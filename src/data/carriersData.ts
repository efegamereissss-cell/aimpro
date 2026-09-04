import { CarrierId, CarrierInfo } from '../types/cargo';

export const CARRIERS: Record<CarrierId, CarrierInfo> = {
  yurtici: {
    id: 'yurtici',
    name: 'Yurtiçi Kargo',
    shortName: 'Yurtiçi',
    tagline: 'Söz Verdiğimiz Gibi',
    logoColor: '#F26522',
    accentColor: '#1A2B4C',
    phone: '444 99 99',
    website: 'https://www.yurticikargo.com',
    officialTrackingUrl: 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=',
    patterns: ['^\\d{12}$', '^YK[0-9A-Z]{9,}$']
  },
  aras: {
    id: 'aras',
    name: 'Aras Kargo',
    shortName: 'Aras',
    tagline: 'Önem Taşır',
    logoColor: '#005CAB',
    accentColor: '#E30613',
    phone: '444 25 52',
    website: 'https://www.araskargo.com.tr',
    officialTrackingUrl: 'https://www.araskargo.com.tr/kargo-takip?code=',
    patterns: ['^2\\d{12}$', '^\\d{13}$']
  },
  mng: {
    id: 'mng',
    name: 'MNG Kargo',
    shortName: 'MNG',
    tagline: 'Dünyaya Taşıyoruz',
    logoColor: '#002B49',
    accentColor: '#0083CA',
    phone: '0850 222 06 06',
    website: 'https://www.mngkargo.com.tr',
    officialTrackingUrl: 'https://www.mngkargo.com.tr/gonderitakip?takipno=',
    patterns: ['^\\d{9,11}$']
  },
  ptt: {
    id: 'ptt',
    name: 'PTT Kargo',
    shortName: 'PTT',
    tagline: 'Geçmişten Geleceğe',
    logoColor: '#FFCC00',
    accentColor: '#112233',
    phone: '444 1 788',
    website: 'https://gonderitakip.ptt.gov.tr',
    officialTrackingUrl: 'https://gonderitakip.ptt.gov.tr/?barkod=',
    patterns: ['^KP\\d{11}$', '^[A-Z]{2}\\d{9}[A-Z]{2}$', '^\\d{13}$']
  },
  trendyol_express: {
    id: 'trendyol_express',
    name: 'Trendyol Express',
    shortName: 'TEX',
    tagline: 'Hızlı ve Güvenilir Teslimat',
    logoColor: '#F27A1A',
    accentColor: '#0B0E14',
    phone: '0850 759 15 15',
    website: 'https://kargotakip.trendyol.com',
    officialTrackingUrl: 'https://kargotakip.trendyol.com/?trackingNumber=',
    patterns: ['^TY\\d{8,}$', '^72\\d{8,}$', '^73\\d{8,}$']
  },
  hepsijet: {
    id: 'hepsijet',
    name: 'HepsiJET',
    shortName: 'HepsiJET',
    tagline: 'Jet Hızında Teslimat',
    logoColor: '#FF6000',
    accentColor: '#00C389',
    phone: '0850 558 0 333',
    website: 'https://hepsijet.com',
    officialTrackingUrl: 'https://hepsijet.com/gonderi-takibi?takipNo=',
    patterns: ['^HJ\\d{8,}$', '^60\\d{8,}$', '^61\\d{8,}$']
  },
  surat: {
    id: 'surat',
    name: 'Sürat Kargo',
    shortName: 'Sürat',
    tagline: 'Zamanında, Güvenle',
    logoColor: '#ED1C24',
    accentColor: '#1B2C4E',
    phone: '0850 202 0 202',
    website: 'https://www.suratkargo.com.tr',
    officialTrackingUrl: 'https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=',
    patterns: ['^\\d{12,14}$', '^SK\\d{9,}$']
  },
  kolay_gelsin: {
    id: 'kolay_gelsin',
    name: 'Kolay Gelsin',
    shortName: 'Kolay Gelsin',
    tagline: 'Alışverişin En Kolay Hali',
    logoColor: '#FFDD00',
    accentColor: '#1F1F1F',
    phone: '0850 955 0 955',
    website: 'https://www.kolaygelsin.com',
    officialTrackingUrl: 'https://www.kolaygelsin.com/takip?takipNo=',
    patterns: ['^KG\\d{8,}$', '^\\d{10}$']
  },
  sendeo: {
    id: 'sendeo',
    name: 'Sendeo Kargo',
    shortName: 'Sendeo',
    tagline: 'İstediğin Zaman, İstediğin Yerde',
    logoColor: '#00D18F',
    accentColor: '#171E28',
    phone: '444 7 548',
    website: 'https://sendeo.com.tr',
    officialTrackingUrl: 'https://sendeo.com.tr/kargo-takip?kargoTakipNo=',
    patterns: ['^\\d{10}$', '^SN\\d{8,}$']
  },
  dhl: {
    id: 'dhl',
    name: 'DHL Express',
    shortName: 'DHL',
    tagline: 'Excellence. Simply delivered.',
    logoColor: '#FFCC00',
    accentColor: '#D40511',
    phone: '444 00 40',
    website: 'https://www.dhl.com/tr-tr',
    officialTrackingUrl: 'https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=',
    patterns: ['^\\d{10}$', '^JJD\\d{16,}$']
  },
  ups: {
    id: 'ups',
    name: 'UPS Express',
    shortName: 'UPS',
    tagline: 'Moving our world forward by delivering what matters.',
    logoColor: '#351C15',
    accentColor: '#FFB500',
    phone: '0850 255 00 66',
    website: 'https://www.ups.com.tr',
    officialTrackingUrl: 'https://www.ups.com/track?loc=tr_TR&tracknum=',
    patterns: ['^1Z[0-9A-Z]{16}$', '^\\d{9,12}$']
  },
  fedex: {
    id: 'fedex',
    name: 'FedEx International',
    shortName: 'FedEx',
    tagline: 'Where now meets next.',
    logoColor: '#4D148C',
    accentColor: '#FF6600',
    phone: '444 93 39',
    website: 'https://www.fedex.com/tr-tr',
    officialTrackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=',
    patterns: ['^\\d{12}$', '^\\d{15}$']
  }
};

