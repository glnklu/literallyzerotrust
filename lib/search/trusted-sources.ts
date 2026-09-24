// -----------------------------------------------------------------------------
// TRUSTED SOURCE REGISTRY
// -----------------------------------------------------------------------------
// This is the editorial backbone of the "Source Attribution" promise: rather
// than asking the LLM to guess how authoritative a result is (which is
// exactly the kind of unverifiable, made-up-sounding number the app's own
// "Zero AI Bias" pillar warns against), confidence is looked up from a
// curated domain registry. The retrieval step (lib/pipeline/retrieve.ts)
// uses this to rank and threshold results *before* anything reaches the LLM.
//
// This list is deliberately not exhaustive. Extending it is a config change,
// not a code change — add a domain to DOMAIN_TIERS and, optionally, a
// friendly name to PUBLISHER_NAMES.
// -----------------------------------------------------------------------------

import type { SourceType } from "@/lib/types";

export type TrustTier =
  | "government-official" // primary legislative/executive record
  | "organization-official" // a person's own company/campaign/party as publisher
  | "transcript-archive" // third-party verbatim transcript archives
  | "social-post" // a direct post on the figure's own social account
  | "major-news" // established general/political news organizations
  | "general-news" // reputable outlets outside politics — entertainment, business, sports
  | "unverified"; // anything not in the registry

interface TierConfig {
  confidence: number;
  label: string;
}

export const TIER_CONFIG: Record<TrustTier, TierConfig> = {
  "government-official": { confidence: 97, label: "Official government record" },
  "organization-official": { confidence: 93, label: "Official organization release" },
  "transcript-archive": { confidence: 89, label: "Verified transcript archive" },
  "social-post": { confidence: 80, label: "Direct social post" },
  "major-news": { confidence: 76, label: "Major news outlet" },
  "general-news": { confidence: 68, label: "Established news outlet" },
  unverified: { confidence: 45, label: "Unverified source" },
};

/** Below this, a result is dropped from retrieval entirely rather than cited. */
export const MIN_CITABLE_CONFIDENCE = 55;

const DOMAIN_TIERS: Record<string, TrustTier> = {
  // --- Government / official records -------------------------------------
  "whitehouse.gov": "government-official",
  "congress.gov": "government-official",
  "senate.gov": "government-official",
  "house.gov": "government-official",
  "state.gov": "government-official",
  "defense.gov": "government-official",
  "federalregister.gov": "government-official",
  "presidency.ucsb.edu": "government-official",
  "gov.uk": "government-official",
  "parliament.uk": "government-official",
  "hansard.parliament.uk": "government-official",
  "europarl.europa.eu": "government-official",
  "ec.europa.eu": "government-official",
  "un.org": "government-official",
  "nato.int": "government-official",
  "sec.gov": "government-official",
  // The registry above was US/UK/EU-only, which meant any head of state or
  // official outside those (Putin, for example) had no official-record tier
  // at all to search within — not "no results," but no domain even tried.
  "kremlin.ru": "government-official",
  "en.kremlin.ru": "government-official",
  "elysee.fr": "government-official",
  "bundesregierung.de": "government-official",
  "canada.ca": "government-official",
  "pmindia.gov.in": "government-official",

  // --- Verbatim transcript archives ---------------------------------------
  "c-span.org": "transcript-archive",
  "rev.com": "transcript-archive",
  "factba.se": "transcript-archive",
  "millercenter.org": "transcript-archive",
  "americanrhetoric.com": "transcript-archive",

  // --- Direct posts on a figure's own social account ----------------------
  // Domain-level only (can't restrict to a specific handle via search's
  // include_domains) — query-plan.ts narrows further by putting the known
  // handle, when the figure registry has one, directly in the query text.
  "x.com": "social-post",
  "twitter.com": "social-post",
  "threads.net": "social-post",
  "truthsocial.com": "social-post",

  // --- Major news organizations --------------------------------------------
  "reuters.com": "major-news",
  "apnews.com": "major-news",
  "bbc.co.uk": "major-news",
  "bbc.com": "major-news",
  "npr.org": "major-news",
  "pbs.org": "major-news",
  "cnn.com": "major-news",
  "nbcnews.com": "major-news",
  "cbsnews.com": "major-news",
  "abcnews.go.com": "major-news",
  "foxnews.com": "major-news",
  "wsj.com": "major-news",
  "nytimes.com": "major-news",
  "washingtonpost.com": "major-news",
  "theguardian.com": "major-news",
  "politico.com": "major-news",
  "axios.com": "major-news",
  "bloomberg.com": "major-news",
  "ft.com": "major-news",
  "skynews.com": "major-news",
  "itv.com": "major-news",

  // --- General-interest outlets (entertainment, business, sports, culture) —
  // the app covers "any public figure," not just politicians, and most of
  // what's written about a musician, athlete, or executive lives here
  // rather than on a government or major-political-news domain. -----------
  "variety.com": "general-news",
  "billboard.com": "general-news",
  "rollingstone.com": "general-news",
  "hollywoodreporter.com": "general-news",
  "people.com": "general-news",
  "ew.com": "general-news",
  "vulture.com": "general-news",
  "usatoday.com": "general-news",
  "time.com": "general-news",
  "forbes.com": "general-news",
  "businessinsider.com": "general-news",
  "espn.com": "general-news",
  "vogue.com": "general-news",
  "gq.com": "general-news",
  "pitchfork.com": "general-news",
  "theverge.com": "general-news",
  "techcrunch.com": "general-news",
  "wired.com": "general-news",
};

