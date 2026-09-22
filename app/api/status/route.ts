// -----------------------------------------------------------------------------
// DIAGNOSTIC ENDPOINT
// -----------------------------------------------------------------------------
// Visit this URL directly in a browser (GET /api/status) to see, with zero
// ambiguity, whether the deployed app's runtime actually has the search/LLM
// credentials — instead of inferring it indirectly from what a query result
// looks like, or digging through the hosting dashboard's UI. Only booleans
// are returned; no key values, prefixes, or lengths are ever exposed.
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { isSearchConfigured } from "@/lib/search/tavily";
import { isSynthesisConfigured } from "@/lib/pipeline/synthesize";
import { isLivePipelineConfigured } from "@/lib/pipeline/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    tavilyKeyDetected: isSearchConfigured(),
    anthropicKeyDetected: isSynthesisConfigured(),
    livePipelineActive: isLivePipelineConfigured(),
  });
}
