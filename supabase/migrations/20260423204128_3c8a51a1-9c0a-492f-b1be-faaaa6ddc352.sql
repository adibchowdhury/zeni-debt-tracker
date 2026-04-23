
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  strategy text not null default 'avalanche' check (strategy in ('snowball','avalanche')),
  extra_monthly numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- debts
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null check (balance >= 0),
  initial_balance numeric not null check (initial_balance >= 0),
  interest_rate numeric not null default 0,
  minimum_payment numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.debts enable row level security;
create policy "own debts all" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.debts(user_id);

-- payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric not null check (amount > 0),
  paid_at timestamptz not null default now(),
  cleared_debt boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create policy "own payments all" on public.payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.payments(user_id, paid_at desc);

-- streaks (one per user per ISO week)
create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  has_extra_payment boolean not null default false,
  no_unnecessary_spending boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);
alter table public.streaks enable row level security;
create policy "own streaks all" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- challenges (weekly)
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  kind text not null,
  goal_amount numeric not null default 0,
  status text not null default 'active' check (status in ('active','completed','skipped')),
  progress numeric not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);
alter table public.challenges enable row level security;
create policy "own challenges all" on public.challenges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- milestones
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_key text not null,
  achieved_at timestamptz not null default now(),
  unique(user_id, milestone_key)
);
alter table public.milestones enable row level security;
create policy "own milestones all" on public.milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- personal bests
create table public.personal_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('week','month')),
  period_start date not null,
  total_amount numeric not null,
  created_at timestamptz not null default now(),
  unique(user_id, period, period_start)
);
alter table public.personal_bests enable row level security;
create policy "own bests all" on public.personal_bests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- activity feed (anonymous, global readable)
create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  amount numeric,
  created_at timestamptz not null default now()
);
alter table public.activity_feed enable row level security;
create policy "anyone signed in can read activity" on public.activity_feed for select to authenticated using (true);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger for profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- when a payment is logged, append anonymous activity (security definer to bypass RLS for inserts only)
create or replace function public.handle_new_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining numeric;
begin
  -- update debt balance
  update public.debts
    set balance = greatest(0, balance - new.amount)
  where id = new.debt_id and user_id = new.user_id
  returning balance into remaining;

  if remaining = 0 then
    update public.payments set cleared_debt = true where id = new.id;
    insert into public.activity_feed(kind, amount) values ('debt_cleared', new.amount);
  elsif new.amount >= 100 then
    insert into public.activity_feed(kind, amount) values ('payment', new.amount);
  end if;
  return new;
end;
$$;

create trigger on_payment_insert
  after insert on public.payments
  for each row execute function public.handle_new_payment();
