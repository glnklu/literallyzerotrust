"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, LibraryBig, Clock3 } from "lucide-react";
import type { Answer } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AnswerHeaderProps {
  answer: Answer;
  onOpenSources: () => void;
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function AnswerHeader({ answer, onOpenSources }: AnswerHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold",
              answer.figure.accent
            )}
          >
            {answer.figure.initials}
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{answer.figure.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{answer.figure.role}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={onOpenSources} className="shrink-0">
          <LibraryBig className="h-3.5 w-3.5" />
          {answer.sources.length} sources
        </Button>
      </div>

      <h2 className="text-balance font-serif text-2xl font-semibold leading-snug md:text-3xl">
        {answer.query}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="accent" className="gap-1.5">
          <FlaskConical className="h-3 w-3" />
          Preview data — illustrative, not verified statements
        </Badge>
        <Badge variant="muted" className="gap-1.5">
          <Clock3 className="h-3 w-3" />
          Generated {relativeTime(answer.generatedAt)}
        </Badge>
      </div>
    </div>
  );
}
