import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    // Default auth tables - do not remove
    ...authTables,

    // Users table (extended from authTables)
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
    }).index("email", ["email"]),

    // Notices / Posts table
    notices: defineTable({
      title: v.string(),
      description: v.string(),
      category: v.union(
        v.literal("events"),
        v.literal("internships"),
        v.literal("academics"),
        v.literal("hackathons"),
        v.literal("general")
      ),
      userId: v.id("users"),
      authorName: v.string(),
      createdAt: v.number(),
    })
      .index("by_createdAt", ["createdAt"])
      .index("by_category", ["category", "createdAt"])
      .index("by_userId", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
