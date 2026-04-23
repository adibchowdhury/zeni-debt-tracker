import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Strategy = "snowball" | "avalanche";

export interface Debt {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  interestRate: number;
  minPayment: number;
  createdAt: number;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: number; // ms timestamp
}

export interface DebtStore {
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
  loading: boolean;
}

interface DebtStoreActions {
  addDebt: (d: Omit<Debt, "id" | "initialBalance" | "createdAt"> & { initialBalance?: number }) => Promise<void>;
  updateDebt: (id: string, patch: Partial<Omit<Debt, "id">>) => Promise<void>;
  removeDebt: (id: string) => Promise<void>;
  logPayment: (debtId: string, amount: number) => Promise<{ cleared: boolean; debtName: string }>;
  setStrategy: (s: Strategy) => Promise<void>;
  setExtraMonthly: (n: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const EVT = "debtfree:refresh";

function bump() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT));
}

export function useDebtStore(): DebtStore & DebtStoreActions {
  const { user } = useAuth();
  const [state, setState] = useState<DebtStore>({
    debts: [],
    payments: [],
    strategy: "avalanche",
    extraMonthly: 0,
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ debts: [], payments: [], strategy: "avalanche", extraMonthly: 0, loading: false });
      return;
    }
    const [debtsRes, paymentsRes, profileRes] = await Promise.all([
      supabase.from("debts").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("payments").select("*").eq("user_id", user.id).order("paid_at", { ascending: false }),
      supabase.from("profiles").select("strategy, extra_monthly").eq("id", user.id).maybeSingle(),
    ]);
    const debts: Debt[] = (debtsRes.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      balance: Number(r.balance),
      initialBalance: Number(r.initial_balance),
      interestRate: Number(r.interest_rate),
      minPayment: Number(r.minimum_payment),
      createdAt: new Date(r.created_at).getTime(),
    }));
    const payments: Payment[] = (paymentsRes.data ?? []).map((r) => ({
      id: r.id,
      debtId: r.debt_id,
      amount: Number(r.amount),
      date: new Date(r.paid_at).getTime(),
    }));
    setState({
      debts,
      payments,
      strategy: (profileRes.data?.strategy as Strategy) ?? "avalanche",
      extraMonthly: Number(profileRes.data?.extra_monthly ?? 0),
      loading: false,
    });
  }, [user]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(EVT, handler);
    return () => window.removeEventListener(EVT, handler);
  }, [refresh]);

  const addDebt: DebtStoreActions["addDebt"] = async (d) => {
    if (!user) return;
    await supabase.from("debts").insert({
      user_id: user.id,
      name: d.name,
      balance: d.balance,
      initial_balance: d.initialBalance ?? d.balance,
      interest_rate: d.interestRate,
      minimum_payment: d.minPayment,
    });
    bump();
  };

  const updateDebt: DebtStoreActions["updateDebt"] = async (id, patch) => {
    if (!user) return;
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.balance !== undefined) dbPatch.balance = patch.balance;
    if (patch.initialBalance !== undefined) dbPatch.initial_balance = patch.initialBalance;
    if (patch.interestRate !== undefined) dbPatch.interest_rate = patch.interestRate;
    if (patch.minPayment !== undefined) dbPatch.minimum_payment = patch.minPayment;
    await supabase.from("debts").update(dbPatch).eq("id", id).eq("user_id", user.id);
    bump();
  };

  const removeDebt: DebtStoreActions["removeDebt"] = async (id) => {
    if (!user) return;
    await supabase.from("debts").delete().eq("id", id).eq("user_id", user.id);
    bump();
  };

  const logPayment: DebtStoreActions["logPayment"] = async (debtId, amount) => {
    if (!user) return { cleared: false, debtName: "" };
    const debt = state.debts.find((d) => d.id === debtId);
    const debtName = debt?.name ?? "";
    const willClear = !!debt && debt.balance > 0 && debt.balance - amount <= 0.005;

    await supabase.from("payments").insert({
      user_id: user.id,
      debt_id: debtId,
      amount,
    });
    bump();
    return { cleared: willClear, debtName };
  };

  const setStrategy: DebtStoreActions["setStrategy"] = async (s) => {
    if (!user) return;
    await supabase.from("profiles").update({ strategy: s }).eq("id", user.id);
    bump();
  };

  const setExtraMonthly: DebtStoreActions["setExtraMonthly"] = async (n) => {
    if (!user) return;
    await supabase.from("profiles").update({ extra_monthly: n }).eq("id", user.id);
    bump();
  };

  return { ...state, addDebt, updateDebt, removeDebt, logPayment, setStrategy, setExtraMonthly, refresh };
}

// Backwards-compat shim used by a few places — same shape as the v1 hook
export interface AppStateLegacy {
  user: { email: string; name?: string } | null;
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
  loading: boolean;
}

export function useAppState() {
  const store = useDebtStore();
  const { user } = useAuth();
  const state: AppStateLegacy = {
    user: user ? { email: user.email ?? "", name: (user.user_metadata?.display_name as string | undefined) } : null,
    debts: store.debts,
    payments: store.payments,
    strategy: store.strategy,
    extraMonthly: store.extraMonthly,
    loading: store.loading,
  };
  return { state, store };
}
