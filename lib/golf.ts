export type Tier = 'tier1' | 'tier2' | 'tier3';

export interface Golfer {
  name: string;
  odds: string;
  tier: Tier;
}

export interface Entry {
  id: string;
  playerName: string;
  picks: string[]; // 6 names: 2 t1, 2 t2, 2 t3
  submittedAt: number;
}

export interface Results {
  [golferName: string]: number; // finish position, 0 = missed cut
}

export const GOLFERS: Record<Tier, Golfer[]> = {
  tier1: [
    { name: 'Scottie Scheffler', odds: '+550', tier: 'tier1' },
    { name: 'Jon Rahm', odds: '+950', tier: 'tier1' },
    { name: 'Bryson DeChambeau', odds: '+1000', tier: 'tier1' },
    { name: 'Rory McIlroy', odds: '+1300', tier: 'tier1' },
    { name: 'Xander Schauffele', odds: '+1400', tier: 'tier1' },
    { name: 'Ludvig Åberg', odds: '+1650', tier: 'tier1' },
    { name: 'Tommy Fleetwood', odds: '+2200', tier: 'tier1' },
    { name: 'Cameron Young', odds: '+2200', tier: 'tier1' },
  ],
  tier2: [
    { name: 'Collin Morikawa', odds: '+3000', tier: 'tier2' },
    { name: 'Justin Rose', odds: '+3000', tier: 'tier2' },
    { name: 'Robert MacIntyre', odds: '+3000', tier: 'tier2' },
    { name: 'Matt Fitzpatrick', odds: '+2350', tier: 'tier2' },
    { name: 'Hideki Matsuyama', odds: '+2800', tier: 'tier2' },
    { name: 'Min Woo Lee', odds: '+3300', tier: 'tier2' },
    { name: 'Si Woo Kim', odds: '+3300', tier: 'tier2' },
    { name: 'Jordan Spieth', odds: '+4500', tier: 'tier2' },
    { name: 'Brooks Koepka', odds: '+3700', tier: 'tier2' },
    { name: 'Patrick Reed', odds: '+4200', tier: 'tier2' },
    { name: 'Tony Finau', odds: '+4500', tier: 'tier2' },
    { name: 'Shane Lowry', odds: '+5000', tier: 'tier2' },
    { name: 'Dustin Johnson', odds: '+5000', tier: 'tier2' },
    { name: 'Justin Thomas', odds: '+5000', tier: 'tier2' },
    { name: 'Viktor Hovland', odds: '+5500', tier: 'tier2' },
    { name: 'Akshay Bhatia', odds: '+5100', tier: 'tier2' },
  ],
  tier3: [
    { name: 'Adam Scott', odds: '+6500', tier: 'tier3' },
    { name: 'Patrick Cantlay', odds: '+6000', tier: 'tier3' },
    { name: 'Jake Knapp', odds: '+6600', tier: 'tier3' },
    { name: 'Sepp Straka', odds: '+6600', tier: 'tier3' },
    { name: 'Jacob Bridgeman', odds: '+8600', tier: 'tier3' },
    { name: 'Russell Henley', odds: '+7000', tier: 'tier3' },
    { name: 'Sungjae Im', odds: '+7000', tier: 'tier3' },
    { name: 'Corey Conners', odds: '+7500', tier: 'tier3' },
    { name: 'Harris English', odds: '+8000', tier: 'tier3' },
    { name: 'Sam Burns', odds: '+7000', tier: 'tier3' },
    { name: 'Max Homa', odds: '+12500', tier: 'tier3' },
    { name: 'Kurt Kitayama', odds: '+15000', tier: 'tier3' },
    { name: 'Daniel Berger', odds: '+12500', tier: 'tier3' },
    { name: 'Joaquin Niemann', odds: '+9000', tier: 'tier3' },
    { name: 'Abraham Ancer', odds: '+9000', tier: 'tier3' },
    { name: 'Keegan Bradley', odds: '+10000', tier: 'tier3' },
    { name: 'Jason Day', odds: '+10000', tier: 'tier3' },
    { name: 'Will Zalatoris', odds: '+10000', tier: 'tier3' },
    { name: 'Rickie Fowler', odds: '+11000', tier: 'tier3' },
    { name: 'Chris Gotterup', odds: '+8000', tier: 'tier3' },
  ],
};

export const ALL_GOLFERS: Golfer[] = [
  ...GOLFERS.tier1,
  ...GOLFERS.tier2,
  ...GOLFERS.tier3,
];

const POINTS_TABLE = [
  0,   // index 0 = placeholder
  100, // 1st
  70,  // 2nd
  55,  // 3rd
  45,  // 4th
  38,  // 5th
  35,  // 6th
  32,  // 7th
  28,  // 8th
  25,  // 9th
  22,  // 10th
  20,  // 11th
  18,  // 12th
  16,  // 13th
  14,  // 14th
  13,  // 15th
  12,  // 16th
  11,  // 17th
  10,  // 18th
  10,  // 19th
  10,  // 20th
];

export function getPoints(position: number): number {
  if (position <= 0) return 0;
  if (position <= 20) return POINTS_TABLE[position];
  if (position <= 30) return 8;
  if (position <= 50) return 5;
  return 2; // made cut, 51+
}

export function calcEntryScore(entry: Entry, results: Results): number {
  return entry.picks.reduce((sum, name) => {
    const pos = results[name] ?? 0;
    return sum + getPoints(pos);
  }, 0);
}

export const SCORING_ROWS = [
  { label: '1st (Champion)', pts: 100 },
  { label: '2nd', pts: 70 },
  { label: '3rd', pts: 55 },
  { label: '4th', pts: 45 },
  { label: '5th', pts: 38 },
  { label: '6th–10th', pts: '35 → 22' },
  { label: '11th–20th', pts: '20 → 10' },
  { label: '21st–30th', pts: 8 },
  { label: '31st–50th', pts: 5 },
  { label: 'Made cut (51+)', pts: 2 },
  { label: 'Missed cut', pts: 0 },
];
