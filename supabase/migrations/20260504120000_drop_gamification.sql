-- Remove XP / coins / leaderboard gamification (revert handle_new_user to profiles-only).

drop trigger if exists payments_reward_after_insert on public.payments;

drop function if exists public.handle_payment_rewards();
drop function if exists public._apply_reward(uuid, text, text, integer, integer, jsonb, timestamptz);
drop function if exists public._ensure_user_rewards_locked(uuid, timestamptz);
drop function if exists public._week_start_utc(timestamptz);
drop function if exists public._utc_day(timestamptz);
drop function if exists public.claim_milestone_reward(text);
drop function if exists public.claim_challenge_reward(uuid);
drop function if exists public.claim_personal_best_reward(text, date);
drop function if exists public.leaderboard_weekly(integer);

drop table if exists public.reward_events;
drop table if exists public.user_rewards;

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
