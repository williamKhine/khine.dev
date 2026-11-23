import { convexTest } from "convex-test";
import { vi } from "vitest";
import type portfolioSchema from "../../convex/schema";

export async function setupPortfolioTest(schema: typeof portfolioSchema, modules: Record<string, () => Promise<unknown>>) {
  vi.stubEnv("OWNER_GITHUB_ID", "42");
  const t = convexTest(schema, modules);
  const { ownerId, visitorId } = await t.run(async (ctx) => {
    const ownerId = await ctx.db.insert("users", { name: "William" });
    const visitorId = await ctx.db.insert("users", { name: "William" });
    await ctx.db.insert("authAccounts", { userId: ownerId, provider: "github", providerAccountId: "42" });
    await ctx.db.insert("authAccounts", { userId: visitorId, provider: "github", providerAccountId: "43" });
    return { ownerId, visitorId };
  });
  return {
    t,
    owner: t.withIdentity({ subject: ownerId }),
    visitor: t.withIdentity({ subject: visitorId }),
  };
}
