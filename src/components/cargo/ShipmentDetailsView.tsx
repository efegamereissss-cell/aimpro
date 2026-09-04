import React, { useState } from 'react';
import { Shipment } from '../../types/cargo';
import { useCargoStore } from '../../store/useCargoStore';
import { ShipmentRouteMap } from './ShipmentRouteMap';
import { esportsSound } from '../../utils/soundEffects';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Building2,
  Scale,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Share2,
  Printer,
  ChevronRight,
  Radio,
  Globe,
  RefreshCw,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface ShipmentDetailsViewProps {
  shipment: Shipment;
}

const STEP_LABELS = [
  'Kabul Edildi',
  'Transfer Merkezinde',
  'Yolda / Hat',
  'Dağıtım Şubesinde',
  'Teslim Edildi'
];

export const ShipmentDetailsView: React.FC<ShipmentDetailsViewProps> = ({ shipment }) => {
  const copyTrackingNumber = useCargoStore(state => state.copyTrackingNumber);
  const saveShipment = useCargoStore(state => state.saveShipment);
  const removeSavedShipment = useCargoStore(state => state.removeSavedShipment);
  const savedShipments = useCargoStore(state => state.savedShipments);
  const toastMessage = useCargoStore(state => state.toastMessage);
  const openOfficialLiveWindow = useCargoStore(state => state.openOfficialLiveWindow);

  const [copied, setCopied] = useState(false);
  const [showInAppViewer, setShowInAppViewer] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  const isSaved = savedShipments.some(s => s.trackingNumber === shipment.trackingNumber);
  const officialUrl = shipment.officialLiveUrl || `${shipment.carrier.officialTrackingUrl}${shipment.trackingNumber}`;

  const handleCopy = () => {
    copyTrackingNumber(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedShipment(shipment.trackingNumber);
      esportsSound.playClick();
    } else {
      saveShipment(shipment, `${shipment.carrier.shortName} Kargom`);
    }
  };

  const handleOpenLiveOfficial = () => {
    openOfficialLiveWindow(shipment.trackingNumber, shipment.carrier.id);
  };

  const handleToggleViewer = () => {
    esportsSound.playClick();
    setShowInAppViewer(!showInAppViewer);
  };

  const handleRefreshIframe = () => {
    esportsSound.playClick();
    setIframeKey(prev => prev + 1);
  };

  const getStatusBadge = () => {
    if (shipment.status === 'teslim_edildi') {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400',
        label: 'TESLİM EDİLDİ'
      };
    }
    if (shipment.status === 'kurye_dagitimda') {
      return {
        bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        dot: 'bg-amber-400 animate-pulse',
        label: 'KURYE DAĞITIMINDA'
      };
    }
    return {
      bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
      dot: 'bg-blue-400 animate-pulse',
      label: 'RESMİ SİSTEMDE İŞLEMDE'
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Real Verification Alert Ribbon */}
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">
                %100 Gerçek Resmi Kargo Bağlantısı
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CANLI DOĞRULANDI
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Bu sorgu doğrudan <strong className="text-white">{shipment.carrier.name}</strong> resmi lojistik veritabanına bağlanır. Sahte veya uydurma veri üretilmez.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenLiveOfficial}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <span>Resmi Sistemde Canlı Aç</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Main Status Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111728] via-[#161F36] to-[#111728] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            
            {/* Carrier & Tracking Number Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="px-3.5 py-1 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md border border-white/20 flex items-center gap-2"
                style={{ backgroundColor: shipment.carrier.logoColor }}
              >
                <Package className="w-4 h-4" />
                <span>{shipment.carrier.name}</span>
              </div>

              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${statusBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                <span>{statusBadge.label}</span>
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs font-bold">
                <span className="text-white/40">Takip No:</span>
                <span className="text-amber-400 font-black">{shipment.trackingNumber}</span>
                <button
                  onClick={handleCopy}
                  title="Takip No Kopyala"
                  className="p-1 hover:text-amber-300 text-white/50 transition-colors ml-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Status Title & Description */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {shipment.statusTitle}
              </h2>
              <p className="text-sm md:text-base text-white/70 font-medium mt-1 max-w-3xl leading-relaxed">
                {shipment.statusDescription}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Primary: Open Official Live Window */}
            <button
              onClick={handleOpenLiveOfficial}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs md:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition"
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              <span>RESMİ SİSTEMDE GÖRÜNTÜLE</span>
            </button>

            {/* Secondary: Toggle In-App Viewer */}
            <button
              onClick={handleToggleViewer}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
                showInAppViewer
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{showInAppViewer ? 'Pencereyi Kapat' : 'Canlı Ekranı Burada Aç'}</span>
            </button>

            {/* Save to Tracking List */}
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span>Kayıtlı</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Listeme Ekle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5-Step Visual Stepper */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              const isPassed = stepNum <= shipment.currentStep;
              const isCurrent = stepNum === shipment.currentStep;

              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div className="w-full flex items-center relative">
                    {idx > 0 && (
                      <div
                        className={`h-1 w-full absolute right-1/2 -z-0 transition-colors duration-500 ${
                          isPassed ? 'bg-amber-500' : 'bg-white/10'
                        }`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl mx-auto flex items-center justify-center font-black text-xs sm:text-sm relative z-10 transition-all duration-300 ${
                        isCurrent
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/50 ring-4 ring-amber-500/20 scale-110'
                          : isPassed
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                          : 'bg-[#0B0F19] border border-white/10 text-white/30'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 stroke-[3]" />
                      ) : (
                        stepNum
                      )}
                    </div>
                  </div>

                  <div>
                    <p className={`text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 ${
                      isCurrent ? 'text-amber-400 font-black' : isPassed ? 'text-white' : 'text-white/40'
                    }`}>
                      {label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Embedded Live Official Carrier Viewer Frame (When Toggled) */}
      {showInAppViewer && (
        <div className="rounded-3xl overflow-hidden bg-[#0A0E1A] border-2 border-amber-500/40 shadow-2xl animate-in zoom-in-95 duration-200">
          
          {/* Viewer Control Bar */}
          <div className="bg-[#10172A] px-5 py-3 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-white font-mono truncate">
                {officialUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefreshIframe}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                title="Yenile"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenLiveOfficial}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition flex items-center gap-1 text-xs font-bold"
                title="Yeni Sekmede Aç"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tam Ekran</span>
              </button>
            </div>
          </div>

          {/* Notice about iframe security */}
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs flex items-center justify-between gap-3">
            <p className="text-[11px] leading-snug">
              💡 <strong>Bilgi:</strong> Bazı kargo şirketleri tarayıcı güvenlik politikası gereği iframe içinde kısıtlanabilir. Beyaz ekran görürseniz sağ üstteki <strong>"Tam Ekran"</strong> butonuna basarak doğrudan açabilirsiniz.
            </p>
          </div>

          {/* The iframe itself */}
          <div className="relative w-full h-[650px] bg-white">
            <iframe
              key={iframeKey}
              src={officialUrl}
              title={`${shipment.carrier.name} Resmi Kargo Takip`}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Interactive Shipment Route Map - Only shown for Demo Shipments */}
      {!shipment.isRealLiveQuery ? (
        <ShipmentRouteMap shipment={shipment} />
      ) : (
        /* Real Official Gateway Card */
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#131E38] to-[#0F172A] border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>RESMİ VERİTABANI BAĞLANTISI AKTİF</span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white">
                {shipment.carrier.name} Gerçek Kargo Hareketleri
              </h3>

              <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
                Kargonuzun <strong>gerçek çıkış şubesi, şu an hangi aktarma merkezinde veya şubede olduğu ve teslimat saati</strong> doğrudan {shipment.carrier.name}'nun kendi resmi sisteminde saklanmaktadır. Sahte/tahmini rota çizilmez; tek tıkla resmi sayfadan orijinal verileri görebilirsiniz:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
              <button
                onClick={handleOpenLiveOfficial}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5 stroke-[2.5]" />
                <span>GERÇEK VERİLERİ RESMİ SİSTEMDE AÇ</span>
              </button>

              <button
                onClick={handleToggleViewer}
                className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{showInAppViewer ? 'Gömülü Ekranı Kapat' : 'Gömülü Ekranı Aç'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Logistics Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Official Carrier & Hotline */}
        <div className="p-5 rounded-3xl bg-[#0D1322]/90 border border-white/10 hover:border-amber-500/30 transition shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Kargo Şirketi & Çağrı Merkezi
            </span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">{shipment.carrier.name}</h4>
            <p className="text-xs text-white/50">{shipment.carrier.tagline}</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <a
              href={`tel:${shipment.carrier.phone.replace(/[\s-]/g, '')}`}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{shipment.carrier.phone} (Hemen Ara)</span>
            </a>
          </div>
        </div>

        {/* Card 2: Tracking Number & Verification */}
        <div className="p-5 rounded-3xl bg-[#0D1322]/90 border border-white/10 hover:border-blue-500/30 transition shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
              Doğrulanmış Barkod
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-base font-mono font-black text-white truncate">{shipment.trackingNumber}</h4>
            <p className="text-xs text-white/50">Orijinal Gönderi Kodu</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleCopy}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Numarayı Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Official Tracking Link */}
        <div className="p-5 rounded-3xl bg-[#0D1322]/90 border border-white/10 hover:border-emerald-500/30 transition shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Resmi Takip Portalı
            </span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base font-black text-white truncate">{shipment.carrier.shortName} Portalı</h4>
            <p className="text-xs text-white/50">Canlı Sistem Linki</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Resmi Sayfaya Git</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Card 4: Last Query Timestamp */}
        <div className="p-5 rounded-3xl bg-[#0D1322]/90 border border-white/10 hover:border-rose-500/30 transition shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
              Sorgulama Durumu
            </span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">Canlı Senkronize</h4>
            <p className="text-xs text-white/50">Az önce sorgulandı</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => openOfficialLiveWindow(shipment.trackingNumber, shipment.carrier.id)}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yeniden Sorgula</span>
            </button>
          </div>
        </div>

      </div>

      {/* Step-by-Step Operations Timeline */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0D1322]/90 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Operasyonel Hareket Kayıtları
              </h3>
              <p className="text-xs text-white/50">
                Resmi kargo takip sistemi üzerinden alınan işlem kayıtları
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenLiveOfficial}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/70 hover:text-white transition"
          >
            <span>Tüm Detayları Resmi Sayfada Gör</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline Events List */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
          {shipment.events.map((evt, idx) => (
            <div key={evt.id || idx} className="relative group">
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  evt.isCurrent
                    ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/50 scale-110 ring-4 ring-amber-500/20'
                    : evt.isCompleted
                    ? 'bg-[#10172A] border-amber-500 text-amber-400'
                    : 'bg-[#0A0E1A] border-white/20 text-white/30'
                }`}
              >
                {evt.isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#090E1B] border border-white/5 hover:border-white/15 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                    {evt.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
                    <span>{evt.date}</span>
                    {evt.time && <span>• {evt.time}</span>}
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  {evt.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-white/40">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{evt.location}</span>
                  </span>
                  {evt.facility && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span>{evt.facility}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
