"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { SearchBar } from "@/components/search-bar";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { FigureBrowser } from "@/components/figure-browser";
import { AnswerSkeleton } from "@/components/answer/answer-skeleton";
import { AnswerView } from "@/components/answer/answer-view";
import { AnswerEmptyState } from "@/components/answer/answer-empty-state";
import type { AnswerResult } from "@/lib/types";

type ViewState = "idle" | "loading" | "result";

export default function Home() {
  const [state, setState] = useState<ViewState>("idle");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);

  async function runSearch(q: string) {
    setQuery(q);
    setState("loading");
    setResult(null);

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data: AnswerResult = await res.json();
      setResult(data);
    } catch {
      setResult({ status: "error", query: q, message: "Network error — please try again." });
    } finally {
      setState("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const isWide = state === "result" && result?.status === "ok";

  return (
    <main className="min-h-dvh">
      <SiteHeader />

      {state === "idle" && (
        <>
          <Hero />
          <div className="container -mt-8 pb-4">
            <SearchBar onSearch={runSearch} />
          </div>
          <PromptSuggestions onSelect={runSearch} />
          <FigureBrowser onSelect={runSearch} />
        </>
      )}

      {state !== "idle" && (
        <div className="container py-10">
          <div className="mx-auto mb-8 max-w-2xl">
            <SearchBar onSearch={runSearch} loading={state === "loading"} initialValue={query} />
          </div>

          <div className={isWide ? "mx-auto max-w-4xl" : "mx-auto max-w-2xl"}>
            {state === "loading" && <AnswerSkeleton />}

            {state === "result" && result?.status === "ok" && (
              <AnswerView answer={result.answer} onSelectRelated={runSearch} />
            )}

            {state === "result" && result?.status === "insufficient_sources" && (
              <AnswerEmptyState
                variant="insufficient"
                query={result.query}
                figureGuess={result.figureGuess}
                onRetry={() => runSearch(result.query)}
              />
            )}

            {state === "result" && result?.status === "demo_not_covered" && (
              <AnswerEmptyState
                variant="demo"
                query={result.query}
                figureGuess={result.figureGuess}
                onRetry={() => runSearch(result.query)}
                onTrySample={runSearch}
              />
            )}

            {state === "result" && result?.status === "error" && (
              <AnswerEmptyState
                variant="error"
                query={result.query}
                message={result.message}
                onRetry={() => runSearch(result.query)}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
