import { NextResponse } from 'next/server';

// Liveness/readiness probe. Used by the Playwright dev-server readiness check
// (see playwright.config.ts) and handy for container health checks. Keep it
// dependency-free so it answers even while the rest of the app is warming up.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' });
}
