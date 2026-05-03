import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/security")({
  head: () => ({
    meta: [
      { title: "Security — zeni" },
      {
        name: "description",
        content: "Learn how zeni protects your data with modern security practices.",
      },
      { property: "og:title", content: "Security — zeni" },
      {
        property: "og:description",
        content: "Learn how zeni protects your data with modern security practices.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://zenidebtfree.com/security",
      },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Security</p>

        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          How We Protect Your Data
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">Last updated: April 30, 2026</p>

        <div className="mt-12 space-y-10 text-foreground">
          <section>
            <p className="leading-relaxed text-muted-foreground">We take security seriously.</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Zeni is built to help you stay motivated while paying off debt, and that only works if
              your data is protected. From day one, we’ve focused on building the app with modern
              security practices in place.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Authentication & Access</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We use secure authentication powered by Supabase.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Login and account access are handled through secure, industry-standard methods
              </li>
              <li>Password reset flows are protected</li>
              <li>Access to your data is restricted to your account only</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Data Protection</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>All data is transmitted over secure HTTPS connections</li>
              <li>Sensitive information is protected in transit</li>
              <li>Each user’s data is isolated from other users</li>
              <li>Row Level Security helps ensure users can only access their own data</li>
              <li>We follow the principle of least privilege when handling data</li>
              <li>
                Zeni does not connect directly to your bank accounts or access banking credentials
              </li>
              <li>We do not sell your personal data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Application Security</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Content Security Policy (CSP) to prevent malicious scripts</li>
              <li>Security headers to reduce common web vulnerabilities</li>
              <li>Protections against XSS and injection attacks</li>
              <li>Browser-level protections that help control what content can run on the site</li>
            </ul>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              These measures help make sure only trusted content runs in your browser.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Infrastructure</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Zeni is built on trusted infrastructure providers used by modern SaaS applications.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Frontend hosted on Vercel</li>
              <li>Backend and database managed by Supabase</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Ongoing Improvements</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Security isn’t a one-time setup. We continuously review and improve our security
              practices as the product evolves.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Report a Security Issue</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              If you believe you’ve found a security issue, please reach out:
            </p>
            <p className="mt-2">
              <a
                href="mailto:support@zenidebtfree.com"
                className="text-primary underline-offset-4 hover:underline"
              >
                support@zenidebtfree.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
