import React from 'react';
import { useStatsStore } from '../../store/useStatsStore';
import { RANK_COLORS } from '../../utils/math';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { 
  X, 
  BarChart3, 
  Trophy, 
  Clock, 
  Crosshair, 
  Zap, 
  Trash2, 
  Award,
  Flame
} from 'lucide-react';

interface StatsModalProps {
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ onClose }) => {
  const history = useStatsStore(state => state.history);
  const personalBests = useStatsStore(state => state.personalBests);
  const getSkillRadar = useStatsStore(state => state.getSkillRadar);
  const clearHistory = useStatsStore(state => state.clearHistory);

  const radar = getSkillRadar();

  const totalMatches = history.length;
  const avgAccuracy = totalMatches > 0
    ? Math.round(history.reduce((a, b) => a + b.accuracy, 0) / totalMatches * 10) / 10
    : 0;
  const totalElims = history.reduce((a, b) => a + b.targetsDestroyed, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 border border-cyber-border shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-cyber-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center text-cyber-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Performance Analytics</h2>
              <p className="text-xs text-cyber-muted">Skill Radar, High Scores & Match Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyber-muted hover:text-white p-2 rounded-xl bg-cyber-card border border-cyber-border hover:bg-cyber-border transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-8">
          {/* Top Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-cyber-card/60 rounded-2xl p-5 border border-cyber-border">
              <div className="flex items-center justify-between text-xs font-bold text-cyber-muted uppercase">
                <span>Total Matches</span>
                <Clock className="w-4 h-4 text-cyber-primary" />
              </div>
              <span className="font-mono text-3xl font-black text-white mt-2 block">
                {totalMatches}
              </span>
            </div>

            <div className="bg-cyber-card/60 rounded-2xl p-5 border border-cyber-border">
              <div className="flex items-center justify-between text-xs font-bold text-cyber-muted uppercase">
                <span>Overall Accuracy</span>
                <Crosshair className="w-4 h-4 text-cyber-primary" />
              </div>
              <span className="font-mono text-3xl font-black text-white mt-2 block">
                {avgAccuracy}%
              </span>
            </div>

            <div className="bg-cyber-card/60 rounded-2xl p-5 border border-cyber-border">
              <div className="flex items-center justify-between text-xs font-bold text-cyber-muted uppercase">
                <span>Total Targets Destroyed</span>
                <Zap className="w-4 h-4 text-cyber-warning" />
              </div>
              <span className="font-mono text-3xl font-black text-cyber-primary mt-2 block">
                {totalElims.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Skill Radar Breakdown Progress Bars */}
          <div className="bg-cyber-card/60 rounded-2xl p-6 border border-cyber-border">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyber-primary" />
              Skill Radar Analysis
            </h3>

            <div className="space-y-3.5">
              {[
                { label: 'Clicking / Flicking', val: radar.clicking, color: 'bg-cyber-primary' },
                { label: 'Tracking Smoothness', val: radar.tracking, color: 'bg-cyber-accent' },
                { label: 'Target Switching Speed', val: radar.switching, color: 'bg-cyber-neon' },
                { label: 'Speed & Reaction Tempo', val: radar.speed, color: 'bg-cyber-warning' },
                { label: 'Precision & Micro Control', val: radar.precision, color: 'bg-indigo-400' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-cyber-muted">{item.label}</span>
                    <span className="text-white font-mono">{item.val} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-cyber-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Bests Highlight Table */}
          <div className="bg-cyber-card/60 rounded-2xl p-6 border border-cyber-border">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyber-warning" />
              Scenario High Scores
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
              {ALL_SCENARIOS.slice(0, 12).map(sc => {
                const pb = personalBests[sc.id] || 0;
                return (
                  <div
                    key={sc.id}
                    className="bg-cyber-bg/70 p-3.5 rounded-xl border border-cyber-border flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[140px]">{sc.name}</h4>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider">{sc.category}</span>
                    </div>
                    <span className="font-mono text-sm font-black text-cyber-primary">
                      {pb > 0 ? pb.toLocaleString() : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Match History */}
          {history.length > 0 && (
            <div className="bg-cyber-card/60 rounded-2xl p-6 border border-cyber-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyber-accent" />
                  Recent Matches
                </h3>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-xs text-cyber-danger hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Data
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.slice(0, 15).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-cyber-bg/60 px-4 py-3 rounded-xl border border-cyber-border text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{m.scenarioName}</span>
                      <span className="text-cyber-muted ml-2">({m.accuracy}%)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="font-black px-2 py-0.5 rounded text-[10px] uppercase border"
                        style={{
                          borderColor: RANK_COLORS[m.rankTier],
                          color: RANK_COLORS[m.rankTier]
                        }}
                      >
                        {m.rankTier}
                      </span>
                      <span className="font-mono font-black text-cyber-primary">
                        {m.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-cyber-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-cyber-primary text-black rounded-xl text-sm font-black uppercase tracking-wider hover:bg-cyber-primary/90 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
