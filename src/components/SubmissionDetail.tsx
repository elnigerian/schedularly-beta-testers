"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, MapPin, Home, MessageSquare, ExternalLink } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

type BreakdownItem = {
  field: string;
  label: string;
  max: number;
  awarded: number;
  answerLabel: string;
};

type SubmissionDetail = {
  _id: string;
  name: string;
  email: string;
  cityText?: string;
  painDescription?: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordSize?: string;
  channelDetail?: string;
  totalScore: number;
  tier: string;
  tierLabel: string;
  submittedAt: number;
  breakdown: BreakdownItem[];
};

function getTierVariant(tier: string): "tier1" | "tier2" | "tier3" | "disqualified" {
  switch (tier) {
    case "tier1": return "tier1";
    case "tier2": return "tier2";
    case "tier3": return "tier3";
    default: return "disqualified";
  }
}

function ScoreBar({ awarded, max }: { awarded: number; max: number }) {
  const pct = max > 0 ? (awarded / max) * 100 : 0;
  const color =
    pct >= 80
      ? "bg-[#059669]"
      : pct >= 50
      ? "bg-[#0D7377]"
      : pct > 0
      ? "bg-[#D97706]"
      : "bg-[#DC2626]";

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold text-[#1E293B] whitespace-nowrap">
        {awarded}/{max} pts
      </span>
    </div>
  );
}

export function SubmissionDetail({
  submissionId,
  adminSecret,
}: {
  submissionId: string;
  adminSecret: string;
}) {
  const router = useRouter();

  const detail = useQuery(api.submissions.getSubmissionDetail, {
    id: submissionId as Id<"submissions">,
    adminSecret,
  });

  if (detail === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#64748B]">Loading…</div>
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-[#64748B]">Submission not found or unauthorized.</div>
        <button
          onClick={() => router.back()}
          className="text-[#0D7377] hover:underline text-sm"
        >
          ← Back
        </button>
      </div>
    );
  }

  const s = detail as SubmissionDetail;

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">
      {/* Header */}
      <div
        className="px-8 h-[60px] flex items-center gap-3 sticky top-0 z-40"
        style={{
          background: "#1B2A4A",
          boxShadow: "0 2px 12px rgba(27,42,74,.35)",
        }}
      >
        <div className="h-[34px] w-[34px] rounded-lg flex items-center justify-center bg-[#F2A900]">
          <span
            className="text-[18px] font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            S
          </span>
        </div>
        <span
          className="text-[20px] text-white"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          Schedularly
        </span>
        <span className="text-white/40 mx-1">/</span>
        <a
          href="/admin"
          className="text-[14px] text-white/60 hover:text-white transition-colors"
        >
          Admin
        </a>
        <span className="text-white/40 mx-1">/</span>
        <span className="text-[14px] text-white/70 font-medium truncate max-w-[200px]">
          {s.name}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-5 pt-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0D7377] mb-5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        {/* Hero card */}
        <div className="bg-[#1B2A4A] rounded-xl px-6 py-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[22px] text-white font-semibold">{s.name}</div>
            <div className="text-[13px] text-white/60 flex items-center gap-1 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {s.email}
            </div>
            {s.cityText && (
              <div className="text-[13px] text-white/60 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {s.cityText}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-baseline gap-1">
              <span
                className="text-[42px] text-[#F2A900] leading-none"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                {s.totalScore}
              </span>
              <span className="text-[18px] text-white/40">/22</span>
            </div>
            <Badge
              variant={getTierVariant(s.tier)}
              className="text-[11px] uppercase tracking-wide"
            >
              {s.tierLabel}
            </Badge>
            <div className="text-[11px] text-white/40">
              {new Date(s.submittedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Scoring Breakdown — Admin Only */}
        <Card className="mb-5">
          <CardHeader>
            <CardTitle className="text-[16px] text-[#1B2A4A]">
              Scoring Breakdown{" "}
              <span className="text-[11px] font-normal text-[#64748B] ml-2 bg-[#F5F7FA] px-2 py-0.5 rounded-full border border-[#D1DCE9]">
                Admin View Only
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-[#F1F5F9]">
            {s.breakdown.map((item) => (
              <div key={item.field} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#1E293B]">
                      {item.label}
                    </div>
                    <div className="text-[12px] text-[#64748B] mt-0.5 leading-snug">
                      {item.answerLabel}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={cn(
                        "text-[13px] font-bold",
                        item.awarded === item.max
                          ? "text-[#059669]"
                          : item.awarded > 0
                          ? "text-[#0D7377]"
                          : "text-[#DC2626]"
                      )}
                    >
                      +{item.awarded}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">/{item.max}</span>
                  </div>
                </div>
                <ScoreBar awarded={item.awarded} max={item.max} />
              </div>
            ))}
            <div className="pt-4 flex justify-between items-center">
              <span className="text-[14px] font-bold text-[#1B2A4A]">
                Total Score
              </span>
              <span
                className="text-[24px] font-bold text-[#0D7377]"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                {s.totalScore}
                <span className="text-[14px] text-[#94A3B8] font-normal">
                  /22
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Qualitative Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {s.painDescription && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] text-[#1B2A4A] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#0D7377]" />
                  Pain Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-[#475569] leading-relaxed italic">
                  &ldquo;{s.painDescription}&rdquo;
                </p>
              </CardContent>
            </Card>
          )}

          {(s.landlordName || s.landlordEmail) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] text-[#1B2A4A] flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#059669]" />
                  Landlord Nomination
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {s.landlordName && (
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium uppercase tracking-wide mb-0.5">
                      Name
                    </div>
                    <div className="text-[13px] text-[#1E293B]">
                      {s.landlordName}
                    </div>
                  </div>
                )}
                {s.landlordEmail && (
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium uppercase tracking-wide mb-0.5">
                      Email
                    </div>
                    <a
                      href={`mailto:${s.landlordEmail}`}
                      className="text-[13px] text-[#0D7377] hover:underline flex items-center gap-1"
                    >
                      {s.landlordEmail}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {s.landlordSize && (
                  <div>
                    <div className="text-[11px] text-[#64748B] font-medium uppercase tracking-wide mb-0.5">
                      Portfolio Size
                    </div>
                    <div className="text-[13px] text-[#1E293B]">
                      {s.landlordSize}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {s.channelDetail && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] text-[#1B2A4A]">
                  Acquisition Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-[#475569]">{s.channelDetail}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
