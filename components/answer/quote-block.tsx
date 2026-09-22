"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceChip } from "@/components/source-chip";
import { Quote as QuoteIcon, BadgeCheck, ShieldQuestion } from "lucide-react";
import type { Answer, VerificationMethod } from "@/lib/types";

interface QuoteBlockProps {
  answer: Answer;
  onOpenSource: (id: string) => void;
  activeSourceId?: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const VERIFICATION_LABEL: Record<VerificationMethod, string> = {
  snippet: "Matched retrieved source text",
  "full-page": "Confirmed against live source page",
  unverified: "Could not confirm exact wording",
};

function VerificationBadge({ verified, method }: { verified: boolean; method: VerificationMethod }) {
  const Icon = verified ? BadgeCheck : ShieldQuestion;
  return (
    <Badge variant={verified ? "accent" : "shift"} className="gap-1 whitespace-nowrap">
      <Icon className="h-3 w-3" />
      {VERIFICATION_LABEL[method]}
    </Badge>
  );
}

export function QuoteBlock({ answer, onOpenSource, activeSourceId }: QuoteBlockProps) {
  const sourceIndex = new Map(answer.sources.map((s, i) => [s.id, i + 1]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>In Their Own Words</CardTitle>
        <CardDescription>
          Verbatim excerpts, checked against the source rather than taken on the model&apos;s word.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {answer.quotes.map((quote) => {
          const source = answer.sources.find((s) => s.id === quote.sourceId);
          const idx = sourceIndex.get(quote.sourceId);
          return (
            <div
              key={quote.id}
              className="rounded-lg border border-border bg-muted/40 p-4"
            >
              <div className="flex gap-3">
                <QuoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent/70" />
                <p className="font-serif text-[15px] italic leading-relaxed text-foreground/95">
                  {quote.text}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pl-7 text-xs text-muted-foreground">
                <span>
                  {formatDate(quote.date)} · {quote.context}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <VerificationBadge verified={quote.verified} method={quote.verificationMethod} />
                  {source && idx && (
                    <SourceChip
                      source={source}
                      index={idx}
                      onClick={onOpenSource}
                      active={activeSourceId === quote.sourceId}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
