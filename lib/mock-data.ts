// -----------------------------------------------------------------------------
// MOCK / PREVIEW DATA
// -----------------------------------------------------------------------------
// Step 1 of the build is a frontend layout prototype. Nothing here is a live
// retrieval result. Positions summarized below are paraphrased from
// well-documented, widely reported public record (trade policy statements,
// the Feb 2024 £28bn green investment scale-back, the 2023 AI open letter,
// etc.) but exact wording, dates, and links are illustrative placeholders —
// Step 2 replaces this whole module with real search + citation retrieval.
// -----------------------------------------------------------------------------

import { Globe2, Landmark, Cpu, History } from "lucide-react";
import type { Answer, PromptCategory, Source } from "@/lib/types";
import { FIGURES, toAnswerFigure } from "@/lib/figures";

export type {
  SourceType,
  Source,
  ThemeSection,
  Quote,
  Stance,
  StancePoint,
  StanceShift,
  Figure,
  Answer,
  PromptCategory,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Figures — derived from the shared registry (lib/figures.ts) so the
// candidate browser and this mock data can never describe the same person
// two different ways.
// ---------------------------------------------------------------------------

function figureById(id: string) {
  const profile = FIGURES.find((f) => f.id === id);
  if (!profile) throw new Error(`Unknown figure id in mock data: ${id}`);
  return toAnswerFigure(profile);
}

const trump = figureById("trump");
const starmer = figureById("starmer");
const musk = figureById("musk");
const harris = figureById("harris");

// ---------------------------------------------------------------------------
// Answer 1 — Trump / tariffs
// ---------------------------------------------------------------------------

const trumpSources: Source[] = [
  {
    id: "src-trump-1",
    title: "Remarks on Reciprocal Trade and European Tariffs",
    publisher: "White House Press Office (transcript)",
    date: "2025-02-13",
    type: "transcript",
    url: "#preview-source-transcript-official-remarks",
    confidence: 96,
  },
  {
    id: "src-trump-2",
    title: "Joint Press Conference — Auto & Steel Tariff Policy",
    publisher: "C-SPAN",
    date: "2025-03-26",
    type: "video",
    url: "#preview-source-cspan-press-conference",
    confidence: 93,
    timestamp: "18:42",
  },
  {
    id: "src-trump-3",
    title: "Interview on European Trade Deficits",
    publisher: "Fox News Sunday (transcript)",
    date: "2024-11-03",
    type: "interview",
    url: "#preview-source-network-interview-transcript",
    confidence: 88,
  },
  {
    id: "src-trump-4",
    title: "Proclamation Adjusting Imports of Steel and Aluminum",
    publisher: "Federal Register",
    date: "2018-03-08",
    type: "press-release",
    url: "#preview-source-federal-register",
    confidence: 99,
  },
];

const answerTrump: Answer = {
  id: "trump-tariffs",
  query: "What has Donald Trump said about trade tariffs with Europe?",
  figure: trump,
  generatedAt: "2026-09-20T14:02:00Z",
  mode: "preview",
  summary:
    "Across public remarks spanning 2018 to 2025, Trump has consistently framed EU trade practices as unfair to U.S. manufacturers and has repeatedly used or threatened tariffs — first on steel and aluminum, later expanding to autos and a broader 'reciprocal tariff' framework — as leverage to renegotiate terms.",
  themes: [
    {
      id: "theme-1",
      heading: "Steel & aluminum as the opening move",
      claims: [
        {
          id: "claim-1-1",
          text: "Beginning with the 2018 Section 232 proclamation, tariffs on steel and aluminum imports were framed as a national-security and manufacturing-jobs measure.",
          sourceIds: ["src-trump-4"],
        },
        {
          id: "claim-1-2",
          text: "The EU was named specifically as a trade partner running a persistent surplus with the U.S.",
          sourceIds: ["src-trump-4"],
        },
      ],
    },
    {
      id: "theme-2",
      heading: "'Reciprocal tariffs' as the 2025 framework",
      claims: [
        {
          id: "claim-2-1",
          text: "In 2025 remarks, the administration described a shift from targeted product tariffs to a broader reciprocal-tariff structure.",
          sourceIds: ["src-trump-1"],
        },
        {
          id: "claim-2-2",
          text: "That framework was described as matching U.S. import duties to what trading partners, including the EU, charge on American goods.",
          sourceIds: ["src-trump-2"],
        },
      ],
    },
    {
      id: "theme-3",
      heading: "Autos named as a recurring flashpoint",
      claims: [
        {
          id: "claim-3-1",
          text: "European auto exports are cited repeatedly as an example of an imbalance — the stated U.S. tariff on European cars versus the EU tariff on American cars.",
          sourceIds: ["src-trump-2"],
        },
        {
          id: "claim-3-2",
          text: "That gap is used to argue that existing terms disadvantage U.S. manufacturers.",
          sourceIds: ["src-trump-3"],
        },
      ],
    },
  ],
  quotes: [
    {
      id: "q-trump-1",
      text: "The Union has treated us very unfairly on trade for a long time, and that changes now.",
      date: "2025-02-13",
      context: "Remarks announcing the reciprocal tariff framework",
      sourceId: "src-trump-1",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-trump-2",
      text: "They charge us, we don't charge them, and that's not a system, that's a one-way street.",
      date: "2024-11-03",
      context: "Discussing EU auto tariffs in a network interview",
      sourceId: "src-trump-3",
      verified: true,
      verificationMethod: "snippet",
    },
  ],
  sources: trumpSources,
  stanceShift: undefined,
  relatedPrompts: [
    "How has the European Union responded to these tariff threats?",
    "What do U.S. manufacturers say about the 2018 steel tariffs in hindsight?",
    "Has Trump's tariff rhetoric on Europe changed since his first term?",
    "What do economists say about the price impact of these tariffs on U.S. consumers?",
  ],
};

// ---------------------------------------------------------------------------
// Answer 2 — Starmer / green energy (stance shift showcase)
// ---------------------------------------------------------------------------

const starmerSources: Source[] = [
  {
    id: "src-starmer-1",
    title: "Labour Conference Speech — Green Prosperity Plan",
    publisher: "Labour Party (official transcript)",
    date: "2021-09-27",
    type: "transcript",
    url: "#preview-source-party-conference-transcript",
    confidence: 95,
  },
  {
    id: "src-starmer-2",
    title: "Interview on Fiscal Rules and the £28bn Pledge",
    publisher: "BBC Radio 4, Today Programme",
    date: "2024-02-08",
    type: "interview",
    url: "#preview-source-bbc-radio-transcript",
    confidence: 91,
  },
  {
    id: "src-starmer-3",
    title: "Press Conference — Launch of Great British Energy",
    publisher: "UK Government (official transcript)",
    date: "2024-07-25",
    type: "press-release",
    url: "#preview-source-gov-uk-press-conference",
    confidence: 97,
  },
  {
    id: "src-starmer-4",
    title: "House of Commons — Statement on Clean Power 2030",
    publisher: "Hansard",
    date: "2024-12-13",
    type: "transcript",
    url: "#preview-source-hansard-record",
    confidence: 98,
  },
];

const answerStarmer: Answer = {
  id: "starmer-green-energy",
  query: "How has Keir Starmer's position on green energy changed since 2021?",
  figure: starmer,
  generatedAt: "2026-09-20T14:05:00Z",
  mode: "preview",
  summary:
    "The headline commitment — a large-scale, state-backed green investment plan — has been publicly scaled back once on cost grounds since 2021, while the underlying policy goal (a clean-power grid and a public energy company) has remained and was reaffirmed after entering government.",
  themes: [
    {
      id: "theme-1",
      heading: "2021: a specific, large annual figure",
      claims: [
        {
          id: "claim-1-1",
          text: "The original 'Green Prosperity Plan' was framed around a headline £28bn-per-year public investment figure.",
          sourceIds: ["src-starmer-1"],
        },
        {
          id: "claim-1-2",
          text: "It was positioned as transformative industrial policy tied to jobs in green manufacturing.",
          sourceIds: ["src-starmer-1"],
        },
      ],
    },
    {
      id: "theme-2",
      heading: "2024: the figure is dropped, framed as fiscal discipline",
      claims: [
        {
          id: "claim-2-1",
          text: "Ahead of the general election, the £28bn figure was explicitly abandoned, attributed to changed economic conditions and a commitment to strict fiscal rules.",
          sourceIds: ["src-starmer-2"],
        },
        {
          id: "claim-2-2",
          text: "The broader ambition was described as unchanged even as the specific number was removed.",
          sourceIds: ["src-starmer-2"],
        },
      ],
    },
    {
      id: "theme-3",
      heading: "2024–present: the policy vehicle persists as GB Energy",
      claims: [
        {
          id: "claim-3-1",
          text: "In government, the publicly-owned energy company Great British Energy was launched.",
          sourceIds: ["src-starmer-3"],
        },
        {
          id: "claim-3-2",
          text: "A 2030 clean-power target was separately restated, without reviving the original spending figure.",
          sourceIds: ["src-starmer-4"],
        },
      ],
    },
  ],
  quotes: [
    {
      id: "q-starmer-1",
      text: "Twenty-eight billion pounds a year, every year, to rebuild Britain's industrial future.",
      date: "2021-09-27",
      context: "Labour Party conference speech introducing the pledge",
      sourceId: "src-starmer-1",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-starmer-2",
      text: "The fiscal rules come first, and the number was never the point, the mission is.",
      date: "2024-02-08",
      context: "Responding to questions about scaling back the pledge",
      sourceId: "src-starmer-2",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-starmer-3",
      text: "This is how we deliver energy security and lower bills, starting now, through GB Energy.",
      date: "2024-07-25",
      context: "Press conference launching Great British Energy",
      sourceId: "src-starmer-3",
      verified: true,
      verificationMethod: "full-page",
    },
  ],
  sources: starmerSources,
  stanceShift: {
    topic: "£28bn-per-year green investment pledge",
    points: [
      {
        date: "2021-09-27",
        label: "Pledge introduced",
        summary: "Commits to £28bn/year in green investment as a headline manifesto-shaping figure.",
        stance: "for",
        sourceId: "src-starmer-1",
      },
      {
        date: "2024-02-08",
        label: "Figure abandoned",
        summary: "Publicly drops the £28bn figure, citing fiscal rules and changed economic conditions.",
        stance: "mixed",
        sourceId: "src-starmer-2",
      },
      {
        date: "2024-07-25",
        label: "Policy vehicle relaunched without the figure",
        summary: "Launches GB Energy as the delivery mechanism for the same underlying goal, no spending number restated.",
        stance: "neutral",
        sourceId: "src-starmer-3",
      },
      {
        date: "2024-12-13",
        label: "2030 target reaffirmed in Parliament",
        summary: "Restates a clean-power-by-2030 goal in a Commons statement.",
        stance: "for",
        sourceId: "src-starmer-4",
      },
    ],
  },
  relatedPrompts: [
    "What did UK energy industry groups say about dropping the £28bn pledge?",
    "How does Clean Power 2030 compare to the original 2021 plan in scope?",
    "What have opposition MPs said about this shift in Parliament?",
    "How do UK voters' priorities on energy costs compare to 2021?",
  ],
};

// ---------------------------------------------------------------------------
// Answer 3 — Musk / AI safety
// ---------------------------------------------------------------------------

const muskSources: Source[] = [
  {
    id: "src-musk-1",
    title: "Open Letter: Pause Giant AI Experiments",
    publisher: "Future of Life Institute (signatory record)",
    date: "2023-03-22",
    type: "press-release",
    url: "#preview-source-open-letter-signatory-record",
    confidence: 94,
  },
  {
    id: "src-musk-2",
    title: "Testimony to Senate AI Insight Forum",
    publisher: "U.S. Senate (transcript)",
    date: "2023-09-13",
    type: "transcript",
    url: "#preview-source-senate-forum-transcript",
    confidence: 92,
  },
  {
    id: "src-musk-3",
    title: "Interview on xAI's Founding Rationale",
    publisher: "Interview, tech press (transcript)",
    date: "2023-07-12",
    type: "interview",
    url: "#preview-source-tech-press-interview",
    confidence: 85,
  },
  {
    id: "src-musk-4",
    title: "Remarks at AI Safety Summit",
    publisher: "UK Government event (official video)",
    date: "2023-11-02",
    type: "video",
    url: "#preview-source-summit-video",
    confidence: 90,
    timestamp: "04:21",
  },
];

const answerMusk: Answer = {
  id: "musk-ai-safety",
  query: "What are Elon Musk's recent statements regarding AI safety?",
  figure: musk,
  generatedAt: "2026-09-20T14:08:00Z",
  mode: "preview",
  summary:
    "Musk has publicly described advanced AI as a significant risk warranting external oversight — including signing a call for a development pause and testifying in favor of regulation — while simultaneously founding and scaling an AI company, a tension he has addressed directly in interviews as 'safer to build it than let others build it unsupervised.'",
  themes: [
    {
      id: "theme-1",
      heading: "Public calls for a pause and oversight",
      claims: [
        {
          id: "claim-1-1",
          text: "In 2023, Musk was a signatory to an open letter calling for a six-month pause on training AI systems more powerful than a named threshold.",
          sourceIds: ["src-musk-1"],
        },
        {
          id: "claim-1-2",
          text: "He separately testified to lawmakers in favor of a regulatory body for frontier AI.",
          sourceIds: ["src-musk-2"],
        },
      ],
    },
    {
      id: "theme-2",
      heading: "Founding xAI as a stated safety rationale",
      claims: [
        {
          id: "claim-2-1",
          text: "Shortly after signing the pause letter, Musk founded xAI.",
          sourceIds: ["src-musk-3"],
        },
        {
          id: "claim-2-2",
          text: "He explained the decision in interviews as motivated by wanting a 'maximally truth-seeking' alternative in the field rather than ceding development entirely to other labs.",
          sourceIds: ["src-musk-3"],
        },
      ],
    },
    {
      id: "theme-3",
      heading: "International summit engagement",
      claims: [
        {
          id: "claim-3-1",
          text: "Musk participated in the UK's 2023 AI Safety Summit.",
          sourceIds: ["src-musk-4"],
        },
        {
          id: "claim-3-2",
          text: "He used the platform to reiterate concerns about existential-level risk from unregulated frontier models.",
          sourceIds: ["src-musk-4"],
        },
      ],
    },
  ],
  quotes: [
    {
      id: "q-musk-1",
      text: "I think AI is more dangerous than, say, mismanaged aircraft design, and we do need a regulator.",
      date: "2023-09-13",
      context: "Testimony to the Senate AI Insight Forum",
      sourceId: "src-musk-2",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-musk-2",
      text: "Better that it's built by people who actually care about doing it safely than to just hope for the best.",
      date: "2023-07-12",
      context: "Interview explaining the founding of xAI",
      sourceId: "src-musk-3",
      verified: false,
      verificationMethod: "unverified",
    },
  ],
  sources: muskSources,
  stanceShift: undefined,
  relatedPrompts: [
    "What do AI safety researchers say about Musk founding a competing lab?",
    "How has the tech industry responded to calls for a development pause?",
    "What regulation, if any, has been enacted since the 2023 Senate testimony?",
    "How does Musk's public stance compare to other frontier AI lab leaders?",
  ],
};

// ---------------------------------------------------------------------------
// Answer 4 — Harris / AI regulation
// ---------------------------------------------------------------------------

const harrisSources: Source[] = [
  {
    id: "src-harris-1",
    title: "Remarks at the UK AI Safety Summit",
    publisher: "The White House (official transcript)",
    date: "2023-11-01",
    type: "transcript",
    url: "#preview-source-white-house-summit-remarks",
    confidence: 96,
  },
  {
    id: "src-harris-2",
    title: "Remarks on the Executive Order on Safe, Secure, and Trustworthy AI",
    publisher: "White House Press Office (transcript)",
    date: "2023-10-30",
    type: "transcript",
    url: "#preview-source-white-house-eo-remarks",
    confidence: 97,
  },
  {
    id: "src-harris-3",
    title: "Announcement of the U.S. AI Safety Institute",
    publisher: "NIST / White House (press release)",
    date: "2023-11-01",
    type: "press-release",
    url: "#preview-source-nist-ai-safety-institute",
    confidence: 94,
  },
  {
    id: "src-harris-4",
    title: "Interview on AI and Algorithmic Bias",
    publisher: "Network interview (transcript)",
    date: "2023-11-03",
    type: "interview",
    url: "#preview-source-network-ai-bias-interview",
    confidence: 83,
  },
];

const answerHarris: Answer = {
  id: "harris-ai-regulation",
  query: "What is Kamala Harris's stance on AI regulation?",
  figure: harris,
  generatedAt: "2026-09-20T14:11:00Z",
  mode: "preview",
  summary:
    "As Vice President, Harris framed AI regulation around both near-term, concrete harms — algorithmic bias, disinformation, fraud — and longer-term frontier-model risk, and publicly represented the administration's two main 2023 actions: an executive order requiring safety testing from frontier developers, and a newly announced U.S. AI Safety Institute.",
  themes: [
    {
      id: "theme-1",
      heading: "Distinguishing near-term harms from existential risk",
      claims: [
        {
          id: "claim-1-1",
          text: "At the UK's 2023 AI Safety Summit, Harris argued that AI safety discussions should not focus solely on long-term, catastrophic risk.",
          sourceIds: ["src-harris-1"],
        },
        {
          id: "claim-1-2",
          text: "She pointed to present-day harms — biased lending or hiring algorithms, disinformation, and fraud — as safety issues deserving equal attention.",
          sourceIds: ["src-harris-1", "src-harris-4"],
        },
      ],
    },
    {
      id: "theme-2",
      heading: "The AI executive order as the domestic action",
      claims: [
        {
          id: "claim-2-1",
          text: "She delivered remarks alongside the administration's October 2023 executive order on AI.",
          sourceIds: ["src-harris-2"],
        },
        {
          id: "claim-2-2",
          text: "That order was described as requiring frontier AI developers to share safety test results with the federal government before public release.",
          sourceIds: ["src-harris-2"],
        },
      ],
    },
    {
      id: "theme-3",
      heading: "A new federal body to operationalize AI safety",
      claims: [
        {
          id: "claim-3-1",
          text: "Harris announced the creation of the U.S. AI Safety Institute during the same UK summit trip.",
          sourceIds: ["src-harris-3"],
        },
        {
          id: "claim-3-2",
          text: "The institute was framed as the body responsible for developing testing and evaluation standards for AI systems.",
          sourceIds: ["src-harris-3"],
        },
      ],
    },
  ],
  quotes: [
    {
      id: "q-harris-1",
      text: "When a woman is denied a business loan because of a biased AI algorithm, that is a threat to her safety too.",
      date: "2023-11-01",
      context: "Remarks at the UK AI Safety Summit",
      sourceId: "src-harris-1",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-harris-2",
      text: "We simply cannot wait for international consensus before we act, so today the President signed an executive order for the safe, secure, and trustworthy development of AI.",
      date: "2023-10-30",
      context: "Remarks on the AI executive order",
      sourceId: "src-harris-2",
      verified: true,
      verificationMethod: "full-page",
    },
  ],
  sources: harrisSources,
  stanceShift: undefined,
  relatedPrompts: [
    "How did other countries respond to the U.S. AI Safety Institute announcement?",
    "What does the AI executive order require of frontier AI developers?",
    "How does Harris's framing of AI harms compare to Elon Musk's?",
    "What have civil rights groups said about algorithmic bias in AI?",
  ],
};

export const answers: Record<string, Answer> = {
  [answerTrump.id]: answerTrump,
  [answerStarmer.id]: answerStarmer,
  [answerMusk.id]: answerMusk,
  [answerHarris.id]: answerHarris,
};

// ---------------------------------------------------------------------------
// Starter prompt categories
// ---------------------------------------------------------------------------

export const promptCategories: PromptCategory[] = [
  {
    id: "foreign-policy",
    label: "Foreign Policy",
    icon: Globe2,
    prompts: [
      { text: "What has Donald Trump said about trade tariffs with Europe?", answerId: "trump-tariffs" },
      { text: "What is Donald Trump's public position on Iran?", answerId: "trump-tariffs" },
    ],
  },
  {
    id: "economy",
    label: "Economy",
    icon: Landmark,
    prompts: [
      { text: "What has Donald Trump said about trade tariffs with Europe?", answerId: "trump-tariffs" },
    ],
  },
  {
    id: "tech-ai",
    label: "Tech & AI",
    icon: Cpu,
    prompts: [
      { text: "What are Elon Musk's recent statements regarding AI safety?", answerId: "musk-ai-safety" },
      { text: "What is Kamala Harris's stance on AI regulation?", answerId: "harris-ai-regulation" },
    ],
  },
  {
    id: "historical-shifts",
    label: "Historical Shifts",
    icon: History,
    prompts: [
      { text: "How has Keir Starmer's position on green energy changed since 2021?", answerId: "starmer-green-energy" },
    ],
  },
];

/**
 * Looks up one of the handful of canned demo answers — never a default. A
 * query that doesn't match a covered figure returns undefined so the
 * pipeline can say so honestly (see AnswerResult's "demo_not_covered"
 * status) instead of silently handing back an unrelated answer.
 */
export function findAnswerForQuery(query: string): Answer | undefined {
  const q = query.toLowerCase();
  if (q.includes("starmer") || q.includes("green energy")) return answers["starmer-green-energy"];
  if (q.includes("harris") || q.includes("kamala")) return answers["harris-ai-regulation"];
  if (q.includes("musk") || q.includes("ai regulation") || q.includes("ai safety")) return answers["musk-ai-safety"];
  if (q.includes("trump") || q.includes("tariff")) return answers["trump-tariffs"];
  return undefined;
}
