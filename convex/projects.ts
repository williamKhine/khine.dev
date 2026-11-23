import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwner } from "./owner";

export const published = query({
  args: {},
  handler: (ctx) => ctx.db.query("projects")
    .withIndex("by_published_order", (q) => q.eq("published", true)).collect(),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return ctx.db.query("projects").withIndex("by_published_order").collect();
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("projects")),
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    markdown: v.string(),
  },
  handler: async (ctx, { id, slug, title, summary, markdown }) => {
    await requireOwner(ctx);
    title = title.trim();
    summary = summary.trim();
    if (!title || !summary) throw new ConvexError("Enter a title and summary.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
      throw new ConvexError("Use a URL slug with lowercase letters, numbers and single hyphens.");
    }
    const fields = { title, summary, markdown };
    if (id) {
      const project = await ctx.db.get(id);
      if (!project) throw new ConvexError("Project no longer exists.");
      if (project.published && !markdown.trim()) throw new ConvexError("Enter the Case Study before saving.");
      await ctx.db.patch(id, fields);
      return id;
    }

    const existing = await ctx.db.query("projects").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (existing) throw new ConvexError("This URL slug is already in use.");

    const last = await ctx.db.query("projects").withIndex("by_order").order("desc").first();
    return ctx.db.insert("projects", { ...fields, slug, published: false, order: (last?.order ?? 0) + 1 });
  },
});

export const setPublished = mutation({
  args: { id: v.id("projects"), published: v.boolean() },
  handler: async (ctx, { id, published }) => {
    await requireOwner(ctx);
    const project = await ctx.db.get(id);
    if (!project) throw new ConvexError("Project no longer exists.");
    if (published && !project.markdown.trim()) throw new ConvexError("Enter the Case Study before publishing.");
    await ctx.db.patch(id, { published });
  },
});

export const move = mutation({
  args: { id: v.id("projects"), direction: v.union(v.literal("up"), v.literal("down")) },
  handler: async (ctx, { id, direction }) => {
    await requireOwner(ctx);
    const projects = await ctx.db.query("projects")
      .withIndex("by_published_order", (q) => q.eq("published", true)).collect();
    const index = projects.findIndex((project) => project._id === id);
    if (index === -1) return;
    const neighbor = projects[index + (direction === "up" ? -1 : 1)];
    if (!neighbor) return;
    await ctx.db.patch(id, { order: neighbor.order });
    await ctx.db.patch(neighbor._id, { order: projects[index].order });
  },
});
