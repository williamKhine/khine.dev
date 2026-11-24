"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ComponentProps } from "react";
import { isResumeCode } from "@/lib/resume-codes";

const portfolioOrigin = "https://khine.dev";

function portfolioDestination(href: string, pathname: string) {
  try {
    const destination = new URL(href, portfolioOrigin + pathname);
    if (destination.origin === portfolioOrigin &&
      (destination.pathname === "/" || destination.pathname.startsWith("/case-studies/"))) {
      return destination;
    }
  } catch {
    // Leave malformed links unchanged.
  }
  return null;
}

type PortfolioLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

function CodedLink({ href, ...props }: PortfolioLinkProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const code = params.get("code");
  const destination = portfolioDestination(href, pathname);
  if (!destination || !code || params.getAll("code").length !== 1 || !isResumeCode(code)) {
    return <Link href={href} {...props} />;
  }

  destination.searchParams.set("code", code);
  return <Link {...props} href={destination.pathname + destination.search + destination.hash} prefetch={false} />;
}

export function PortfolioLink(props: PortfolioLinkProps) {
  return <Suspense fallback={<Link {...props} />}><CodedLink {...props} /></Suspense>;
}

function ResumeAction() {
  const params = useSearchParams();
  const code = params.get("code");
  const valid = code !== null && params.getAll("code").length === 1 && isResumeCode(code);
  const [result, setResult] = useState<{ code: string; active: boolean }>();

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    const url = `/api/resume?code=${encodeURIComponent(code)}&check=1`;
    fetch(url, { signal: controller.signal, cache: "no-store" }).then(
      (response) => setResult({ code, active: response.status === 204 }),
      () => {
        if (!controller.signal.aborted) setResult({ code, active: false });
      },
    );
    return () => controller.abort();
  }, [code, valid]);

  if (code === null) return null;
  if (valid && result?.code !== code) return null;
  return (
    <div className="shell py-2 text-sm" role="status">
      {valid && result?.active ? (
        <a className="study-link" href={`/api/resume?code=${encodeURIComponent(code)}`}>Open Résumé (PDF)</a>
      ) : "This résumé link is unavailable."}
    </div>
  );
}

export function PortfolioResumeAction() {
  return <Suspense><ResumeAction /></Suspense>;
}
