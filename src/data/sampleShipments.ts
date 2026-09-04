import { Shipment, CarrierId } from '../types/cargo';
import { CARRIERS, detectCarrierByCode } from './carriersData';

export const SAMPLE_SHIPMENTS: Record<string, Shipment> = {
  // 1. Yurtiçi Kargo - Kurye Dağıtımda (En popüler durum)
  '123456789012': {
    trackingNumber: '123456789012',
    carrier: CARRIERS.yurtici,
    status: 'kurye_dagitimda',
    statusTitle: 'Kargonuz Kurye Dağıtımında',
    statusDescription: 'Gönderiniz dağıtıcı kurye tarafından teslim edilmek üzere yola çıkmıştır. Bugün mesai bitimine kadar teslim edilecektir.',
    currentStep: 4,
    totalSteps: 5,
    sender: {
      nameMasked: 'H**** B***** TEKNOLOJİ A.Ş.',
      city: 'Kocaeli',
      branch: 'Gebze Lojistik Şubesi'
    },
    receiver: {
      nameMasked: 'E*** K***',
      city: 'İstanbul',
      district: 'Kadıköy',
      addressMasked: 'Caferağa Mah. Moda Cad. No: ** D: * Kadıköy / İstanbul',
      destinationBranch: 'Moda Şubesi'
    },
    packageInfo: {
      desi: 2.4,
      weightKg: 1.8,
      pieces: 1,
      packageType: 'Koli / Kutu',
      paymentType: 'Gönderici Ödemeli',
      declaredValue: '4.850 TL'
    },
    estimatedDelivery: {
      date: 'Bugün',
      timeWindow: '14:30 - 17:30 Arası',
      daysLeft: 0
    },
    courier: {
      name: 'Mehmet Yılmaz',
      phoneMasked: '0532 *** ** 41',
      vehiclePlateMasked: '34 ** 9214',
      vehicleType: 'Kamyonet (Panelvan)'
    },
    events: [
      {
        id: 'ev-1',
        date: 'Bugün',
        time: '09:45',
        location: 'İstanbul / Kadıköy',
        facility: 'Moda Dağıtım Şubesi',
        status: 'kurye_dagitimda',
        title: 'Kurye Dağıtıma Çıktı',
        description: 'Gönderiniz kuryemiz Mehmet Yılmaz zimmetine alınmış olup adrese dağıtıma çıkarılmıştır.',
        isCompleted: true,
        isCurrent: true
      },
      {
        id: 'ev-2',
        date: 'Bugün',
        time: '06:15',
        location: 'İstanbul / Kadıköy',
        facility: 'Moda Dağıtım Şubesi',
        status: 'dagitim_subesinde',
        title: 'Varış Şubesine Ulaştı',
        description: 'Gönderi transfer merkezinden varış şubesine teslim alınmıştır.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: 'ev-3',
        date: 'Dün',
        time: '23:30',
        location: 'Kocaeli / Çayırova',
        facility: 'Marmara Ana Transfer Merkezi',
        status: 'transfer_merkezinde',
        title: 'Transfer Merkezinden Sevk Edildi',
        description: 'Paket hat aracına yüklenmiş olup hedef dağıtım merkezine doğru yola çıkmıştır.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: 'ev-4',
        date: 'Dün',
        time: '18:10',
        location: 'Kocaeli / Gebze',
        facility: 'Gebze Şubesi',
        status: 'kabul_edildi',
        title: 'Kargo Kabul Edildi',
        description: 'Gönderici tarafından şubemize teslim edilen paket sistemimize işlenmiştir.',
        isCompleted: true,
        isCurrent: false
      }
    ],
    route: {
      origin: { city: 'Kocaeli', label: 'Çıkış: Gebze', xPercent: 32, yPercent: 42, completed: true },
      transferHubs: [
        { city: 'Çayırova', label: 'Marmara Transfer Hub', xPercent: 30, yPercent: 40, completed: true }
      ],
      destination: { city: 'İstanbul', label: 'Varış: Kadıköy', xPercent: 28, yPercent: 38, completed: false },
      progressPercent: 88
    },
    lastUpdated: Date.now()
  },

  // 2. PTT Kargo - Şehirlerarası Yolda
  'KP048291048TR': {
    trackingNumber: 'KP048291048TR',
    carrier: CARRIERS.ptt,
    status: 'yolda',
    statusTitle: 'Gönderi Transfer Aşamasında (Yolda)',
    statusDescription: 'Paketiniz Ankara Posta İşleme ve Dağıtım Merkezi üzerinden İzmir yönüne doğru yola çıkmıştır.',
    currentStep: 3,
    totalSteps: 5,
    sender: {
      nameMasked: 'B***** KİTABEVİ',
      city: 'Ankara',
      branch: 'Kızılay PTT Merkez Müdürlüğü'
    },
    receiver: {
      nameMasked: 'S***** D****',
      city: 'İzmir',
      district: 'Bornova',
      addressMasked: 'Kazımdirik Mah. Sanayi Cad. No: ** Bornova / İzmir',
      destinationBranch: 'Bornova PTT Dağıtım Merkezi'
    },
    packageInfo: {
      desi: 1.5,
      weightKg: 1.2,
      pieces: 1,
      packageType: 'Kitap / Doküman Paketi',
      paymentType: 'Gönderici Ödemeli'
    },
    estimatedDelivery: {
      date: 'Yarın (06 Eylül)',
      timeWindow: '10:00 - 16:00',
      daysLeft: 1
    },
    events: [
      {
        id: 'ev-ptt-1',
        date: 'Bugün',
        time: '04:20',
        location: 'Ankara',
        facility: 'Ankara PİDM (Posta İşleme ve Dağıtım)',
        status: 'yolda',
        title: 'Torba/Konteyner Sevk Edildi',
        description: 'Gönderi İzmir PİDM yönüne sevk edilen hat tırına yüklenmiştir.',
        isCompleted: true,
        isCurrent: true
      },
      {
        id: 'ev-ptt-2',
        date: 'Dün',
        time: '21:00',
        location: 'Ankara',
        facility: 'Ankara PİDM',
        status: 'transfer_merkezinde',
        title: 'Merkeze Giriş Yapıldı',
        description: 'Gönderi kabul merkezinden Ankara PİDM aktarma merkezine ulaştı.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: 'ev-ptt-3',
        date: 'Dün',
        time: '14:15',
        location: 'Ankara / Çankaya',
        facility: 'Kızılay PTT Şubesi',
        status: 'kabul_edildi',
        title: 'Gönderi Kabul Edildi',
        description: 'Gönderi şubede kabul edildi ve barkod numarası oluşturuldu.',
        isCompleted: true,
        isCurrent: false
      }
    ],
    route: {
      origin: { city: 'Ankara', label: 'Çıkış: Kızılay', xPercent: 48, yPercent: 45, completed: true },
      transferHubs: [
        { city: 'Ankara PİDM', label: 'Ana Posta Dağıtım', xPercent: 47, yPercent: 46, completed: true }
      ],
      destination: { city: 'İzmir', label: 'Varış: Bornova', xPercent: 18, yPercent: 55, completed: false },
      progressPercent: 55
    },
    lastUpdated: Date.now()
  },

  // 3. Trendyol Express - Teslim Edildi
  'TY9841294812': {
    trackingNumber: 'TY9841294812',
    carrier: CARRIERS.trendyol_express,
    status: 'teslim_edildi',
    statusTitle: 'Kargonuz Teslim Edildi',
    statusDescription: 'Gönderiniz güvenle alıcıya bizzat teslim edilmiştir.',
    currentStep: 5,
    totalSteps: 5,
    sender: {
      nameMasked: 'TRENDYOL SATICISI (MODA BUTİK)',
      city: 'İstanbul',
      branch: 'Samandıra Transfer Merkezi'
    },
    receiver: {
      nameMasked: 'A*** Y******',
      city: 'Bursa',
      district: 'Nilüfer',
      addressMasked: 'İhsaniye Mah. Barış Sok. No: ** Nilüfer / Bursa',
      destinationBranch: 'Bursa Nilüfer Dağıtım Şubesi'
    },
    packageInfo: {
      desi: 3.0,
      weightKg: 0.9,
      pieces: 1,
      packageType: 'Kıyafet Paketi',
      paymentType: 'Online Tahsilat'
    },
    estimatedDelivery: {
      date: 'Tamamlandı',
      timeWindow: 'Teslim Edildi',
      daysLeft: 0
    },
    deliveredAt: {
      date: 'Bugün',
      time: '13:42',
      recipientNameMasked: 'Kendisi (A*** Y******)'
    },
    courier: {
      name: 'Burak Demir',
      phoneMasked: '0544 *** ** 88',
      vehiclePlateMasked: '16 *** 44',
      vehicleType: 'Motosikletli Hızlı Kurye'
    },
    events: [
      {
        id: 'ev-ty-1',
        date: 'Bugün',
        time: '13:42',
        location: 'Bursa / Nilüfer',
        facility: 'Teslimat Adresi',
        status: 'teslim_edildi',
        title: 'Teslim Edildi',
        description: 'Paket SMS onay kodu ile alıcının kendisine teslim edilmiştir.',
        isCompleted: true,
        isCurrent: true
      },
      {
        id: 'ev-ty-2',
        date: 'Bugün',
        time: '10:15',
        location: 'Bursa / Nilüfer',
        facility: 'Nilüfer Dağıtım Merkezi',
        status: 'kurye_dagitimda',
        title: 'Kurye Dağıtıma Çıktı',
        description: 'Trendyol Express kuryesi paketi aldı, kapınıza doğru yola çıktı.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: 'ev-ty-3',
        date: 'Bugün',
        time: '05:30',
        location: 'Bursa',
        facility: 'Bursa Ana Transfer Merkezi',
        status: 'transfer_merkezinde',
        title: 'Transfer Merkezine Ulaştı',
        description: 'İstanbul Samandıra merkezinden Bursa merkezine ulaştı.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: 'ev-ty-4',
        date: 'Dün',
        time: '16:00',
        location: 'İstanbul',
        facility: 'Samandıra Toplama Merkezi',
        status: 'kabul_edildi',
        title: 'Paket Satıcıdan Alındı',
        description: 'Satıcı siparişi paketleyip kuryemize teslim etti.',
        isCompleted: true,
        isCurrent: false
      }
    ],
    route: {
      origin: { city: 'İstanbul', label: 'Çıkış: Samandıra', xPercent: 28, yPercent: 38, completed: true },
      transferHubs: [
        { city: 'Bursa Hub', label: 'Bursa Ana Dağıtım', xPercent: 27, yPercent: 44, completed: true }
      ],
      destination: { city: 'Bursa', label: 'Varış: Nilüfer', xPercent: 26, yPercent: 45, completed: true },
      progressPercent: 100
    },
    lastUpdated: Date.now()
  },

  // 4. Aras Kargo - Kabul Edildi
  '2489182948192': {
    trackingNumber: '2489182948192',
    carrier: CARRIERS.aras,
    status: 'kabul_edildi',
    statusTitle: 'Kargonuz Şubede Kabul Edildi',
    statusDescription: 'Kargonuz şubede barkodlanmış olup transfer merkezine yönlendirilmek üzere beklemektedir.',
    currentStep: 2,
    totalSteps: 5,
    sender: {
      nameMasked: 'D**** ELEKTRONİK LTD.',
      city: 'Antalya',
      branch: 'Muratpaşa Şubesi'
    },
    receiver: {
      nameMasked: 'M**** C**',
      city: 'Eskişehir',
      district: 'Tepebaşı',
      addressMasked: 'Eski Bağlar Mah. Üniversite Cad. No: ** Tepebaşı / Eskişehir',
      destinationBranch: 'Tepebaşı Şubesi'
    },
    packageInfo: {
      desi: 4.5,
      weightKg: 3.2,
      pieces: 2,
      packageType: 'Elektronik / Hassas Kutu',
      paymentType: 'Gönderici Ödemeli'
    },
    estimatedDelivery: {
      date: '07 Eylül Pazartesi',
      timeWindow: 'Gün İçinde',
      daysLeft: 2
    },
    events: [
      {
        id: 'ev-aras-1',
        date: 'Bugün',
        time: '15:20',
        location: 'Antalya / Muratpaşa',
        facility: 'Muratpaşa Şubesi',
        status: 'kabul_edildi',
        title: 'Kargo Girişi Yapıldı',
        description: 'Gönderiniz şubemizde kabul edildi ve akşam transfer tırına ayrıldı.',
        isCompleted: true,
        isCurrent: true
      },
      {
        id: 'ev-aras-2',
        date: 'Bugün',
        time: '11:00',
        location: 'Antalya',
        facility: 'Online İşlem',
        status: 'siparis_alindi',
        title: 'Kargo İrsaliyesi Oluşturuldu',
        description: 'Gönderici firma kargo barkodunu sistem üzerinden oluşturdu.',
        isCompleted: true,
        isCurrent: false
      }
    ],
    route: {
      origin: { city: 'Antalya', label: 'Çıkış: Muratpaşa', xPercent: 38, yPercent: 78, completed: true },
      transferHubs: [
        { city: 'Akdeniz Hub', label: 'Antalya Transfer Merkezi', xPercent: 37, yPercent: 74, completed: false }
      ],
      destination: { city: 'Eskişehir', label: 'Varış: Tepebaşı', xPercent: 35, yPercent: 47, completed: false },
      progressPercent: 25
    },
    lastUpdated: Date.now()
  }
};

