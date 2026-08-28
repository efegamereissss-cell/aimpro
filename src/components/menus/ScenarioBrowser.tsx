import React, { useState, useMemo } from 'react';
import { ScenarioConfig, Category } from '../../types/game';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { useStatsStore } from '../../store/useStatsStore';
import { 
  Search, 
  Filter, 
  Target, 
  Zap, 
  Crosshair, 
  Bot, 
  Plus, 
  Play, 
  Trophy, 
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ScenarioBrowserProps {
  onSelectScenario: (scenario: ScenarioConfig) => void;
  onCreateCustom: () => void;
}

export const ScenarioBrowser: React.FC<ScenarioBrowserProps> = ({
  onSelectScenario,
  onCreateCustom
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const personalBests = useStatsStore(state => state.personalBests);

  const filteredScenarios = useMemo(() => {
    return ALL_SCENARIOS.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'all' || s.difficulty === selectedDifficulty;
      const matchQuery =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchDiff && matchQuery;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const categories: { id: Category | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Scenarios', icon: Filter },
    { id: 'clicking', label: 'Clicking / Flicking', icon: Crosshair },
    { id: 'tracking', label: 'Continuous Tracking', icon: Zap },
    { id: 'switching', label: 'Target Switching', icon: Target },
    { id: 'strafing', label: 'AI Strafing Bots', icon: Bot }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 select-none flex flex-col space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-cyber-border shadow-2xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyber-primary">
            Scenario Catalog (+50 Modes)
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-0.5">
            Aim Training Routines
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar Input */}
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-cyber-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scenarios, tags, or games..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-card/80 border border-cyber-border rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-cyber-muted focus:border-cyber-primary outline-none transition-all"
            />
          </div>

          {/* Custom Scenario Button */}
          <button
            onClick={onCreateCustom}
            className="flex items-center gap-2 bg-cyber-card hover:bg-cyber-border text-white px-5 py-3 rounded-2xl text-sm font-bold border border-cyber-border transition-all whitespace-nowrap shadow-md hover:border-cyber-primary"
          >
            <Plus className="w-4 h-4 text-cyber-primary" />
            <span>Studio</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Difficulty Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-cyber-card/70 text-cyber-muted hover:text-white border border-cyber-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyber-muted uppercase">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="bg-cyber-card border border-cyber-border rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-cyber-primary"
          >
            <option value="all">All Tiers</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Master">Master</option>
            <option value="Grandmaster">Grandmaster</option>
          </select>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map(scenario => {
          const pb = personalBests[scenario.id] || 0;

          const difficultyColor = {
            Beginner: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
            Intermediate: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
            Advanced: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
            Master: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
            Grandmaster: 'text-rose-400 border-rose-400/30 bg-rose-400/10'
          }[scenario.difficulty];

          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="group glass-panel rounded-3xl p-6 border border-cyber-border hover:border-cyber-primary/70 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] relative overflow-hidden"
            >
              {/* Top Row: Category & Difficulty Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-primary">
                    {scenario.category}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${difficultyColor}`}>
                    {scenario.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-cyber-primary transition-colors uppercase tracking-tight">
                  {scenario.name}
                </h3>
                <p className="text-xs text-cyber-muted mt-2 leading-relaxed line-clamp-2">
                  {scenario.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {scenario.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold bg-cyber-bg/80 px-2 py-0.5 rounded-md text-cyber-muted border border-cyber-border/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer: PB Score & Play Button */}
              <div className="mt-6 pt-4 border-t border-cyber-border/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyber-muted">
                  <Trophy className="w-3.5 h-3.5 text-cyber-warning" />
                  <span>PB: <strong className="text-white font-mono">{pb > 0 ? pb.toLocaleString() : '—'}</strong></span>
                </div>

                <button className="flex items-center gap-1.5 bg-cyber-primary/10 group-hover:bg-cyber-primary text-cyber-primary group-hover:text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-16 text-cyber-muted">
          <p className="text-lg font-bold">No scenarios found matching your search criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-cyber-primary underline font-bold"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
