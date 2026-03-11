"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle2, Home, MapPin, Clock, FileText, Cpu, Users, Info } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Schema ────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  q1: z.number().optional(),
  qMarket: z.number().optional(),
  cityText: z.string().optional(),
  q2: z.number().optional(),
  qTenure: z.number().optional(),
  q3: z.number().optional(),
  painDescription: z.string().optional(),
  q4: z.number().optional(),
  qRole: z.number().optional(),
  q5: z.number().optional(),
  landlordName: z.string().optional(),
  landlordEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  landlordSize: z.string().optional(),
  qChannel: z.number().optional(),
  channelDetail: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────

type RadioOption = {
  value: number;
  label: string;
};

type ScoreAnswers = {
  q1?: number;
  qMarket?: number;
  q2?: number;
  qTenure?: number;
  q3?: number;
  q4?: number;
  qRole?: number;
  q5?: number;
  qChannel?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTierVariant(tier: string): "tier1" | "tier2" | "tier3" | "disqualified" | "incomplete" {
  switch (tier) {
    case "tier1": return "tier1";
    case "tier2": return "tier2";
    case "tier3": return "tier3";
    case "low": return "disqualified";
    default: return "incomplete";
  }
}

function getTierLabel(tier: string, score: number): string {
  if (score === 0) return "Incomplete";
  switch (tier) {
    case "tier1": return "Tier 1 — Priority";
    case "tier2": return "Tier 2 — Conditional";
    case "tier3": return "Waitlist";
    case "low": return "Low Priority";
    default: return "Incomplete";
  }
}

// ── RadioGroup ────────────────────────────────────────────────────────────────

function RadioGroup({
  field,
  options,
  value,
  onChange,
}: {
  field: string;
  options: RadioOption[];
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup">
      {options.map((opt) => (
        <label
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-start gap-3 px-4 py-3 rounded-lg border-[1.5px] cursor-pointer transition-all",
            "hover:border-[#14A098] hover:bg-[#F0F9F9]",
            value === opt.value
              ? "border-[#0D7377] bg-[#E6F4F4]"
              : "border-[#D1DCE9] bg-[#FAFBFC]"
          )}
        >
          <input
            type="radio"
            name={field}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
            aria-label={opt.label}
          />
          <div
            className={cn(
              "mt-0.5 h-4.5 w-4.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
              value === opt.value
                ? "border-[#0D7377] bg-[#0D7377]"
                : "border-[#D1DCE9]"
            )}
          >
            {value === opt.value && (
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </div>
          <span className="text-sm text-[#1E293B] leading-snug">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

// ── ChannelTip ────────────────────────────────────────────────────────────────

function ChannelTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-3.5 mb-5 rounded-r-lg border-l-[3px] border-[#14A098] bg-[#F0F9FF] text-[#0369A1] text-[12.5px] leading-relaxed">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#0D7377]" />
      <div>{children}</div>
    </div>
  );
}

// ── SectionTag ────────────────────────────────────────────────────────────────

function SectionTag({
  type,
}: {
  type: "renter" | "landlord" | "both";
}) {
  const styles = {
    renter: "bg-[rgba(14,165,233,0.2)] text-[#38BDF8]",
    landlord: "bg-[rgba(5,150,105,0.2)] text-[#34D399]",
    both: "bg-[rgba(242,169,0,0.2)] text-[#F2A900]",
  };
  const labels = { renter: "Renter", landlord: "Landlord", both: "Both Sides" };
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide",
        styles[type]
      )}
    >
      {labels[type]}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ScreeningForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedTier, setSubmittedTier] = useState("");
  const [submittedScore, setSubmittedScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track scored answers separately for live preview
  const [answers, setAnswers] = useState<ScoreAnswers>({});

  const submitApplication = useMutation(api.submissions.submitApplication);

  // Server-side score preview (rubric stays server-side)
  const scorePreview = useQuery(api.submissions.getScorePreview, answers);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const watchedQ5 = watch("q5");
  const showLandlordFields = watchedQ5 !== undefined && watchedQ5 >= 2;

  // Count required radio fields answered
  const REQUIRED_FIELDS: (keyof ScoreAnswers)[] = [
    "q1", "qMarket", "q2", "qTenure", "q3", "q4", "qRole", "q5", "qChannel",
  ];
  const answeredCount = REQUIRED_FIELDS.filter((f) => answers[f] !== undefined).length;
  const progressPct = Math.round((answeredCount / REQUIRED_FIELDS.length) * 100);

  const setRadioAnswer = useCallback(
    (field: keyof ScoreAnswers, value: number) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));
      setValue(field as keyof FormValues, value as never);
    },
    [setValue]
  );

  const currentScore = scorePreview?.score ?? 0;
  const currentTier = scorePreview?.tier ?? "low";

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitApplication({
        name: data.name,
        email: data.email,
        q1: data.q1,
        qMarket: data.qMarket,
        cityText: data.cityText,
        q2: data.q2,
        qTenure: data.qTenure,
        q3: data.q3,
        painDescription: data.painDescription,
        q4: data.q4,
        qRole: data.qRole,
        q5: data.q5,
        landlordName: data.landlordName || undefined,
        landlordEmail: data.landlordEmail || undefined,
        landlordSize: data.landlordSize,
        qChannel: data.qChannel,
        channelDetail: data.channelDetail,
      });
      setSubmittedTier(result.tier);
      setSubmittedScore(result.totalScore);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────

  if (submitted) {
    const tierConfig = {
      tier1: {
        label: "🎉 Tier 1 — Priority Invite",
        style: "bg-[rgba(5,150,105,0.12)] text-[#065F46] border-2 border-[#6EE7B7]",
      },
      tier2: {
        label: "⏳ Tier 2 — Conditional Invite",
        style: "bg-[rgba(217,119,6,0.1)] text-[#92400E] border-2 border-[#FCD34D]",
      },
      tier3: {
        label: "📋 Waitlist — We'll be in touch",
        style: "bg-[rgba(100,116,139,0.1)] text-[#475569] border-2 border-[#CBD5E1]",
      },
      low: {
        label: "Thank you for applying",
        style: "bg-[#FEF2F2] text-[#991B1B] border-2 border-[#FCA5A5]",
      },
    };
    const config = tierConfig[submittedTier as keyof typeof tierConfig] ?? tierConfig.low;

    return (
      <div className="max-w-[560px] mx-auto px-5 py-16 text-center">
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-[#0D7377] to-[#14A098] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
        <h2
          className="text-[28px] text-[#1B2A4A] mb-3"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          Application Received!
        </h2>
        <p className="text-[15px] text-[#64748B] leading-relaxed mb-6">
          We&apos;ll review your application and follow up within{" "}
          <strong>3 business days</strong>. If you nominated a landlord, watch
          for a separate invite in their inbox.
        </p>
        <div
          className={cn(
            "inline-block px-7 py-3.5 rounded-xl text-[15px] font-bold mb-6",
            config.style
          )}
        >
          {config.label}
        </div>
        <p className="text-[13px] text-[#94A3B8] leading-relaxed">
          While you wait — think about which rental history you&apos;d most want
          verified first. That&apos;s the first thing we&apos;ll help you build.
        </p>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Sticky Progress Bar */}
      <div className="sticky top-[60px] z-40 bg-[#1B2A4A]/95 backdrop-blur-sm border-b border-white/10 px-5 py-3">
        <div className="max-w-[740px] mx-auto">
          <Progress value={progressPct} className="h-1.5 mb-1.5" />
          <p className="text-[11px] text-white/50 text-right">
            {answeredCount} of {REQUIRED_FIELDS.length} questions answered
          </p>
        </div>
      </div>

      <div className="max-w-[740px] mx-auto px-5 pt-6 pb-10">
        <Accordion type="multiple" defaultValue={["section-1"]}>
          {/* ── SECTION 1: Your Move & Timeline ── */}
          <AccordionItem value="section-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#F2A900] text-[#1B2A4A] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <span
                  className="text-[17px] text-white flex-1 truncate"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Your Move &amp; Timeline
                </span>
                <SectionTag type="renter" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ChannelTip>
                <strong>Channel note:</strong> If you found us on{" "}
                <strong>Reddit</strong> (r/renting, r/NYCapartments, etc.),
                your post history may already signal urgency. On{" "}
                <strong>Facebook Groups</strong> or via <strong>email</strong>,
                this question carries full weight.
              </ChannelTip>

              <div className="mb-5">
                <Label className="mb-1.5 block">
                  When are you planning to move?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <p className="text-xs text-[#64748B] mb-2.5">
                  This helps us match you with renters who need the platform
                  most urgently.
                </p>
                <RadioGroup
                  field="q1"
                  value={answers.q1}
                  onChange={(v) => setRadioAnswer("q1", v)}
                  options={[
                    {
                      value: 3,
                      label:
                        "I'm actively applying to rentals right now, or moving within the next 90 days",
                    },
                    {
                      value: 2,
                      label: "I'm planning to move in 3–6 months",
                    },
                    { value: 1, label: "Possibly moving in 6–12 months" },
                    {
                      value: 0,
                      label: "No specific plans to move right now",
                    },
                  ]}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">
                  What city or metro area are you renting in (or moving to)?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <p className="text-xs text-[#64748B] mb-2.5">
                  Competitive markets = higher stakes = more value from
                  verified records.
                </p>
                <RadioGroup
                  field="qMarket"
                  value={answers.qMarket}
                  onChange={(v) => setRadioAnswer("qMarket", v)}
                  options={[
                    {
                      value: 2,
                      label:
                        "Major metro — NYC, SF, LA, Chicago, Miami, Austin, Boston, Seattle, or similar",
                    },
                    {
                      value: 1,
                      label: "Mid-size city with competitive rental market",
                    },
                    {
                      value: 0,
                      label: "Smaller city or suburban / rural area",
                    },
                  ]}
                />
                <Input
                  {...register("cityText")}
                  placeholder="Type your city (e.g. Brooklyn, NY)"
                  className="mt-3"
                  aria-label="City"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 2: Rental History ── */}
          <AccordionItem value="section-2">
            <AccordionTrigger>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#F2A900] text-[#1B2A4A] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <span
                  className="text-[17px] text-white flex-1 truncate"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Your Rental History
                </span>
                <SectionTag type="renter" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ChannelTip>
                <strong>Channel note:</strong> On <strong>Reddit</strong>, we
                can cross-reference post history for this. On{" "}
                <strong>LinkedIn</strong>, frequent city changes or job moves
                are a proxy. On <strong>Typeform / email</strong>, this is
                self-reported — be honest, it helps us match you correctly.
              </ChannelTip>

              <div className="mb-5">
                <Label className="mb-1.5 block">
                  How many rental applications have you submitted in the past 2
                  years? <span className="text-[#DC2626]">*</span>
                </Label>
                <RadioGroup
                  field="q2"
                  value={answers.q2}
                  onChange={(v) => setRadioAnswer("q2", v)}
                  options={[
                    {
                      value: 3,
                      label:
                        "6 or more — I apply frequently, or I've had multiple rejections or delays",
                    },
                    { value: 2, label: "3–5 applications" },
                    { value: 1, label: "1–2 applications" },
                    { value: 0, label: "I've never applied to a rental" },
                  ]}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">
                  How long have you been at your current (or most recent)
                  address? <span className="text-[#DC2626]">*</span>
                </Label>
                <RadioGroup
                  field="qTenure"
                  value={answers.qTenure}
                  onChange={(v) => setRadioAnswer("qTenure", v)}
                  options={[
                    {
                      value: 2,
                      label:
                        "3 or more years — or I have multiple verified tenancies I can document",
                    },
                    { value: 1, label: "1–3 years at current address" },
                    {
                      value: 0,
                      label: "Less than 1 year, or currently between rentals",
                    },
                  ]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 3: Verification Pain ── */}
          <AccordionItem value="section-3">
            <AccordionTrigger>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#F2A900] text-[#1B2A4A] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <span
                  className="text-[17px] text-white flex-1 truncate"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Your Verification Pain
                </span>
                <SectionTag type="renter" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ChannelTip>
                <strong>Channel note:</strong> This is the highest-signal
                section. On <strong>Reddit</strong>, look for users who posted
                things like &quot;lost my apartment because landlord
                couldn&apos;t verify in time.&quot; On{" "}
                <strong>Facebook Groups</strong> and{" "}
                <strong>Twitter/X</strong>, search for complaints about
                verification delays. On <strong>Typeform/email</strong>, the
                open text field below is gold.
              </ChannelTip>

              <div className="mb-5">
                <Label className="mb-1.5 block">
                  Have you ever experienced friction during a rental application
                  due to verification issues?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <RadioGroup
                  field="q3"
                  value={answers.q3}
                  onChange={(v) => setRadioAnswer("q3", v)}
                  options={[
                    {
                      value: 3,
                      label:
                        "Yes — I actually lost a rental or was rejected because of missing/slow documentation",
                    },
                    {
                      value: 2,
                      label:
                        "Yes — I experienced significant delays chasing references or documents",
                    },
                    {
                      value: 1,
                      label:
                        "I've heard about this problem from others but haven't personally experienced it",
                    },
                    {
                      value: 0,
                      label: "No — verification has never been an issue for me",
                    },
                  ]}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Briefly describe the biggest pain point in your rental
                  application experience{" "}
                  <span className="text-xs font-normal text-[#0D7377] bg-[#0D7377]/10 px-2 py-0.5 rounded-full">
                    qualitative
                  </span>
                </Label>
                <p className="text-xs text-[#64748B] mb-2.5">
                  This helps us prioritize which features to build first. Be
                  specific — even 1–2 sentences helps.
                </p>
                <Textarea
                  {...register("painDescription")}
                  placeholder="e.g. 'My previous landlord was hard to reach for references and I nearly lost my apartment waiting for a callback...'"
                  className="min-h-[90px]"
                  aria-label="Pain description"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 4: Tech & Profile ── */}
          <AccordionItem value="section-4">
            <AccordionTrigger>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#F2A900] text-[#1B2A4A] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <span
                  className="text-[17px] text-white flex-1 truncate"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Your Tech Comfort &amp; Role
                </span>
                <SectionTag type="renter" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ChannelTip>
                <strong>Channel note:</strong> <strong>Product Hunt</strong>{" "}
                applicants self-score maximum here. <strong>LinkedIn</strong>{" "}
                job titles and listed tools are a strong signal.{" "}
                <strong>Reddit</strong> accounts with technical subreddit
                activity indicate tech comfort.{" "}
                <strong>Facebook Group</strong> applicants may need more
                hand-holding during onboarding.
              </ChannelTip>

              <div className="mb-5">
                <Label className="mb-1.5 block">
                  Which best describes your digital tool usage?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <RadioGroup
                  field="q4"
                  value={answers.q4}
                  onChange={(v) => setRadioAnswer("q4", v)}
                  options={[
                    {
                      value: 2,
                      label:
                        "I actively use apps for rent payment, banking, scheduling, or productivity — I try new tools regularly",
                    },
                    {
                      value: 1,
                      label:
                        "I use a couple of apps (e.g. Venmo or a banking app) but I'm not particularly tech-forward",
                    },
                    {
                      value: 0,
                      label: "I mostly use email; I prefer paper processes",
                    },
                  ]}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Which best describes your work situation?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <p className="text-xs text-[#64748B] mb-2.5">
                  High-mobility roles tend to move more often and benefit most
                  from a portable rental profile.
                </p>
                <RadioGroup
                  field="qRole"
                  value={answers.qRole}
                  onChange={(v) => setRadioAnswer("qRole", v)}
                  options={[
                    {
                      value: 2,
                      label:
                        "Travel nurse, military / veteran, corporate relocator, or other high-mobility profession",
                    },
                    {
                      value: 1,
                      label:
                        "Remote worker, consultant, student, or freelancer — I move periodically",
                    },
                    {
                      value: 0,
                      label:
                        "Standard office-based role in one city — I move infrequently",
                    },
                  ]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 5: Landlord Nomination ── */}
          <AccordionItem value="section-5">
            <AccordionTrigger>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#F2A900] text-[#1B2A4A] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  5
                </span>
                <span
                  className="text-[17px] text-white flex-1 truncate"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Landlord Nomination
                </span>
                <SectionTag type="both" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Landlord callout */}
              <div className="flex gap-3 p-4 mb-5 rounded-xl border-[1.5px] border-[#6EE7B7] bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5]">
                <Home className="h-6 w-6 text-[#059669] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] text-[#065F46] font-semibold mb-1">
                    Why this matters — and why it benefits you
                  </h4>
                  <p className="text-[13px] text-[#047857] leading-relaxed">
                    Schedularly&apos;s verification is only as strong as the
                    landlord participation behind it. Nominating your landlord
                    now means your rental record can be verified immediately at
                    launch. A verified record dramatically increases your
                    credibility on future applications.
                  </p>
                </div>
              </div>

              <ChannelTip>
                <strong>Channel note:</strong> For <strong>Reddit</strong>{" "}
                applicants, follow up via DM to collect landlord info after
                initial acceptance. For <strong>email/Typeform</strong>{" "}
                applicants, send a 48-hr follow-up email specifically
                requesting landlord nomination. <strong>Do not require</strong>{" "}
                this upfront for Facebook Group applicants — collect it in
                onboarding instead.
              </ChannelTip>

              <div className="mb-5">
                <Label className="mb-1.5 block">
                  Can you nominate a current or recent landlord to participate
                  in beta verification?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <RadioGroup
                  field="q5"
                  value={answers.q5}
                  onChange={(v) => setRadioAnswer("q5", v)}
                  options={[
                    {
                      value: 3,
                      label:
                        "Yes — I've already spoken to them and they're willing to participate. I have their contact info.",
                    },
                    {
                      value: 2,
                      label:
                        "Probably yes — I believe they would participate if I asked",
                    },
                    {
                      value: 1,
                      label:
                        "Unsure — I have a landlord but I'm not sure they'd participate",
                    },
                    {
                      value: 0,
                      label:
                        "No — my landlord is a large property management company, or I have no current landlord",
                    },
                  ]}
                />
              </div>

              {/* Conditional landlord fields — revealed with animation */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  showLandlordFields
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                )}
                aria-hidden={!showLandlordFields}
              >
                <div className="border-t border-[#D1DCE9] mt-2 pt-5 flex flex-col gap-4">
                  <div>
                    <Label className="mb-1.5 block">
                      Landlord&apos;s name{" "}
                      <span className="text-xs font-normal text-[#0D7377] bg-[#0D7377]/10 px-2 py-0.5 rounded-full">
                        optional — helps us prepare their invite
                      </span>
                    </Label>
                    <Input
                      {...register("landlordName")}
                      placeholder="e.g. James Rivera"
                      aria-label="Landlord name"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">
                      Landlord&apos;s email address{" "}
                      <span className="text-xs font-normal text-[#64748B]">
                        optional
                      </span>
                    </Label>
                    <Input
                      {...register("landlordEmail")}
                      type="email"
                      placeholder="landlord@email.com"
                      aria-label="Landlord email"
                    />
                    {errors.landlordEmail && (
                      <p className="text-xs text-[#DC2626] mt-1">
                        {errors.landlordEmail.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-1.5 block">
                      How many units does your landlord manage?{" "}
                      <span className="text-xs font-normal text-[#64748B]">
                        helps us prioritize
                      </span>
                    </Label>
                    <Select
                      onValueChange={(v) => setValue("landlordSize", v)}
                    >
                      <SelectTrigger aria-label="Landlord unit count">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">
                          1–2 units (individual owner)
                        </SelectItem>
                        <SelectItem value="3-10">
                          3–10 units (small landlord)
                        </SelectItem>
                        <SelectItem value="11-25">11–25 units</SelectItem>
                        <SelectItem value="26+">
                          26+ units or property management company
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── SECTION 6: About You ── */}
          <AccordionItem value="section-6">
            <AccordionTrigger>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded-full bg-[#F2A900] text-[#1B2A4A] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  6
                </span>
                <span
                  className="text-[17px] text-white flex-1 truncate"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  About You
                </span>
                <SectionTag type="renter" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 mb-5">
                <div>
                  <Label htmlFor="name" className="mb-1.5 block">
                    Your full name <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="First and last name"
                    aria-required="true"
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-[#DC2626] mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block">
                    Your email address{" "}
                    <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="you@email.com"
                    aria-required="true"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-[#DC2626] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">
                  How did you hear about Schedularly?{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <p className="text-xs text-[#64748B] mb-2.5">
                  This helps us understand where our best applicants come from.
                </p>
                <RadioGroup
                  field="qChannel"
                  value={answers.qChannel}
                  onChange={(v) => setRadioAnswer("qChannel", v)}
                  options={[
                    {
                      value: 2,
                      label:
                        "Referred by a friend or current Schedularly user / Product Hunt / LinkedIn",
                    },
                    {
                      value: 1,
                      label: "Reddit, BiggerPockets, or a Facebook Group",
                    },
                    {
                      value: 0,
                      label: "Instagram, TikTok, Twitter/X, or other social media",
                    },
                  ]}
                />
                <Input
                  {...register("channelDetail")}
                  placeholder="Specific source (e.g. r/renting, 'NYC Renters' Facebook group)"
                  className="mt-3"
                  aria-label="Channel detail"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ── Score Preview & Submit ── */}
        <div className="mt-2.5 bg-white border border-[#D1DCE9] rounded-xl px-6 py-7 text-center shadow-sm">
          <div className="bg-[#1B2A4A] rounded-xl px-5 py-4 mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[13px] text-white/60 mb-1">
                Your estimated score
              </div>
              <div
                className="text-[32px] text-[#F2A900]"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                {currentScore}
                <span className="text-[18px] text-white/40">/22</span>
              </div>
            </div>
            <Badge
              variant={
                answeredCount === 0
                  ? "incomplete"
                  : getTierVariant(currentTier)
              }
              className="text-[11px] font-semibold px-3 py-1 uppercase tracking-wide"
            >
              {getTierLabel(currentTier, currentScore)}
            </Badge>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-3.5 text-[15px] font-semibold rounded-xl bg-gradient-to-br from-[#0D7377] to-[#0A5E62] hover:from-[#0A5E62] hover:to-[#084F53] shadow-lg shadow-teal-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            aria-live="polite"
          >
            {isSubmitting ? "Submitting…" : "Submit My Application →"}
          </Button>

          <p className="text-[12px] text-[#64748B] mt-3 leading-relaxed">
            We review applications within 3 business days. Beta spots are
            limited — higher scores are prioritized. Your information is never
            sold or shared.
          </p>
        </div>
      </div>
    </form>
  );
}
