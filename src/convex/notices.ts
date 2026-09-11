import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all notices, sorted by newest first.
 * Optionally filter by category.
 */
export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("events"),
        v.literal("internships"),
        v.literal("academics"),
        v.literal("hackathons"),
        v.literal("general")
      )
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let notices;

    if (args.category) {
      notices = await ctx.db
        .query("notices")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    } else {
      notices = await ctx.db
        .query("notices")
        .withIndex("by_createdAt")
        .order("desc")
        .collect();
    }

    // Filter by search query if provided
    if (args.search && args.search.trim()) {
      const searchLower = args.search.toLowerCase();
      notices = notices.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.description.toLowerCase().includes(searchLower)
      );
    }

    return notices;
  },
});

/**
 * Get a single notice by ID.
 */
export const get = query({
  args: { noticeId: v.id("notices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.noticeId);
  },
});

/**
 * Create a new notice. Must be authenticated.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("events"),
      v.literal("internships"),
      v.literal("academics"),
      v.literal("hackathons"),
      v.literal("general")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to create a notice.");
    }

    const user = await ctx.db.get(userId);
    const authorName = user?.name || "Anonymous";

    const noticeId = await ctx.db.insert("notices", {
      title: args.title,
      description: args.description,
      category: args.category,
      userId,
      authorName,
      createdAt: Date.now(),
    });

    return noticeId;
  },
});

/**
 * Update an existing notice. Only the owner can update.
 */
export const update = mutation({
  args: {
    noticeId: v.id("notices"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("events"),
      v.literal("internships"),
      v.literal("academics"),
      v.literal("hackathons"),
      v.literal("general")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to update a notice.");
    }

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) {
      throw new Error("Notice not found.");
    }

    if (notice.userId !== userId) {
      throw new Error("You can only edit your own notices.");
    }

    await ctx.db.patch(args.noticeId, {
      title: args.title,
      description: args.description,
      category: args.category,
    });

    return args.noticeId;
  },
});

/**
 * Delete a notice. Only the owner can delete.
 */
export const remove = mutation({
  args: { noticeId: v.id("notices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to delete a notice.");
    }

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) {
      throw new Error("Notice not found.");
    }

    if (notice.userId !== userId) {
      throw new Error("You can only delete your own notices.");
    }

    await ctx.db.delete(args.noticeId);
    return args.noticeId;
  },
});
