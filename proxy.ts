import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const authMiddleware = convexAuthNextjsMiddleware(undefined, {
  shouldHandleCode: (request) => request.nextUrl.pathname === "/admin",
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return NextResponse.next();
  return authMiddleware(request, event);
}

export const config = { matcher: ["/admin", "/api/auth"] };
