import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  computeScore,
  computeTier,
  SCORING_RUBRIC,
  getTierLabel,
  getOptionLabel,
} from './scoring';

export const submissionsSchema = {
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
}

// ── Public: Submit a new application ─────────────────────────────────────────

export const submitApplication = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    q1: v.optional(v.number()),
    qMarket: v.optional(v.number()),
    cityText: v.optional(v.string()),
    q2: v.optional(v.number()),
    qTenure: v.optional(v.number()),
    q3: v.optional(v.number()),
    painDescription: v.optional(v.string()),
    q4: v.optional(v.number()),
    qRole: v.optional(v.number()),
    q5: v.optional(v.number()),
    landlordName: v.optional(v.string()),
    landlordEmail: v.optional(v.string()),
    landlordSize: v.optional(v.string()),
    qChannel: v.optional(v.number()),
    channelDetail: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const {
      name,
      email,
      cityText,
      painDescription,
      landlordName,
      landlordEmail,
      landlordSize,
      channelDetail,
      ...answers
    } = args;

    // Server-side score computation — rubric never sent to client
    const totalScore = computeScore(answers);
    const tier = computeTier(totalScore);

    const id = await ctx.db.insert("submissions", {
      name,
      email,
      cityText,
      painDescription,
      landlordName,
      landlordEmail,
      landlordSize,
      channelDetail,
      ...answers,
      totalScore,
      tier,
      submittedAt: Date.now(),
    });

    return { id, totalScore, tier };
  },
});

// ── Public: Get score preview (server-side, rubric hidden) ────────────────────

export const getScorePreview = query({
  args: {
    q1: v.optional(v.number()),
    qMarket: v.optional(v.number()),
    q2: v.optional(v.number()),
    qTenure: v.optional(v.number()),
    q3: v.optional(v.number()),
    q4: v.optional(v.number()),
    qRole: v.optional(v.number()),
    q5: v.optional(v.number()),
    qChannel: v.optional(v.number()),
  },
  handler: async (_ctx: any, args: any) => {
    const score = computeScore(args);
    const tier = computeTier(score);
    return { score, tier };
  },
});

// ── Admin: List all submissions ───────────────────────────────────────────────

export const listSubmissions = query({
  args: {
    adminSecret: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("Unauthorized");
    }
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_submitted_at")
      .order("desc")
      .collect();

    return submissions.map((s: any) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      totalScore: s.totalScore,
      tier: s.tier,
      tierLabel: getTierLabel(s.tier),
      submittedAt: s.submittedAt,
      cityText: s.cityText,
      hasLandlord: (s.q5 ?? 0) >= 2,
    }));
  },
});

// ── Admin: Get full submission detail with scoring breakdown ──────────────────

export const getSubmissionDetail = query({
  args: {
    id: v.id("submissions"),
    adminSecret: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("Unauthorized");
    }

    const s = await ctx.db.get(args.id);
    if (!s) return null;

    const breakdown = (
      Object.keys(SCORING_RUBRIC) as Array<keyof typeof SCORING_RUBRIC>
    ).map((field) => {
      const value = s[field] as number | undefined;
      const rubric = SCORING_RUBRIC[field];
      return {
        field,
        label: rubric.label,
        max: rubric.max,
        awarded: value ?? 0,
        answerLabel:
          value !== undefined
            ? getOptionLabel(field, value)
            : "Not answered",
      };
    });

    return {
      _id: s._id,
      name: s.name,
      email: s.email,
      cityText: s.cityText,
      painDescription: s.painDescription,
      landlordName: s.landlordName,
      landlordEmail: s.landlordEmail,
      landlordSize: s.landlordSize,
      channelDetail: s.channelDetail,
      totalScore: s.totalScore,
      tier: s.tier,
      tierLabel: getTierLabel(s.tier),
      submittedAt: s.submittedAt,
      breakdown,
    };
  },
});
