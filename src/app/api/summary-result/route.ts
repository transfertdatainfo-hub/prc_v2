import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  // summaryStore est maintenant typé correctement
  const store = globalThis.summaryStore ?? new Map();

  const summary = store.get(jobId || "");

  return NextResponse.json({ summary });
}
