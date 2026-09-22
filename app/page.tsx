"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { SearchBar } from "@/components/search-bar";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { AnswerSkeleton } from "@/components/answer/answer-skeleton";
import { AnswerView } from "@/components/answer/answer-view";
import { findAnswerForQuery, type Answer } from "@/lib/mock-data";

type ViewState = "idle" | "loading" | "answer";

export default function Home() {
  const [state, setState] = useState<ViewState>("idle");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);

  function runSearch(q: string) {
    setQuery(q);
    setState("loading");
    setAnswer(null);
    // Simulated retrieval + synthesis latency — Step 2 replaces this with a real call.
    window.setTimeout(() => {
      setAnswer(findAnswerForQuery(q));
      setState("answer");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1100);
  }

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
        </>
      )}

      {state !== "idle" && (
        <div className="container py-10">
          <div className="mx-auto mb-8 max-w-2xl">
            <SearchBar onSearch={runSearch} loading={state === "loading"} initialValue={query} />
          </div>

          <div className={state === "loading" ? "mx-auto max-w-2xl" : "mx-auto max-w-4xl"}>
            {state === "loading" && <AnswerSkeleton />}
            {state === "answer" && answer && (
              <AnswerView answer={answer} onSelectRelated={runSearch} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
