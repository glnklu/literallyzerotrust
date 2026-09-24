// -----------------------------------------------------------------------------
// QUERY PLANNER
// -----------------------------------------------------------------------------
// Turns "What has Donald Trump said about trade tariffs with Europe?" into a
// handful of targeted searches — one per trust tier — instead of a single
// generic web search. This is what makes retrieval favor c-span.org and
// whitehouse.gov over a random blog's summary of what someone said.
//
// Every query here is domain-restricted to a first-source tier — official
// records, the figure's own organization, their own social posts, or a
// direct interview transcript — deliberately excluding a general unrestricted
// pass. The app answers in quotes, not paraphrased analysis, so a source that
// only ever reports *about* the figure (rather than quoting them directly)
// isn't useful input even when its domain would otherwise be trustworthy.
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
  socialHandle?: string;
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
  tierLabel: TrustTier;
}

export interface QueryPlan {
  rawQuery: string;
  figureGuess?: string;
  organizationDomains?: string[];
  searchQueries: PlannedQuery[];
}

function guessFigure(rawQuery: string): FigureGuess | undefined {
  const known = findFigureByAlias(rawQuery);
  if (known) {
    return { canonicalName: known.name, orgDomains: known.orgDomains, socialHandle: known.socialHandle };
  }

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
  const socialHandle = figure?.socialHandle;
  const extraDomains = orgDomains ? withOrganizationDomains(orgDomains) : undefined;

  const subject = figureName ? `${figureName} ${topic}` : rawQuery;

  // include_domains is domain-level only, so a known handle is put directly
  // in the query text to narrow the social-post search to that account —
  // otherwise it falls back to a name+topic search across the whole tier.
  const socialQuery = socialHandle
    ? `${topic} (site:x.com/${socialHandle} OR site:twitter.com/${socialHandle})`
    : subject;

  const searchQueries: PlannedQuery[] = [
    {
      query: `${subject} quote OR remarks OR transcript`,
      includeDomains: domainsForTiers(["government-official", "transcript-archive"]),
      tierLabel: "transcript-archive",
    },
    {
      query: `${subject} statement OR press release OR posted`,
      includeDomains: domainsForTiers(["government-official", "organization-official"], extraDomains),
      tierLabel: "government-official",
    },
    {
      query: socialQuery,
      includeDomains: domainsForTiers(["social-post"]),
      tierLabel: "social-post",
    },
    {
      query: `${subject} interview quote`,
      includeDomains: domainsForTiers(["transcript-archive", "major-news", "general-news"]),
      tierLabel: "major-news",
    },
  ];

  return { rawQuery, figureGuess: figureName, organizationDomains: orgDomains, searchQueries };
}
