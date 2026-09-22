"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight, Users } from "lucide-react";
import { FIGURES } from "@/lib/figures";
import { cn } from "@/lib/utils";

interface FigureBrowserProps {
  onSelect: (question: string) => void;
}

const ALL_CATEGORIES = Array.from(new Set(FIGURES.flatMap((f) => f.categories))).sort();

export function FigureBrowser({ onSelect }: FigureBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FIGURES.filter((f) => {
      const matchesQuery = !q || f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q);
      const matchesCategory = !category || f.categories.includes(category);
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <section className="container pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-xs font-semibold uppercase tracking-wide">Browse figures</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Search by public figure
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Filter the figures currently covered and jump straight to what they&apos;ve said.
          </p>
        </div>

        <div className="mx-auto mb-5 flex max-w-md items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm ring-1 ring-transparent focus-within:ring-accent/40">
          <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or role…"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
            aria-label="Search public figures"
          />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory((current) => (current === c ? null : c))}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === c
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No figures match &ldquo;{query}&rdquo;. Try a different name or clear the filter.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((figure) => (
              <button
                key={figure.id}
                onClick={() => onSelect(figure.sampleQuestion)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card/50 p-4 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
              >
                <div className="flex w-full items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold",
                      figure.accent
                    )}
                  >
                    {figure.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{figure.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{figure.role}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {figure.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <span className="mt-auto flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Ask about {figure.name.split(" ")[0]}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
