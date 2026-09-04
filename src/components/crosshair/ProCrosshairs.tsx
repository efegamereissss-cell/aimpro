import React, { useState } from 'react';
import { PRO_CROSSHAIRS } from '../../data/proCrosshairs';
import { ProCrosshair } from '../../types/esports';
import { esportsSound } from '../../utils/soundEffects';
import { Crosshair, Copy, Check, Sparkles, Award } from 'lucide-react';

export const ProCrosshairs: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = async (id: string, code: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      esportsSound.playCodeCopied();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F1420] via-[#122424] to-[#0F1420] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Crosshair className="w-3.5 h-3.5" />
            <span>VALORANT PRO NİŞANGAH VERİTABANI</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Dünyanın En İyi Esporcularının <span className="text-cyan-400">Crosshair Kodları</span>
          </h1>
          <p className="text-sm md:text-base text-white/70 font-medium">
            cNed, Alfajer, Aspas, TenZ ve diğer yıldızların oyun içi ayarlarını tek tıkla kopyalayın ve Valorant ayarlarınıza yapıştırın.
          </p>
        </div>
      </div>

      {/* Crosshairs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRO_CROSSHAIRS.map(ch => {
          const isCopied = copiedId === ch.id;

          return (
            <div
              key={ch.id}
              className="bg-[#0F1420]/90 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
            >
              <div>
                {/* Visual Crosshair Canvas Box */}
                <div className="relative aspect-square w-full rounded-xl bg-[#090C12] border border-white/10 flex items-center justify-center overflow-hidden mb-4 group-hover:border-cyan-500/40 transition-colors">
                  {/* Background gridlines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* SVG Crosshair representation */}
                  <svg className="w-16 h-16 relative z-10" viewBox="0 0 100 100">
                    {/* Center crosshair bars or dot */}
                    {ch.tags.includes('Nokta (Dot)') || ch.tags.includes('Mavi Nokta') || ch.tags.includes('Beyaz Nokta') || ch.tags.includes('Sarı Nokta') ? (
                      <circle cx="50" cy="50" r="4" fill={ch.color} stroke="#000" strokeWidth="1.5" />
                    ) : (
                      <g stroke={ch.color} strokeWidth="2.5" strokeLinecap="square">
                        {/* Top bar */}
                        <line x1="50" y1="36" x2="50" y2="44" />
                        {/* Bottom bar */}
                        <line x1="50" y1="56" x2="50" y2="64" />
                        {/* Left bar */}
                        <line x1="36" y1="50" x2="44" y2="50" />
                        {/* Right bar */}
                        <line x1="56" y1="50" x2="64" y2="50" />
                      </g>
                    )}
                  </svg>

                  {/* Team Tag pill */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/80 border border-white/20 text-white/80">
                    {ch.team}
                  </span>
                </div>

                {/* Player & Role Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                      {ch.playerName}
                    </h3>
                    <span className="text-xs font-mono font-bold text-white/40">{ch.role}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {ch.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleCopyCode(ch.id, ch.code)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 ${
                    isCopied
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-white/10 hover:bg-cyan-500 hover:text-black text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>KOD KOPYALANDI!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>KODU KOPYALA</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
