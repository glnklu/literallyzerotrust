// -----------------------------------------------------------------------------
// FIGURE REGISTRY
// -----------------------------------------------------------------------------
// The single source of truth for "who is a known public figure in this app."
// Two very different consumers read from it:
//   1. lib/pipeline/query-plan.ts — figure-guessing for the live retrieval
//      pipeline (name + organization domains, used for any query).
//   2. components/figure-browser.tsx — the candidate search/filter UI, where
//      a card's click has to lead somewhere coherent (see sampleQuestion).
// Keeping one list instead of two prevents exactly the bug where the browser
// promises a figure and a different one's answer shows up.
// -----------------------------------------------------------------------------

import type { Figure } from "@/lib/types";

export interface FigureProfile {
  id: string;
  name: string;
  role: string;
  /** lowercase match strings for query-plan figure detection, longest first wins */
  aliases: string[];
  /** seeds "organization-official" trust tier domains for this figure's own org/campaign/company */
  orgDomains?: string[];
  /** known handle (no @) on X/Twitter — narrows the direct-post search to this account */
  socialHandle?: string;
  categories: string[];
  initials: string;
  accent: string; // tailwind gradient classes, e.g. "from-red-500/15 to-blue-500/15"
  /** the question run when this figure is picked from the browser */
  sampleQuestion: string;
}

export const FIGURES: FigureProfile[] = [
  {
    id: "trump",
    name: "Donald Trump",
    role: "President of the United States",
    aliases: ["trump", "donald trump"],
    socialHandle: "realDonaldTrump",
    categories: ["Foreign Policy", "Economy"],
    initials: "DT",
    accent: "from-red-500/15 to-blue-500/15",
    sampleQuestion: "What has Donald Trump said about trade tariffs with Europe?",
  },
  {
    id: "starmer",
    name: "Keir Starmer",
    role: "Prime Minister of the United Kingdom",
    aliases: ["starmer", "keir starmer"],
    orgDomains: ["labour.org.uk"],
    socialHandle: "Keir_Starmer",
    categories: ["Historical Shifts", "Foreign Policy"],
    initials: "KS",
    accent: "from-rose-500/15 to-amber-500/15",
    sampleQuestion: "How has Keir Starmer's position on green energy changed since 2021?",
  },
  {
    id: "musk",
    name: "Elon Musk",
    role: "CEO, Tesla & xAI",
    aliases: ["musk", "elon musk"],
    orgDomains: ["tesla.com", "x.ai", "xai.com"],
    socialHandle: "elonmusk",
    categories: ["Tech & AI"],
    initials: "EM",
    accent: "from-slate-500/15 to-cyan-500/15",
    sampleQuestion: "What are Elon Musk's recent statements regarding AI safety?",
  },
  {
    id: "harris",
    name: "Kamala Harris",
    role: "Former Vice President of the United States",
    aliases: ["harris", "kamala harris"],
    socialHandle: "KamalaHarris",
    categories: ["Tech & AI", "Economy"],
    initials: "KH",
    accent: "from-violet-500/15 to-fuchsia-500/15",
    sampleQuestion: "What is Kamala Harris's stance on AI regulation?",
  },
];

export function findFigureByAlias(rawQuery: string): FigureProfile | undefined {
  const lower = rawQuery.toLowerCase();
  return FIGURES.flatMap((figure) => figure.aliases.map((alias) => ({ figure, alias })))
    .sort((a, b) => b.alias.length - a.alias.length) // longest alias wins ("donald trump" before "trump")
    .find(({ alias }) => lower.includes(alias))?.figure;
}

export function toAnswerFigure(profile: FigureProfile): Figure {
  return {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    initials: profile.initials,
    accent: profile.accent,
  };
}
