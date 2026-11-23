"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Projects } from "./projects";
import { Reservations } from "./reservations";

export function Dashboard({ convexUrl }: { convexUrl: string }) {
  const [client] = useState(() => new ConvexReactClient(convexUrl));

  return (
    <ConvexAuthNextjsProvider client={client}>
      <DashboardAccess />
    </ConvexAuthNextjsProvider>
  );
}

function DashboardAccess() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const hasAccess = useQuery(api.owner.access, isAuthenticated ? {} : "skip");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function updateSession() {
    setPending(true);
    setError("");
    try {
      if (isAuthenticated) await signOut();
      else await signIn("github", { redirectTo: "/admin" });
    } catch {
      setError(isAuthenticated ? "Could not sign out. Try again." : "Could not start GitHub sign-in. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (isLoading || (isAuthenticated && hasAccess === undefined)) {
    return <p role="status">Checking access…</p>;
  }

  return (
    <div className="space-y-6">
      {isAuthenticated && !hasAccess && <p role="alert">Owner access required.</p>}
      <Button variant={isAuthenticated ? "outline" : "default"} disabled={pending} onClick={updateSession}>
        {isAuthenticated ? "Sign out" : "Sign in with GitHub"}
      </Button>
      {error && <p role="alert">{error}</p>}
      {isAuthenticated && hasAccess && <><Projects /><Reservations /></>}
    </div>
  );
}
