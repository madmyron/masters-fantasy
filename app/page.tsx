'use client';

import { useState, useEffect, useCallback } from 'react';
import { GOLFERS, ALL_GOLFERS, SCORING_ROWS, type Entry, type Results, type Tier } from '@/lib/golf';

type Tab = 'rules' | 'draft' | 'entries' | 'scores';

const TIER_NAMES: Record<Tier, string> = { tier1: 'Tier 1', tier2: 'Tier 2', tier3: 'Tier 3' };
const TIER_SHORT: Record<Tier, string> = { tier1: 'T1', tier2: 'T2', tier3: 'T3' };

interface ScoredEntry extends Entry { total: number; }

export default function Home() {
  const [tab, setTab] = useState<Tab>('rules');

  // Draft state
  const [playerName, setPlayerName] = useState('');
  const [picks, setPicks] = useState<{ tier1: string[]; tier2: string[]; tier3: string[] }>({
    tier1: [], tier2: [], tier3: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shareText, setShareText] = useState('');
  const [copied, setCopied] = useState(false);

  // Entries state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Scores state
  const [results, setResults] = useState<Results>({});
  const [scored, setScored] = useState<ScoredEntry[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [savingResults, setSavingResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch { /* ignore */ }
    setLoadingEntries(false);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setScored(data.scored ?? []);
      setHasResults(data.hasResults ?? false);
      if (data.results) {
        const r: Results = {};
        ALL_GOLFERS.forEach(g => {
          if (data.results[g.name] !== undefined) r[g.name] = data.results[g.name];
        });
        setResults(r);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (tab === 'entries') fetchEntries();
    if (tab === 'scores') fetchLeaderboard();
  }, [tab, fetchEntries, fetchLeaderboard]);

  function togglePick(tier: Tier, name: string) {
    setPicks(prev => {
      const list = prev[tier];
      if (list.includes(name)) return { ...prev, [tier]: list.filter(n => n !== name) };
      if (list.length >= 2) return prev; // already full
      return { ...prev, [tier]: [...list, name] };
    });
  }

  const allPicked = picks.tier1.length === 2 && picks.tier2.length === 2 && picks.tier3.length === 2;
  const allPicks = [...picks.tier1, ...picks.tier2, ...picks.tier3];

  async function submitEntry() {
    if (!playerName.trim() || !allPicked) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim(), picks: allPicks }),
      });
      if (res.ok) {
        const text = [
          `⛳ ${playerName.trim()}'s Masters 2025 Picks:`,
          `🥇 Tier 1: ${picks.tier1.join(' & ')}`,
          `🥈 Tier 2: ${picks.tier2.join(' & ')}`,
          `🥉 Tier 3: ${picks.tier3.join(' & ')}`,
          ``,
          `Join the group: [paste your Vercel URL here]`,
        ].join('\n');
        setShareText(text);
        setSubmitted(true);
        setPicks({ tier1: [], tier2: [], tier3: [] });
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  function copyShare() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function saveResults() {
    setSavingResults(true);
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });
      await fetchLeaderboard();
      setResultsSaved(true);
      setTimeout(() => setResultsSaved(false), 3000);
    } catch { /* ignore */ }
    setSavingResults(false);
  }

  const tierOf = (name: string): Tier => {
    if (GOLFERS.tier1.find(g => g.name === name)) return 'tier1';
    if (GOLFERS.tier2.find(g => g.name === name)) return 'tier2';
    return 'tier3';
  };

  return (
    <>
      <header className="site-header">
        <h1>⛳ Masters Fantasy Golf</h1>
        <p>Augusta National · April 10–13, 2025</p>
        <span className="badge">2025 Tournament</span>
      </header>

      <div className="app-shell">
        <div className="tabs">
          {(['rules', 'draft', 'entries', 'scores'] as Tab[]).map(t => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'rules' ? '📋 Rules' : t === 'draft' ? '✏️ Draft' : t === 'entries' ? '👥 Entries' : '🏆 Scores'}
            </button>
          ))}
        </div>

        {/* RULES */}
        {tab === 'rules' && (
          <>
            <div className="card">
              <div className="card-title">🎯 How it works</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Each player drafts <strong>6 golfers</strong> — 2 from each tier. Your final score is the combined fantasy points earned based on each golfer&rsquo;s Masters finish.
              </p>
              <table className="scoring-table">
                <thead>
                  <tr><th>Finish</th><th>Points</th></tr>
                </thead>
                <tbody>
                  {SCORING_ROWS.map(r => (
                    <tr key={r.label}>
                      <td>{r.label}</td>
                      <td className="pts-badge">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <div className="card-title">🏌️ Tiers explained</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Tier 1</span> — Elite favorites (Vegas top picks).<br />
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Tier 2</span> — Strong contenders, solid chances to contend.<br />
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>Tier 3</span> — Longshots &amp; sleepers. High risk, high reward.
              </p>
              <div className="info-box">
                📱 <strong>Share this page URL with your friends</strong> — they come here, pick their team, and everyone's entries are shared in real time. After the tournament ends Sunday, enter finishing positions in the Scores tab.
              </div>
            </div>
          </>
        )}

        {/* DRAFT */}
        {tab === 'draft' && (
          <>
            {submitted ? (
              <div className="card">
                <div className="card-title" style={{ color: 'var(--green)' }}>✅ Entry submitted!</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                  Share this with your group chat so they can join:
                </p>
                <div
                  className="share-text"
                  onClick={copyShare}
                  title="Click to copy"
                >
                  {shareText}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={copyShare}>
                    {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setSubmitted(false)}>
                    Submit another entry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="card">
                  <div className="card-title">Your name</div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      className="form-input"
                      placeholder="Enter your name..."
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Your picks (2 per tier)</div>
                  <div className="slots-grid">
                    {(['tier1', 'tier1', 'tier2', 'tier2', 'tier3', 'tier3'] as Tier[]).map((tier, i) => {
                      const idx = i % 2;
                      const name = picks[tier][idx];
                      return (
                        <div key={`${tier}-${idx}`} className={`slot${name ? ' filled' : ''}`}>
                          <span className="slot-tier">{TIER_SHORT[tier]}</span>
                          <span className="slot-name">{name || `Pick ${TIER_NAMES[tier]}`}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      className="btn btn-primary"
                      disabled={!allPicked || !playerName.trim() || submitting}
                      onClick={submitEntry}
                    >
                      {submitting ? <><span className="spinner" />Submitting…</> : '⛳ Submit my picks'}
                    </button>
                  </div>
                </div>

                {(['tier1', 'tier2', 'tier3'] as Tier[]).map(tier => (
                  <div className="card" key={tier}>
                    <div className="card-title">
                      <span className={`tier-label ${tier === 'tier1' ? 't1' : tier === 'tier2' ? 't2' : 't3'}`}>
                        {TIER_NAMES[tier]}
                      </span>
                      {tier === 'tier1' ? ' Favorites' : tier === 'tier2' ? ' Contenders' : ' Sleepers'}
                      <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--gray-400)', fontWeight: 400 }}>
                        {picks[tier].length}/2 selected
                      </span>
                    </div>
                    <div className="golfer-grid">
                      {GOLFERS[tier].map(g => {
                        const sel = picks[tier].includes(g.name);
                        const tierFull = picks[tier].length >= 2 && !sel;
                        return (
                          <button
                            key={g.name}
                            className={`golfer-btn${sel ? ' selected' : ''}${tierFull ? ' disabled-golfer' : ''}`}
                            onClick={() => togglePick(tier, g.name)}
                            disabled={tierFull}
                          >
                            <span className="golfer-name">{g.name}</span>
                            <span className="golfer-odds">{g.odds}</span>
                            {sel && <span className="check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ENTRIES */}
        {tab === 'entries' && (
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              👥 All entries
              <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '5px 12px' }} onClick={fetchEntries}>
                Refresh
              </button>
            </div>
            {loadingEntries ? (
              <div className="empty-state"><span className="spinner" /> Loading entries…</div>
            ) : entries.length === 0 ? (
              <div className="empty-state">No entries yet. Be the first to draft!</div>
            ) : (
              entries
                .slice()
                .sort((a, b) => b.submittedAt - a.submittedAt)
                .map(e => (
                  <div key={e.id} className="entry-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="entry-name">{e.playerName}</div>
                      <div className="entry-time">{new Date(e.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="picks-row">
                      {e.picks.map(p => (
                        <span key={p} className={`pick-chip ${tierOf(p) === 'tier1' ? 't1' : tierOf(p) === 'tier2' ? 't2' : 't3'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* SCORES */}
        {tab === 'scores' && (
          <>
            <div className="card">
              <div className="card-title">📝 Enter finishing positions</div>
              <p style={{ fontSize: '0.83rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                Enter each golfer&rsquo;s final position (1–70). Leave blank or 0 for missed cut.
              </p>
              <div className="results-grid">
                {ALL_GOLFERS.map(g => (
                  <div key={g.name} className="result-row">
                    <span className="result-name" title={g.name}>{g.name}</span>
                    <input
                      className="result-input"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="pos"
                      value={results[g.name] ?? ''}
                      onChange={e => {
                        const v = parseInt(e.target.value);
                        setResults(prev => ({ ...prev, [g.name]: isNaN(v) ? 0 : v }));
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-primary" onClick={saveResults} disabled={savingResults}>
                  {savingResults ? <><span className="spinner" />Saving…</> : '💾 Save & calculate'}
                </button>
                {resultsSaved && <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>✓ Saved!</span>}
              </div>
            </div>

            {hasResults && (
              <div className="card">
                <div className="card-title">🏆 Fantasy leaderboard</div>
                {scored.length === 0 ? (
                  <div className="empty-state">No entries to score yet.</div>
                ) : (
                  scored.map((e, i) => (
                    <div key={e.id} className="lb-row">
                      <div className={`lb-pos${i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : ''}`}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="lb-name">{e.playerName}</div>
                        <div className="lb-picks">{e.picks.join(', ')}</div>
                      </div>
                      <div className="lb-pts">{e.total} pts</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
