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
  ChevronRight
} from 'lucide-react';

interface ShipmentDetailsViewProps {
  shipment: Shipment;
}

const STEP_LABELS = [
  'Sipariş / Barkod',
  'Kabul Edildi',
  'Transfer / Yolda',
  'Kurye Dağıtımda',
  'Teslim Edildi'
];

export const ShipmentDetailsView: React.FC<ShipmentDetailsViewProps> = ({ shipment }) => {
  const copyTrackingNumber = useCargoStore(state => state.copyTrackingNumber);
  const saveShipment = useCargoStore(state => state.saveShipment);
  const removeSavedShipment = useCargoStore(state => state.removeSavedShipment);
  const savedShipments = useCargoStore(state => state.savedShipments);
  const toastMessage = useCargoStore(state => state.toastMessage);

  const [copied, setCopied] = useState(false);
  const isSaved = savedShipments.some(s => s.trackingNumber === shipment.trackingNumber);

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
      saveShipment(shipment, `${shipment.carrier.shortName} Kargosu`);
    }
  };

  const getStatusBadge = () => {
    switch (shipment.status) {
      case 'teslim_edildi':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'TESLİM EDİLDİ'
        };
      case 'kurye_dagitimda':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
          label: 'KURYE DAĞITIMINDA'
        };
      case 'yolda':
      case 'transfer_merkezinde':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400 animate-pulse',
          label: 'TRANSFER AŞAMASINDA (YOLDA)'
        };
      default:
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          dot: 'bg-blue-400',
          label: 'ŞUBEDE İŞLEMDE'
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-amber-500 text-black font-black text-xs md:text-sm shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            {/* Save to Tracking List */}
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm border transition-all ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                  <span>LİSTEME EKLENDİ</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 stroke-[2.5]" />
                  <span>TAKİP LİSTEME EKLE</span>
                </>
              )}
            </button>

            {/* Official Carrier Page */}
            <a
              href={`${shipment.carrier.officialTrackingUrl}${shipment.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs md:text-sm font-bold transition-colors"
            >
              <span>Resmi Sayfada Aç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-md ${
                      isPassed
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : 'bg-white/5 border border-white/10 text-white/40'
                    } ${isCurrent && shipment.status !== 'teslim_edildi' ? 'ring-4 ring-amber-500/25 animate-pulse' : ''}`}
                  >
                    {isPassed ? <Check className="w-5 h-5 stroke-[3]" /> : stepNum}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold leading-tight ${
                    isPassed ? 'text-white' : 'text-white/40'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Live Route Map */}
      <ShipmentRouteMap shipment={shipment} />

      {/* 3rd Party Deep Logistics Intel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Estimated Delivery / Delivered Time */}
        <div className="rounded-3xl bg-[#0E1424]/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
            {shipment.deliveredAt ? 'Teslim Edilme Zamanı' : 'Tahmini Teslimat'}
          </span>
          <div className="space-y-0.5">
            <div className="text-lg font-black text-white">
              {shipment.deliveredAt ? `${shipment.deliveredAt.date} - ${shipment.deliveredAt.time}` : shipment.estimatedDelivery.date}
            </div>
            <p className="text-xs text-white/60 font-medium">
              {shipment.deliveredAt ? `Teslim Alan: ${shipment.deliveredAt.recipientNameMasked}` : shipment.estimatedDelivery.timeWindow}
            </p>
          </div>
        </div>

        {/* Courier / Delivery Vehicle Intel */}
        <div className="rounded-3xl bg-[#0E1424]/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
            Kurye & Şube Yetkilisi
          </span>
          <div className="space-y-0.5">
            <div className="text-lg font-black text-white">
              {shipment.courier?.name || shipment.receiver.destinationBranch}
            </div>
            <p className="text-xs text-white/60 font-medium">
              {shipment.courier?.phoneMasked || `Şube İletişim: ${shipment.carrier.phone}`}
            </p>
          </div>
        </div>

        {/* Package Specs (Desi / Weight / Pieces) */}
        <div className="rounded-3xl bg-[#0E1424]/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
            Paket Desisi & Ağırlık
          </span>
          <div className="space-y-0.5">
            <div className="text-lg font-black text-white">
              {shipment.packageInfo.desi} Desi • {shipment.packageInfo.weightKg} kg
            </div>
            <p className="text-xs text-white/60 font-medium">
              {shipment.packageInfo.pieces} Parça • {shipment.packageInfo.packageType}
            </p>
          </div>
        </div>

        {/* Sender & Receiver Summary */}
        <div className="rounded-3xl bg-[#0E1424]/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
            Alıcı & Teslim Şubesi
          </span>
          <div className="space-y-0.5">
            <div className="text-lg font-black text-white truncate">
              {shipment.receiver.nameMasked}
            </div>
            <p className="text-xs text-white/60 font-medium truncate">
              {shipment.receiver.city} / {shipment.receiver.district}
            </p>
          </div>
        </div>

      </div>

      {/* Step-by-Step Events History Timeline */}
      <div className="rounded-3xl bg-[#0B0F1C]/95 border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Kargo Hareket Geçmişi (Tüm Kayıtlar)
              </h3>
              <p className="text-xs text-white/50 font-medium">
                Paketin geçtiği tüm şube, aktarma ve dağıtım kayıtları
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl bg-white/5 text-white/60 font-mono text-xs font-bold">
            {shipment.events.length} Olay Kaydedildi
          </span>
        </div>

        {/* Timeline List */}
        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {shipment.events.map((event, idx) => {
            const isFirst = idx === 0;
            return (
              <div key={event.id} className="relative flex items-start gap-4 sm:gap-6 pl-1 group">
                {/* Node Dot */}
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                  isFirst
                    ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                    : 'bg-[#0E1424] border-white/30 text-white/40'
                }`}>
                  {isFirst ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-white/40" />}
                </div>

                {/* Event Content Card */}
                <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-[#121A30]/90 border-amber-500/40 shadow-lg'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <span className="font-black text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors">
                      {event.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400/90 sm:text-right">
                      {event.date} • {event.time}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-white/40" />
                      <span>{event.facility}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white/40" />
                      <span>{event.location}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
