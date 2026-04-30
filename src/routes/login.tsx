import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "./signup";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (loading) return;

  if (!email || !password) return;

  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  setLoading(false);

  if (error) {
  const message = error.message.toLowerCase();

    if (message.includes("rate") || message.includes("too many") || message.includes("429")) {
      toast.error("Too many login attempts. Please wait a minute and try again.");
      return;
    }

    toast.error("Invalid email or password.");
    return;
}

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
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Password</span>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••" />
        </label>
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform disabled:opacity-60">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create account</Link>
      </p>
    </AuthShell>
  );
}
