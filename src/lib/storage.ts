import { useEffect, useState, useCallback } from "react";

export type Strategy = "snowball" | "avalanche";

export interface Debt {
  id: string;
  name: string;
  balance: number; // current remaining balance
  initialBalance: number;
  interestRate: number; // annual %
  minPayment: number;
  createdAt: number;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: number;
}

export interface AppUser {
  email: string;
  name?: string;
}

export interface AppState {
  user: AppUser | null;
  debts: Debt[];
  payments: Payment[];
  strategy: Strategy;
  extraMonthly: number;
  milestones: string[]; // ids of unlocked milestones
}

const KEY = "debtfree-app-v1";

const defaultState: AppState = {
  user: null,
  debts: [],
  payments: [],
  strategy: "avalanche",
  extraMonthly: 0,
  milestones: [],
};

function read(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function write(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("debtfree:update"));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    setState(read());
    const handler = () => setState(read());
    window.addEventListener("debtfree:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("debtfree:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    const current = read();
    const next = updater(current);
    write(next);
    setState(next);
  }, []);

  return { state, update };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