export const CARRIER_LIST = Object.values(CARRIERS);

/**
 * Intelligent Carrier Auto-Detection based on tracking code format
 */
export function detectCarrierByCode(code: string): CarrierInfo {
  const clean = code.trim().toUpperCase().replace(/[\s-]/g, '');

  if (clean.startsWith('KP') || clean.endsWith('TR')) {
    return CARRIERS.ptt;
  }
  if (clean.startsWith('TY') || clean.startsWith('72') || clean.startsWith('73')) {
    return CARRIERS.trendyol_express;
  }
  if (clean.startsWith('HJ') || clean.startsWith('60') || clean.startsWith('61')) {
    return CARRIERS.hepsijet;
  }
  if (clean.startsWith('1Z')) {
    return CARRIERS.ups;
  }
  if (clean.startsWith('KG')) {
    return CARRIERS.kolay_gelsin;
  }
  if (clean.startsWith('YK')) {
    return CARRIERS.yurtici;
  }
  if (clean.startsWith('SK')) {
    return CARRIERS.surat;
  }
  if (clean.startsWith('2') && clean.length === 13) {
    return CARRIERS.aras;
  }

  // Length heuristics
  if (clean.length === 12) {
    return CARRIERS.yurtici;
  }
  if (clean.length === 13) {
    return CARRIERS.aras;
  }
  if (clean.length >= 9 && clean.length <= 11) {
    return CARRIERS.mng;
  }

  // Default fallback
  return CARRIERS.yurtici;
}
