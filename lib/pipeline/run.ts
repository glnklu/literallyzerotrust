// -----------------------------------------------------------------------------
// TOP-LEVEL PIPELINE: plan -> retrieve -> synthesize
// -----------------------------------------------------------------------------
// generateAnswer() is the one function the API route calls. It is also the
// seam between "demo mode" and "live mode": when search/LLM credentials
// aren't configured (or the search provider is unreachable), it falls back
// to the Step 1 mock dataset so the product still works end-to-end without
// any setup. Nothing in the UI has to know which path ran — both return the
// same Answer/AnswerResult contract from lib/types.ts.
// -----------------------------------------------------------------------------

import { planQueries } from "@/lib/pipeline/query-plan";
import { retrieveSources } from "@/lib/pipeline/retrieve";
import { synthesizeAnswer, isSynthesisConfigured } from "@/lib/pipeline/synthesize";
import { verifyQuotes } from "@/lib/pipeline/verify";
import { isSearchConfigured } from "@/lib/search/tavily";
import { findAnswerForQuery } from "@/lib/mock-data";
import type { Answer, AnswerResult, Figure } from "@/lib/types";

/** Below this many trusted sources, the pipeline reports "insufficient_sources" rather than guessing. */
const MIN_SOURCES_FOR_ANSWER = 2;

const ACCENT_PALETTE = [
  "from-red-500/15 to-blue-500/15",
  "from-rose-500/15 to-amber-500/15",
  "from-slate-500/15 to-cyan-500/15",
  "from-emerald-500/15 to-teal-500/15",
  "from-violet-500/15 to-fuchsia-500/15",
  "from-orange-500/15 to-yellow-500/15",
];

function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = (hash * 33) ^ input.charCodeAt(i);
  return hash >>> 0;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

function accentFor(name: string): string {
  return ACCENT_PALETTE[hashString(name) % ACCENT_PALETTE.length];
}

export function isLivePipelineConfigured(): boolean {
  return isSearchConfigured() && isSynthesisConfigured();
}

export async function generateAnswer(rawQuery: string): Promise<AnswerResult> {
  const query = rawQuery.trim();
  if (!query) {
    return { status: "error", query, message: "Please enter a question." };
  }

  if (!isLivePipelineConfigured()) {
    return { status: "ok", answer: findAnswerForQuery(query) };
  }

  const plan = planQueries(query);
  const retrieval = await retrieveSources(plan);

  if (retrieval.providerUnavailable) {
    // Search API rejected every request the same way (e.g. bad/missing
    // key) — treat as "not configured" rather than surfacing a scary error.
    return { status: "ok", answer: findAnswerForQuery(query) };
  }

  if (retrieval.documents.length < MIN_SOURCES_FOR_ANSWER) {
    return {
      status: "insufficient_sources",
      query,
      figureGuess: plan.figureGuess,
      sourcesFound: retrieval.documents.length,
    };
  }

  const synthesis = await synthesizeAnswer({
    query,
    figureGuess: plan.figureGuess,
    documents: retrieval.documents,
  });

  if (synthesis.status === "insufficient_evidence") {
    return {
      status: "insufficient_sources",
      query,
      figureGuess: plan.figureGuess,
      sourcesFound: retrieval.documents.length,
    };
  }
  if (synthesis.status === "error") {
    return { status: "error", query, message: synthesis.message };
  }

  const core = synthesis.data;
  const citedSourceIds = new Set<string>([
    ...core.themes.flatMap((t) => t.claims.flatMap((c) => c.sourceIds)),
    ...core.quotes.map((q) => q.sourceId),
    ...(core.stanceShift?.points.map((p) => p.sourceId) ?? []),
  ]);
  const sources = retrieval.documents
    .filter((d) => citedSourceIds.has(d.id))
    .map(({ snippet: _snippet, ...source }) => source);

  // Quotes are the highest-stakes claim in the whole app ("this is what they
  // actually said, verbatim") — check each one against real source text
  // rather than trusting the model's "verbatim" instruction-following.
  const verifications = await verifyQuotes(core.quotes, retrieval.documents);

  const figure: Figure = {
    id: slugify(core.figureName),
    name: core.figureName,
    role: core.figureRole,
    initials: initialsFor(core.figureName),
    accent: accentFor(core.figureName),
  };

  const answer: Answer = {
    id: `${slugify(core.figureName)}-${slugify(query).slice(0, 40)}-${Date.now()}`,
    query,
    figure,
    generatedAt: new Date().toISOString(),
    mode: "live",
    summary: core.summary,
    themes: core.themes.map((t, i) => ({
      id: `theme-${i + 1}`,
      heading: t.heading,
      claims: t.claims.map((c, j) => ({ id: `theme-${i + 1}-claim-${j + 1}`, ...c })),
    })),
    quotes: core.quotes.map((q, i) => ({
      id: `quote-${i + 1}`,
      ...q,
      verified: verifications[i].verified,
      verificationMethod: verifications[i].method,
    })),
    sources,
    stanceShift: core.stanceShift,
    relatedPrompts: core.relatedPrompts.slice(0, 4),
  };

  return { status: "ok", answer };
}
