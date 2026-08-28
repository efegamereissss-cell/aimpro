import { ScenarioConfig, Category } from '../../types/game';
import { CLICKING_SCENARIOS } from './clicking';
import { TRACKING_SCENARIOS } from './tracking';
import { SWITCHING_SCENARIOS } from './switching';
import { STRAFING_SCENARIOS } from './strafing';

export const ALL_SCENARIOS: ScenarioConfig[] = [
  ...CLICKING_SCENARIOS,
  ...TRACKING_SCENARIOS,
  ...SWITCHING_SCENARIOS,
  ...STRAFING_SCENARIOS
];

export function getScenariosByCategory(category: Category | 'all'): ScenarioConfig[] {
  if (category === 'all') return ALL_SCENARIOS;
  return ALL_SCENARIOS.filter(s => s.category === category);
}

export function getScenarioById(id: string): ScenarioConfig | undefined {
  return ALL_SCENARIOS.find(s => s.id === id);
}

export function searchScenarios(query: string, category?: Category | 'all'): ScenarioConfig[] {
  const q = query.toLowerCase().trim();
  let list = category && category !== 'all' ? getScenariosByCategory(category) : ALL_SCENARIOS;
  if (!q) return list;
  return list.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some(tag => tag.toLowerCase().includes(q)) ||
      s.difficulty.toLowerCase().includes(q)
  );
}
