"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SourceChip } from "@/components/source-chip";
import { Quote as QuoteIcon } from "lucide-react";
import type { Answer } from "@/lib/mock-data";

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

export function QuoteBlock({ answer, onOpenSource, activeSourceId }: QuoteBlockProps) {
  const sourceIndex = new Map(answer.sources.map((s, i) => [s.id, i + 1]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>In Their Own Words</CardTitle>
        <CardDescription>
          Verbatim excerpts, shown with the date and setting they were spoken in.
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
          );
        })}
      </CardContent>
    </Card>
  );
}
