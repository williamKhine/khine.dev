import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  resumeVersions: defineTable({
    label: v.string(),
    code: v.string(),
    // Once set, retain the code on this row even after revocation.
    publishedAt: v.optional(v.number()),
  }).index("by_code", ["code"]),
});
