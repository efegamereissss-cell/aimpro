import React, { useRef } from 'react';
import { useRankGameStore } from '../../store/useRankGameStore';
import { ValorantRank } from '../../types/esports';
import { RankBadge, RANK_INFO } from '../ui/RankBadge';
import confetti from 'canvas-confetti';
import { Target, Trophy, Flame, Play, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, HelpCircle } from 'lucide-react';

const ALL_RANKS: ValorantRank[] = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'ascendant',
  'immortal',
  'radiant'
];

export const GuessTheRank: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    scenarios,
    currentIndex,
    selectedGuess,
    isAnswerRevealed,
    score,
    streak,
    bestStreak,
    submitGuess,
    nextScenario,
    resetGame
  } = useRankGameStore();

  const currentScenario = scenarios[currentIndex];

  const handleGuess = (rank: ValorantRank) => {
    if (isAnswerRevealed) return;
    submitGuess(rank);

    if (rank === currentScenario.correctRank) {
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const isCurrentCorrect = selectedGuess === currentScenario.correctRank;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner & Score Tracker */}
      <div className="bg-[#0F1420]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>İNTERAKTİF ESPOR OYUNU</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Rank Tahmini <span className="text-amber-400">(Guess The Rank)</span>
            </h1>
            <p className="text-xs md:text-sm text-white/60 font-medium">
              Aşağıdaki klibi izle, vuruş ve yetenek kullanımına bakarak oyuncunun gerçek rankını tahmin et!
            </p>
          </div>

          {/* Live Score Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-center">
              <span className="text-[10px] font-black uppercase text-white/50 block">Toplam Puan</span>
              <span className="text-xl font-black font-mono text-amber-400">{score}</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-center">
              <span className="text-[10px] font-black uppercase text-white/50 block flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-rose-500" /> Seri (Streak)
              </span>
              <span className="text-xl font-black font-mono text-rose-400">{streak} 🔥</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-center hidden sm:block">
              <span className="text-[10px] font-black uppercase text-white/50 block">En İyi Seri</span>
              <span className="text-xl font-black font-mono text-cyan-400">{bestStreak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-[#0F1420]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Video Stage */}
        <div className="relative aspect-video bg-black max-h-[460px] w-full">
          <video
            ref={videoRef}
            src={currentScenario.videoUrl}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Floating Scenario Title & Stats Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-lg">
              {currentScenario.title}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-cyan-400">
                K/D: {currentScenario.playerStats.kd}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-emerald-400">
                HS%: {currentScenario.playerStats.hsPercent}
              </span>
            </div>
          </div>
        </div>

        {/* Guessing Controls & Result Area */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* If answer is revealed: Show Outcome & Analysis */}
          {isAnswerRevealed && (
            <div
              className={`p-5 rounded-2xl border animate-in zoom-in-95 duration-200 ${
                isCurrentCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {isCurrentCorrect ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {isCurrentCorrect ? 'TEBRİKLER! TAM İSABET! 🎯' : 'YANLIŞ TAHMİN! ❌'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/70 font-bold">Oyuncunun Gerçek Rankı:</span>
                      <RankBadge rank={currentScenario.correctRank} size="md" />
                    </div>
                    <p className="text-xs text-white/70 font-medium mt-2 leading-relaxed">
                      💡 <strong>Neden?</strong> {currentScenario.analysisNote}
                    </p>
                  </div>
                </div>

                <button
                  onClick={nextScenario}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-sm shadow-xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shrink-0 self-end sm:self-auto"
                >
                  <span>SONRAKİ KLİP</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* Rank Buttons Grid */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-white/60 block mb-3 text-center sm:text-left">
              {isAnswerRevealed ? 'Diğer Seçenekler' : 'Sence Bu Oyuncu Hangi Rank? Birini Seç:'}
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-2.5">
              {ALL_RANKS.map(rank => {
                const isSelected = selectedGuess === rank;
                const isCorrectRank = currentScenario.correctRank === rank;
                const rankDetails = RANK_INFO[rank];
                const Icon = rankDetails.icon;

                let borderStyle = 'border-white/10 bg-black/40 hover:bg-white/10 text-white';
                if (isAnswerRevealed) {
                  if (isCorrectRank) {
                    borderStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
                  } else if (isSelected && !isCurrentCorrect) {
                    borderStyle = 'border-rose-500 bg-rose-500/20 text-rose-300 opacity-70';
                  } else {
                    borderStyle = 'opacity-30 border-white/5 bg-black/20 text-white/40';
                  }
                }

                return (
                  <button
                    key={rank}
                    disabled={isAnswerRevealed}
                    onClick={() => handleGuess(rank)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 ${borderStyle}`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" style={{ color: rankDetails.color }} />
                    <span className="text-[11px] font-black uppercase">{rankDetails.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
