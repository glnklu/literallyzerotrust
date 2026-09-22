"use client";

import { SearchX, AlertTriangle, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FIGURES } from "@/lib/figures";

interface AnswerEmptyStateProps {
  variant: "insufficient" | "error" | "demo";
  query: string;
  figureGuess?: string;
  message?: string;
  onRetry: () => void;
  onTrySample?: (question: string) => void;
}

const ICON = { insufficient: SearchX, demo: Sparkles, error: AlertTriangle } as const;

export function AnswerEmptyState({
  variant,
  query,
  figureGuess,
  message,
  onRetry,
  onTrySample,
}: AnswerEmptyStateProps) {
  const Icon = ICON[variant];

  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>

        <h3 className="font-serif text-lg font-semibold">
          {variant === "insufficient" && "Not enough primary sources found"}
          {variant === "demo" && "This one isn't in the preview yet"}
          {variant === "error" && "Something went wrong"}
        </h3>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {variant === "insufficient" &&
            `We couldn't find enough official statements, transcripts, or press records to answer "${query}"${
              figureGuess ? ` for ${figureGuess}` : ""
            } with confidence. Rather than guess, we're telling you that — try narrowing the question, checking the spelling of the figure's name, or asking about a more widely covered topic.`}
          {variant === "demo" &&
            `Live search isn't connected in this preview, so it only has a handful of ready-made answers${
              figureGuess ? ` — and ${figureGuess} isn't one of them yet` : ""
            }. Try one of these instead, or connect live search to ask about anyone.`}
          {variant === "error" && (message || "Something broke while putting this together — please try again.")}
        </p>

        {variant === "demo" && onTrySample && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {FIGURES.map((figure) => (
              <button
                key={figure.id}
                onClick={() => onTrySample(figure.sampleQuestion)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
              >
                {figure.name}
              </button>
            ))}
          </div>
        )}

        {variant !== "demo" && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
