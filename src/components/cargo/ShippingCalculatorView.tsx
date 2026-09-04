import React, { useState, useMemo } from 'react';
import { esportsSound } from '../../utils/soundEffects';
import { CARRIERS } from '../../data/carriersData';
import {
  Calculator,
  Box,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Check,
  RotateCcw,
  Zap,
  ShieldCheck,
  Building2,
  ExternalLink,
  Copy
} from 'lucide-react';

interface PresetItem {
  name: string;
  width: number;
  length: number;
  height: number;
  weight: number;
  iconText: string;
}

const PRESET_ITEMS: PresetItem[] = [
  { name: 'Küçük Kutu (Telefon / Takı)', width: 20, length: 15, height: 10, weight: 0.5, iconText: '📱' },
  { name: 'Ayakkabı Kutusu', width: 35, length: 25, height: 15, weight: 1.2, iconText: '👟' },
  { name: 'Tekstil / Giysi Paketi', width: 30, length: 25, height: 6, weight: 0.7, iconText: '👕' },
  { name: 'Laptop / Bilgisayar Kutusu', width: 45, length: 35, height: 10, weight: 2.8, iconText: '💻' },
  { name: 'Büyük Ev / Taşınma Kolisi', width: 60, length: 45, height: 40, weight: 8.5, iconText: '📦' },
];

type DistanceZone = 'local' | 'near' | 'mid' | 'far';

const DISTANCE_ZONES: { id: DistanceZone; label: string; range: string; multiplier: number }[] = [
  { id: 'local', label: 'Şehir İçi', range: '0 - 50 km', multiplier: 1.0 },
  { id: 'near', label: 'Yakın Hat', range: '50 - 300 km', multiplier: 1.18 },
  { id: 'mid', label: 'Orta Hat', range: '300 - 600 km', multiplier: 1.35 },
  { id: 'far', label: 'Uzun Hat', range: '600+ km', multiplier: 1.55 },
];

interface CarrierPricingModel {
  carrierKey: keyof typeof CARRIERS;
  basePrice: number;
  pricePerDesi: number;
  discountBadge?: string;
  speed: string;
  reliability: number; // out of 5
}

const CARRIER_PRICING: CarrierPricingModel[] = [
  { carrierKey: 'ptt', basePrice: 65, pricePerDesi: 8.5, discountBadge: 'En Ekonomik', speed: '2-4 İş Günü', reliability: 4.4 },
  { carrierKey: 'trendyol_express', basePrice: 75, pricePerDesi: 9.2, discountBadge: 'E-Ticaret Favorisi', speed: '1-2 İş Günü', reliability: 4.8 },
  { carrierKey: 'hepsijet', basePrice: 78, pricePerDesi: 9.5, discountBadge: 'Hızlı Teslimat', speed: '1-2 İş Günü', reliability: 4.7 },
  { carrierKey: 'surat', basePrice: 79, pricePerDesi: 10.0, speed: '2-3 İş Günü', reliability: 4.2 },
  { carrierKey: 'aras', basePrice: 88, pricePerDesi: 11.2, speed: '1-2 İş Günü', reliability: 4.6 },
  { carrierKey: 'mng', basePrice: 89, pricePerDesi: 11.5, speed: '1-2 İş Günü', reliability: 4.5 },
  { carrierKey: 'yurtici', basePrice: 96, pricePerDesi: 12.0, discountBadge: 'En Hızlı & Yaygın', speed: '24 Saatte Teslimat', reliability: 4.9 },
  { carrierKey: 'kolay_gelsin', basePrice: 85, pricePerDesi: 10.5, discountBadge: 'Canlı Kurye Takip', speed: '1-2 İş Günü', reliability: 4.8 },
];

