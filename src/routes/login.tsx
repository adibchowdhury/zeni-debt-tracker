import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { AuthShell } from "./signup";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { state, update } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state.user?.email ?? "");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    update((s) => ({ ...s, user: { email, name: s.user?.name } }));
    toast.success("Welcome back!");
    navigate({ to: "/app" });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@email.com" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••" />
        </label>
        <button type="submit"
          className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform">
          Log in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create account</Link>
      </p>
    </AuthShell>
  );
}
