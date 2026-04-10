import type { Entry, Results } from './golf';

// In-memory fallback for local dev when KV env vars aren't set
const memStore: { entries: Entry[]; results: Results } = {
  entries: [],
  results: {},
};

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  const { kv } = await import('@vercel/kv');
  return kv;
}

export async function getEntries(): Promise<Entry[]> {
  if (!useKV()) return memStore.entries;
  const kv = await getKV();
  const entries = await kv.get<Entry[]>('masters2025:entries');
  return entries ?? [];
}

export async function addEntry(entry: Entry): Promise<void> {
  if (!useKV()) {
    memStore.entries.push(entry);
    return;
  }
  const kv = await getKV();
  const entries = await getEntries();
  // Prevent duplicate names — replace if same name re-submits
  const filtered = entries.filter(e => e.playerName.toLowerCase() !== entry.playerName.toLowerCase());
  filtered.push(entry);
  await kv.set('masters2025:entries', filtered);
}

export async function getResults(): Promise<Results> {
  if (!useKV()) return memStore.results;
  const kv = await getKV();
  const results = await kv.get<Results>('masters2025:results');
  return results ?? {};
}

export async function setResults(results: Results): Promise<void> {
  if (!useKV()) {
    memStore.results = results;
    return;
  }
  const kv = await getKV();
  await kv.set('masters2025:results', results);
}
