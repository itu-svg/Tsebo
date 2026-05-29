// This route is no longer used — PayFast uses webhooks via /api/webhooks/payfast
// Kept as a stub to avoid 404 errors from any cached references
import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ success: false, error: 'Use PayFast webhook instead' }, { status: 410 })
}
