import React, { useState } from 'react';
import { useCargoStore } from '../../store/useCargoStore';
import { esportsSound } from '../../utils/soundEffects';
import {
  BookmarkCheck,
  Package,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface SavedShipmentsViewProps {
  onSelectShipment: () => void;
}

export const SavedShipmentsView: React.FC<SavedShipmentsViewProps> = ({ onSelectShipment }) => {
  const savedShipments = useCargoStore(state => state.savedShipments);
  const removeSavedShipment = useCargoStore(state => state.removeSavedShipment);
  const updateSavedLabel = useCargoStore(state => state.updateSavedLabel);
  const copyTrackingNumber = useCargoStore(state => state.copyTrackingNumber);
  const trackShipment = useCargoStore(state => state.trackShipment);

  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [newLabelText, setNewLabelText] = useState('');

  const handleStartEdit = (code: string, currentLabel?: string) => {
    setEditingCode(code);
    setNewLabelText(currentLabel || 'Kargom');
  };

  const handleSaveLabel = (code: string) => {
    if (newLabelText.trim()) {
      updateSavedLabel(code, newLabelText.trim());
    }
    setEditingCode(null);
  };

  const handleOpenShipment = (code: string) => {
    trackShipment(code);
    onSelectShipment();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111728] via-[#1A182E] to-[#111728] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>KAYITLI PAKETLERİM • TAKİP LİSTESİ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Takip Ettiğiniz <span className="text-amber-400">Tüm Kargolar</span>
            </h1>
            <p className="text-xs md:text-sm text-white/60 font-medium">
              Sık baktığınız gönderilerinizi etiketleyerek kaydedin; sayfa yenilense de listesinde kalır.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-right shrink-0">
            <span className="text-[10px] text-white/40 font-bold uppercase block">Kayıtlı Kargo</span>
            <span className="font-mono font-black text-xl text-amber-400">{savedShipments.length} Paket</span>
          </div>
        </div>
      </div>

      {/* Shipments Grid or Empty State */}
      {savedShipments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {savedShipments.map(shipment => {
            const isDelivered = shipment.status === 'teslim_edildi';

            return (
              <div
                key={shipment.trackingNumber}
                className="group relative rounded-3xl bg-[#0E1424]/90 hover:bg-[#121A30] border border-white/10 hover:border-amber-500/50 p-5 md:p-6 transition-all duration-300 flex flex-col justify-between shadow-xl backdrop-blur-xl"
              >
                <div>
                  {/* Carrier & Status Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white border border-white/20 shadow-sm"
                      style={{ backgroundColor: shipment.carrier.logoColor }}
                    >
                      {shipment.carrier.shortName}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                      isDelivered
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}>
                      {isDelivered ? 'TESLİM EDİLDİ' : shipment.statusTitle}
                    </span>
                  </div>

                  {/* Custom Label or Name */}
                  <div className="mb-2">
                    {editingCode === shipment.trackingNumber ? (
                      <div className="flex items-center gap-1.5 my-1">
                        <input
                          type="text"
                          value={newLabelText}
                          onChange={(e) => setNewLabelText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel(shipment.trackingNumber)}
                          className="px-2 py-1 rounded-lg bg-black/60 border border-amber-500 text-white text-xs font-bold w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveLabel(shipment.trackingNumber)}
                          className="p-1 rounded-lg bg-amber-500 text-black font-black text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {shipment.customLabel || `${shipment.carrier.shortName} Kargom`}
                        </h3>
                        <button
                          onClick={() => handleStartEdit(shipment.trackingNumber, shipment.customLabel)}
                          title="İsmi Düzenle"
                          className="p-1 rounded-md text-white/30 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-white/60">
                      <span>No:</span>
                      <span className="text-white font-bold">{shipment.trackingNumber}</span>
                      <button
                        onClick={() => copyTrackingNumber(shipment.trackingNumber)}
                        title="Kopyala"
                        className="p-0.5 hover:text-amber-400 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="my-3 space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${shipment.route.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>{shipment.route.origin.city}</span>
                      <span>%{shipment.route.progressPercent}</span>
                      <span>{shipment.route.destination.city}</span>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="pt-2.5 border-t border-white/10 space-y-1 text-xs text-white/70">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Varış Adresi:</span>
                      <span className="font-bold text-white">{shipment.receiver.city} / {shipment.receiver.district}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Teslimat:</span>
                      <span className="font-bold text-amber-300">{shipment.estimatedDelivery.date}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => removeSavedShipment(shipment.trackingNumber)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                    title="Listeden Çıkar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenShipment(shipment.trackingNumber)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>DETAYLI GÖR</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-6 rounded-3xl bg-[#0F1422]/60 border border-white/10 shadow-2xl space-y-4 max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight">
              Takip Listeniz Henüz Boş
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Kargo takip numarası sorguladıktan sonra "Takip Listeme Ekle" butonuna basarak kargolarınızı buraya kaydedebilirsiniz.
            </p>
          </div>
          <button
            onClick={onSelectShipment}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg transition-all"
          >
            <span>Kargo Sorgulamaya Git</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      )}

    </div>
  );
};
