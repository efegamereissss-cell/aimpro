import React, { useState } from 'react';
import { CARRIER_LIST } from '../../data/carriersData';
import { CarrierId, CarrierInfo } from '../../types/cargo';
import { useCargoStore } from '../../store/useCargoStore';
import { esportsSound } from '../../utils/soundEffects';
import {
  Building2,
  Phone,
  ExternalLink,
  Search,
  Check,
  Copy,
  Clock,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface CarriersDirectoryViewProps {
  onSelectCarrierForTracking: (carrierId: CarrierId) => void;
}

const CARRIER_EXTRA_INFO: Record<string, {
  hours: string;
  weekendDelivery: boolean;
  coverage: string;
  description: string;
}> = {
  yurtici: {
    hours: 'Hafta içi 09:00 - 18:00, Cmt 09:00 - 13:00',
    weekendDelivery: true,
    coverage: 'Tüm Türkiye + 220 Ülke (DPD Ağı)',
    description: 'Türkiye\'nin ilk özel kargo şirketi, 1000\'den fazla şube ve geniş VIP dağıtım ağı.'
  },
  aras: {
    hours: 'Hafta içi 08:30 - 18:00, Cmt 08:30 - 13:00',
    weekendDelivery: true,
    coverage: 'Türkiye geneli ve Kıbrıs',
    description: 'Geniş transfer merkezleri ve otomasyon sistemleriyle günlük yüz binlerce teslimat.'
  },
  mng: {
    hours: 'Hafta içi 08:30 - 18:00, Cmt 08:30 - 14:00',
    weekendDelivery: true,
    coverage: 'Tüm Türkiye ve DHL eCommerce Global',
    description: 'DHL eCommerce ortaklığı ile hem yurt içi hem yurt dışı e-ticaret lojistiğinde lider.'
  },
  ptt: {
    hours: 'Hafta içi 08:30 - 17:30, Nöbetçi Merkezler Cmt açık',
    weekendDelivery: false,
    coverage: '81 il ve en ücra köylere kadar tam erişim',
    description: 'Devlet güvencesiyle Türkiye\'nin en köklü ve en yaygın teslimat kurumu.'
  },
  trendyol_express: {
    hours: 'Haftanın 7 Günü 08:00 - 21:00 (Nöbetçi Kurye)',
    weekendDelivery: true,
    coverage: '81 İl E-Ticaret Ağı',
    description: 'Trendyol ekosistemine özel, randevulu ve canlı konum takipli yeni nesil kargo.'
  },
  hepsijet: {
    hours: 'Haftanın 7 Günü 09:00 - 22:00 (Akşam Teslimat)',
    weekendDelivery: true,
    coverage: '81 İl Merkez ve İlçeler',
    description: 'Bugün teslimat ve randevulu saat aralığı teslimatında öncü teknolojik kargo.'
  },
  surat: {
    hours: 'Hafta içi 09:00 - 18:00, Cmt 09:00 - 13:00',
    weekendDelivery: true,
    coverage: 'Türkiye geneli 700+ şube',
    description: 'Tasarruf ve KOBİ dostu tarifeleri ile uygun fiyatlı kargo çözümleri.'
  },
  kolay_gelsin: {
    hours: 'Hafta içi 09:00 - 21:00, Cmt 09:00 - 18:00',
    weekendDelivery: true,
    coverage: 'Büyükşehirler ve E-Ticaret Merkezleri',
    description: 'Canlı harita kurye takibi ve teslimat saati seçimi sunan premium kargo.'
  },
  sendeo: {
    hours: 'Hafta içi 09:00 - 18:00, Cmt 09:00 - 14:00',
    weekendDelivery: true,
    coverage: 'Koç Topluluğu Dağıtım Ağı',
    description: 'Aygaz istasyonları ve yerel esnaf teslimat noktaları ile 7/24 teslim alma imkanı.'
  },
  dhl: {
    hours: 'Hafta içi 08:30 - 18:00',
    weekendDelivery: false,
    coverage: '220+ Ülke ve Bölge',
    description: 'Dünya çapında ekspres hava kargo ve gümrükleme hizmetlerinde küresel lider.'
  },
  ups: {
    hours: 'Hafta içi 09:00 - 18:00',
    weekendDelivery: false,
    coverage: '220+ Ülke ve Türkiye Sanayi Merkezleri',
    description: 'Global lojistik devi, yüksek değerli gönderiler ve uluslararası taşımacılık.'
  },
  fedex: {
    hours: 'Hafta içi 08:30 - 18:00',
    weekendDelivery: false,
    coverage: 'Uluslararası Ekspres Ağı',
    description: 'Zaman duyarlı uluslararası gönderiler için öncü hava kargo taşımacılığı.'
  }
};

export const CarriersDirectoryView: React.FC<CarriersDirectoryViewProps> = ({
  onSelectCarrierForTracking
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const copyTrackingNumber = useCargoStore(state => state.copyTrackingNumber);

  const filteredCarriers = CARRIER_LIST.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.shortName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.tagline.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCopyPhone = (carrierId: string, phone: string) => {
    navigator.clipboard?.writeText(phone);
    esportsSound.playCodeCopied();
    setCopiedPhone(carrierId);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const handleSelectCarrier = (carrierId: CarrierId) => {
    esportsSound.playClick();
    onSelectCarrierForTracking(carrierId);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111728] via-[#161D32] to-[#111728] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>TÜRKİYE VE KÜRESEL KARGO REHBERİ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kargo Şirketleri İletişim & Takip Rehberi
            </h1>
            <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
              Türkiye\'nin ve dünyanın önde gelen 12 kargo şirketinin müşteri hizmetleri çağrı merkezi numaraları, çalışma saatleri, hafta sonu dağıtım durumları ve resmi takip bağlantıları.
            </p>
          </div>

          {/* Search box within directory */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Firma ara (Örn: Yurtiçi, PTT)..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-[#0A0E1A]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Grid of Carriers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCarriers.map(carrier => {
          const extra = CARRIER_EXTRA_INFO[carrier.id] || {
            hours: 'Hafta içi 09:00 - 18:00',
            weekendDelivery: false,
            coverage: 'Türkiye Geneli',
            description: carrier.tagline
          };
          const isPhoneCopied = copiedPhone === carrier.id;

          return (
            <div
              key={carrier.id}
              className="group relative rounded-3xl p-6 bg-[#0E1526]/90 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg"
                      style={{ backgroundColor: carrier.logoColor }}
                    >
                      {carrier.shortName.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition">
                        {carrier.name}
                      </h3>
                      <p className="text-xs text-white/50 italic">
                        "{carrier.tagline}"
                      </p>
                    </div>
                  </div>

                  {/* Weekend badge */}
                  {extra.weekendDelivery && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Cmt Dağıtım Var
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-white/70 leading-relaxed">
                  {extra.description}
                </p>

                {/* Operational Details List */}
                <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px]">{extra.hours}</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/60">
                    <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-[11px] truncate">Hizmet Ağı: {extra.coverage}</span>
                  </div>
                </div>

                {/* Call center card */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <a
                      href={`tel:${carrier.phone.replace(/[\s-]/g, '')}`}
                      className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 transition"
                      title="Hemen Ara"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">
                        Çağrı Merkezi
                      </span>
                      <a
                        href={`tel:${carrier.phone.replace(/[\s-]/g, '')}`}
                        className="text-xs font-mono font-bold text-white hover:text-amber-400 transition"
                      >
                        {carrier.phone}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyPhone(carrier.id, carrier.phone)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                    title="Numarayı Kopyala"
                  >
                    {isPhoneCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-5 mt-4 border-t border-white/5 flex items-center gap-2">
                <button
                  onClick={() => handleSelectCarrier(carrier.id)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Bu Firmayla Sorgula</span>
                </button>

                <a
                  href={carrier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition flex items-center justify-center"
                  title="Resmi Web Sitesine Git"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
