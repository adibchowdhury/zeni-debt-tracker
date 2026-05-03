import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Heart, Plane, Plus, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useDebtStore } from "@/lib/storage";
import { ProgressBar } from "@/components/debt/ProgressBar";
import { simulatePayoff, formatMoney, formatDate } from "@/lib/debt-math";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const REASONS = [
  { key: "Less stress", icon: Heart },
  { key: "Financial freedom", icon: Sparkles },
  { key: "Family", icon: Users },
  { key: "Travel", icon: Plane },
] as const;

type Reason = (typeof REASONS)[number]["key"] | "Custom";

interface NewDebtDraft {
  name: string;
  balance: string;
  interestRate: string;
  minPayment: string;
}

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const store = useDebtStore();

  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(true);

  const [reason, setReason] = useState<Reason | null>(null);
  const [customReason, setCustomReason] = useState("");

  const [debt, setDebt] = useState<NewDebtDraft>({
    name: "",
    balance: "",
    interestRate: "",
    minPayment: "",
  });

  const [extra, setExtra] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.onboarding_completed) {
        navigate({ to: "/app" });
      } else {
        setChecking(false);
      }
    })();
  }, [user, loading, navigate]);

  const totalSteps = 4;

  const reasonValue = reason === "Custom" ? customReason.trim() : (reason ?? "");
  const canContinueStep1 =
    reason !== null && (reason !== "Custom" || customReason.trim().length > 0);

  const balanceNum = parseFloat(debt.balance.replace(/,/g, "."));
  const canContinueStep2 = debt.name.trim().length > 0 && !isNaN(balanceNum) && balanceNum > 0;

  const extraNum = parseFloat((extra || "0").replace(/,/g, "."));
  const canContinueStep3 = !isNaN(extraNum) && extraNum >= 0;

  const handleStep1 = async () => {
    if (!user || !canContinueStep1) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ debt_free_reason: reasonValue })
      .eq("id", user.id);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save");
      return;
    }
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!canContinueStep2) return;
    setSubmitting(true);
    try {
      await store.addDebt({
        name: debt.name.trim(),
        balance: balanceNum,
        initialBalance: balanceNum,
        interestRate: parseFloat(debt.interestRate.replace(/,/g, ".")) || 0,
        minPayment: parseFloat(debt.minPayment.replace(/,/g, ".")) || 0,
        debtType: "Other",
        dueDay: null,
      });
      setStep(3);
    } catch {
      toast.error("Couldn't add debt");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep3 = async () => {
    if (!user || !canContinueStep3) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ extra_monthly: extraNum })
      .eq("id", user.id);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save");
      return;
    }
    await store.refresh();
    setStep(4);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't finish");
      return;
    }
    try {
      sessionStorage.setItem("zeni:show-first-payment-modal", "1");
    } catch {
      /* ignore */
    }
    navigate({ to: "/app" });
  };

  const preview = useMemo(() => {
    if (step !== 4) return null;
    const result = simulatePayoff(store.debts, store.strategy, extraNum || 0);
    const total = store.debts.reduce((s, d) => s + d.balance, 0);
    return { total, payoffDate: result.payoffDate };
  }, [step, store.debts, store.strategy, extraNum]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span className="text-primary">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <ProgressBar value={(step / totalSteps) * 100} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  What's your reason for becoming debt-free?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This helps you stay motivated when it gets tough.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {REASONS.map((r) => {
                  const active = reason === r.key;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setReason(r.key)}
                      className={`flex items-center gap-2 rounded-2xl border p-3.5 text-left text-sm font-medium transition-all ${
                        active
                          ? "border-primary bg-primary-soft text-primary shadow-glow"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {r.key}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setReason("Custom")}
                  className={`col-span-2 flex items-center gap-2 rounded-2xl border p-3.5 text-left text-sm font-medium transition-all ${
                    reason === "Custom"
                      ? "border-primary bg-primary-soft text-primary shadow-glow"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <Plus className="h-4 w-4 shrink-0" /> Custom
                </button>
              </div>

              {reason === "Custom" && (
                <input
                  autoFocus
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  maxLength={120}
                  placeholder="Your reason…"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              )}

              <ContinueButton
                disabled={!canContinueStep1 || submitting}
                onClick={handleStep1}
                label="Continue"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Let's add your first debt
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Don't worry, you can add more later.
                </p>
              </div>

              <div className="space-y-3">
                <Field
                  label="Debt name"
                  value={debt.name}
                  onChange={(v) => setDebt({ ...debt, name: v })}
                  placeholder="e.g. Visa card"
                />
                <Field
                  label="Balance"
                  value={debt.balance}
                  onChange={(v) => setDebt({ ...debt, balance: v.replace(/[^0-9.,]/g, "") })}
                  placeholder="2500"
                  inputMode="decimal"
                  prefix="$"
                />
                <Field
                  label="Interest rate (optional)"
                  value={debt.interestRate}
                  onChange={(v) => setDebt({ ...debt, interestRate: v.replace(/[^0-9.,]/g, "") })}
                  placeholder="19.99"
                  inputMode="decimal"
                  suffix="%"
                />
                <Field
                  label="Minimum payment (optional)"
                  value={debt.minPayment}
                  onChange={(v) => setDebt({ ...debt, minPayment: v.replace(/[^0-9.,]/g, "") })}
                  placeholder="50"
                  inputMode="decimal"
                  prefix="$"
                />
              </div>

              <ContinueButton
                disabled={!canContinueStep2 || submitting}
                onClick={handleStep2}
                label="Add debt & continue"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  How much can you put toward debt each month?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This helps us estimate your payoff timeline.
                </p>
              </div>

              <Field
                label="Monthly extra payment"
                value={extra}
                onChange={(v) => setExtra(v.replace(/[^0-9.,]/g, ""))}
                placeholder="100"
                inputMode="decimal"
                prefix="$"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Even $50/month makes a difference.</p>

              <ContinueButton
                disabled={!canContinueStep3 || submitting}
                onClick={handleStep3}
                label="Continue"
              />
            </div>
          )}

          {step === 4 && preview && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  You're on track to be debt-free by {formatDate(preview.payoffDate)}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  You've already taken the hardest step.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-5 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total debt
                    </div>
                    <div className="font-display text-2xl font-bold tabular-nums">
                      {formatMoney(preview.total)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Payoff
                    </div>
                    <div className="font-display text-base font-semibold">
                      {formatDate(preview.payoffDate)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <ProgressBar value={0} />
                </div>
              </div>

              <div className="rounded-2xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
                You just started your journey 🎉
              </div>

              <ContinueButton
                disabled={submitting}
                onClick={handleFinish}
                label="Enter your dashboard"
                icon={<ArrowRight className="h-4 w-4" />}
              />

              <p className="text-xs text-muted-foreground">
                You can connect your bank later to automatically log payments, or track manually.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i + 1 === step
                  ? "w-6 bg-primary"
                  : i + 1 < step
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  prefix,
  suffix,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "decimal";
  prefix?: string;
  suffix?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border border-input bg-background py-3 outline-none focus:ring-2 focus:ring-ring ${
            prefix ? "pl-7" : "pl-4"
          } ${suffix ? "pr-8" : "pr-4"}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function ContinueButton({
  disabled,
  onClick,
  label,
  icon,
}: {
  disabled?: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {label} {icon ?? <Check className="h-4 w-4" />}
    </button>
  );
}
