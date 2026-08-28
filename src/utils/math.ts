import { RankTier } from '../types/game';

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function distance3D(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function calculateRankTier(score: number, accuracy: number, category: string): RankTier {
  const weightedScore = score * (accuracy / 100);
  
  if (category === 'tracking') {
    if (accuracy >= 85 && score >= 12000) return 'Ascendant';
    if (accuracy >= 75 && score >= 9000) return 'Grandmaster';
    if (accuracy >= 65 && score >= 7000) return 'Master';
    if (accuracy >= 55 && score >= 5000) return 'Diamond';
    if (accuracy >= 45 && score >= 3500) return 'Platinum';
    if (accuracy >= 35 && score >= 2500) return 'Gold';
    if (accuracy >= 25 && score >= 1500) return 'Silver';
    if (accuracy >= 15 && score >= 800) return 'Bronze';
    return 'Iron';
  }

  // Clicking / Flicking / Switching
  if (score >= 100000 && accuracy >= 94) return 'Ascendant';
  if (score >= 85000 && accuracy >= 90) return 'Grandmaster';
  if (score >= 70000 && accuracy >= 85) return 'Master';
  if (score >= 55000 && accuracy >= 80) return 'Diamond';
  if (score >= 42000 && accuracy >= 75) return 'Platinum';
  if (score >= 30000 && accuracy >= 70) return 'Gold';
  if (score >= 20000 && accuracy >= 60) return 'Silver';
  if (score >= 10000) return 'Bronze';
  return 'Iron';
}

export const RANK_COLORS: Record<RankTier, string> = {
  'Iron': '#94a3b8',
  'Bronze': '#cd7f32',
  'Silver': '#cbd5e1',
  'Gold': '#fbbf24',
  'Platinum': '#22d3ee',
  'Diamond': '#818cf8',
  'Master': '#c084fc',
  'Grandmaster': '#f43f5e',
  'Ascendant': '#10b981'
};
