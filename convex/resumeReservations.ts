import { PDFDocument, ParseSpeeds } from "pdf-lib";
import { ConvexError, v } from "convex/values";
import { isResumeCode, MAX_RESUME_PDF_BYTES, reservationValidationError } from "../lib/resume-codes";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { requireOwner } from "./owner";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return ctx.db.query("resumeVersions").order("desc").collect();
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

    if (version && version.code !== code) {
      if (version.pdf) await ctx.storage.delete(version.pdf);
      await ctx.db.patch(id, { ...reservation, pdf: undefined, codeRevision: (version.codeRevision ?? 0) + 1 });
    } else {
      await ctx.db.patch(id, reservation);
    }
    return id;
  },
});

export const availability = query({
  args: { id: v.optional(v.id("resumeVersions")), code: v.string() },
  handler: async (ctx, { id, code }) => {
    await requireOwner(ctx);
    if (!isResumeCode(code)) return false;
    const version = await ctx.db.query("resumeVersions")
      .withIndex("by_code", (q) => q.eq("code", code)).unique();
    return !version || (version._id === id && version.publishedAt === undefined);
  },
});

function requireReservation(version: Doc<"resumeVersions"> | null) {
  if (!version) throw new ConvexError("Reservation no longer exists.");
  if (version.publishedAt !== undefined) throw new ConvexError("Published codes and PDFs are locked.");
  return version;
}

export const uploadReservation = internalQuery({
  args: { id: v.id("resumeVersions") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    return requireReservation(await ctx.db.get(id));
  },
});

export const attachPdf = internalMutation({
  args: { id: v.id("resumeVersions"), revision: v.number(), pdf: v.id("_storage") },
  handler: async (ctx, { id, revision, pdf }) => {
    await requireOwner(ctx);
    const version = requireReservation(await ctx.db.get(id));
    if ((version.codeRevision ?? 0) !== revision) {
      throw new ConvexError("The code changed during upload. Upload the updated PDF.");
    }
    if (version.pdf) await ctx.storage.delete(version.pdf);
    await ctx.db.patch(id, { pdf });
  },
});

export const uploadPdf = action({
  args: {
    id: v.id("resumeVersions"),
    code: v.string(),
    revision: v.number(),
    bytes: v.bytes(),
  },
  handler: async (ctx, { id, code, revision, bytes }): Promise<void> => {
    const version = await ctx.runQuery(internal.resumeReservations.uploadReservation, { id });
    if (version.code !== code || (version.codeRevision ?? 0) !== revision) {
      throw new ConvexError("The code changed. Upload the updated PDF.");
    }
    if (bytes.byteLength > MAX_RESUME_PDF_BYTES) {
      throw new ConvexError("Choose a PDF no larger than 2 MB.");
    }

    try {
      const document = await PDFDocument.load(bytes, { parseSpeed: ParseSpeeds.Fastest, throwOnInvalidObject: true });
      if (!document.getPageCount()) throw new Error("No pages");
    } catch {
      throw new ConvexError("Choose a readable PDF with at least one page.");
    }

    const pdf = await ctx.storage.store(new Blob([bytes], { type: "application/pdf" }));
    try {
      await ctx.runMutation(internal.resumeReservations.attachPdf, { id, revision, pdf });
    } catch (error) {
      await ctx.storage.delete(pdf);
      throw error;
    }
  },
});

export const publish = mutation({
  args: { id: v.id("resumeVersions"), revision: v.number(), pdf: v.id("_storage") },
  handler: async (ctx, { id, revision, pdf }) => {
    await requireOwner(ctx);
    const version = requireReservation(await ctx.db.get(id));
    if (version.pdf !== pdf || (version.codeRevision ?? 0) !== revision) {
      throw new ConvexError("The code or PDF changed. Review the reservation before publishing.");
    }
    await ctx.db.patch(id, { publishedAt: Date.now() });
  },
});

export const retire = mutation({
  args: { id: v.id("resumeVersions"), operation: v.union(v.literal("archive"), v.literal("revoke")) },
  handler: async (ctx, { id, operation }) => {
    await requireOwner(ctx);
    const version = await ctx.db.get(id);
    if (!version || version.publishedAt === undefined) throw new ConvexError("Publish the reservation first.");
    if (operation === "archive" && version.archivedAt === undefined) {
      await ctx.db.patch(id, { archivedAt: Date.now() });
    }
    if (operation === "revoke" && version.revokedAt === undefined) {
      await ctx.db.patch(id, { revokedAt: Date.now() });
    }
  },
});

export const expireLookupLimit = internalMutation({
  args: { id: v.id("resumeLookupLimits") },
  handler: async (ctx, { id }) => {
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});

export const resolvePdf = internalMutation({
  args: { code: v.string(), client: v.string() },
  handler: async (ctx, { code, client }) => {
    const now = Date.now();
    const limit = await ctx.db.query("resumeLookupLimits").withIndex("by_client", (q) => q.eq("client", client)).unique();
    const current = limit && limit.resetsAt > now;
    if (current && limit.failures >= 30) return { status: "limited" as const };

    const version = isResumeCode(code)
      ? await ctx.db.query("resumeVersions").withIndex("by_code", (q) => q.eq("code", code)).unique()
      : null;
    if (version?.pdf && version.publishedAt !== undefined && version.revokedAt === undefined) {
      return { status: "active" as const, pdf: version.pdf };
    }

    if (current) {
      await ctx.db.patch(limit._id, { failures: limit.failures + 1 });
    } else {
      if (limit) await ctx.db.delete(limit._id);
      const resetsAt = now + 60_000;
      const id = await ctx.db.insert("resumeLookupLimits", { client, failures: 1, resetsAt });
      await ctx.scheduler.runAt(resetsAt, internal.resumeReservations.expireLookupLimit, { id });
    }
    return { status: "missing" as const };
  },
});
