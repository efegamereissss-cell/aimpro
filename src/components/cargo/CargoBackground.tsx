import React from 'react';

export const CargoBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] animate-pulse-slow" />
      <div className="absolute top-1/3 -right-36 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[170px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[550px] h-[550px] bg-orange-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '6s' }} />

      {/* 2. Global Logistics Map Silhouette / Vector Points */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_20%_35%,#fff_2px,transparent_2px),radial-gradient(circle_at_45%_65%,#fff_2px,transparent_2px),radial-gradient(circle_at_75%_30%,#fff_2px,transparent_2px)] [background-size:120px_120px]" />

      {/* 3. Subtle Hex / Tech Dots Matrix */}
      <div className="absolute inset-0 tactical-dots opacity-15" />

      {/* 4. Giant Watermark Outline */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-[14vw] font-black tracking-[0.25em] text-white/[0.012] whitespace-nowrap uppercase pointer-events-none font-mono">
        GLOBAL LOGISTICS
      </div>
      <div className="absolute bottom-10 -left-16 text-[12vw] font-black tracking-[0.2em] text-white/[0.01] whitespace-nowrap uppercase pointer-events-none font-mono -rotate-6">
        KARGOBILGI
      </div>

      {/* 5. Logistics Routing Accents */}
      <div className="absolute top-24 left-6 hidden xl:flex flex-col gap-1 text-[9px] font-mono text-white/25 uppercase tracking-wider">
        <span>// CARGO TRACKING PROTOCOL</span>
        <span>LAT: 39.9334° N, 32.8597° E (TURKEY)</span>
        <span>NETWORK: 12 CARRIERS ACTIVE</span>
      </div>

      <div className="absolute top-24 right-6 hidden xl:flex flex-col items-end gap-1 text-[9px] font-mono text-white/25 uppercase tracking-wider">
        <span>SPEED: REAL-TIME PUSH</span>
        <span>API STATUS: OPERATIONAL</span>
        <span>AUTO-CARRIER: ENABLED</span>
      </div>

      {/* 6. Corner Framing Brackets */}
      <div className="absolute top-20 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/25 hidden md:block" />
      <div className="absolute top-20 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500/25 hidden md:block" />
      <div className="absolute bottom-6 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500/25 hidden md:block" />
      <div className="absolute bottom-6 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500/25 hidden md:block" />
    </div>
  );
};
