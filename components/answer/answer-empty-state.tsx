"use client";

import { SearchX, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AnswerEmptyStateProps {
  variant: "insufficient" | "error";
  query: string;
  figureGuess?: string;
  message?: string;
  onRetry: () => void;
}

export function AnswerEmptyState({ variant, query, figureGuess, message, onRetry }: AnswerEmptyStateProps) {
  const isInsufficient = variant === "insufficient";
  const Icon = isInsufficient ? SearchX : AlertTriangle;

  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>

        <h3 className="font-serif text-lg font-semibold">
          {isInsufficient ? "Not enough primary sources found" : "Something went wrong"}
        </h3>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {isInsufficient
            ? `We couldn't find enough official statements, transcripts, or press records to answer "${query}"${
                figureGuess ? ` for ${figureGuess}` : ""
              } with confidence. Rather than guess, we're telling you that — try narrowing the question, checking the spelling of the figure's name, or asking about a more widely covered topic.`
            : message || "The retrieval or synthesis pipeline hit an unexpected error. Please try again."}
        </p>

        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
