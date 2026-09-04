import React, { useState } from 'react';
import { EsportsNavbar, NavTab } from './components/navbar/EsportsNavbar';
import { LobbiesView } from './components/lobbies/LobbiesView';
import { ClipsView } from './components/clips/ClipsView';
import { GuessTheRank } from './components/rankGame/GuessTheRank';
import { ProCrosshairs } from './components/crosshair/ProCrosshairs';
import { VctMatches } from './components/vct/VctMatches';
import { Flame, Shield, Users, Trophy, ExternalLink, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('lobbies');

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-[#FF4655] selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#FF4655]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Navbar */}
      <EsportsNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {activeTab === 'lobbies' && <LobbiesView />}
        {activeTab === 'clips' && <ClipsView />}
        {activeTab === 'guess-rank' && <GuessTheRank />}
        {activeTab === 'crosshairs' && <ProCrosshairs />}
        {activeTab === 'vct' && <VctMatches />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-[#0A0D14]/90 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/50">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF4655] flex items-center justify-center text-white font-black">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-tight">PREMATE.PRO</span>
              <p className="text-[11px] text-white/40">Türkiye'nin En Gelişmiş Valorant Espor & Takım Arama Portalı</p>
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
              Valorant, Riot Games Inc.'in tescilli markasıdır. Bu site bağımsız bir topluluk projesidir.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
