// -----------------------------------------------------------------------------
// SYNTHESIS: neutral, citation-only extraction
// -----------------------------------------------------------------------------
// This is where the app's core promise is enforced in the prompt itself:
// Claude sees ONLY the retrieved documents (never its own training-data
// knowledge of the figure), must cite every claim back to a provided
// document id, and must say so plainly when the evidence is too thin rather
// than produce a confident-sounding answer anyway.
//
// Structured output is forced via tool use (not "please respond in JSON"),
// and the result is re-validated against a zod schema *and* cross-checked
// against the actual set of retrieved document ids — anything citing an id
// that doesn't exist is dropped rather than trusted. This is intentionally
// defensive even though Step 3 is where a fuller citation/verification
// engine lands; a synthesis step that can silently hallucinate a citation
// isn't acceptable to ship even as a first cut.
// -----------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RetrievedDocument } from "@/lib/pipeline/retrieve";

const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_SNIPPET_CHARS = 800;

const SYSTEM_PROMPT = `You are the synthesis engine for "Trust No One?", a transparency tool that reports what a named public figure has actually said about a topic — using ONLY the source documents supplied in this request.

Hard rules, no exceptions:
1. Use only the content inside the provided <documents>. Never draw on outside knowledge of what this figure has said, believes, or has been reported to believe elsewhere. If your training data "remembers" something relevant that isn't in the documents, ignore it.
2. Never state or imply a political, moral, or factual judgment about the figure's position. Do not use evaluative language (e.g. "concerning", "admirable", "extreme", "reasonable", "hypocritical", "flip-flopped"). Describe what was said and when; let the reader judge it.
3. Write each theme as a list of individual sentence-level "claims", not one paragraph. Each claim is exactly one sentence, and each claim cites the specific document id(s) that support THAT sentence — not a single citation list for the whole theme. If one sentence draws on two documents, cite both; if a heading needs three sentences to explain, that's three claims, each separately cited. Never invent a document id, a quote, a date, or a source not present in <documents>.
4. Quotes must be copied verbatim from a document's content. If no document contains a clean, quotable verbatim sentence on this topic, leave "quotes" empty rather than paraphrasing something as if it were quoted.
5. If the documents show the figure's position changing, softening, reversing, or being restated differently over time, populate "stanceShift" with a neutral chronological sequence of at least two points. State what changed and when — never label either position as the "real" or "true" one.
6. If, after reviewing every document, there isn't enough material to actually answer what this figure said on this specific topic (documents are off-topic, about a different person, too thin, or contradictory in a way you can't responsibly summarize), set "insufficientEvidence" to true, give one plain-language sentence in "insufficientReason", and leave "themes"/"quotes" empty. Do not stretch unrelated material into an answer.
7. "relatedPrompts" are natural follow-up questions grounded in the answer you just gave (e.g. what critics, allies, or an affected country/industry have said about the same topic) — not generic filler.
8. Write in a neutral, factual register throughout, like a wire-service reporter, not an opinion column.

Respond only by calling the emit_answer tool.`;

const stancePointSchema = z.object({
  date: z.string(),
  label: z.string(),
  summary: z.string(),
  stance: z.enum(["for", "against", "mixed", "neutral"]),
  sourceId: z.string(),
});

const answerCoreSchema = z.object({
  figureName: z.string(),
  figureRole: z.string(),
  insufficientEvidence: z.boolean().optional().default(false),
  insufficientReason: z.string().optional(),
  summary: z.string().optional().default(""),
  themes: z
    .array(
      z.object({
        heading: z.string(),
        claims: z
          .array(
            z.object({
              text: z.string(),
              sourceIds: z.array(z.string()).min(1),
            })
          )
          .min(1),
      })
    )
    .optional()
    .default([]),
  quotes: z
    .array(
      z.object({
        text: z.string(),
        date: z.string(),
        context: z.string(),
        sourceId: z.string(),
      })
    )
    .optional()
    .default([]),
  stanceShift: z
    .object({
      topic: z.string(),
      points: z.array(stancePointSchema).min(2),
    })
    .optional(),
  relatedPrompts: z.array(z.string()).optional().default([]),
});

export type SynthesizedCore = z.infer<typeof answerCoreSchema>;

