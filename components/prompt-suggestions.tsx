"use client";

import { promptCategories } from "@/lib/mock-data";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <section className="container py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Or start with a suggested question
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Grouped by topic — every answer is generated the same way: sourced, cited, neutral.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {promptCategories.map((category, idx) => (
            <div
              key={category.id}
              className="animate-fade-in rounded-xl border border-border bg-card/50 p-4"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <category.icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {category.label}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {category.prompts.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => onSelect(p.text)}
                    className={cn(
                      "group flex items-start gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[13px] leading-snug text-foreground/90",
                      "transition-colors hover:border-border hover:bg-muted"
                    )}
                  >
                    <span className="flex-1">{p.text}</span>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
