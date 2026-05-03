import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { LottieAnimation } from "../components/LottieAnimation";
import { AnimatedSection } from "../components/AnimatedSection";

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Zeni Personal Finance" },
      {
        name: "description",
        content: "Have questions? We're here to help. Reach out to the Zeni team.",
      },
      { property: "og:title", content: "Contact — Zeni Personal Finance" },
      { property: "og:description", content: "Questions about Zeni? We'd love to hear from you." },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://zenidebtfree.com/contact",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-6xl">
            Get in <span className="text-gradient-primary">Touch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Questions, feedback, or just want to say hi? We're real people and we'd love to hear
            from you.
          </p>
        </AnimatedSection>

        <div className="mt-20 grid gap-12 md:grid-cols-5">
          <AnimatedSection animation="slide-left" className="md:col-span-2">
            <div className="space-y-8">
              {[
                { icon: Mail, title: "Email", detail: "support@zenidebtfree.com" },
                { icon: Phone, title: "Phone", detail: "Not Available" },
                { icon: MapPin, title: "Office", detail: "Dallas-Fort Worth Metroplex" },
              ].map((item) => (
                <div key={item.title} className="group flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 max-w-[200px]">
              <LottieAnimation
                url="https://assets9.lottiefiles.com/packages/lf20_u25cckyh.json"
                className="w-full"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slide-right" delay={200} className="md:col-span-3">
            <div className="glass rounded-2xl p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <Mail className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Message Sent!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Tell us about your needs..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
