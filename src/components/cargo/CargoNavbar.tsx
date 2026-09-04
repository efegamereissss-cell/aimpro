import React, { useState, useEffect } from 'react';
import { useCargoStore } from '../../store/useCargoStore';
import { esportsSound } from '../../utils/soundEffects';
import {
  Package,
  Search,
  BookmarkCheck,
  Calculator,
  Building2,
  Volume2,
  VolumeX,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export type CargoNavTab = 'tracking' | 'saved' | 'calculator' | 'directory';

interface CargoNavbarProps {
  activeTab: CargoNavTab;
  onTabChange: (tab: CargoNavTab) => void;
}

export const CargoNavbar: React.FC<CargoNavbarProps> = ({ activeTab, onTabChange }) => {
  const savedShipments = useCargoStore(state => state.savedShipments);
  const [isMuted, setIsMuted] = useState(esportsSound.isMuted);
  const [volume, setVolume] = useState(esportsSound.volume);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [liveQueryCount, setLiveQueryCount] = useState(48920);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveQueryCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const muted = esportsSound.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    esportsSound.setVolume(newVol);
  };

  const navItems = [
    { id: 'tracking' as CargoNavTab, label: 'Kargo Takip', icon: Search },
    {
      id: 'saved' as CargoNavTab,
      label: 'Takip Listem',
      icon: BookmarkCheck,
      badge: savedShipments.length > 0 ? String(savedShipments.length) : undefined
    },
    { id: 'calculator' as CargoNavTab, label: 'Desi & Ücret Hesapla', icon: Calculator },
    { id: 'directory' as CargoNavTab, label: 'Kargo Rehberi', icon: Building2 }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Brand Logo - KargoCom */}
          <div
            onClick={() => {
              esportsSound.playClick();
              onTabChange('tracking');
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(245,158,11,0.45)] group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl md:text-2xl tracking-tight text-white">
                  Kargo<span className="text-amber-400">Com</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full tracking-wider">
                  EVRENSEL TAKİP
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider -mt-0.5 hidden md:block">
                Türkiye & Uluslararası Kargo Ağı
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all relative ${
                    isActive
                      ? 'bg-amber-500 text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
                      isActive ? 'bg-black/20 text-black border-black/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Live Today Queries Counter */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{liveQueryCount.toLocaleString()} Bugün Sorgulandı</span>
            </div>

            {/* Sound Menu & Tok Test */}
            <div className="relative">
              <button
                onClick={() => setShowSoundMenu(!showSoundMenu)}
                title="Ses Ayarları & TOK Sesini Test Et"
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  showSoundMenu
                    ? 'bg-white/15 border-amber-500/50 text-white'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Sound Settings Popover */}
              {showSoundMenu && (
                <div className="absolute right-0 mt-2 w-56 p-4 rounded-2xl bg-[#0E1424] border border-amber-500/40 shadow-2xl z-50 text-white space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Tok Ses Ayarları
                    </span>
                    <button
                      onClick={handleToggleMute}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isMuted ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isMuted ? 'Sessiz' : 'Açık'}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-white/60 mb-1">
                      <span>Ses Seviyesi</span>
                      <span className="font-mono font-bold text-white">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      esportsSound.playCodeCopied();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border border-amber-500/30 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <span>🔊 TOK Sesini Dinle</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Track Action Button */}
            <button
              onClick={() => {
                esportsSound.playClick();
                onTabChange('tracking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-500 text-black font-black text-xs md:text-sm shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Truck className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">KARGO SORGULA</span>
              <span className="sm:hidden">SORGULA</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Sub-bar */}
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
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-white/60 hover:text-white bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-black/30 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
