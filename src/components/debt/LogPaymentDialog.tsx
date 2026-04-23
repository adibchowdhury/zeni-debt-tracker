import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useAppState, uid } from "@/lib/storage";
import { formatMoney } from "@/lib/debt-math";
import { toast } from "sonner";

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
  const { state, update } = useAppState();
  const activeDebts = state.debts.filter((d) => d.balance > 0);
  const [debtId, setDebtId] = useState(activeDebts[0]?.id ?? "");
  const [amount, setAmount] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!debtId || isNaN(amt) || amt <= 0) {
      toast.error("Enter an amount");
      return;
    }
    const targetDebt = state.debts.find((d) => d.id === debtId);
    if (!targetDebt) return;
    const wasOpen = targetDebt.balance > 0;
    const newBalance = Math.max(0, targetDebt.balance - amt);

    update((s) => ({
      ...s,
      debts: s.debts.map((d) => (d.id === debtId ? { ...d, balance: newBalance } : d)),
      payments: [
        ...s.payments,
        { id: uid(), debtId, amount: amt, date: Date.now() },
      ],
    }));

    if (wasOpen && newBalance === 0) {
      celebrate();
      toast.success(`🎉 ${targetDebt.name} is paid off!`);
    } else {
      toast.success(`Logged ${formatMoney(amt)} — keep going!`);
    }
    onClose();
  };

  if (activeDebts.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl bg-card p-6 text-center shadow-soft"
        >
          <p className="text-muted-foreground">No active debts to pay against.</p>
          <button
            onClick={onClose}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Close
          </button>
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
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-soft sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Log a payment</h2>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
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
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
          >
            <Plus className="h-4 w-4" /> Log payment
          </button>
        </form>
      </div>
    </div>
  );
}

function celebrate() {
  if (typeof window === "undefined") return;
  const colors = ["#3b82f6", "#10b981", "#06b6d4", "#fbbf24"];
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