export const ShippingCalculatorView: React.FC = () => {
  const [width, setWidth] = useState<number>(30);
  const [length, setLength] = useState<number>(20);
  const [height, setHeight] = useState<number>(15);
  const [weight, setWeight] = useState<number>(1.5);
  const [distanceZone, setDistanceZone] = useState<DistanceZone>('near');
  const [hasInsurance, setHasInsurance] = useState<boolean>(false);
  const [hasCod, setHasCod] = useState<boolean>(false);
  const [hasExpress, setHasExpress] = useState<boolean>(false);
  const [copiedPrice, setCopiedPrice] = useState<string | null>(null);

  // Desi Calculation Formula: (En x Boy x Yükseklik) / 3000
  const desi = useMemo(() => {
    const val = (width * length * height) / 3000;
    return Math.round(val * 100) / 100;
  }, [width, length, height]);

  // Billable weight is the greater of Desi or Actual Weight
  const billableWeight = useMemo(() => {
    return Math.max(desi, weight);
  }, [desi, weight]);

  const activeZone = DISTANCE_ZONES.find(z => z.id === distanceZone) || DISTANCE_ZONES[1];

  // Calculate carrier quotes
  const quotes = useMemo(() => {
    return CARRIER_PRICING.map(carrierModel => {
      const carrier = CARRIERS[carrierModel.carrierKey];
      let price = (carrierModel.basePrice + (billableWeight * carrierModel.pricePerDesi)) * activeZone.multiplier;

      if (hasInsurance) price += 25;
      if (hasCod) price += 35;
      if (hasExpress) price += 50;

      return {
        carrier,
        model: carrierModel,
        estimatedPrice: Math.round(price),
        billableWeight
      };
    }).sort((a, b) => a.estimatedPrice - b.estimatedPrice);
  }, [billableWeight, activeZone, hasInsurance, hasCod, hasExpress]);

  const handleApplyPreset = (preset: PresetItem) => {
    esportsSound.playClick();
    setWidth(preset.width);
    setLength(preset.length);
    setHeight(preset.height);
    setWeight(preset.weight);
  };

  const handleReset = () => {
    esportsSound.playClick();
    setWidth(30);
    setLength(20);
    setHeight(15);
    setWeight(1.5);
    setDistanceZone('near');
    setHasInsurance(false);
    setHasCod(false);
    setHasExpress(false);
  };

  const handleCopyQuote = (carrierName: string, price: number) => {
    const text = `${carrierName} Tahmini Kargo Ücreti: ${price} TL (Desi: ${desi.toFixed(2)}, Ağırlık: ${weight} kg, Mesafe: ${activeZone.label})`;
    navigator.clipboard?.writeText(text);
    esportsSound.playCodeCopied();
    setCopiedPrice(carrierName);
    setTimeout(() => setCopiedPrice(null), 2500);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111728] via-[#1F1735] to-[#111728] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>DESİ & KARGO ÜCRETİ KARŞILAŞTIRMA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kargo Desi ve Ücret Hesaplayıcı
            </h1>
            <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
              Paket ölçülerinizi ve ağırlığınızı girin. Resmi Türk Standartları Formülü <span className="text-amber-400 font-mono font-bold">(En × Boy × Yükseklik / 3000)</span> ile desinizi hesaplayıp tüm kargo firmalarının güncel yaklaşık tarifelerini anında kıyaslayın.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Row */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white/70">
            Hızlı Hazır Paket Ölçüleri
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESET_ITEMS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-2xl bg-[#0D1322] border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition text-left group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{preset.iconText}</span>
                <span className="text-[10px] font-mono text-white/40 group-hover:text-amber-400 transition font-bold">
                  {preset.weight} kg
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                  {preset.name}
                </p>
                <p className="text-[10px] font-mono text-white/50 mt-0.5">
                  {preset.width}x{preset.length}x{preset.height} cm
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Calculation Inputs & Desi Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0F1626]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white/90 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>Paket Boyutları ve Ağırlık Bilgisi</span>
            </h3>

            {/* 3 Dimensions */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* En */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 flex justify-between">
                  <span>En</span>
                  <span className="text-amber-400 font-mono">{width} cm</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={width}
                  onChange={e => setWidth(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500 transition text-sm"
                />
              </div>

              {/* Boy */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 flex justify-between">
                  <span>Boy</span>
                  <span className="text-amber-400 font-mono">{length} cm</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={length}
                  onChange={e => setLength(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500 transition text-sm"
                />
              </div>

              {/* Yükseklik */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 flex justify-between">
                  <span>Yükseklik</span>
                  <span className="text-amber-400 font-mono">{height} cm</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={height}
                  onChange={e => setHeight(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-500 transition text-sm"
                />
              </div>
            </div>

            {/* Fiili Ağırlık */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fiili Ağırlık (Gerçek Kilo)</span>
                </label>
                <span className="text-xs font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {weight.toFixed(1)} KG
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="flex-1 accent-amber-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={weight}
                  onChange={e => setWeight(Math.max(0.1, Number(e.target.value) || 0.1))}
                  className="w-24 bg-[#0A0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-right text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Mesafe / Hat Seçimi */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-white/70">Mesafe / Gönderi Hattı</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DISTANCE_ZONES.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => {
                      esportsSound.playClick();
                      setDistanceZone(zone.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      distanceZone === zone.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-[#0A0E1A] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-black">{zone.label}</p>
                    <p className="text-[10px] font-mono text-white/40">{zone.range}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ek Hizmetler */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-white/70">Ek Kargo Hizmetleri</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    esportsSound.playClick();
                    setHasCod(!hasCod);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                    hasCod
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-[#0A0E1A] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <span>Kapıda Ödeme</span>
                  <span className="text-[10px] font-mono font-bold">+₺35</span>
                </button>

                <button
                  onClick={() => {
                    esportsSound.playClick();
                    setHasInsurance(!hasInsurance);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                    hasInsurance
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#0A0E1A] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <span>Sigortalı Paket</span>
                  <span className="text-[10px] font-mono font-bold">+₺25</span>
                </button>

                <button
                  onClick={() => {
                    esportsSound.playClick();
                    setHasExpress(!hasExpress);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                    hasExpress
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-[#0A0E1A] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <span>Hızlı / VIP Kargo</span>
                  <span className="text-[10px] font-mono font-bold">+₺50</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Summary & Official Desi Calculation Explanation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121B2F] to-[#0D1322] border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Hesaplama Özeti
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-black border border-amber-500/30">
                Resmi IATA / TSE Kuralı
              </span>
            </div>

            {/* Big Numbers */}
            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center">
                <p className="text-xs font-bold text-white/50 mb-1">Hesaplanan Desi</p>
                <p className="text-3xl font-black font-mono text-amber-400">
                  {desi.toFixed(2)}
                </p>
                <p className="text-[10px] text-white/40 mt-1 font-mono">
                  ({width}×{length}×{height} / 3000)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center">
                <p className="text-xs font-bold text-white/50 mb-1">Fiili Ağırlık</p>
                <p className="text-3xl font-black font-mono text-blue-400">
                  {weight.toFixed(2)} <span className="text-sm text-white/60">kg</span>
                </p>
                <p className="text-[10px] text-white/40 mt-1 font-mono">
                  Terazi Ölçümü
                </p>
              </div>
            </div>

            {/* Billable Weight Alert */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-black text-amber-300">
                <Info className="w-4 h-4 shrink-0" />
                <span>Faturalandırılacak Kargo Birimi:</span>
                <span className="font-mono text-white text-sm bg-amber-500/30 px-2 py-0.5 rounded font-black">
                  {billableWeight.toFixed(2)} {desi > weight ? 'DESİ' : 'KG'}
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {desi > weight
                  ? 'Paketinizin hacmi ağırlığına göre daha yüksek olduğundan kargo firmaları DESİ üzerinden ücretlendirme yapacaktır.'
                  : 'Paketinizin ağırlığı hacmine göre daha yüksek olduğundan kargo firmaları AĞIRLIK (KG) üzerinden ücretlendirme yapacaktır.'}
              </p>
            </div>

            {/* Educational Info box */}
            <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-white/50 space-y-1.5 leading-relaxed">
              <p className="font-bold text-white/80">Desi Nasıl Hesaplanır?</p>
              <p>
                Kargo taşımacılığında yer kaplama oranı maliyet oluşturur. 1 desi = 3000 cm³ hacme denk gelir. Formül: <code className="text-amber-400 bg-white/5 px-1 py-0.5 rounded">En (cm) × Boy (cm) × Yükseklik (cm) / 3000</code>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Carrier Price Comparison Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Kargo Firmaları Tahmini Fiyat Kıyaslama</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {billableWeight.toFixed(1)} birim ({activeZone.label} - {activeZone.range}) için yaklaşık genel gönderici fiyatlarıdır.
            </p>
          </div>
          <span className="text-xs text-white/40 hidden sm:inline-block">
            * Kampanya ve kurumsal anlaşmalara göre değişebilir
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quotes.map((item, index) => {
            const isBestValue = index === 0;
            const isCopied = copiedPrice === item.carrier.name;

            return (
              <div
                key={item.carrier.id}
                className={`relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isBestValue
                    ? 'bg-gradient-to-b from-[#18233C] to-[#0F1728] border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-[#0E1526]/90 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  {item.model.discountBadge ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isBestValue
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.model.discountBadge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-white/40 uppercase">Standart Tarife</span>
                  )}

                  <span className="text-[10px] font-mono text-white/50">
                    ★ {item.model.reliability} / 5.0
                  </span>
                </div>

                {/* Carrier Name & Info */}
                <div className="space-y-1 mb-4">
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.carrier.logoColor }}
                    />
                    <span>{item.carrier.name}</span>
                  </h4>
                  <p className="text-xs text-white/50 font-medium">
                    Tahmini Teslimat: <span className="text-white/80 font-bold">{item.model.speed}</span>
                  </p>
                </div>

                {/* Price Display */}
                <div className="my-3 p-3 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-0.5">
                    Tahmini Tutar
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                      ~₺{item.estimatedPrice}
                    </span>
                    <span className="text-xs text-white/40 font-bold">KDV Dahil</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleCopyQuote(item.carrier.name, item.estimatedPrice)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/60" />
                        <span>Fiyatı Kopyala</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.carrier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition"
                    title="Resmi Web Sitesine Git"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
