import React from 'react';
import { PRO_PLAYLISTS, PlaylistConfig } from '../../data/playlists';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { ScenarioConfig } from '../../types/game';
import { Trophy, Play, X, Sparkles, CheckCircle2, Clock, Target, Layers } from 'lucide-react';

interface PlaylistModalProps {
  onClose: () => void;
  onStartPlaylist: (playlist: PlaylistConfig) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ onClose, onStartPlaylist }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 select-none overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-8 border border-cyber-border shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-primary to-blue-600 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Pro Esports Warmup Playlists</h2>
              <span className="text-[10px] text-cyber-muted uppercase tracking-widest font-bold">
                Curated Multi-Stage Benchmark Routines from Top Pro Players
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-cyber-card hover:bg-cyber-danger/20 text-cyber-muted hover:text-cyber-danger transition-all border border-cyber-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRO_PLAYLISTS.map(playlist => {
            const scenarios = playlist.scenarioIds
              .map(id => ALL_SCENARIOS.find(s => s.id === id))
              .filter(Boolean) as ScenarioConfig[];

            const totalDuration = scenarios.reduce((acc, s) => acc + s.duration, 0);

            return (
              <div
                key={playlist.id}
                className="glass-panel p-6 rounded-3xl border border-cyber-border hover:border-cyber-primary transition-all duration-150 flex flex-col justify-between space-y-4 group hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-sm"
                      style={{ color: playlist.color, borderColor: playlist.color + '40', backgroundColor: playlist.color + '15' }}
                    >
                      {playlist.tag} Pro Routine
                    </span>
                    <span className="text-xs font-mono font-bold text-cyber-muted">
                      {scenarios.length} Stages • {Math.round(totalDuration / 60)} min
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-cyber-primary transition-colors uppercase mt-3">
                    {playlist.name}
                  </h3>
                  <span className="text-[11px] font-bold text-cyber-primary uppercase tracking-wider block mt-0.5">
                    Curated by {playlist.creator}
                  </span>
                  <p className="text-xs text-cyber-muted mt-2 leading-relaxed font-medium">
                    {playlist.description}
                  </p>
                </div>

                {/* Scenario Stages Preview */}
                <div className="bg-cyber-bg/60 p-3 rounded-2xl border border-cyber-border/80 space-y-1.5">
                  <span className="text-[9px] font-black uppercase text-cyber-muted tracking-widest block">
                    Routine Stages:
                  </span>
                  {scenarios.map((sc, i) => (
                    <div key={sc.id} className="flex items-center justify-between text-xs text-white">
                      <span className="truncate flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-cyber-card text-[10px] font-black text-cyber-primary flex items-center justify-center">
                          {i + 1}
                        </span>
                        {sc.name}
                      </span>
                      <span className="text-cyber-muted font-mono text-[11px]">{sc.duration}s</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onStartPlaylist(playlist)}
                  className="w-full flex items-center justify-center gap-2 bg-cyber-primary hover:bg-cyber-primary/90 text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Full Playlist
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
