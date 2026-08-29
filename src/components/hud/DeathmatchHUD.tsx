import React from 'react';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { Shield, Heart, Skull, Zap, Swords, Crosshair, Users, Trophy } from 'lucide-react';

export const DeathmatchHUD: React.FC = () => {
  const isMultiplayerActive = useMultiplayerStore(state => state.isMultiplayerActive);
  const health = useMultiplayerStore(state => state.health);
  const maxHealth = useMultiplayerStore(state => state.maxHealth);
  const isAlive = useMultiplayerStore(state => state.isAlive);
  const kills = useMultiplayerStore(state => state.kills);
  const deaths = useMultiplayerStore(state => state.deaths);
  const streak = useMultiplayerStore(state => state.streak);
  const respawnTimeRemaining = useMultiplayerStore(state => state.respawnTimeRemaining);
  const killfeed = useMultiplayerStore(state => state.killfeed);
  const isScoreboardOpen = useMultiplayerStore(state => state.isScoreboardOpen);
  const remotePlayers = useMultiplayerStore(state => state.remotePlayers);
  const localId = useMultiplayerStore(state => state.localId);
  const nickname = useMultiplayerStore(state => state.nickname);
  const color = useMultiplayerStore(state => state.color);
  const roomCode = useMultiplayerStore(state => state.roomCode);

  if (!isMultiplayerActive) return null;

  const healthPercent = Math.max(0, Math.min(1, health / (maxHealth || 100)));
  const isCritical = health < 30 && isAlive;

  // Build full player list for TAB Scoreboard
  const allPlayers = [
    {
      id: localId,
      nickname,
      color,
      kills,
      deaths,
      ping: 15,
      isLocal: true
    },
    ...Object.values(remotePlayers).map(p => ({
      id: p.id,
      nickname: p.nickname,
      color: p.color,
      kills: p.kills || 0,
      deaths: p.deaths || 0,
      ping: p.ping || 25,
      isLocal: false
    }))
  ].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-sans">
      {/* Critical Low Health Red Vignette */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-600/15 animate-pulse mix-blend-overlay pointer-events-none" />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP RIGHT LIVE KILLFEED */}
      {/* ========================================================================= */}
      <div className="absolute top-20 right-6 flex flex-col items-end gap-1.5 z-40 max-w-sm">
        {killfeed.map(entry => (
          <div
            key={entry.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md text-xs font-black shadow-lg animate-in slide-in-from-right-4 duration-150"
          >
            <span style={{ color: entry.killerColor }}>{entry.killerName}</span>
            <span className="text-white/60 text-[10px] uppercase font-mono px-1 bg-white/10 rounded">
              {entry.weapon === 'knife' ? '🔪' : entry.weapon === 'sheriff' ? '🔫' : '⚡'}
            </span>
            {entry.isHeadshot && (
              <span className="text-red-500 font-bold text-[10px] px-1 bg-red-500/20 rounded">
                CRIT
              </span>
            )}
            <span style={{ color: entry.victimColor }}>{entry.victimName}</span>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM LEFT 100 HP HEALTH BAR & COMBAT STATS */}
      {/* ========================================================================= */}
      <div className="absolute bottom-6 left-6 flex items-end gap-4 pointer-events-auto">
        <div className="glass-panel p-4 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl flex flex-col gap-2 min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-cyber-muted tracking-wider">
            <div className="flex items-center gap-1.5 text-white">
              <Heart className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-bounce' : 'text-emerald-400'}`} />
              <span>CAN (HP)</span>
            </div>
            <span className={`text-xl font-black font-mono ${health > 50 ? 'text-emerald-400' : health > 25 ? 'text-amber-400' : 'text-red-500'}`}>
              {health}
            </span>
          </div>

          {/* 100 HP Health Bar Track */}
          <div className="w-full h-3.5 bg-black/80 rounded-full border border-white/10 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-200 shadow-sm"
              style={{
                width: `${healthPercent * 100}%`,
                background: health > 50 
                  ? 'linear-gradient(90deg, #059669, #10b981)' 
                  : health > 25 
                  ? 'linear-gradient(90deg, #d97706, #f59e0b)' 
                  : 'linear-gradient(90deg, #dc2626, #ef4444)'
              }}
            />
          </div>

          {/* Kills & Deaths Counter */}
          <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-cyber-muted border-t border-white/10">
            <span className="flex items-center gap-1 text-cyber-primary">
              <Skull className="w-3.5 h-3.5" /> {kills} Leş
            </span>
            <span className="text-white/40">/</span>
            <span className="text-red-400">{deaths} Ölüm</span>
            <span className="text-white/40">/</span>
            <span className="text-amber-400 font-mono">K/D: {deaths > 0 ? (kills / deaths).toFixed(2) : kills}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEATH & RESPAWN OVERLAY */}
      {/* ========================================================================= */}
      {!isAlive && (
        <div className="absolute inset-0 bg-red-950/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto z-50 animate-in fade-in duration-200">
          <div className="glass-panel p-8 rounded-3xl border border-red-500/50 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              <Skull className="w-9 h-9" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              ELENDİN!
            </h2>
            <p className="text-sm text-cyber-muted font-medium">
              Redmatch 2 Online Deathmatch
            </p>
            <div className="text-4xl font-black font-mono text-cyber-primary animate-pulse">
              {respawnTimeRemaining.toFixed(1)}s
            </div>
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
              Yeniden doğuluyor...
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB LEADERBOARD / SCOREBOARD MODAL */}
      {/* ========================================================================= */}
      {isScoreboardOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-cyber-primary/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyber-primary/20 border border-cyber-primary/40 flex items-center justify-center text-cyber-primary">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    ONLINE DEATHMATCH SKOR TABLOSU
                  </h3>
                  <span className="text-xs text-cyber-muted font-bold">
                    Oda: <span className="text-cyber-primary">{roomCode}</span> • {allPlayers.length} Oyuncu Çevrimiçi
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyber-muted bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                [TAB] Bırakınca Kapanır
              </span>
            </div>

            {/* Scoreboard Table */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-12 text-[11px] font-black uppercase text-cyber-muted px-4 py-1.5">
                <span className="col-span-1">#</span>
                <span className="col-span-5">Oyuncu</span>
                <span className="col-span-2 text-center text-cyber-primary">Leş (K)</span>
                <span className="col-span-2 text-center text-red-400">Ölüm (D)</span>
                <span className="col-span-2 text-right text-emerald-400">Ping</span>
              </div>

              {allPlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    p.isLocal
                      ? 'bg-cyber-primary/15 border-cyber-primary/50 text-white shadow-sm'
                      : 'bg-white/5 border-white/5 text-white/90'
                  }`}
                >
                  <span className="col-span-1 font-black text-cyber-muted">{idx + 1}</span>
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-black truncate">{p.nickname}</span>
                    {p.isLocal && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-cyber-primary text-black">
                        SEN
                      </span>
                    )}
                  </div>
                  <span className="col-span-2 text-center font-black font-mono text-cyber-primary">{p.kills}</span>
                  <span className="col-span-2 text-center font-bold font-mono text-red-400">{p.deaths}</span>
                  <span className="col-span-2 text-right font-mono text-emerald-400">{p.ping}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