/**
 * Generates an ultra-realistic 3rd party shipment tracking profile for ANY user-entered tracking code
 */
export function generateRealisticShipment(code: string, carrierOverride?: CarrierId): Shipment {
  const clean = code.trim().toUpperCase().replace(/[\s-]/g, '');

  // If we already have this exact mock shipment, return it
  if (SAMPLE_SHIPMENTS[clean]) {
    return SAMPLE_SHIPMENTS[clean];
  }

  const carrier = carrierOverride ? CARRIERS[carrierOverride] : detectCarrierByCode(clean);

  // Generate deterministic details based on tracking code characters
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  const CITIES = [
    { name: 'İstanbul', district: 'Kadıköy', branch: 'Rıhtım Şubesi', x: 28, y: 38 },
    { name: 'Ankara', district: 'Çankaya', branch: 'Kavaklıdere Şubesi', x: 48, y: 45 },
    { name: 'İzmir', district: 'Konak', branch: 'Alsancak Şubesi', x: 18, y: 55 },
    { name: 'Bursa', district: 'Nilüfer', branch: 'FSM Şubesi', x: 26, y: 44 },
    { name: 'Antalya', district: 'Muratpaşa', branch: 'Lara Şubesi', x: 38, y: 78 },
    { name: 'Adana', district: 'Seyhan', branch: 'Ziyapaşa Şubesi', x: 55, y: 72 },
    { name: 'Gaziantep', district: 'Şahinbey', branch: 'Gaziantep Merkez', x: 65, y: 72 },
    { name: 'Konya', district: 'Selçuklu', branch: 'Mevlana Şubesi', x: 42, y: 62 },
    { name: 'Kocaeli', district: 'İzmit', branch: 'Yahya Kaptan Şubesi', x: 31, y: 40 },
    { name: 'Samsun', district: 'Atakum', branch: 'Atakum Sahil Şubesi', x: 56, y: 28 },
    { name: 'Trabzon', district: 'Ortahisar', branch: 'Meydan Şubesi', x: 74, y: 30 },
    { name: 'Diyarbakır', district: 'Kayapınar', branch: 'Diclekent Şubesi', x: 78, y: 65 }
  ];

  const originCity = CITIES[posHash % CITIES.length];
  const destCity = CITIES[(posHash + 5) % CITIES.length];

  const STATUSES: Array<{
    status: Shipment['status'];
    step: number;
    title: string;
    desc: string;
    progress: number;
  }> = [
    {
      status: 'kurye_dagitimda',
      step: 4,
      title: 'Kargonuz Kurye Dağıtımında',
      desc: 'Paketiniz dağıtıcı kuryemiz tarafından teslim edilmek üzere çıkarılmıştır.',
      progress: 88
    },
    {
      status: 'yolda',
      step: 3,
      title: 'Şehirlerarası Transfer Aşamasında',
      desc: 'Paketiniz aktarma merkezleri arasında hat aracında sevk halindedir.',
      progress: 60
    },
    {
      status: 'teslim_edildi',
      step: 5,
      title: 'Kargonuz Başarıyla Teslim Edildi',
      desc: 'Paket alıcısına güvenle teslim edilmiştir.',
      progress: 100
    },
    {
      status: 'dagitim_subesinde',
      step: 4,
      title: 'Hedef Dağıtım Şubesinde',
      desc: 'Paket varış şubesine ulaşmış olup ilk dağıtım periyoduna hazırlanmaktadır.',
      progress: 75
    }
  ];

  const statusObj = STATUSES[posHash % STATUSES.length];

  const desi = Number((1 + (posHash % 40) / 10).toFixed(1));
  const weight = Number((0.5 + (posHash % 35) / 10).toFixed(1));

  const courierNames = ['Ahmet Kurt', 'Kemal Çetin', 'Ali Vural', 'Burak Yıldız', 'Emre Şahin'];
  const courierName = courierNames[posHash % courierNames.length];

  return {
    trackingNumber: clean,
    carrier,
    status: statusObj.status,
    statusTitle: statusObj.title,
    statusDescription: statusObj.desc,
    currentStep: statusObj.step,
    totalSteps: 5,
    sender: {
      nameMasked: 'T*** GÖNDERİ TEKNOLOJİLERİ A.Ş.',
      city: originCity.name,
      branch: `${originCity.name} ${originCity.branch}`
    },
    receiver: {
      nameMasked: 'A**** S*****',
      city: destCity.name,
      district: destCity.district,
      addressMasked: `${destCity.district} Mah. Atatürk Bulvarı No: ** ${destCity.name}`,
      destinationBranch: `${destCity.name} ${destCity.branch}`
    },
    packageInfo: {
      desi,
      weightKg: weight,
      pieces: (posHash % 2) + 1,
      packageType: 'Standart Paket',
      paymentType: 'Gönderici Ödemeli'
    },
    estimatedDelivery: {
      date: statusObj.status === 'teslim_edildi' ? 'Teslim Edildi' : 'Bugün / Yarın',
      timeWindow: 'Mesai Saatleri İçinde (09:00 - 18:00)',
      daysLeft: statusObj.status === 'teslim_edildi' ? 0 : 1
    },
    deliveredAt: statusObj.status === 'teslim_edildi' ? {
      date: 'Bugün',
      time: '14:20',
      recipientNameMasked: 'Alıcının Kendisi'
    } : undefined,
    courier: statusObj.status === 'kurye_dagitimda' ? {
      name: courierName,
      phoneMasked: `05${(30 + posHash % 20)} *** ** ${10 + (posHash % 89)}`,
      vehiclePlateMasked: `34 ** ${1000 + (posHash % 8999)}`,
      vehicleType: 'Dağıtım Kamyoneti'
    } : undefined,
    events: [
      {
        id: `ev-${posHash}-1`,
        date: 'Bugün',
        time: '11:45',
        location: `${destCity.name} / ${destCity.district}`,
        facility: `${destCity.name} ${destCity.branch}`,
        status: statusObj.status,
        title: statusObj.title,
        description: statusObj.desc,
        isCompleted: true,
        isCurrent: true
      },
      {
        id: `ev-${posHash}-2`,
        date: 'Bugün',
        time: '05:30',
        location: `${destCity.name}`,
        facility: `${destCity.name} Ana Aktarma Merkezi`,
        status: 'transfer_merkezinde',
        title: 'Aktarma Merkezine Ulaştı',
        description: 'Hat aracı aktarma merkezine giriş yaptı ve boşaltıldı.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: `ev-${posHash}-3`,
        date: 'Dün',
        time: '21:15',
        location: `${originCity.name}`,
        facility: `${originCity.name} Çıkış Transfer Merkezi`,
        status: 'yolda',
        title: 'Çıkış Merkezinden Sevk Edildi',
        description: 'Gönderi hat aracına yüklendi ve varış iline sevk edildi.',
        isCompleted: true,
        isCurrent: false
      },
      {
        id: `ev-${posHash}-4`,
        date: 'Dün',
        time: '16:00',
        location: `${originCity.name}`,
        facility: `${originCity.name} ${originCity.branch}`,
        status: 'kabul_edildi',
        title: 'Kargo Kabul Edildi',
        description: 'Paket şubemizde kabul edilmiş ve barkodlanmıştır.',
        isCompleted: true,
        isCurrent: false
      }
    ],
    route: {
      origin: {
        city: originCity.name,
        label: `Çıkış: ${originCity.district}`,
        xPercent: originCity.x,
        yPercent: originCity.y,
        completed: true
      },
      transferHubs: [
        {
          city: 'Ana Aktarma Hub',
          label: 'Merkezi Transfer Üssü',
          xPercent: Math.round((originCity.x + destCity.x) / 2),
          yPercent: Math.round((originCity.y + destCity.y) / 2),
          completed: statusObj.progress >= 50
        }
      ],
      destination: {
        city: destCity.name,
        label: `Varış: ${destCity.district}`,
        xPercent: destCity.x,
        yPercent: destCity.y,
        completed: statusObj.status === 'teslim_edildi'
      },
      progressPercent: statusObj.progress
    },
    lastUpdated: Date.now()
  };
}
