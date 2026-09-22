// -----------------------------------------------------------------------------
// QUERY PLANNER
// -----------------------------------------------------------------------------
// Turns "What has Donald Trump said about trade tariffs with Europe?" into a
// handful of targeted searches — one per trust tier — instead of a single
// generic web search. This is what makes retrieval favor c-span.org and
// whitehouse.gov over a random blog's summary of what someone said.
//
// Figure detection here is deliberately simple (a small known-figure
// registry + a capitalized-name-sequence fallback) rather than an LLM call:
// it keeps every search request's latency and cost to zero until retrieval
// actually needs to hit the network, and query planning doesn't need to be
// perfect — the domain-tiered retrieval step and the synthesis step both
// tolerate an imprecise guess.
// -----------------------------------------------------------------------------

import { domainsForTiers, withOrganizationDomains, type TrustTier } from "@/lib/search/trusted-sources";
import { findFigureByAlias } from "@/lib/figures";

interface FigureGuess {
  canonicalName: string;
  orgDomains?: string[];
}

const QUESTION_STOPWORDS = new Set([
  "what",
  "how",
  "has",
  "have",
  "is",
  "are",
  "does",
  "did",
  "said",
  "say",
  "says",
  "about",
  "since",
  "position",
  "stance",
  "regarding",
]);

export interface PlannedQuery {
  query: string;
  includeDomains?: string[];
  tierLabel: TrustTier | "broad";
}

export interface QueryPlan {
  rawQuery: string;
  figureGuess?: string;
  organizationDomains?: string[];
  searchQueries: PlannedQuery[];
}

function guessFigure(rawQuery: string): FigureGuess | undefined {
  const known = findFigureByAlias(rawQuery);
  if (known) return { canonicalName: known.name, orgDomains: known.orgDomains };

  // Fallback: two-or-more consecutive capitalized words, e.g. "Keir Starmer"
  const capNameMatch = rawQuery.match(/\b([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)+)\b/);
  if (capNameMatch) {
    const candidate = capNameMatch[1];
    const words = candidate.toLowerCase().split(/\s+/);
    if (!words.every((w) => QUESTION_STOPWORDS.has(w))) {
      return { canonicalName: candidate };
    }
  }

  // Further fallback: a single capitalized word, for mononyms (e.g. "Pink",
  // "Madonna", "Drake"). Skips the question's first word, since that's
  // almost always just sentence-initial capitalization ("What...", "How...")
  // rather than a name. This is a heuristic, not real NER — it can still
  // misfire on a capitalized non-name (a place, a brand), but for a
  // one-word subject it's the best signal available without an LLM call.
  const singleCapMatches = [...rawQuery.matchAll(/\b[A-Z][a-zA-Z'-]{2,}\b/g)];
  const isFirstWord = (index: number) => rawQuery.slice(0, index).trim().length === 0;
  const mononym = singleCapMatches.find(
    (m) => !isFirstWord(m.index ?? 0) && !QUESTION_STOPWORDS.has(m[0].toLowerCase())
  );
  if (mononym) return { canonicalName: mononym[0] };

  return undefined;
}

/** Strips the figure's name and common question scaffolding to leave a topic phrase. */
function extractTopic(rawQuery: string, figureName?: string): string {
  let topic = rawQuery;
  if (figureName) {
    topic = topic.replace(new RegExp(figureName, "i"), "");
  }
  topic = topic
    .replace(/^[\s,]*['’]s\s+/i, "")
    .replace(/[?]+$/, "")
    .trim();
  return topic || rawQuery;
}

export function planQueries(rawQuery: string): QueryPlan {
  const figure = guessFigure(rawQuery);
  const topic = extractTopic(rawQuery, figure?.canonicalName);
  const figureName = figure?.canonicalName;
  const orgDomains = figure?.orgDomains;
  const extraDomains = orgDomains ? withOrganizationDomains(orgDomains) : undefined;

  const subject = figureName ? `${figureName} ${topic}` : rawQuery;

  const searchQueries: PlannedQuery[] = [
    {
      query: `${subject} transcript`,
      includeDomains: domainsForTiers(["government-official", "transcript-archive"]),
      tierLabel: "transcript-archive",
    },
    {
      query: `${subject} statement OR press conference`,
      includeDomains: domainsForTiers(["government-official", "organization-official"], extraDomains),
      tierLabel: "government-official",
    },
    {
      query: `${subject} interview`,
      includeDomains: domainsForTiers(["major-news", "general-news"]),
      tierLabel: "major-news",
    },
    // Unrestricted pass — catches trusted-tier pages our explicit domain
    // lists missed. Uses the raw, unparsed question rather than `subject`:
    // it's a hedge against a bad figure/topic guess mangling the query, so
    // at least one search always runs on clean text. Results outside the
    // registry are scored "unverified" by lib/search/trusted-sources.ts and
    // dropped by MIN_CITABLE_CONFIDENCE.
    {
      query: rawQuery,
      tierLabel: "broad",
    },
  ];

  return { rawQuery, figureGuess: figureName, organizationDomains: orgDomains, searchQueries };
}
