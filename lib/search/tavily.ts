// -----------------------------------------------------------------------------
// SEARCH PROVIDER: Tavily
// -----------------------------------------------------------------------------
// One provider, behind a narrow interface (searchWeb). Swapping to Exa or
// Serper later means writing one file with this same shape and pointing
// lib/pipeline/retrieve.ts at it — nothing upstream changes.
//
// Tavily was picked over Exa/Serper for Step 2 because its `include_domains`
// parameter lets the retrieval step search *within* the trusted-source
// registry directly, rather than filtering a generic web index after the
// fact.
// -----------------------------------------------------------------------------

export interface RawSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface SearchOptions {
  includeDomains?: string[];
  maxResults?: number;
}

export class SearchProviderError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "SearchProviderError";
  }
}

interface TavilyApiResult {
  title?: string;
  url: string;
  content?: string;
  published_date?: string;
}

interface TavilyApiResponse {
  results?: TavilyApiResult[];
}

export function isSearchConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY);
}

export async function searchWeb(
  query: string,
  opts: SearchOptions = {}
): Promise<RawSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new SearchProviderError("TAVILY_API_KEY is not configured");
  }

  let response: Response;
  try {
    response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: opts.maxResults ?? 8,
        include_domains: opts.includeDomains?.length ? opts.includeDomains : undefined,
      }),
    });
  } catch (err) {
    throw new SearchProviderError("Tavily request failed to send", err);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new SearchProviderError(
      `Tavily search failed: ${response.status} ${response.statusText} ${body}`.trim()
    );
  }

  const data = (await response.json()) as TavilyApiResponse;
  return (data.results ?? [])
    .filter((r) => Boolean(r.url))
    .map((r) => ({
      title: r.title ?? r.url,
      url: r.url,
      snippet: r.content ?? "",
      publishedDate: r.published_date || undefined,
    }));
}
