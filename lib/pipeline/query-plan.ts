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
  /** The substring actually found in rawQuery (e.g. "Trump", not "Donald Trump") — stripped when building the topic. */
  matchedText: string;
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
    // The alias that actually matched (e.g. "trump") is usually shorter
    // than the canonical name ("Donald Trump") — strip that, not the
    // canonical form, or a query that only ever says "Trump" ends up with
    // the canonical name appended rather than substituted.
    const lower = rawQuery.toLowerCase();
    const matchedAlias = [...known.aliases]
      .sort((a, b) => b.length - a.length)
      .find((alias) => lower.includes(alias));
    return {
      canonicalName: known.name,
      matchedText: matchedAlias ?? known.name,
      orgDomains: known.orgDomains,
      socialHandle: known.socialHandle,
    };
  }

  // Fallback: two-or-more consecutive capitalized words, e.g. "Keir Starmer"
  const capNameMatch = rawQuery.match(/\b([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)+)\b/);
  if (capNameMatch) {
    const candidate = capNameMatch[1];
    const words = candidate.toLowerCase().split(/\s+/);
    if (!words.every((w) => QUESTION_STOPWORDS.has(w))) {
      return { canonicalName: candidate, matchedText: candidate };
    }
  }

  // Further fallback: a single capitalized word, for mononyms (e.g. "Pink",
  // "Madonna", "Putin"). Takes the *first* capitalized word that isn't a
  // question stopword — not the first non-first word. A query can be a
  // question ("What does Pink think...", where "What" is capitalized only
  // by sentence position and must be skipped) or a bare "Name topic" phrase
  // ("Putin about Georgia", where the name genuinely is the first word and
  // skipping it entirely would misfire on "Georgia" instead). Filtering by
  // the stopword list handles both: real question words get skipped
  // wherever they sit, and an actual leading name doesn't. This is a
  // heuristic, not real NER — it can still misfire on a capitalized
  // non-name (a place, a brand), but for a one-word subject it's the best
  // signal available without an LLM call.
  const singleCapMatches = [...rawQuery.matchAll(/\b[A-Z][a-zA-Z'-]{2,}\b/g)];
  const mononym = singleCapMatches.find((m) => !QUESTION_STOPWORDS.has(m[0].toLowerCase()));
  if (mononym) return { canonicalName: mononym[0], matchedText: mononym[0] };

  return undefined;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strips the figure's name and common question scaffolding to leave a topic phrase. */
function extractTopic(rawQuery: string, matchedText?: string): string {
  let topic = rawQuery;
  if (matchedText) {
    topic = topic.replace(new RegExp(escapeRegExp(matchedText), "i"), "");
  }
  topic = topic
    // An orphaned possessive marker left where the name used to sit (e.g.
    // "Starmer's" -> "'s") can end up anywhere in the string, not just at
    // the very start — the name is often mid-sentence ("What is X's...").
    .replace(/\s['’]s\b/i, "")
    .replace(/[?]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Removing the figure's name from mid-sentence (e.g. "What does X think
  // about...") leaves the question's leading scaffolding exposed at the
  // front — strip that run too, so it doesn't leak into the search query
  // as noise words instead of real topic terms.
  const words = topic.split(/\s+/);
  let start = 0;
  while (start < words.length && QUESTION_STOPWORDS.has(words[start].toLowerCase())) start++;
  topic = words.slice(start).join(" ");

  return topic || rawQuery;
}

export function planQueries(rawQuery: string): QueryPlan {
  const figure = guessFigure(rawQuery);
  const topic = extractTopic(rawQuery, figure?.matchedText);
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
