import type { Entry, Results } from './golf';

// In-memory fallback for local dev when env vars aren't set
const memStore: { entries: Entry[]; results: Results } = {
  entries: [],
  results: {},
};

function useRedis(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getEntries(): Promise<Entry[]> {
  if (!useRedis()) return memStore.entries;
  const redis = await getRedis();
  const entries = await redis.get<Entry[]>('masters2026:entries');
  return entries ?? [];
}

export async function addEntry(entry: Entry): Promise<void> {
  if (!useRedis()) {
    memStore.entries.push(entry);
    return;
  }
  const redis = await getRedis();
  const entries = await getEntries();
  const filtered = entries.filter(e => e.playerName.toLowerCase() !== entry.playerName.toLowerCase());
  filtered.push(entry);
  await redis.set('masters2026:entries', filtered);
}

export async function getResults(): Promise<Results> {
  if (!useRedis()) return memStore.results;
  const redis = await getRedis();
  const results = await redis.get<Results>('masters2026:results');
  return results ?? {};
}

export async function setResults(results: Results): Promise<void> {
  if (!useRedis()) {
    memStore.results = results;
    return;
  }
  const redis = await getRedis();
  await redis.set('masters2026:results', results);
}
