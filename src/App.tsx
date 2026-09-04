import React, { useState, useEffect } from 'react';
import { CargoNavbar, CargoNavTab } from './components/cargo/CargoNavbar';
import { CargoBackground } from './components/cargo/CargoBackground';
import { TrackingSearchBar } from './components/cargo/TrackingSearchBar';
import { ShipmentDetailsView } from './components/cargo/ShipmentDetailsView';
import { SavedShipmentsView } from './components/cargo/SavedShipmentsView';
import { ShippingCalculatorView } from './components/cargo/ShippingCalculatorView';
import { CarriersDirectoryView } from './components/cargo/CarriersDirectoryView';
import { useCargoStore } from './store/useCargoStore';
import { esportsSound } from './utils/soundEffects';
import {
  Package,
  Search,
  BookmarkCheck,
  Calculator,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Truck,
  Sparkles
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<CargoNavTab>('tracking');

  const currentShipment = useCargoStore(state => state.currentShipment);
  const setSelectedCarrierId = useCargoStore(state => state.setSelectedCarrierId);
  const toastMessage = useCargoStore(state => state.toastMessage);
  const setToast = useCargoStore(state => state.setToast);
  const init = useCargoStore(state => state.init);

  useEffect(() => {
    init();

    // Log visitor activity to Discord (once per session, privacy safe)
    try {
      if (typeof window !== 'undefined' && !sessionStorage.getItem('kargocom_visit_logged')) {
        sessionStorage.setItem('kargocom_visit_logged', '1');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const browser = navigator.userAgent.includes('Chrome') ? 'Google Chrome' :
                        navigator.userAgent.includes('Firefox') ? 'Mozilla Firefox' :
                        navigator.userAgent.includes('Safari') ? 'Apple Safari' :
                        navigator.userAgent.includes('Edge') ? 'Microsoft Edge' : 'Web Tarayıcı';

        fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device: isMobile ? '📱 Mobil Cihaz' : '💻 Masaüstü Bilgisayar',
            browser,
            path: 'Ana Sayfa'
          })
        }).catch(() => {});
      }
    } catch {}
  }, [init]);

  const handleTabChange = (tab: CargoNavTab) => {
    esportsSound.playClick();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* Dynamic Global Logistics Grid Background */}
      <CargoBackground />

      {/* Main Navbar */}
      <CargoNavbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Live Logistics Ticker Bar */}
      <div className="relative z-20 bg-[#090E1B]/95 border-b border-white/5 py-2 px-4 overflow-hidden backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono font-semibold text-white/60">
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-black text-white uppercase tracking-wider text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              AĞ DURUMU AKTİF
            </span>
          </div>

          <div className="overflow-hidden whitespace-nowrap ml-4 flex-1">
            <div className="inline-block animate-marquee pl-4">
              <span className="text-amber-400 font-black">LOGISTICS PROTOCOL:</span> 🚚 Yurtiçi, Aras, MNG, PTT, Trendyol Express, HepsiJET, Sürat, Kolay Gelsin, Sendeo, DHL, UPS, FedEx entegrasyonu // 📍 Canlı Rota ve Kurye Bilgileri Aktif // ⚡ Takip Numarasını Girerek Anında 3. Parti Detaylarını Öğrenin // 📐 TSE Standartlarında Otomatik Desi & Ücret Hesaplayıcı
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 pl-4 text-[10px] text-white/40">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> %100 Doğrulanmış Veri
            </span>
            <span>KargoCom V3.0</span>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        
        {/* TAB 1: Kargo Takip */}
        {activeTab === 'tracking' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <TrackingSearchBar />

            {currentShipment ? (
              <ShipmentDetailsView shipment={currentShipment} />
            ) : (
              <div className="p-12 rounded-3xl bg-[#0D1322]/80 border border-white/10 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">
                  Henüz Bir Kargo Sorgulamadınız
                </h3>
                <p className="text-sm text-white/50 max-w-md mx-auto">
                  Yukarıdaki arama kutusuna takip numaranızı yazabilir veya hızlı örnek kodlara tıklayarak canlı rota ve kurye detaylarını inceleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Takip Listem */}
        {activeTab === 'saved' && (
          <SavedShipmentsView onSelectShipment={() => setActiveTab('tracking')} />
        )}

        {/* TAB 3: Desi & Ücret Hesaplama */}
        {activeTab === 'calculator' && (
          <ShippingCalculatorView />
        )}

        {/* TAB 4: Kargo Rehberi */}
        {activeTab === 'directory' && (
          <CarriersDirectoryView
            onSelectCarrierForTracking={(carrierId) => {
              setSelectedCarrierId(carrierId);
              setActiveTab('tracking');
            }}
          />
        )}

      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0D1527]/95 border border-amber-500/50 shadow-2xl shadow-black/80 backdrop-blur-xl text-white">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold pr-2">{toastMessage}</p>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0A0E1A]/95 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center text-white font-black shadow-lg">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight">
                  Kargo<span className="text-amber-400">Com</span>
                </span>
                <p className="text-xs text-white/50">
                  Türkiye ve Uluslararası Evrensel Kargo Takip Platformu
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-white/60">
              <button
                onClick={() => handleTabChange('tracking')}
                className="hover:text-amber-400 transition"
              >
                Kargo Sorgula
              </button>
              <button
                onClick={() => handleTabChange('saved')}
                className="hover:text-amber-400 transition"
              >
                Takip Listem
              </button>
              <button
                onClick={() => handleTabChange('calculator')}
                className="hover:text-amber-400 transition"
              >
                Desi & Ücret Hesapla
              </button>
              <button
                onClick={() => handleTabChange('directory')}
                className="hover:text-amber-400 transition"
              >
                Kargo Rehberi
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>
              © 2026 KargoCom. Tüm hakları saklıdır. Evrensel paket takip ve lojistik analiz sistemi.
            </p>
            <p className="text-[11px] text-center md:text-right">
              Yurtiçi, Aras, MNG, PTT, Trendyol Express ve diğer tescilli markalar ilgili şirketlerin tescilli mülkiyetindedir.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
export default App;
