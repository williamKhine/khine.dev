import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

http.route({
  path: "/resume",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const headers = {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    };
    const secret = process.env.RESUME_PROXY_SECRET;
    const client = request.headers.get("X-Resume-Client");
    if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}` || !client || !/^[a-f0-9]{64}$/.test(client)) {
      return new Response(null, { status: 404, headers });
    }
    const params = new URL(request.url).searchParams;
    const code = params.get("code");
    if (!code || params.getAll("code").length !== 1) {
      return new Response(null, { status: 404, headers });
    }

    const result = await ctx.runMutation(internal.resumeReservations.resolvePdf, { code, client });
    if (result.status === "limited") {
      return new Response(null, { status: 429, headers: { ...headers, "Retry-After": "60" } });
    }
    if (result.status !== "active") return new Response(null, { status: 404, headers });

    const pdf = await ctx.storage.get(result.pdf);
    if (!pdf) return new Response(null, { status: 404, headers });
    if (params.get("check") === "1") return new Response(null, { status: 204, headers });
    return new Response(pdf, {
      headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="resume.pdf"' },
    });
  }),
});

export default http;
