import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";

async function isOwner(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  const githubId = process.env.OWNER_GITHUB_ID;
  if (!userId || !githubId) return false;

  const account = await ctx.db
    .query("authAccounts")
    .withIndex("providerAndAccountId", (q) =>
      q.eq("provider", "github").eq("providerAccountId", githubId),
    )
    .unique();

  return account?.userId === userId;
}

export const access = query({ args: {}, handler: isOwner });

export async function requireOwner(ctx: QueryCtx) {
  if (!(await isOwner(ctx))) {
    throw new ConvexError("Owner access required.");
  }
}
