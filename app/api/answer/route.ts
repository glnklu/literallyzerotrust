import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/pipeline/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AnswerRequestBody {
  query?: unknown;
}

export async function POST(request: Request) {
  let body: AnswerRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.query !== "string" || !body.query.trim()) {
    return NextResponse.json(
      { status: "error", message: "`query` must be a non-empty string." },
      { status: 400 }
    );
  }

  if (body.query.length > 500) {
    return NextResponse.json(
      { status: "error", message: "Query is too long (500 characters max)." },
      { status: 400 }
    );
  }

  try {
    const result = await generateAnswer(body.query);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ status: "error", query: body.query, message }, { status: 500 });
  }
}
