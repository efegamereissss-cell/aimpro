import React from 'react';
import { useLobbyStore } from '../../store/useLobbyStore';
import { esportsSound } from '../../utils/soundEffects';
import { Users, Film, Target, Crosshair, Trophy, Plus, Volume2, VolumeX, Flame } from 'lucide-react';

export type NavTab = 'lobbies' | 'clips' | 'guess-rank' | 'crosshairs' | 'vct';

interface EsportsNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const EsportsNavbar: React.FC<EsportsNavbarProps> = ({ activeTab, onTabChange }) => {
  const setCreateModalOpen = useLobbyStore(state => state.setCreateModalOpen);
  const [isMuted, setIsMuted] = React.useState(esportsSound.isMuted);

  const handleToggleMute = () => {
    const muted = esportsSound.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { id: 'lobbies' as NavTab, label: 'Lobi & Takım Bul', icon: Users, badge: 'CANLI' },
    { id: 'clips' as NavTab, label: 'Topluluk Klipleri', icon: Film, badge: 'YENİ' },
    { id: 'guess-rank' as NavTab, label: 'Rank Tahmini', icon: Target },
    { id: 'crosshairs' as NavTab, label: 'Pro Crosshair', icon: Crosshair },
    { id: 'vct' as NavTab, label: 'VCT Fikstürü', icon: Trophy, isLive: true }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Logo */}
          <div
            onClick={() => onTabChange('lobbies')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-[#FF4655] to-rose-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,70,85,0.4)] group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl md:text-2xl tracking-tighter text-white">
                  PREMATE<span className="text-[#FF4655]">.PRO</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/30 rounded">
                  ESPORTS
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider -mt-1 hidden md:block">
                Valorant Oyuncu & Takım Platformu
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    esportsSound.playClick();
                    onTabChange(item.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all relative ${
                    isActive
                      ? 'bg-[#FF4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {item.badge}
                    </span>
                  )}
                  {item.isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Live Online Count */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1,842 Çevrimiçi</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Create Lobby CTA */}
            <button
              onClick={() => {
                esportsSound.playClick();
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4655] to-rose-600 hover:from-rose-600 hover:to-[#FF4655] text-white font-black text-xs md:text-sm shadow-[0_0_20px_rgba(255,70,85,0.4)] hover:shadow-[0_0_30px_rgba(255,70,85,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>LOBİ OLUŞTUR</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-white/5 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  esportsSound.playClick();
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#FF4655] text-white'
                    : 'text-white/60 hover:text-white bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
