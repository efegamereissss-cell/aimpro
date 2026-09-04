import React, { useState } from 'react';
import { EsportsNavbar, NavTab } from './components/navbar/EsportsNavbar';
import { LobbiesView } from './components/lobbies/LobbiesView';
import { ClipsView } from './components/clips/ClipsView';
import { GuessTheRank } from './components/rankGame/GuessTheRank';
import { ProCrosshairs } from './components/crosshair/ProCrosshairs';
import { VctMatches } from './components/vct/VctMatches';
import { TacticalBackground } from './components/ui/TacticalBackground';
import { Users, Flame, ExternalLink, Heart, Radio, Activity, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('lobbies');

  return (
    <div className="min-h-screen tactical-bg text-slate-100 flex flex-col font-sans selection:bg-[#FF4655] selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Cyber Tactical Esports Background */}
      <TacticalBackground />

      {/* Main Navbar */}
      <EsportsNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Live Tactical Esports Ticker Bar */}
      <div className="relative z-20 bg-[#090D17]/90 border-b border-white/5 py-1.5 px-4 overflow-hidden backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono font-semibold text-white/60">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-black text-white uppercase tracking-wider text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded">
              AĞ DURUMU
            </span>
          </div>

          <div className="overflow-hidden whitespace-nowrap ml-4 flex-1">
            <div className="inline-block animate-marquee pl-4">
              <span className="text-[#FF4655] font-black">VALORANT PROTOCOL:</span> 🇹🇷 İstanbul Sunucusu (Ping: 4ms) // 🟢 Küresel Gerçek Zamanlı Senkronizasyon Açık // ⚡ Kodunu Kopyala, Doğrudan Partiye Katıl // 👑 Radyant & Yücelik Premadeler Aktif // 🛡️ Premier & Turnuva Takımları Kuruluyor
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 pl-4 text-[10px] text-white/40">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-cyan-400" /> %100 Doğrulanmış Lobiler</span>
            <span>V2.8.4</span>
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {activeTab === 'lobbies' && <LobbiesView />}
        {activeTab === 'clips' && <ClipsView />}
        {activeTab === 'guess-rank' && <GuessTheRank />}
        {activeTab === 'crosshairs' && <ProCrosshairs />}
        {activeTab === 'vct' && <VctMatches />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0A0D14]/95 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/50">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF4655] to-rose-600 flex items-center justify-center text-white font-black shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-tight">Team<span className="text-[#FF4655]">Com</span></span>
              <p className="text-[11px] text-white/40">Türkiye'nin En Gelişmiş Valorant Takım Arama & Lobi Portalı</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <button onClick={() => setActiveTab('lobbies')} className="hover:text-white transition-colors">
              Lobi Bul
            </button>
            <button onClick={() => setActiveTab('clips')} className="hover:text-white transition-colors">
              Topluluk Klipleri
            </button>
            <button onClick={() => setActiveTab('guess-rank')} className="hover:text-white transition-colors">
              Rank Tahmini Oyunu
            </button>
            <button onClick={() => setActiveTab('crosshairs')} className="hover:text-white transition-colors">
              Pro Crosshairler
            </button>
            <button onClick={() => setActiveTab('vct')} className="hover:text-white transition-colors">
              VCT Fikstür
            </button>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] text-white/40">
              Valorant, Riot Games Inc.'in tescilli markasıdır. TeamCom bağımsız bir topluluk platformudur.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
