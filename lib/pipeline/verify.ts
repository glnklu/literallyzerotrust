// -----------------------------------------------------------------------------
// QUOTE VERIFICATION
// -----------------------------------------------------------------------------
// Synthesis is instructed to copy quotes verbatim, but an instruction isn't
// proof. This step actually checks: first against the search snippet already
// retrieved (free — no extra network call), and if that doesn't contain the
// quote, by fetching the live source page and searching its text. A quote
// that matches neither is still shown (hiding it would silently contradict
// "every claim is sourced"), but marked unverified so the UI can say so
// instead of implying a confirmed exact transcript match.
//
// This is a heuristic, not a guarantee: search snippets are often
// pre-truncated/summarized by the search provider, and a live page fetch can
// be blocked, paywalled, or restructured since indexing. Both match paths
// use normalized-substring-or-high-word-overlap, not exact string equality,
// specifically to tolerate that kind of harmless drift (smart quotes,
// snippet ellipses) without pretending to be more rigorous than it is.
// -----------------------------------------------------------------------------

import type { VerificationMethod } from "@/lib/types";
import type { RetrievedDocument } from "@/lib/pipeline/retrieve";

const FETCH_TIMEOUT_MS = 6000;
const MAX_HTML_CHARS = 2_000_000;
const MAX_PAGE_TEXT_CHARS = 20_000;
const WORD_OVERLAP_THRESHOLD = 0.85;

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "for",
  "is", "are", "was", "were", "it", "that", "this", "with", "as", "by", "be",
  "has", "have", "had", "i", "we", "you", "he", "she", "they", "not", "so",
]);

export interface QuoteVerification {
  verified: boolean;
  method: VerificationMethod;
}

export async function verifyQuotes(
  quotes: { text: string; sourceId: string }[],
  documents: RetrievedDocument[]
): Promise<QuoteVerification[]> {
  const docById = new Map(documents.map((d) => [d.id, d]));
  return Promise.all(quotes.map((q) => verifyOne(q, docById.get(q.sourceId))));
}

async function verifyOne(
  quote: { text: string; sourceId: string },
  document: RetrievedDocument | undefined
): Promise<QuoteVerification> {
  if (!document) return { verified: false, method: "unverified" };

  if (textAppearsIn(quote.text, document.snippet)) {
    return { verified: true, method: "snippet" };
  }

  const pageText = await fetchPageText(document.url);
  if (pageText && textAppearsIn(quote.text, pageText)) {
    return { verified: true, method: "full-page" };
  }

  return { verified: false, method: "unverified" };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\w\s'"-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textAppearsIn(needle: string, haystack: string): boolean {
  const n = normalize(needle);
  const h = normalize(haystack);
  if (!n || !h) return false;
  if (h.includes(n)) return true;
  return wordOverlapRatio(n, h) >= WORD_OVERLAP_THRESHOLD;
}

function wordOverlapRatio(needleNormalized: string, haystackNormalized: string): number {
  const words = needleNormalized.split(" ").filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (words.length === 0) return 0;
  const found = words.filter((w) => haystackNormalized.includes(w));
  return found.length / words.length;
}

async function fetchPageText(url: string): Promise<string | null> {
  if (!/^https?:\/\//i.test(url)) return null; // skips mock/preview placeholder URLs

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "TrustNoOneVerifier/1.0 (+citation verification fetch)" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) return null;

    const html = await res.text();
    return htmlToText(html.slice(0, MAX_HTML_CHARS)).slice(0, MAX_PAGE_TEXT_CHARS);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
