import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — zeni" },
      {
        name: "description",
        content:
          "How zeni collects, uses, and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — zeni" },
      {
        property: "og:description",
        content:
          "How zeni collects, uses, and protects your personal information.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://zenidebtfree.com/privacy",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: April 26, 2026
        </p>

        <div className="mt-12 space-y-10 text-foreground">
          <section>
            <h2 className="font-display text-2xl font-semibold">
              1. Information We Collect
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We collect information you provide directly, such as your email
              address, debt details, and payment activity. We also collect
              usage data to improve the product.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">
              2. How We Use Your Information
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Your information is used to provide debt tracking features,
              calculate your payoff timeline, and send progress updates. We
              never sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">
              3. Data Storage & Security
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              All data is encrypted in transit and at rest. We use
              industry-standard security practices to protect your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">
              4. Your Rights
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              You can access, export, or delete your data at any time from
              your account settings. Contact us at privacy@zeni.app for
              assistance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">
              5. Contact Us
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:privacy@zeni.app"
                className="text-primary underline-offset-4 hover:underline"
              >
                privacy@zeni.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
