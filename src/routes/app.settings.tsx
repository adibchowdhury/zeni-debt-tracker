import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { applyTheme, persistTheme, readStoredTheme } from "@/lib/theme";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

const PREFS_STORAGE_KEY = "zeni:settings:preferences:v1";

type UserPreferences = {
  paymentReminders: boolean;
  emailNotifications: boolean;
};

function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { paymentReminders: true, emailNotifications: true };
  }
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { paymentReminders: true, emailNotifications: true };
    const p = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      paymentReminders: typeof p.paymentReminders === "boolean" ? p.paymentReminders : true,
      emailNotifications: typeof p.emailNotifications === "boolean" ? p.emailNotifications : true,
    };
  } catch {
    return { paymentReminders: true, emailNotifications: true };
  }
}

function savePreferences(p: UserPreferences) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function SettingsPage() {
  const { user, loading: authLoading } = useAuth();

  const [profileLoading, setProfileLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(readStoredTheme() === "dark");
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const meta = user.user_metadata?.display_name as string | undefined;
      setFullName((data?.display_name ?? meta ?? "").trim());
      setNewEmail("");
      setProfileLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const accountEmail = user?.email ?? "";
  const emailWillChange =
    newEmail.trim().length > 0 && newEmail.trim().toLowerCase() !== accountEmail.toLowerCase();

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const name = fullName.trim();
    if (name.length < 1) {
      toast.error("Please enter your full name.");
      return;
    }
    if (name.length > 120) {
      toast.error("Name is too long.");
      return;
    }
    if (emailWillChange && !isValidEmail(newEmail.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }

    setSavingProfile(true);
    try {
      const { error: authMetaErr } = await supabase.auth.updateUser({
        data: { display_name: name },
      });
      if (authMetaErr) {
        toast.error(authMetaErr.message);
        return;
      }
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ display_name: name })
        .eq("id", user.id);
      if (profileErr) {
        toast.error(profileErr.message);
        return;
      }

      if (emailWillChange) {
        const { error: emailErr } = await supabase.auth.updateUser({
          email: newEmail.trim().toLowerCase(),
        });
        if (emailErr) {
          toast.error(emailErr.message);
          return;
        }
        toast.success("Profile saved. Check your inbox to confirm your new email if required.");
      } else {
        toast.success("Profile updated.");
      }
      setNewEmail("");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyErr) {
        toast.error("Current password is incorrect.");
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) {
        toast.error(updateErr.message);
        return;
      }
      toast.success("Password updated. You're still signed in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSavingPassword(false);
    }
  };

  const updatePref = (key: keyof UserPreferences, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePreferences(next);
    toast.success("Preference saved.");
  };

  const setAppearanceDark = (dark: boolean) => {
    const theme = dark ? "dark" : "light";
    setDarkMode(dark);
    applyTheme(theme);
    persistTheme(theme);
    toast.success("Appearance saved.");
  };

  if (authLoading || !user) {
    return (
      <div className="text-sm text-muted-foreground">
        {authLoading ? "Loading…" : "Sign in to manage settings."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, security, and preferences. Changes apply to this device where noted.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold text-heading">Profile &amp; account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your name appears in the app. Email is used to sign in.
        </p>

        {profileLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading profile…</p>
        ) : (
          <form onSubmit={saveProfile} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="settings-full-name">Full name</Label>
              <Input
                id="settings-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="max-w-md rounded-xl border-[#E5E7EB] py-2.5"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label>Account email</Label>
              <p className="text-sm font-medium text-foreground">{accountEmail}</p>
              <p className="text-xs text-muted-foreground">
                This is the address you use to sign in. To change it, enter a new email below. Your
                project may send a confirmation link before the update takes effect.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-new-email">New email (optional)</Label>
              <Input
                id="settings-new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
                className="max-w-md rounded-xl border-[#E5E7EB] py-2.5"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={savingProfile}
                className="rounded-2xl"
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Password */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold text-heading">Password &amp; security</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For your security, confirm your current password before choosing a new one.
        </p>

        <form onSubmit={savePassword} className="mt-6 max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-current-password">Current password</Label>
            <Input
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-xl border-[#E5E7EB] py-2.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-new-password">New password</Label>
            <Input
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="rounded-xl border-[#E5E7EB] py-2.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-confirm-password">Confirm new password</Label>
            <Input
              id="settings-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="rounded-xl border-[#E5E7EB] py-2.5"
            />
          </div>
          <Button type="submit" variant="default" disabled={savingPassword} className="rounded-2xl">
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      {/* Billing */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold text-heading">Subscription &amp; billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          When billing is connected, you&apos;ll manage your plan here.
        </p>

        <div className="mt-6 space-y-4 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Current plan</p>
            <p className="mt-1 text-sm text-muted-foreground">Free — full access during beta.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Monthly and yearly options will appear here once checkout is enabled.</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-semibold"
              onClick={() => toast.message("Billing isn’t connected yet — check back soon.")}
            >
              Manage subscription
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-destructive/30 font-semibold text-destructive hover:bg-destructive/5"
              onClick={() => toast.message("Cancel flow will be available when billing is live.")}
            >
              Cancel subscription
            </Button>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold text-heading">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Theme is saved in this browser and applies to both the public site and the app when you’re
          signed in.
        </p>

        <div className="mt-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Dark mode</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Use a darker palette across Zeni. Same setting as the sun/moon control on the public
                site.
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setAppearanceDark} aria-label="Dark mode" />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold text-heading">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Notification choices stored on this device. You can change them any time.
        </p>

        <div className="mt-6 divide-y divide-border rounded-2xl border border-border">
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Payment reminders</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Gentle nudges to log payments and stay on track.
              </p>
            </div>
            <Switch
              checked={prefs.paymentReminders}
              onCheckedChange={(v) => updatePref("paymentReminders", v)}
              aria-label="Payment reminders"
            />
          </div>
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Email notifications</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Product updates and tips (when we send them).
              </p>
            </div>
            <Switch
              checked={prefs.emailNotifications}
              onCheckedChange={(v) => updatePref("emailNotifications", v)}
              aria-label="Email notifications"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
