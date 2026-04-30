import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !password) return;
    setLoading(true);
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: name || undefined },
      },
    });
    setLoading(false);

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes("rate") || message.includes("too many") || message.includes("429")) {
        toast.error("Too many attempts. Please wait a minute and try again.");
        return;
      }

      toast.error("Unable to create account. Try a different email or password.");
      return;
    }

    toast.success("Check your email to finish creating your account.");
    navigate({ to: "/login" });
  };

  return <AuthShell title="Create your account" subtitle="Start your debt-free journey today.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name (optional)">
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
          placeholder="Alex" />
      </Field>
      <Field label="Email">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@email.com" />
      </Field>
      <Field label="Password">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="At least 6 characters"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      <button type="submit" disabled={loading}
        className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform disabled:opacity-60">
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
    </p>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero px-5 py-10">
      <div className="mx-auto mb-10 flex w-fit items-center">
        <Logo to="/" size="md" />
      </div>
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
