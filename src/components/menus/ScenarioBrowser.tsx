import React, { useState, useMemo } from 'react';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { ScenarioConfig, Category } from '../../types/game';
import { useStatsStore } from '../../store/useStatsStore';
import { 
  Search, 
  Target, 
  Zap, 
  Flame, 
  Crosshair, 
  Bot, 
  Plus, 
  Trophy, 
  Clock, 
  Sparkles, 
  Play, 
  Filter,
  Layers
} from 'lucide-react';

type DifficultyFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | 'Grandmaster';

interface ScenarioBrowserProps {
  onSelectScenario: (scenario: ScenarioConfig) => void;
  onCreateCustom: () => void;
}

export const ScenarioBrowser: React.FC<ScenarioBrowserProps> = ({
  onSelectScenario,
  onCreateCustom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');

  const personalBests = useStatsStore(state => state.personalBests);

  const filteredScenarios = useMemo(() => {
    return ALL_SCENARIOS.filter(sc => {
      const matchQuery = sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || sc.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'all' || sc.difficulty === selectedDifficulty;
      return matchQuery && matchCat && matchDiff;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const categories: { id: Category | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Modes', icon: Layers },
    { id: 'clicking', label: 'Clicking / Flick', icon: Crosshair },
    { id: 'tracking', label: 'Tracking', icon: Zap },
    { id: 'switching', label: 'Target Switch', icon: Target },
    { id: 'strafing', label: 'Bot Duels AI', icon: Bot }
  ];

  const difficulties: DifficultyFilter[] = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Master', 'Grandmaster'];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 select-none space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-cyber-border shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-cyber-primary">Benchmark Catalog</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40">
              52 Routines
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-1">
            Scenario Training Hub
          </h1>
        </div>

        <button
          onClick={onCreateCustom}
          className="flex items-center gap-2 bg-gradient-to-r from-cyber-accent to-pink-600 hover:opacity-90 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Create Custom Scenario
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-cyber-border shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyber-muted" />
            <input
              type="text"
              placeholder="Search scenarios by name (e.g. Gridshot, Reflex, Thin Shaft)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-cyber-card/80 border border-cyber-border rounded-2xl text-white placeholder-cyber-muted focus:outline-none focus:border-cyber-primary transition-all text-sm font-medium"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-cyber-primary text-black shadow-md'
                    : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border hover:border-cyber-primary/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map(scenario => {
          const pb = personalBests[scenario.id] || 0;
          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="glass-panel p-5 rounded-3xl border border-cyber-border hover:border-cyber-primary transition-all duration-150 cursor-pointer group hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col justify-between space-y-4 hover:-translate-y-1 backdrop-blur-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-cyber-card text-cyber-primary border border-cyber-primary/30 tracking-wider">
                    {scenario.category}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-widest ${
                      scenario.difficulty === 'Grandmaster' || scenario.difficulty === 'Master'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : scenario.difficulty === 'Advanced'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : scenario.difficulty === 'Intermediate'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {scenario.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-cyber-primary transition-colors uppercase mt-3">
                  {scenario.name}
                </h3>
                <p className="text-xs text-cyber-muted line-clamp-2 mt-1 font-medium leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono font-bold text-cyber-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyber-primary" />
                    {scenario.duration}s
                  </span>
                  <span>•</span>
                  <span>{scenario.targetCount} Targets</span>
                </div>

                <div className="flex items-center gap-2">
                  {pb > 0 && (
                    <span className="flex items-center gap-1 font-mono text-xs font-black text-cyber-warning">
                      <Trophy className="w-3.5 h-3.5" />
                      {pb.toLocaleString()}
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-cyber-primary/10 group-hover:bg-cyber-primary text-cyber-primary group-hover:text-black flex items-center justify-center transition-all shadow-md">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
