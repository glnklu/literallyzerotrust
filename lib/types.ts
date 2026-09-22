// -----------------------------------------------------------------------------
// CANONICAL DATA CONTRACT
// -----------------------------------------------------------------------------
// Shared between the Step 1 mock data, the Step 2 retrieval/synthesis
// pipeline, and every UI component. The pipeline's job (lib/pipeline/*) is to
// produce a value that satisfies exactly this shape from real sources — the
// UI never needs to know whether an Answer came from mock data or a live run.
// -----------------------------------------------------------------------------

import type { LucideIcon } from "lucide-react";

export type SourceType =
  | "transcript"
  | "video"
  | "press-release"
  | "vote-record"
  | "interview";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  date: string;
  type: SourceType;
  url: string;
  confidence: number; // 0-100, editorial confidence that this is an official/primary source
  timestamp?: string; // for video sources, e.g. "12:04"
}

export interface ThemeSection {
  id: string;
  heading: string;
  body: string;
  sourceIds: string[];
}

export interface Quote {
  id: string;
  text: string;
  date: string;
  context: string;
  sourceId: string;
}

export type Stance = "for" | "against" | "mixed" | "neutral";

export interface StancePoint {
  date: string;
  label: string;
  summary: string;
  stance: Stance;
  sourceId: string;
}

export interface StanceShift {
  topic: string;
  points: StancePoint[];
}

export interface Figure {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent: string; // tailwind gradient classes
}

/**
 * "preview": generated from Step 1's static mock data (no search/LLM keys
 * configured, or the pipeline explicitly fell back).
 * "live": generated from real retrieval + Claude synthesis.
 */
export type AnswerMode = "preview" | "live";

export interface Answer {
  id: string;
  query: string;
  figure: Figure;
  generatedAt: string;
  mode: AnswerMode;
  summary: string;
  themes: ThemeSection[];
  quotes: Quote[];
  sources: Source[];
  stanceShift?: StanceShift;
  relatedPrompts: string[];
}

export interface PromptCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  prompts: { text: string; answerId: string }[];
}

/**
 * The pipeline never fabricates an Answer when evidence is thin — it returns
 * one of these instead, and the UI renders each state honestly rather than
 * forcing a confident-looking card out of nothing.
 */
export type AnswerResult =
  | { status: "ok"; answer: Answer }
  | { status: "insufficient_sources"; query: string; figureGuess?: string; sourcesFound: number }
  | { status: "error"; query: string; message: string };
