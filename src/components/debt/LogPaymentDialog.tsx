import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { useDebtStore } from "@/lib/storage";
import { formatMoney } from "@/lib/debt-math";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEngagement } from "@/lib/engagement";
import { supabase } from "@/integrations/supabase/client";
import { MILESTONE_CATALOG } from "@/lib/milestone-catalog";

export function LogPaymentDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </>
  );
}

function Dialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const store = useDebtStore();
  const eng = useEngagement();
  const activeDebts = store.debts.filter((d) => d.balance > 0);
  const [debtId, setDebtId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const beforeMilestones = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!debtId && activeDebts.length > 0) {
      setDebtId(activeDebts[0].id);
    }
  }, [debtId, activeDebts]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = (amount ?? "").toString().trim().replace(/,/g, ".");
    const amt = parseFloat(raw);
    if (!debtId) {
      toast.error("Pick a debt");
      return;
    }
    if (!raw || isNaN(amt) || amt <= 0) {
      toast.error("Enter an amount");
      return;
    }
    setSubmitting(true);
    beforeMilestones.current = new Set(eng.unlockedMilestones);
    try {
      const { cleared, debtName } = await store.logPayment(debtId, amt);

      let badgeTitles: string[] = [];
      if (user) {
        await new Promise((r) => setTimeout(r, 450));
        const { data: rows } = await supabase.from("milestones").select("milestone_key").eq("user_id", user.id);
        const after = new Set((rows ?? []).map((r) => r.milestone_key as string));
        const newKeys = [...after].filter((k) => !beforeMilestones.current.has(k));
        badgeTitles = newKeys.map((k) => MILESTONE_CATALOG.find((e) => e.id === k)?.title ?? k);
      }

      const lines: string[] = [];
      if (cleared) {
        celebrate();
        lines.push(`${debtName} is paid off.`);
      }
      lines.push("Payment logged. You're making progress.");
      if (badgeTitles.length > 0) {
        lines.push(`Badge unlocked: ${badgeTitles.join(", ")}`);
      }
      toast.success(lines.join(" "));

      onClose();
    } catch {
      toast.error("Couldn't log payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (activeDebts.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl bg-card p-6 text-center shadow-sm"
        >
          <p className="text-muted-foreground">No active debts to pay against.</p>
          <Button type="button" onClick={onClose} variant="default" size="sm" className="mt-4 w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-sm sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Log a payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Towards</span>
            <select
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            >
              {activeDebts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {formatMoney(d.balance)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Amount</span>
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.,]/g, "");
                setAmount(v);
              }}
              placeholder="100"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[25, 50, 100, 200].map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setAmount(String(v))}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                ${v}
              </button>
            ))}
          </div>
          <Button type="submit" variant="cta" disabled={submitting} className="w-full gap-2">
            <Plus className="h-4 w-4" /> {submitting ? "Logging…" : "Log payment"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function celebrate() {
  if (typeof window === "undefined") return;
  const colors = ["#FF6A00", "#FDBA74", "#FACC15", "#3B82F6"];
  const count = 60;
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden";
  document.body.appendChild(container);
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `position:absolute;top:-20px;left:${Math.random() * 100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};transform:rotate(${Math.random() * 360}deg);opacity:0.9;transition:transform 1.6s cubic-bezier(.2,.8,.4,1), top 1.8s ease-out, opacity 1.8s ease-out;`;
    container.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.top = `${100 + Math.random() * 10}%`;
      piece.style.transform = `translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 720}deg)`;
      piece.style.opacity = "0";
    });
  }
  setTimeout(() => container.remove(), 2000);
}
