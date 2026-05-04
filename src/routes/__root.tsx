import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";
import faviconUrl from "@/assets/logo_coin.png?url";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Button asChild variant="default">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zeni — Become Debt-Free, Without the Stress" },
      {
        name: "description",
        content:
          "A simple, motivating debt payoff coach. Track progress, see your debt-free date, and celebrate every win.",
      },
      { property: "og:title", content: "zeni — Pay off debt faster, without the stress" },
      {
        property: "og:description",
        content:
          "A simple, motivating debt payoff coach. Track progress, see your debt-free date, and celebrate every win.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "zeni — Pay off debt faster, without the stress" },
      {
        name: "twitter:description",
        content: "zeni helps you pay off debt faster with a motivating, mobile-first web app.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/606690b9-631e-4503-9a9a-740d0773163b/id-preview-e3650c2a--5a194a91-60f4-4c3d-a8a9-0c50253cdbc1.lovable.app-1776977908643.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/606690b9-631e-4503-9a9a-740d0773163b/id-preview-e3650c2a--5a194a91-60f4-4c3d-a8a9-0c50253cdbc1.lovable.app-1776977908643.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: faviconUrl },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <>
        <Outlet />
        <Analytics />
      </>
      <Toaster />
    </AuthProvider>
  );
}
