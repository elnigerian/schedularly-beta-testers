/**
 * Internal scoring rubric — server-side only.
 * These values are never exposed to the client UI.
 */

export const SCORING_RUBRIC = {
  q1: {
    label: "Move Timeline",
    max: 3,
    options: [
      { value: 3, label: "Actively applying / moving within 90 days" },
      { value: 2, label: "Planning to move in 3–6 months" },
      { value: 1, label: "Possibly moving in 6–12 months" },
      { value: 0, label: "No specific plans" },
    ],
  },
  qMarket: {
    label: "Market Competitiveness",
    max: 2,
    options: [
      { value: 2, label: "Major metro (NYC, SF, LA, Chicago, etc.)" },
      { value: 1, label: "Mid-size city with competitive market" },
      { value: 0, label: "Smaller city or suburban/rural" },
    ],
  },
  q2: {
    label: "Rental Application Volume",
    max: 3,
    options: [
      { value: 3, label: "6 or more applications" },
      { value: 2, label: "3–5 applications" },
      { value: 1, label: "1–2 applications" },
      { value: 0, label: "Never applied" },
    ],
  },
  qTenure: {
    label: "Tenancy Length",
    max: 2,
    options: [
      { value: 2, label: "3+ years or multiple verified tenancies" },
      { value: 1, label: "1–3 years at current address" },
      { value: 0, label: "Less than 1 year or between rentals" },
    ],
  },
  q3: {
    label: "Verification Pain",
    max: 3,
    options: [
      { value: 3, label: "Lost a rental due to missing/slow documentation" },
      { value: 2, label: "Significant delays chasing references/documents" },
      { value: 1, label: "Heard about this from others" },
      { value: 0, label: "No verification issues" },
    ],
  },
  q4: {
    label: "Tech Comfort",
    max: 2,
    options: [
      { value: 2, label: "Active app user, tries new tools regularly" },
      { value: 1, label: "Uses a few apps but not tech-forward" },
      { value: 0, label: "Mostly email, prefers paper" },
    ],
  },
  qRole: {
    label: "Work Situation / Mobility",
    max: 2,
    options: [
      {
        value: 2,
        label: "Travel nurse, military, corporate relocator, or high-mobility",
      },
      { value: 1, label: "Remote worker, consultant, student, freelancer" },
      { value: 0, label: "Standard office role, moves infrequently" },
    ],
  },
  q5: {
    label: "Landlord Nomination",
    max: 3,
    options: [
      { value: 3, label: "Yes — spoken to them, they're willing, have contact info" },
      { value: 2, label: "Probably yes — believe they would participate" },
      { value: 1, label: "Unsure — not sure they'd participate" },
      { value: 0, label: "No — large property management or no current landlord" },
    ],
  },
  qChannel: {
    label: "Acquisition Channel",
    max: 2,
    options: [
      { value: 2, label: "Referral / Product Hunt / LinkedIn" },
      { value: 1, label: "Reddit / BiggerPockets / Facebook Group" },
      { value: 0, label: "Instagram / TikTok / Twitter/X / other social" },
    ],
  },
} as const;

export const TOTAL_MAX_SCORE = 22; // 22 scoreable points + qualitative pain description

export const TIER_THRESHOLDS = {
  tier1: 18,
  tier2: 12,
  tier3: 7,
} as const;

export type AnswerKey = keyof typeof SCORING_RUBRIC;

export interface SubmissionAnswers {
  q1?: number;
  qMarket?: number;
  q2?: number;
  qTenure?: number;
  q3?: number;
  q4?: number;
  qRole?: number;
  q5?: number;
  qChannel?: number;
}

export function computeScore(answers: SubmissionAnswers): number {
  return (
    (answers.q1 ?? 0) +
    (answers.qMarket ?? 0) +
    (answers.q2 ?? 0) +
    (answers.qTenure ?? 0) +
    (answers.q3 ?? 0) +
    (answers.q4 ?? 0) +
    (answers.qRole ?? 0) +
    (answers.q5 ?? 0) +
    (answers.qChannel ?? 0)
  );
}

export function computeTier(score: number): string {
  if (score >= TIER_THRESHOLDS.tier1) return "tier1";
  if (score >= TIER_THRESHOLDS.tier2) return "tier2";
  if (score >= TIER_THRESHOLDS.tier3) return "tier3";
  return "low";
}

export function getTierLabel(tier: string): string {
  switch (tier) {
    case "tier1":
      return "Tier 1 — Priority Invite";
    case "tier2":
      return "Tier 2 — Conditional Invite";
    case "tier3":
      return "Waitlist — We'll be in touch";
    default:
      return "Low Priority";
  }
}

export function getOptionLabel(field: AnswerKey, value: number): string {
  const rubric = SCORING_RUBRIC[field];
  const option = rubric.options.find((o) => o.value === value);
  return option?.label ?? `${value} pts`;
}
