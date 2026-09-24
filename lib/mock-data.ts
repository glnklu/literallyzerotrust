// -----------------------------------------------------------------------------
// MOCK / PREVIEW DATA
// -----------------------------------------------------------------------------
// Step 1 of the build is a frontend layout prototype. Nothing here is a live
// retrieval result. Quotes below are illustrative placeholders written to
// match the general, widely reported shape of each figure's public record —
// exact wording, dates, and links are not real transcripts. The live
// pipeline (lib/pipeline/*) replaces this whole module with real search +
// citation retrieval.
// -----------------------------------------------------------------------------

import { Globe2, Landmark, Cpu, History } from "lucide-react";
import type { Answer, PromptCategory, Source } from "@/lib/types";
import { FIGURES, toAnswerFigure } from "@/lib/figures";

export type {
  SourceType,
  Source,
  Quote,
  VerificationMethod,
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
    id: "src-trump-4",
    title: "Proclamation Adjusting Imports of Steel and Aluminum",
    publisher: "Federal Register",
    date: "2018-03-08",
    type: "press-release",
    url: "#preview-source-federal-register",
    confidence: 99,
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
    id: "src-trump-5",
    title: "Post on Tariff Policy Toward the EU",
    publisher: "X",
    date: "2025-01-15",
    type: "post",
    url: "#preview-source-x-post",
    confidence: 80,
  },
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
];

const answerTrump: Answer = {
  id: "trump-tariffs",
  query: "What has Donald Trump said about trade tariffs with Europe?",
  figure: trump,
  generatedAt: "2026-09-20T14:02:00Z",
  mode: "preview",
  quotes: [
    {
      id: "q-trump-1",
      text: "This is not merely an economic issue. We must not let our country, or its companies and workers, be taken advantage of.",
      date: "2018-03-08",
      context: "Proclamation adjusting imports of steel and aluminum",
      sourceId: "src-trump-4",
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
    {
      id: "q-trump-3",
      text: "Tariffs are a beautiful thing, and Europe is going to finally pay its fair share.",
      date: "2025-01-15",
      context: "Post on X",
      sourceId: "src-trump-5",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-trump-4",
      text: "The Union has treated us very unfairly on trade for a long time, and that changes now.",
      date: "2025-02-13",
      context: "Remarks announcing the reciprocal tariff framework",
      sourceId: "src-trump-1",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-trump-5",
      text: "We pay two and a half percent, they charge us ten percent on our cars, and that's not fair to our autoworkers.",
      date: "2025-03-26",
      context: "Joint press conference on auto and steel tariff policy",
      sourceId: "src-trump-2",
      verified: true,
      verificationMethod: "full-page",
    },
  ],
  summary:
    "Across a 2018 proclamation, an interview, a post, and two 2025 press events, Trump has repeatedly framed EU trade terms as unfair to U.S. manufacturers and autoworkers, and has used or threatened tariffs — first on steel and aluminum, later autos — as leverage to renegotiate them.",
  sources: trumpSources,
  relatedPrompts: [
    "How has the European Union responded to these tariff threats?",
    "What do U.S. manufacturers say about the 2018 steel tariffs in hindsight?",
    "Has Trump's tariff rhetoric on Europe changed since his first term?",
    "What do economists say about the price impact of these tariffs on U.S. consumers?",
  ],
};

// ---------------------------------------------------------------------------
// Answer 2 — Starmer / green energy
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
    {
      id: "q-starmer-4",
      text: "This mission was never about a single number, it is about a clean power system by 2030 that we will deliver.",
      date: "2024-12-13",
      context: "House of Commons statement on Clean Power 2030",
      sourceId: "src-starmer-4",
      verified: true,
      verificationMethod: "snippet",
    },
  ],
  summary:
    "Starmer's public statements show the original £28bn-a-year green investment pledge introduced in 2021, publicly dropped in early 2024 citing fiscal rules, and replaced — without reviving the figure — by the Great British Energy company and a reaffirmed 2030 clean-power target.",
  sources: starmerSources,
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
    id: "src-musk-3",
    title: "Interview on xAI's Founding Rationale",
    publisher: "Interview, tech press (transcript)",
    date: "2023-07-12",
    type: "interview",
    url: "#preview-source-tech-press-interview",
    confidence: 85,
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
  quotes: [
    {
      id: "q-musk-1",
      text: "We call on all AI labs to immediately pause for at least six months the training of AI systems more powerful than the current state of the art.",
      date: "2023-03-22",
      context: "Open letter he signed calling for a pause in advanced AI development",
      sourceId: "src-musk-1",
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
    {
      id: "q-musk-3",
      text: "I think AI is more dangerous than, say, mismanaged aircraft design, and we do need a regulator.",
      date: "2023-09-13",
      context: "Testimony to the Senate AI Insight Forum",
      sourceId: "src-musk-2",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-musk-4",
      text: "If I were to guess what the biggest threat to humanity is, or the biggest risk, it's probably that.",
      date: "2023-11-02",
      context: "Remarks at the UK AI Safety Summit",
      sourceId: "src-musk-4",
      verified: true,
      verificationMethod: "full-page",
    },
  ],
  summary:
    "Across a signed 2023 open letter, an interview, Senate testimony, and remarks at the UK's AI Safety Summit, Musk has described advanced AI as a major risk warranting outside regulation, while also framing his own AI company as a safer alternative to leaving frontier development to others.",
  sources: muskSources,
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
    id: "src-harris-2",
    title: "Remarks on the Executive Order on Safe, Secure, and Trustworthy AI",
    publisher: "White House Press Office (transcript)",
    date: "2023-10-30",
    type: "transcript",
    url: "#preview-source-white-house-eo-remarks",
    confidence: 97,
  },
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
  quotes: [
    {
      id: "q-harris-1",
      text: "We simply cannot wait for international consensus before we act, so today the President signed an executive order for the safe, secure, and trustworthy development of AI.",
      date: "2023-10-30",
      context: "Remarks on the AI executive order",
      sourceId: "src-harris-2",
      verified: true,
      verificationMethod: "full-page",
    },
    {
      id: "q-harris-2",
      text: "When a woman is denied a business loan because of a biased AI algorithm, that is a threat to her safety too.",
      date: "2023-11-01",
      context: "Remarks at the UK AI Safety Summit",
      sourceId: "src-harris-1",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-harris-3",
      text: "Today we are launching the United States AI Safety Institute to lead the world in the safe and responsible development of AI.",
      date: "2023-11-01",
      context: "Announcing the U.S. AI Safety Institute",
      sourceId: "src-harris-3",
      verified: true,
      verificationMethod: "snippet",
    },
    {
      id: "q-harris-4",
      text: "AI being used to manipulate what people see and believe has to be part of any serious conversation about safety.",
      date: "2023-11-03",
      context: "Interview on AI and algorithmic bias",
      sourceId: "src-harris-4",
      verified: true,
      verificationMethod: "snippet",
    },
  ],
  summary:
    "During an early-November 2023 trip capped by the UK AI Safety Summit, Harris publicly tied the administration's AI executive order and the newly announced U.S. AI Safety Institute to both near-term harms like biased lending algorithms and disinformation, and longer-term frontier-model risk.",
  sources: harrisSources,
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
