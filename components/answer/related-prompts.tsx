"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface RelatedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export function RelatedPrompts({ prompts, onSelect }: RelatedPromptsProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Dig deeper
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left text-[13.5px] leading-snug transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            <span>{prompt}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
