"use client";

import { Quote, ScanSearch, ListChecks } from "lucide-react";

const pillars = [
  {
    icon: Quote,
    title: "Only their own words",
    body: "Synthesized exclusively from official statements, press conferences, votes, and interview transcripts — never second-hand commentary.",
  },
  {
    icon: ScanSearch,
    title: "Zero synthesized opinion",
    body: "No political conclusions are drawn. If a stance shifted over time, we show the chronology — we don't editorialize it.",
  },
  {
    icon: ListChecks,
    title: "Every claim is sourced",
    body: "Each sentence links back to the exact transcript, timestamp, or official release it came from.",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="container relative py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Non-partisan · Source-first · No commentary
          </div>
          <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            Understand influential figures by their{" "}
            <span className="italic text-accent">actual words</span> — not
            second-hand commentary.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Ask what a politician, executive, or public figure has actually
            said on any issue. Every answer is built from primary sources and
            cited line by line.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card/60 p-5 text-left"
            >
              <p.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <p className="mt-3 text-sm font-semibold">{p.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
