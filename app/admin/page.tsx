import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Owner dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <main id="main" className="shell max-w-3xl py-16">
      <h1 className="mb-8 font-display text-5xl">Owner dashboard</h1>
      {convexUrl ? (
        <ConvexAuthNextjsServerProvider>
          <Dashboard convexUrl={convexUrl} />
        </ConvexAuthNextjsServerProvider>
      ) : (
        <div className="space-y-4">
          <p>GitHub sign-in is unavailable until Convex is configured.</p>
          <Button disabled>Sign in with GitHub</Button>
        </div>
      )}
    </main>
  );
}
