import { NextResponse } from "next/server";

/**
 * Health check endpoint for network connectivity testing
 * Optimized for fast response times
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

/**
 * HEAD request for lightweight connectivity testing
 * Minimal response for network detection
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