const EMIT_ANSWER_TOOL: Anthropic.Tool = {
  name: "emit_answer",
  description: "Emit the neutral, citation-backed answer synthesized from the provided documents.",
  input_schema: {
    type: "object",
    properties: {
      figureName: { type: "string", description: "The public figure's full name, as commonly known." },
      figureRole: { type: "string", description: "Short current title/role, e.g. 'President of the United States'." },
      insufficientEvidence: {
        type: "boolean",
        description: "True if the documents don't actually support an answer on this topic.",
      },
      insufficientReason: { type: "string", description: "One sentence explaining why, if insufficientEvidence is true." },
      summary: { type: "string", description: "2-4 sentence neutral overview of the figure's documented position." },
      themes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            heading: { type: "string" },
            claims: {
              type: "array",
              description: "One entry per sentence. Do not merge multiple sentences into one claim.",
              items: {
                type: "object",
                properties: {
                  text: { type: "string", description: "Exactly one sentence." },
                  sourceIds: {
                    type: "array",
                    items: { type: "string" },
                    description: "Document id(s) that specifically support this sentence.",
                  },
                },
                required: ["text", "sourceIds"],
              },
            },
          },
          required: ["heading", "claims"],
        },
      },
      quotes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "Verbatim excerpt copied from a document's content." },
            date: { type: "string" },
            context: { type: "string", description: "Where/when it was said." },
            sourceId: { type: "string" },
          },
          required: ["text", "date", "context", "sourceId"],
        },
      },
      stanceShift: {
        type: "object",
        description: "Only include if the documents show a genuine change over time.",
        properties: {
          topic: { type: "string" },
          points: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                label: { type: "string" },
                summary: { type: "string" },
                stance: { type: "string", enum: ["for", "against", "mixed", "neutral"] },
                sourceId: { type: "string" },
              },
              required: ["date", "label", "summary", "stance", "sourceId"],
            },
          },
        },
        required: ["topic", "points"],
      },
      relatedPrompts: { type: "array", items: { type: "string" } },
    },
    required: ["figureName", "figureRole", "insufficientEvidence"],
  },
};

export interface SynthesisInput {
  query: string;
  figureGuess?: string;
  documents: RetrievedDocument[];
}

export type SynthesisOutcome =
  | { status: "ok"; data: SynthesizedCore }
  | { status: "insufficient_evidence"; reason: string }
  | { status: "error"; message: string };

function buildUserMessage(input: SynthesisInput): string {
  const docsXml = input.documents
    .map((doc) => {
      const snippet = doc.snippet.slice(0, MAX_SNIPPET_CHARS);
      return `  <document id="${doc.id}" publisher="${escapeAttr(doc.publisher)}" date="${escapeAttr(
        doc.date
      )}" confidence="${doc.confidence}">
    <title>${escapeText(doc.title)}</title>
    <content>${escapeText(snippet)}</content>
  </document>`;
    })
    .join("\n");

  return `<question>${escapeText(input.query)}</question>
${input.figureGuess ? `<figure_guess>${escapeText(input.figureGuess)}</figure_guess>` : ""}
<documents>
${docsXml}
</documents>

Using only the documents above, answer the question by calling emit_answer.`;
}

function escapeText(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);
}
function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}

export function isSynthesisConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function synthesizeAnswer(input: SynthesisInput): Promise<SynthesisOutcome> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: "error", message: "ANTHROPIC_API_KEY is not configured" };
  }

  const client = new Anthropic({ apiKey });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      tools: [EMIT_ANSWER_TOOL],
      tool_choice: { type: "tool", name: "emit_answer" },
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown synthesis error";
    return { status: "error", message };
  }

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "emit_answer"
  );
  if (!toolUse) {
    return { status: "error", message: "Model did not return a structured answer" };
  }

  const parsed = answerCoreSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    return { status: "error", message: `Malformed synthesis output: ${parsed.error.message}` };
  }

  const data = enforceCitationIntegrity(parsed.data, input.documents);

  if (data.insufficientEvidence || (data.themes.length === 0 && data.quotes.length === 0)) {
    return {
      status: "insufficient_evidence",
      reason: data.insufficientReason || "The retrieved sources don't clearly cover this question.",
    };
  }

  return { status: "ok", data };
}

/**
 * Defense in depth: drop any sentence that cites a document id we didn't
 * actually retrieve, at the individual claim level. The model is instructed
 * never to do this, but the UI's entire trust model depends on every
 * sentence's citation resolving to a real source, so it's re-checked in
 * code rather than taken on faith. A theme that loses all its claims this
 * way is dropped entirely rather than shown as an empty heading.
 */
function enforceCitationIntegrity(
  data: SynthesizedCore,
  documents: RetrievedDocument[]
): SynthesizedCore {
  const validIds = new Set(documents.map((d) => d.id));

  const themes = data.themes
    .map((t) => ({
      ...t,
      claims: t.claims
        .map((c) => ({ ...c, sourceIds: c.sourceIds.filter((id) => validIds.has(id)) }))
        .filter((c) => c.sourceIds.length > 0),
    }))
    .filter((t) => t.claims.length > 0);

  const quotes = data.quotes.filter((q) => validIds.has(q.sourceId));

  let stanceShift = data.stanceShift;
  if (stanceShift) {
    const points = stanceShift.points.filter((p) => validIds.has(p.sourceId));
    stanceShift = points.length >= 2 ? { ...stanceShift, points } : undefined;
  }

  return { ...data, themes, quotes, stanceShift };
}
