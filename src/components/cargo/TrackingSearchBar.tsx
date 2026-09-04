import React, { useState, useEffect } from 'react';
import { useCargoStore } from '../../store/useCargoStore';
import { CARRIERS, CARRIER_LIST, detectCarrierByCode } from '../../data/carriersData';
import { CarrierId } from '../../types/cargo';
import { esportsSound } from '../../utils/soundEffects';
import {
  Search,
  Truck,
  Sparkles,
  QrCode,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Layers,
  X,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export const TrackingSearchBar: React.FC = () => {
  const searchQuery = useCargoStore(state => state.searchQuery);
  const setSearchQuery = useCargoStore(state => state.setSearchQuery);
  const selectedCarrierId = useCargoStore(state => state.selectedCarrierId);
  const setSelectedCarrierId = useCargoStore(state => state.setSelectedCarrierId);
  const trackShipment = useCargoStore(state => state.trackShipment);
  const isLoading = useCargoStore(state => state.isLoading);
  const errorMessage = useCargoStore(state => state.errorMessage);

  const [inputVal, setInputVal] = useState(searchQuery);
  const [showCarrierPicker, setShowCarrierPicker] = useState(false);

  // Sync with store if changed externally
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  const detectedCarrier = inputVal.trim()
    ? detectCarrierByCode(inputVal)
    : null;

  const currentCarrierInfo = selectedCarrierId !== 'auto'
    ? CARRIERS[selectedCarrierId]
    : detectedCarrier || CARRIERS.yurtici;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    trackShipment(inputVal, selectedCarrierId !== 'auto' ? selectedCarrierId : undefined);
  };

  const handleQuickDemo = (code: string, carrierId?: CarrierId) => {
    setInputVal(code);
    if (carrierId) setSelectedCarrierId(carrierId);
    trackShipment(code, carrierId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      
      {/* Real Live Info Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-black/40 border border-white/5 text-xs">
        <div className="flex items-center gap-2 text-white/70">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white">Canlı Resmi Kargo Takibi:</span>
          <span className="text-white/50 hidden sm:inline">Takip numaranızı girin, sistem kargonuzu doğrudan firmanın resmi veritabanından sorgulasın.</span>
        </div>
        <span className="text-[10px] font-mono text-amber-400 font-bold hidden md:inline">
          12 Kargo Firması Aktif
        </span>
      </div>

      {/* Main Search Box Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#111728]/95 to-[#0B0F1C]/95 border border-white/10 p-4 sm:p-6 shadow-[0_10px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        
        {/* Top Header Label */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-white/70">
              Gerçek Kargo Takip Kodu
            </span>
          </div>

          {/* Carrier Selection Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCarrierPicker(!showCarrierPicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors"
            >
              <span className="text-white/40 font-normal">Firma:</span>
              <span className="text-amber-400 font-black">
                {selectedCarrierId === 'auto'
                  ? `Otomatik (${currentCarrierInfo.shortName})`
                  : currentCarrierInfo.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </button>

            {/* Carrier Dropdown */}
            {showCarrierPicker && (
              <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto p-2 rounded-2xl bg-[#0E1424] border border-white/15 shadow-2xl z-50 text-white space-y-1">
                <button
                  onClick={() => {
                    setSelectedCarrierId('auto');
                    setShowCarrierPicker(false);
                    esportsSound.playClick();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    selectedCarrierId === 'auto' ? 'bg-amber-500 text-black font-black' : 'hover:bg-white/5 text-white/80'
                  }`}
                >
                  <span>🤖 Otomatik Algıla (Önerilen)</span>
                  {selectedCarrierId === 'auto' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="h-[1px] bg-white/10 my-1" />

                {CARRIER_LIST.map(carrier => (
                  <button
                    key={carrier.id}
                    onClick={() => {
                      setSelectedCarrierId(carrier.id);
                      setShowCarrierPicker(false);
                      esportsSound.playClick();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                      selectedCarrierId === carrier.id ? 'bg-amber-500 text-black font-black' : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: carrier.logoColor }} />
                      <span>{carrier.name}</span>
                    </div>
                    {selectedCarrierId === carrier.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Gerçek kargo takip numaranızı buraya yazın..."
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-white/40 text-sm sm:text-base font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-black font-black text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>RESMİ SİSTEME BAĞLANIYOR...</span>
              </>
            ) : (
              <>
                <Truck className="w-5 h-5 stroke-[2.5]" />
                <span>CANLI SORGULA</span>
              </>
            )}
          </button>
        </form>

        {/* Error Feedback */}
        {errorMessage && (
          <p className="mt-2 text-xs font-bold text-rose-400 animate-in fade-in">
            {errorMessage}
          </p>
        )}

        {/* Real detection badge when typing */}
        {inputVal.trim() && detectedCarrier && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 font-bold animate-in fade-in">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: detectedCarrier.logoColor }} />
            <span>Format Algılandı: <strong className="text-white">{detectedCarrier.name}</strong> resmi takip kodudur.</span>
          </div>
        )}

        {/* Quick 1-Click Demo Buttons */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase text-white/50 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Örnek Test Kodları:
          </span>

          <button
            type="button"
            onClick={() => handleQuickDemo('123456789012', 'yurtici')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 text-[11px] font-mono font-bold text-white/70 hover:text-amber-300 transition-colors"
          >
            Yurtiçi (Örnek)
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('KP048291048TR', 'ptt')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 text-[11px] font-mono font-bold text-white/70 hover:text-amber-300 transition-colors"
          >
            PTT Kargo (Örnek)
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('TY9841294812', 'trendyol_express')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 text-[11px] font-mono font-bold text-white/70 hover:text-amber-300 transition-colors"
          >
            Trendyol Express (Örnek)
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('2489182948192', 'aras')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 text-[11px] font-mono font-bold text-white/70 hover:text-amber-300 transition-colors"
          >
            Aras Kargo (Örnek)
          </button>
        </div>

      </div>

    </div>
  );
};
