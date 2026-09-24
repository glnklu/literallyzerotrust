// -----------------------------------------------------------------------------
// SYNTHESIS: quotes-only, citation-backed extraction
// -----------------------------------------------------------------------------
// This is where the app's core promise is enforced in the prompt itself:
// Claude sees ONLY the retrieved documents (never its own training-data
// knowledge of the figure), extracts verbatim quotes rather than writing a
// paraphrased narrative, and must say so plainly when the evidence is too
// thin rather than produce a confident-sounding answer anyway.
//
// The answer is quotes first, summary second — both in what's shown (see
// components/answer/answer-view.tsx) and in how the model is asked to work:
// pick the quotes, THEN summarize what they show, never the reverse. A
// summary written first would just be an ungrounded paraphrase that quotes
// get cherry-picked to support afterward.
//
// Structured output is forced via tool use (not "please respond in JSON"),
// and the result is re-validated against a zod schema *and* cross-checked
// against the actual set of retrieved document ids — anything citing an id
// that doesn't exist is dropped rather than trusted.
// -----------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RetrievedDocument } from "@/lib/pipeline/retrieve";

const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_SNIPPET_CHARS = 800;

const SYSTEM_PROMPT = `You are the synthesis engine for "literallyzerotrust", a transparency tool that reports what a named public figure has actually said about a topic — in their own words, using ONLY the source documents supplied in this request.

Hard rules, no exceptions:
1. Use only the content inside the provided <documents>. Never draw on outside knowledge of what this figure has said, believes, or has been reported to believe elsewhere. If your training data "remembers" something relevant that isn't in the documents, ignore it.
2. The answer is built entirely from direct quotes — never a paraphrased narrative. A quote must be copied verbatim from a document that is itself the figure's own words: a social media post, an interview transcript, an official statement, remarks, or testimony. Never quote a journalist's or third party's paraphrase or summary of what the figure said, even if it's presented in quotation marks by that source.
3. Never state or imply a political, moral, or factual judgment about the figure's position, in a quote's context line or in the summary. Do not use evaluative language (e.g. "concerning", "admirable", "extreme", "reasonable", "hypocritical", "flip-flopped"). Describe what was said and when; let the reader judge it.
4. Select quotes first, in chronological order by date. Only after choosing them, write "summary" — 1 to 3 plain sentences describing what the selected quotes, taken together, show. The summary must be grounded strictly in the quotes you picked; it is a recap of them, not a separate analysis with its own claims or sources.
5. If no document contains a clean, quotable verbatim first-source statement on this topic, leave "quotes" empty rather than paraphrasing something as if it were quoted. Never invent a document id, a quote, a date, or a source not present in <documents>.
6. If, after reviewing every document, there isn't enough material to actually answer what this figure said on this specific topic (documents are off-topic, about a different person, too thin, or not the figure's own words), set "insufficientEvidence" to true, give one plain-language sentence in "insufficientReason", and leave "quotes" empty.
7. "relatedPrompts" are natural follow-up questions grounded in the quotes you just selected (e.g. what critics, allies, or an affected country/industry have said about the same topic) — not generic filler.
8. Write in a neutral, factual register throughout, like a wire-service reporter, not an opinion column.

Respond only by calling the emit_answer tool.`;

const answerCoreSchema = z.object({
  figureName: z.string(),
  figureRole: z.string(),
  insufficientEvidence: z.boolean().optional().default(false),
  insufficientReason: z.string().optional(),
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
  summary: z.string().optional().default(""),
  relatedPrompts: z.array(z.string()).optional().default([]),
});

export type SynthesizedCore = z.infer<typeof answerCoreSchema>;

const EMIT_ANSWER_TOOL: Anthropic.Tool = {
  name: "emit_answer",
  description: "Emit the quotes-only, citation-backed answer synthesized from the provided documents.",
  strict: true,
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
      quotes: {
        type: "array",
        description: "Verbatim first-source quotes, chosen first and in chronological order.",
        items: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Verbatim excerpt copied from a document's content — must be the figure's own words, never a third party's paraphrase.",
            },
            date: { type: "string" },
            context: { type: "string", description: "Where/when it was said, e.g. 'Post on X' or 'Interview on Fox News Sunday'." },
            sourceId: { type: "string" },
          },
          required: ["text", "date", "context", "sourceId"],
          additionalProperties: false,
        },
      },
      summary: {
        type: "string",
        description: "1-3 sentences recapping what the selected quotes show, written after the quotes are chosen. No claims beyond what the quotes themselves support.",
      },
      relatedPrompts: { type: "array", items: { type: "string" } },
    },
    required: ["figureName", "figureRole", "insufficientEvidence"],
    additionalProperties: false,
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

  if (data.insufficientEvidence || data.quotes.length === 0) {
    return {
      status: "insufficient_evidence",
      reason: data.insufficientReason || "The retrieved sources don't clearly cover this question.",
    };
  }

  return { status: "ok", data };
}

/**
 * Defense in depth: drop any quote that cites a document id we didn't
 * actually retrieve. The model is instructed never to do this, but the UI's
 * entire trust model depends on every quote's citation resolving to a real
 * source, so it's re-checked in code rather than taken on faith.
 */
function enforceCitationIntegrity(
  data: SynthesizedCore,
  documents: RetrievedDocument[]
): SynthesizedCore {
  const validIds = new Set(documents.map((d) => d.id));
  const quotes = data.quotes.filter((q) => validIds.has(q.sourceId));
  return { ...data, quotes };
}
