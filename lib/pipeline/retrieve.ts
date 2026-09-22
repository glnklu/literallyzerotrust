// -----------------------------------------------------------------------------
// RETRIEVAL ORCHESTRATION
// -----------------------------------------------------------------------------
// Runs every query in a QueryPlan against the search provider in parallel,
// dedupes by URL, scores each hit against the trusted-source registry, and
// drops anything under MIN_CITABLE_CONFIDENCE *before* it ever reaches the
// LLM. Synthesis (lib/pipeline/synthesize.ts) only ever sees documents that
// have already cleared this bar — it cannot cite something untrustworthy
// because it's never given the option to.
// -----------------------------------------------------------------------------

import { searchWeb, SearchProviderError } from "@/lib/search/tavily";
import {
  scoreUrl,
  inferSourceType,
  MIN_CITABLE_CONFIDENCE,
  withOrganizationDomains,
} from "@/lib/search/trusted-sources";
import type { QueryPlan } from "@/lib/pipeline/query-plan";
import type { Source } from "@/lib/types";

export interface RetrievedDocument extends Source {
  /** Raw search snippet handed to synthesis — not necessarily shown verbatim to the user. */
  snippet: string;
}

export interface RetrievalResult {
  documents: RetrievedDocument[];
  queriesRun: number;
  queriesFailed: number;
  /** True when every single query failed the same way (e.g. missing API key). */
  providerUnavailable: boolean;
}

function shortHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

const MAX_DOCUMENTS = 12;

export async function retrieveSources(
  plan: QueryPlan,
  opts: { maxPerQuery?: number } = {}
): Promise<RetrievalResult> {
  const extraDomains = plan.organizationDomains
    ? withOrganizationDomains(plan.organizationDomains)
    : undefined;

  const settled = await Promise.allSettled(
    plan.searchQueries.map((pq) =>
      searchWeb(pq.query, {
        includeDomains: pq.includeDomains,
        maxResults: opts.maxPerQuery ?? 6,
      })
    )
  );

  const seen = new Map<string, RetrievedDocument>();
  let queriesFailed = 0;
  let allFailedSameProviderError = true;

  for (const result of settled) {
    if (result.status === "rejected") {
      queriesFailed++;
      if (!(result.reason instanceof SearchProviderError)) {
        allFailedSameProviderError = false;
      }
      continue;
    }
    allFailedSameProviderError = false;

    for (const raw of result.value) {
      if (seen.has(raw.url)) continue;
      const score = scoreUrl(raw.url, extraDomains);
      if (score.confidence < MIN_CITABLE_CONFIDENCE) continue;

      seen.set(raw.url, {
        id: `src-${shortHash(raw.url)}`,
        title: raw.title || score.publisher,
        publisher: score.publisher,
        date: raw.publishedDate ?? "",
        type: inferSourceType(raw.url, raw.title, score.tier),
        url: raw.url,
        confidence: score.confidence,
        snippet: raw.snippet,
      });
    }
  }

  const documents = Array.from(seen.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, MAX_DOCUMENTS);

  return {
    documents,
    queriesRun: plan.searchQueries.length,
    queriesFailed,
    providerUnavailable: allFailedSameProviderError && queriesFailed === plan.searchQueries.length,
  };
}
