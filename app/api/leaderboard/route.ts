import { NextRequest, NextResponse } from 'next/server';
import { getEntries, getResults, setResults } from '@/lib/db';
import { calcEntryScore } from '@/lib/golf';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [entries, results] = await Promise.all([getEntries(), getResults()]);
    const hasResults = Object.keys(results).length > 0;

    const scored = entries
      .map(e => ({
        ...e,
        total: calcEntryScore(e, results),
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ scored, results, hasResults });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { results } = body;
    if (!results || typeof results !== 'object') {
      return NextResponse.json({ error: 'Invalid results' }, { status: 400 });
    }
    await setResults(results);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
  }
}
