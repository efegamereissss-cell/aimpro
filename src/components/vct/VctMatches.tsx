import React from 'react';
import { VCT_MATCHES } from '../../data/vctData';
import { VctMatch } from '../../types/esports';
import { Trophy, Radio, ExternalLink, Calendar, Swords, Shield } from 'lucide-react';

export const VctMatches: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F1420] via-[#241318] to-[#0F1420] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>VCT VALORANT ŞAMPİYONLAR TURU</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Canlı Espor Fikstürü & <span className="text-[#FF4655]">Büyük Türk Derbisi</span>
          </h1>
          <p className="text-sm md:text-base text-white/70 font-medium">
            FUT Esports, BBL Esports, Fnatic ve Sentinels karşılaşmalarını, harita skorlarını ve canlı yayın saatlerini anlık takip edin.
          </p>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {VCT_MATCHES.map(match => {
          const isLive = match.status === 'live';

          return (
            <div
              key={match.id}
              className={`p-5 md:p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl ${
                isLive
                  ? 'bg-[#15111B]/90 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                  : 'bg-[#0F1420]/80 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Left Details */}
              <div className="space-y-1.5 text-center md:text-left w-full md:w-auto">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white/50">
                    {match.tournament}
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <Radio className="w-3 h-3" /> CANLI
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-cyan-400">{match.time}</div>
                {match.map && (
                  <span className="text-xs font-mono text-white/40 block">Harita: {match.map}</span>
                )}
              </div>

              {/* Center: Team A vs Team B Scoreboard */}
              <div className="flex items-center gap-6 md:gap-10">
                {/* Team A */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="font-black text-base md:text-xl text-white block">{match.teamA.name}</span>
                    <span className="text-[10px] font-bold text-white/50">{match.teamA.tag}</span>
                  </div>
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg"
                    style={{ backgroundColor: match.teamA.logoColor }}
                  >
                    {match.teamA.tag}
                  </div>
                </div>

                {/* Score or VS Badge */}
                <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-center shrink-0">
                  {match.teamA.score !== undefined && match.teamB.score !== undefined ? (
                    <div className="font-mono font-black text-xl md:text-2xl tracking-widest text-white">
                      <span className={match.teamA.score > match.teamB.score ? 'text-emerald-400' : ''}>
                        {match.teamA.score}
                      </span>
                      <span className="text-white/30 mx-1.5">:</span>
                      <span className={match.teamB.score > match.teamA.score ? 'text-emerald-400' : ''}>
                        {match.teamB.score}
                      </span>
                    </div>
                  ) : (
                    <span className="font-black text-xs md:text-sm text-white/40 tracking-wider">VS</span>
                  )}
                </div>

                {/* Team B */}
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg"
                    style={{ backgroundColor: match.teamB.logoColor }}
                  >
                    {match.teamB.tag}
                  </div>
                  <div>
                    <span className="font-black text-base md:text-xl text-white block">{match.teamB.name}</span>
                    <span className="text-[10px] font-bold text-white/50">{match.teamB.tag}</span>
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                {match.streamUrl ? (
                  <a
                    href={match.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs md:text-sm shadow-lg transition-all hover:scale-105"
                  >
                    <span>YAYINI İZLE</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-xs font-bold border border-white/10 cursor-default">
                    Detaylar
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
