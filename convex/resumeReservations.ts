import { ConvexError, v } from "convex/values";
import { reservationValidationError } from "../lib/resume-codes";
import { mutation, query } from "./_generated/server";
import { requireOwner } from "./owner";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return (await ctx.db.query("resumeVersions").order("desc").collect())
      .filter((version) => version.publishedAt === undefined);
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("resumeVersions")),
    label: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { id, label, code }) => {
    await requireOwner(ctx);

    const validationError = reservationValidationError(label, code);
    if (validationError) throw new ConvexError(validationError);

    const version = id ? await ctx.db.get("resumeVersions", id) : null;
    if (id && !version) throw new ConvexError("Reservation no longer exists.");
    if (version?.publishedAt !== undefined) throw new ConvexError("Published codes are locked.");

    const collision = await ctx.db
      .query("resumeVersions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (collision && collision._id !== id) {
      throw new ConvexError("This exact Résumé Code is already in use.");
    }

    const reservation = { label: label.trim(), code };
    if (!id) return ctx.db.insert("resumeVersions", reservation);

    await ctx.db.patch("resumeVersions", id, reservation);
    return id;
  },
});
