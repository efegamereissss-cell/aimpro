export type CarrierId =
  | 'yurtici'
  | 'aras'
  | 'mng'
  | 'ptt'
  | 'trendyol_express'
  | 'hepsijet'
  | 'surat'
  | 'kolay_gelsin'
  | 'sendeo'
  | 'dhl'
  | 'ups'
  | 'fedex';

export type ShipmentStatus =
  | 'siparis_alindi'
  | 'kabul_edildi'
  | 'transfer_merkezinde'
  | 'yolda'
  | 'dagitim_subesinde'
  | 'kurye_dagitimda'
  | 'teslim_edildi'
  | 'teslim_edilemedi';

export interface CarrierInfo {
  id: CarrierId;
  name: string;
  shortName: string;
  tagline: string;
  logoColor: string;
  accentColor: string;
  phone: string;
  website: string;
  officialTrackingUrl: string;
  patterns: string[];
}

export interface ShipmentEvent {
  id: string;
  date: string;
  time: string;
  location: string;
  facility: string;
  status: ShipmentStatus;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface PackageDetails {
  desi: number;
  weightKg: number;
  pieces: number;
  packageType: string;
  paymentType: string; // 'Gönderici Ödemeli' | 'Alıcı Ödemeli'
  declaredValue?: string;
}

export interface RouteStop {
  city: string;
  label: string;
  xPercent: number; // 0-100 for SVG map
  yPercent: number; // 0-100 for SVG map
  completed: boolean;
}

export interface Shipment {
  trackingNumber: string;
  carrier: CarrierInfo;
  status: ShipmentStatus;
  statusTitle: string;
  statusDescription: string;
  currentStep: number; // 1 to 5
  totalSteps: number;

  sender: {
    nameMasked: string;
    city: string;
    branch: string;
  };

  receiver: {
    nameMasked: string;
    city: string;
    district: string;
    addressMasked: string;
    destinationBranch: string;
  };

  packageInfo: PackageDetails;

  estimatedDelivery: {
    date: string;
    timeWindow: string;
    daysLeft: number;
  };

  deliveredAt?: {
    date: string;
    time: string;
    recipientNameMasked: string;
  };

  courier?: {
    name: string;
    phoneMasked: string;
    vehiclePlateMasked: string;
    vehicleType: string;
  };

  events: ShipmentEvent[];

  route: {
    origin: RouteStop;
    transferHubs: RouteStop[];
    destination: RouteStop;
    progressPercent: number;
  };

  customLabel?: string;
  savedAt?: number;
  lastUpdated: number;
}