/** Friendly display names for the Source Drawer's "publisher" field. */
const PUBLISHER_NAMES: Record<string, string> = {
  "whitehouse.gov": "The White House",
  "congress.gov": "U.S. Congress",
  "gov.uk": "UK Government",
  "parliament.uk": "UK Parliament",
  "hansard.parliament.uk": "Hansard (UK Parliament)",
  "kremlin.ru": "The Kremlin",
  "en.kremlin.ru": "The Kremlin",
  "elysee.fr": "Élysée Palace (French Presidency)",
  "bundesregierung.de": "German Federal Government",
  "canada.ca": "Government of Canada",
  "pmindia.gov.in": "Prime Minister's Office (India)",
  "c-span.org": "C-SPAN",
  "rev.com": "Rev (transcript archive)",
  "factba.se": "Factbase (transcript archive)",
  "x.com": "X",
  "twitter.com": "X",
  "threads.net": "Threads",
  "truthsocial.com": "Truth Social",
  "reuters.com": "Reuters",
  "apnews.com": "Associated Press",
  "bbc.co.uk": "BBC",
  "bbc.com": "BBC",
  "npr.org": "NPR",
  "cnn.com": "CNN",
  "nbcnews.com": "NBC News",
  "cbsnews.com": "CBS News",
  "abcnews.go.com": "ABC News",
  "foxnews.com": "Fox News",
  "wsj.com": "The Wall Street Journal",
  "nytimes.com": "The New York Times",
  "washingtonpost.com": "The Washington Post",
  "theguardian.com": "The Guardian",
  "variety.com": "Variety",
  "billboard.com": "Billboard",
  "rollingstone.com": "Rolling Stone",
  "hollywoodreporter.com": "The Hollywood Reporter",
  "people.com": "People",
  "usatoday.com": "USA Today",
  "time.com": "Time",
  "forbes.com": "Forbes",
  "espn.com": "ESPN",
};

/**
 * Domains for a specific public figure's own organization/campaign/company —
 * pass in per-query (e.g. resolved from a figure registry) rather than
 * hardcoded here, since these are figure-specific, not global.
 */
export function withOrganizationDomains(
  domains: string[]
): Record<string, TrustTier> {
  const out: Record<string, TrustTier> = {};
  for (const d of domains) out[normalizeDomain(d)] = "organization-official";
  return out;
}

function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^www\./, "");
}

function matchTier(
  hostname: string,
  extra?: Record<string, TrustTier>
): TrustTier {
  const host = normalizeDomain(hostname);
  const registries = extra ? [extra, DOMAIN_TIERS] : [DOMAIN_TIERS];
  for (const registry of registries) {
    // exact match, then longest-suffix match (e.g. "news.bbc.co.uk" -> "bbc.co.uk")
    if (registry[host]) return registry[host];
    const suffixMatch = Object.keys(registry)
      .filter((d) => host.endsWith(`.${d}`))
      .sort((a, b) => b.length - a.length)[0];
    if (suffixMatch) return registry[suffixMatch];
  }
  return "unverified";
}

/** All registered domains for the given tiers — used to build Tavily `include_domains`. */
export function domainsForTiers(
  tiers: TrustTier[],
  extraDomains?: Record<string, TrustTier>
): string[] {
  const registry = extraDomains ? { ...DOMAIN_TIERS, ...extraDomains } : DOMAIN_TIERS;
  return Object.entries(registry)
    .filter(([, tier]) => tiers.includes(tier))
    .map(([domain]) => domain);
}

export interface DomainScore {
  tier: TrustTier;
  confidence: number;
  publisher: string;
  hostname: string;
}

export function scoreUrl(url: string, extraDomains?: Record<string, TrustTier>): DomainScore {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return { tier: "unverified", confidence: 0, publisher: "Unknown", hostname: "" };
  }
  const tier = matchTier(hostname, extraDomains);
  const host = normalizeDomain(hostname);
  const suffixKey = Object.keys(PUBLISHER_NAMES).find((d) => host.endsWith(`.${d}`));
  const publisher = PUBLISHER_NAMES[host] ?? (suffixKey && PUBLISHER_NAMES[suffixKey]) ?? titleCaseFromHost(host);
  return { tier, confidence: TIER_CONFIG[tier].confidence, publisher, hostname: host };
}

function titleCaseFromHost(host: string): string {
  const core = host.split(".").slice(0, -1).join(".") || host;
  return core
    .split(/[.-]/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Heuristic source-type classification from URL/title text. Used to pick an
 * icon and label in the Source Drawer; not part of the confidence score.
 */
export function inferSourceType(url: string, title: string, tier: TrustTier): SourceType {
  if (tier === "social-post") return "post";
  const t = title.toLowerCase();
  if (/\btranscript\b/.test(t)) return "transcript";
  if (/\bvote|roll call\b/.test(t)) return "vote-record";
  if (/\bvideo|remarks at|c-span\.org\/video/.test(t) || url.includes("c-span.org/video"))
    return "video";
  if (/\binterview\b/.test(t)) return "interview";
  if (/\bpress release|statement|proclamation|readout|fact sheet\b/.test(t))
    return "press-release";

  switch (tier) {
    case "government-official":
    case "organization-official":
      return "press-release";
    case "transcript-archive":
      return "transcript";
    case "major-news":
      return "interview";
    default:
      return "interview";
  }
}
