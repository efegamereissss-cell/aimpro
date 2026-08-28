import React, { useState, useRef, useEffect } from 'react';
import { useStatsStore } from '../../store/useStatsStore';
import { soundEngine } from '../../audio/SoundEngine';
import { Zap, X, RotateCcw, Trophy, Award, Activity, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReactionBenchmarkModalProps {
  onClose: () => void;
}

type ReactionState = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export const ReactionBenchmarkModal: React.FC<ReactionBenchmarkModalProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<ReactionState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const startTest = () => {
    setGameState('waiting');
    setReactionTime(null);

    // Random delay between 1.5s and 4.5s
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('ready');
      soundEngine.playHitSound(0, true);
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Clicked too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('early');
      soundEngine.playMissSound();
    } else if (gameState === 'ready') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(elapsed);
      setHistory(prev => [elapsed, ...prev].slice(0, 5));
      setGameState('result');
      soundEngine.playHitSound(4, false);
    } else {
      startTest();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const avgReaction = history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;
  const bestReaction = history.length > 0 ? Math.min(...history) : null;

  const getPercentile = (ms: number) => {
    if (ms < 165) return 'Top 0.5% (Godlike Reflexes)';
    if (ms < 185) return 'Top 2% (Pro Esports Tier)';
    if (ms < 215) return 'Top 10% (High Ranked)';
    if (ms < 250) return 'Top 25% (Above Average)';
    return 'Average Human Reflexes (250ms+)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 select-none">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-8 border border-cyber-border shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyber-primary/20 border border-cyber-primary flex items-center justify-center text-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Reaction Speed Benchmark</h2>
              <span className="text-[10px] text-cyber-muted uppercase tracking-widest font-bold">
                Sub-Millisecond Neuro-Reflex Telemetry
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

        {/* Reaction Test Interactive Area */}
        <div
          onClick={handleClick}
          className={`w-full h-64 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 p-6 border shadow-2xl relative overflow-hidden ${
            gameState === 'waiting'
              ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
              : gameState === 'ready'
              ? 'bg-emerald-500 border-white shadow-[0_0_60px_rgba(16,185,129,0.8)] scale-102'
              : gameState === 'early'
              ? 'bg-amber-950/80 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
              : 'bg-cyber-card/80 border-cyber-border hover:border-cyber-primary shadow-lg'
          }`}
        >
          {gameState === 'idle' && (
            <div className="text-center space-y-2">
              <Clock className="w-12 h-12 text-cyber-primary mx-auto animate-pulse" />
              <h3 className="text-2xl font-black text-white uppercase">Click to Start Reaction Test</h3>
              <p className="text-xs text-cyber-muted font-bold tracking-wider uppercase">
                When the red screen turns GREEN, click as fast as humanly possible!
              </p>
            </div>
          )}

          {gameState === 'waiting' && (
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">WAIT FOR GREEN...</h3>
              <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">
                Do not click yet!
              </p>
            </div>
          )}

          {gameState === 'ready' && (
            <div className="text-center space-y-1">
              <h3 className="text-6xl font-black text-black uppercase tracking-tighter drop-shadow-md">
                CLICK NOW!
              </h3>
            </div>
          )}

          {gameState === 'early' && (
            <div className="text-center space-y-2">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-black text-amber-400 uppercase">Too Early!</h3>
              <p className="text-xs text-cyber-muted font-bold uppercase">
                Click anywhere to try again.
              </p>
            </div>
          )}

          {gameState === 'result' && reactionTime !== null && (
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-cyber-primary">Reflex Speed</span>
              <h3 className="font-mono text-6xl font-black text-white drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]">
                {reactionTime} <span className="text-2xl text-cyber-primary">ms</span>
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-primary/20 text-cyber-primary text-xs font-bold uppercase tracking-wider border border-cyber-primary/40">
                <Award className="w-3.5 h-3.5" />
                {getPercentile(reactionTime)}
              </div>
              <p className="text-[11px] text-cyber-muted font-bold uppercase pt-2">
                Click anywhere to test again
              </p>
            </div>
          )}
        </div>

        {/* 5-Attempt History Matrix */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-cyber-card/60 p-3.5 rounded-2xl border border-cyber-border text-center">
              <span className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">Best Attempt</span>
              <span className="font-mono text-xl font-black text-cyber-neon mt-1 block">{bestReaction} ms</span>
            </div>
            <div className="bg-cyber-card/60 p-3.5 rounded-2xl border border-cyber-border text-center">
              <span className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">Average (5-Shot)</span>
              <span className="font-mono text-xl font-black text-cyber-primary mt-1 block">{avgReaction} ms</span>
            </div>
            <div className="bg-cyber-card/60 p-3.5 rounded-2xl border border-cyber-border text-center">
              <span className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">Total Attempts</span>
              <span className="font-mono text-xl font-black text-white mt-1 block">{history.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
