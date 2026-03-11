import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    // Contact info
    name: v.string(),
    email: v.string(),

    // Q1: Move timeline (0–3)
    q1: v.optional(v.number()),

    // Q_market: City competitiveness (0–2)
    qMarket: v.optional(v.number()),
    cityText: v.optional(v.string()),

    // Q2: Rental applications in past 2 years (0–3)
    q2: v.optional(v.number()),

    // Q_tenure: Tenancy length (0–2)
    qTenure: v.optional(v.number()),

    // Q3: Verification pain (0–3)
    q3: v.optional(v.number()),
    painDescription: v.optional(v.string()),

    // Q4: Tech comfort (0–2)
    q4: v.optional(v.number()),

    // Q_role: Work situation / mobility (0–2)
    qRole: v.optional(v.number()),

    // Q5: Landlord nomination willingness (0–3)
    q5: v.optional(v.number()),
    landlordName: v.optional(v.string()),
    landlordEmail: v.optional(v.string()),
    landlordSize: v.optional(v.string()),

    // Q_channel: How did you hear about us (0–2)
    qChannel: v.optional(v.number()),
    channelDetail: v.optional(v.string()),

    // Computed fields
    totalScore: v.number(),
    tier: v.string(), // "tier1" | "tier2" | "tier3" | "low"

    // Metadata
    submittedAt: v.number(),
    ipAddress: v.optional(v.string()),
  })
    .index("by_score", ["totalScore"])
    .index("by_email", ["email"])
    .index("by_submitted_at", ["submittedAt"]),

  admin_users: defineTable({
    email: v.string(),
    role: v.string(), // "admin" | "reviewer"
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
