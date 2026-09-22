"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SourceChip } from "@/components/source-chip";
import { cn } from "@/lib/utils";
import type { Answer, Stance } from "@/lib/types";

interface StanceShiftProps {
  answer: Answer;
  onOpenSource: (id: string) => void;
  activeSourceId?: string;
}

const stanceDot: Record<Stance, string> = {
  for: "bg-emerald-500",
  against: "bg-red-500",
  mixed: "bg-shift",
  neutral: "bg-muted-foreground",
};

const stanceLabel: Record<Stance, string> = {
  for: "Affirmed",
  against: "Opposed",
  mixed: "Revised",
  neutral: "Reframed",
};

export function StanceShiftTimeline({ answer, onOpenSource, activeSourceId }: StanceShiftProps) {
  if (!answer.stanceShift) return null;
  const sourceIndex = new Map(answer.sources.map((s, i) => [s.id, i + 1]));
  const shift = answer.stanceShift;

  return (
    <Card className="border-shift/25 bg-shift/[0.03]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-shift" />
          <CardTitle className="text-shift/90">Stance Shift Detected</CardTitle>
        </div>
        <CardDescription>
          On &ldquo;{shift.topic}&rdquo; — shown chronologically, without judgment on which position is &ldquo;correct.&rdquo;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-2 space-y-1 border-l border-border pl-6">
          {shift.points.map((point, i) => {
            const source = answer.sources.find((s) => s.id === point.sourceId);
            const idx = sourceIndex.get(point.sourceId);
            return (
              <li
                key={point.date}
                className="group relative animate-fade-in py-4 first:pt-1"
                style={{ animationDelay: `${i * 90}ms`, animationFillMode: "backwards" }}
              >
                <span
                  className={cn(
                    "absolute -left-[29px] top-5 h-3 w-3 rounded-full ring-4 ring-background transition-transform duration-200 group-hover:scale-125",
                    stanceDot[point.stance]
                  )}
                />
                <div className="-mx-2.5 -my-0.5 rounded-lg px-2.5 py-0.5 transition-colors group-hover:bg-muted/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="font-mono text-xs text-muted-foreground">
                      {new Date(point.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {stanceLabel[point.stance]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{point.label}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    {point.summary}
                  </p>
                  {source && idx && (
                    <div className="mt-1.5">
                      <SourceChip
                        source={source}
                        index={idx}
                        onClick={onOpenSource}
                        active={activeSourceId === point.sourceId}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
