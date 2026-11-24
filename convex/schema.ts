import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  projects: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    markdown: v.string(),
    published: v.boolean(),
    order: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_order", ["order"])
    .index("by_published_order", ["published", "order"]),
  resumeLookupLimits: defineTable({
    client: v.string(),
    failures: v.number(),
    resetsAt: v.number(),
  }).index("by_client", ["client"]),
  resumeVersions: defineTable({
    label: v.string(),
    code: v.string(),
    // Once set, retain the code on this row even after revocation.
    publishedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    pdf: v.optional(v.id("_storage")),
    codeRevision: v.optional(v.number()),
  }).index("by_code", ["code"]),
});
