import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {submissionsSchema} from "./submissions";

export default defineSchema({
  submissions: defineTable(submissionsSchema)
    .index("by_score", ["totalScore"])
    .index("by_email", ["email"])
    .index("by_submitted_at", ["submittedAt"]),

  admin_users: defineTable({
    email: v.string(),
    role: v.string(), // "admin" | "reviewer"
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
