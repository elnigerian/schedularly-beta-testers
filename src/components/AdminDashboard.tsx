"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, TrendingUp, Clock, Home } from "lucide-react";

type Submission = {
  _id: string;
  name: string;
  email: string;
  totalScore: number;
  tier: string;
  tierLabel: string;
  submittedAt: number;
  cityText?: string;
  hasLandlord: boolean;
};

function getTierVariant(tier: string): "tier1" | "tier2" | "tier3" | "disqualified" {
  switch (tier) {
    case "tier1": return "tier1";
    case "tier2": return "tier2";
    case "tier3": return "tier3";
    default: return "disqualified";
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Auth Gate ─────────────────────────────────────────────────────────────────

function AdminAuthGate({
  onAuth,
}: {
  onAuth: (secret: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-[#F2A900] flex items-center justify-center">
              <span
                className="text-[16px] font-bold text-[#1B2A4A]"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                S
              </span>
            </div>
            <span
              className="text-lg text-[#1B2A4A]"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              Schedularly
            </span>
          </div>
          <CardTitle className="text-[18px] text-[#1B2A4A]">
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!value.trim()) {
                setError(true);
                return;
              }
              onAuth(value.trim());
            }}
            className="flex flex-col gap-3"
          >
            <Input
              type="password"
              placeholder="Admin secret"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              aria-label="Admin secret"
              aria-describedby={error ? "auth-error" : undefined}
            />
            {error && (
              <p id="auth-error" className="text-xs text-[#DC2626]">
                Please enter the admin secret.
              </p>
            )}
            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Stats Row ─────────────────────────────────────────────────────────────────

function StatsRow({ submissions }: { submissions: Submission[] }) {
  const total = submissions.length;
  const tier1 = submissions.filter((s) => s.tier === "tier1").length;
  const tier2 = submissions.filter((s) => s.tier === "tier2").length;
  const withLandlord = submissions.filter((s) => s.hasLandlord).length;

  const stats = [
    { label: "Total Applicants", value: total, icon: Users, color: "text-[#0D7377]" },
    { label: "Tier 1 (Priority)", value: tier1, icon: TrendingUp, color: "text-[#34D399]" },
    { label: "Tier 2 (Conditional)", value: tier2, icon: Clock, color: "text-[#FCD34D]" },
    { label: "With Landlord", value: withLandlord, icon: Home, color: "text-[#60A5FA]" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <span className="text-[12px] text-[#64748B] font-medium">
                {s.label}
              </span>
            </div>
            <div
              className="text-[28px] font-bold text-[#1E293B]"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              {s.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Submissions Table ─────────────────────────────────────────────────────────

function SubmissionsTable({
  submissions,
  onSelect,
}: {
  submissions: Submission[];
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = submissions.filter((s) => {
    if (filter !== "all" && s.tier !== filter) return false;
    if (
      search &&
      !s.name.toLowerCase().includes(search.toLowerCase()) &&
      !s.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <CardTitle className="text-[18px] text-[#1B2A4A]">
            All Submissions
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {["all", "tier1", "tier2", "tier3", "low"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide transition-all",
                  filter === t
                    ? "bg-[#0D7377] text-white"
                    : "bg-[#F5F7FA] text-[#64748B] hover:bg-[#E6F4F4]"
                )}
              >
                {t === "all" ? "All" : t === "low" ? "Low" : t.replace("tier", "Tier ")}
              </button>
            ))}
          </div>
        </div>
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
          aria-label="Search submissions"
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D1DCE9] bg-[#F5F7FA]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                  Applicant
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                  Score
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                  Tier
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide hidden sm:table-cell">
                  City
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide hidden md:table-cell">
                  Submitted
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide hidden lg:table-cell">
                  Landlord
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-[#64748B] text-sm"
                  >
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-[#D1DCE9] hover:bg-[#F0F9F9] transition-colors cursor-pointer"
                    onClick={() => onSelect(s._id)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#1E293B]">
                        {s.name}
                      </div>
                      <div className="text-[12px] text-[#64748B]">
                        {s.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[22px] font-bold text-[#0D7377]"
                        style={{ fontFamily: "var(--font-dm-serif)" }}
                      >
                        {s.totalScore}
                      </span>
                      <span className="text-[12px] text-[#94A3B8]">/22</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={getTierVariant(s.tier)}
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {s.tierLabel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-[13px] text-[#64748B]">
                      {s.cityText || "—"}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-[12px] text-[#64748B]">
                      {formatDate(s.submittedAt)}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {s.hasLandlord ? (
                        <span className="text-[11px] font-semibold text-[#34D399] bg-[rgba(5,150,105,0.1)] px-2 py-0.5 rounded-full">
                          Yes
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        className="text-[12px] text-[#0D7377] font-medium hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(s._id);
                        }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────

export function AdminDashboard() {
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const router = useRouter();

  const submissions = useQuery(
    api.submissions.listSubmissions,
    adminSecret ? { adminSecret } : "skip"
  );

  if (!adminSecret) {
    return <AdminAuthGate onAuth={setAdminSecret} />;
  }

  if (submissions === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#64748B]">Loading submissions…</div>
      </div>
    );
  }

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
        <span className="text-[14px] text-white/70 font-medium">
          Admin Dashboard
        </span>
        <a
          href="/"
          className="ml-auto text-[12px] text-white/60 hover:text-white transition-colors"
        >
          ← Back to form
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-5 pt-8">
        <div className="mb-6">
          <h1
            className="text-[28px] text-[#1B2A4A] mb-1"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Applicant Dashboard
          </h1>
          <p className="text-[14px] text-[#64748B]">
            Review and manage beta applicants. Scores are calculated server-side
            using the hidden rubric.
          </p>
        </div>

        <StatsRow submissions={submissions as Submission[]} />

        <SubmissionsTable
          submissions={submissions as Submission[]}
          onSelect={(id) => router.push(`/admin/${id}?secret=${adminSecret}`)}
        />
      </div>
    </div>
  );
}
