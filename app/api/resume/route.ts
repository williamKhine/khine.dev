import { createHmac } from "node:crypto";
import { isResumeCode } from "@/lib/resume-codes";

export async function GET(request: Request) {
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  if (code === null || !isResumeCode(code) || params.getAll("code").length !== 1) {
    return new Response(null, { status: 404, headers });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const siteUrl = process.env.CONVEX_SITE_URL ?? convexUrl?.replace(/\.convex\.cloud$/, ".convex.site");
  const secret = process.env.RESUME_PROXY_SECRET;
  if (!siteUrl || !secret) return new Response(null, { status: 503, headers });

  const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") : null;
  const client = createHmac("sha256", secret).update(ip ?? "local").digest("hex");
  const upstream = new URL("/resume", siteUrl);
  upstream.searchParams.set("code", code);
  if (params.get("check") === "1") upstream.searchParams.set("check", "1");

  try {
    const response = await fetch(upstream, {
      cache: "no-store",
      redirect: "error",
      headers: { Authorization: `Bearer ${secret}`, "X-Resume-Client": client },
    });
    if ([200, 204, 404, 429].includes(response.status)) {
      for (const name of ["Content-Type", "Content-Disposition", "Retry-After"]) {
        const value = response.headers.get(name);
        if (value) headers.set(name, value);
      }
      if (response.status !== 200 || headers.get("Content-Type") === "application/pdf") {
        return new Response(response.status === 200 ? response.body : null, { status: response.status, headers });
      }
    }
  } catch {
    // Keep the portfolio accessible during backend outages.
  }
  return new Response(null, { status: 503, headers });
}
