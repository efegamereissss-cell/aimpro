import React from 'react';

export const TacticalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Gradient Glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FF4655]/12 rounded-full blur-[140px] animate-pulse-slow" />
      <div className="absolute top-1/3 -right-36 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '5s' }} />

      {/* 2. Tactical Dot Matrix Overlay */}
      <div className="absolute inset-0 tactical-dots opacity-20" />

      {/* 3. Tactical Diagonal Stripes */}
      <div className="absolute inset-0 tactical-stripes pointer-events-none opacity-40" />

      {/* 4. Giant Valorant Watermark Outlines */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[14vw] font-black tracking-[0.25em] text-white/[0.012] whitespace-nowrap uppercase pointer-events-none font-mono">
        VALORANT // VCT
      </div>
      <div className="absolute bottom-12 -left-20 text-[12vw] font-black tracking-[0.2em] text-white/[0.012] whitespace-nowrap uppercase pointer-events-none font-mono -rotate-6">
        TEAMCOM
      </div>

      {/* 5. Animated Rotating Radar Circle (Esports HUD Style) */}
      <div className="absolute -top-24 -right-24 w-96 h-96 border border-cyan-500/10 rounded-full flex items-center justify-center animate-radar">
        <div className="w-80 h-80 border border-dashed border-cyan-500/15 rounded-full flex items-center justify-center">
          <div className="w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-cyan-400/40 absolute top-1/2 left-1/2 origin-left" />
          </div>
        </div>
      </div>

      {/* 6. Rotating Compass Bottom-Left */}
      <div className="absolute -bottom-28 -left-28 w-96 h-96 border border-[#FF4655]/10 rounded-full flex items-center justify-center animate-radar" style={{ animationDirection: 'reverse', animationDuration: '24s' }}>
        <div className="w-80 h-80 border border-dashed border-[#FF4655]/15 rounded-full flex items-center justify-center">
          <div className="w-60 h-60 border border-white/5 rounded-full">
            <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-rose-500/30 absolute top-1/2 left-1/2 origin-left" />
          </div>
        </div>
      </div>

      {/* 7. Tactical Crosshair & Corner Marks */}
      <div className="absolute top-24 left-6 hidden lg:flex flex-col gap-1 text-[9px] font-mono text-white/20 uppercase tracking-wider">
        <span>// VALORANT PROTOCOL</span>
        <span>LAT: 41.0082° N, 28.9784° E</span>
        <span>SYS: COMBAT READY</span>
      </div>

      <div className="absolute top-24 right-6 hidden lg:flex flex-col items-end gap-1 text-[9px] font-mono text-white/20 uppercase tracking-wider">
        <span>CLUSTER: ISTANBUL // TR</span>
        <span>PEER MESH: ACTIVE</span>
        <span>ENCRYPTION: RIOT-AES</span>
      </div>

      {/* 8. Angled Corner Tech Brackets */}
      <div className="absolute top-20 left-4 w-6 h-6 border-t-2 border-l-2 border-[#FF4655]/30 hidden md:block" />
      <div className="absolute top-20 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 hidden md:block" />
      <div className="absolute bottom-6 left-4 w-6 h-6 border-b-2 border-l-2 border-[#FF4655]/30 hidden md:block" />
      <div className="absolute bottom-6 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-500/30 hidden md:block" />

      {/* 9. Floating Crosshairs (+) */}
      <span className="absolute top-1/4 left-1/6 text-white/15 text-xs font-mono select-none">+</span>
      <span className="absolute top-1/2 right-1/5 text-cyan-400/20 text-xs font-mono select-none">+</span>
      <span className="absolute bottom-1/3 left-1/3 text-[#FF4655]/20 text-xs font-mono select-none">+</span>
      <span className="absolute top-3/4 right-1/4 text-white/15 text-xs font-mono select-none">+</span>

      {/* 10. Angled Tactical Accent Badges in Margins */}
      <div className="absolute top-1/2 left-2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 text-[10px] font-mono font-bold text-white/15 tracking-widest [writing-mode:vertical-lr] rotate-180">
        <span className="w-1.5 h-6 bg-[#FF4655]/30 rounded-full" />
        <span>TEAMCOM // LFT MATRIX</span>
        <span className="w-1.5 h-12 bg-white/10 rounded-full" />
      </div>

      <div className="absolute top-1/2 right-2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 text-[10px] font-mono font-bold text-white/15 tracking-widest [writing-mode:vertical-lr]">
        <span className="w-1.5 h-6 bg-cyan-400/30 rounded-full" />
        <span>RANKED & PREMIER HUB</span>
        <span className="w-1.5 h-12 bg-white/10 rounded-full" />
      </div>
    </div>
  );
};
