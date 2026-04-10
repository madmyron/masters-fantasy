import { NextRequest, NextResponse } from 'next/server';
import { getEntries, addEntry } from '@/lib/db';
import type { Entry } from '@/lib/golf';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json({ entries });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, picks } = body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }
    if (!Array.isArray(picks) || picks.length !== 6) {
      return NextResponse.json({ error: 'Must pick exactly 6 golfers' }, { status: 400 });
    }

    const entry: Entry = {
      id: randomUUID(),
      playerName: playerName.trim(),
      picks,
      submittedAt: Date.now(),
    };

    await addEntry(entry);
    return NextResponse.json({ success: true, entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}
