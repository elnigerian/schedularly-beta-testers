
import * as React from 'react';
import { ScreeningForm } from '@/components/ScreeningForm';


export default function HomePage() {
  return (
    <main>
      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center gap-3 px-8 h-[60px]"
        style={{ background: "#1B2A4A", boxShadow: "0 2px 12px rgba(27,42,74,.35)" }}
      >
        <div
          className="h-[34px] w-[34px] rounded-lg flex items-center justify-center"
          style={{ background: "#F2A900" }}
        >
          <span
            className="text-[18px] font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            S
          </span>
        </div>
        <span
          className="text-[20px] text-white tracking-tight"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          Schedularly
        </span>
        <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.5px] px-2.5 py-1 rounded-full border text-[#F2A900] border-[rgba(242,169,0,0.4)] bg-[rgba(242,169,0,0.15)]">
          Beta Program
        </span>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-6 pt-14 pb-12 text-center"
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #0f3460 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 0%, rgba(13,115,119,.35) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-[640px] mx-auto">
          <div className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] px-3.5 py-1.5 rounded-full mb-[18px] text-[#F2A900] border border-[rgba(242,169,0,0.3)] bg-[rgba(242,169,0,0.12)]">
            Renter Beta — Limited Spots
          </div>

          <h1
            className="text-white leading-[1.15] mb-4 text-3xl sm:text-4xl lg:text-[44px]"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Apply to Shape the Future of{" "}
            <em className="not-italic text-[#F2A900]">
              Rental Verification
            </em>
          </h1>

          <p className="text-[15px] text-white/70 max-w-[520px] mx-auto mb-7 leading-relaxed">
            We&apos;re building a verified rental record platform that puts
            renters in control. Beta users get a portable rental profile they
            keep — forever.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "Free during beta",
              "Portable rental profile you keep",
              "~8 min to complete",
            ].map((pill) => (
              <div
                key={pill}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] text-white/85 border border-white/15 bg-white/[0.08]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#F2A900] flex-shrink-0" />
                {pill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screening Form ── */}
      <ScreeningForm />
    </main>
  );
}
