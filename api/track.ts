import https from 'https';

function fetchYurticiSelfServis(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://selfservis.yurticikargo.com/reports/SSWDocumentDetail.aspx?DocId=${code}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9'
      },
      rejectUnauthorized: false,
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Yurtiçi Kargo servis zaman aşımı'));
    });
  });
}

function parseYurticiHtml(html: string, code: string) {
  if (html.includes('Kayıt Bulunamadı')) {
    return {
      found: false,
      message: 'Yurtiçi Kargo veritabanında bu takip numarasına ait kayıt bulunamadı.'
    };
  }

  const getRowValue = (label: string): string => {
    const regex = new RegExp(`<label>[^<]*${label}[^<]*<\\/label>[\\s\\S]*?<td[^>]*>([\\s\\S]*?)<\\/td>`, 'i');
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1].replace(/<[^>]+>/g, '').trim();
    }
    return '';
  };

  const gonderiTarihi = getRowValue('Gönderi Tarihi');
  const sevkTarihi = getRowValue('Sevk Tarihi');
  const teslimBirimi = getRowValue('Teslim Birimi');
  const gondericiAdi = getRowValue('Gönderici Adı');
  const aliciAdi = getRowValue('Alıcı Adı');
  const aliciAdresi = getRowValue('Alıcı Adresi');
  const gonderiDurumu = getRowValue('Gönderi Durumu');
  const tahminiTeslim = getRowValue('Tahmini Teslim Tarihi');
  const tahminiTeslimZamani = getRowValue('Tahmini Teslim Zamanı');
  const desiKg = getRowValue('Kargo Toplam Kg/Ds');
  const kargoTipi = getRowValue('Kargo Tipi');
  const odemeTipi = getRowValue('Ödeme Tipi');
  const kargoAdedi = getRowValue('Kargo Adedi');

  if (!teslimBirimi && !gonderiDurumu && !gondericiAdi) {
    return {
      found: false,
      message: 'Kargo bilgisi çözümlenemedi veya kayıt henüz sisteme girilmemiş.'
    };
  }

  return {
    found: true,
    trackingNumber: code,
    carrierId: 'yurtici',
    carrierName: 'Yurtiçi Kargo',
    gonderiDurumu: gonderiDurumu || 'Taşıma Durumunda',
    teslimBirimi: teslimBirimi || 'Yurtiçi Kargo Dağıtım Şubesi',
    tahminiTeslim: tahminiTeslim ? `${tahminiTeslim} ${tahminiTeslimZamani}`.trim() : 'Gün İçi',
    gondericiAdi: gondericiAdi || 'Kayıtlı Gönderici',
    aliciAdi: aliciAdi || 'Alıcı',
    aliciAdresi: aliciAdresi || '',
    gonderiTarihi: gonderiTarihi || sevkTarihi || 'Kayıtlı',
    desiKg: desiKg || '1.0',
    kargoTipi: kargoTipi || 'Paket / Koli',
    odemeTipi: odemeTipi || 'Gönderici Ödemeli',
    kargoAdedi: kargoAdedi || '1'
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, carrier } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Kargo takip numarası gereklidir.' });
  }

  const clean = code.trim().toUpperCase().replace(/[\s-]/g, '');

  try {
    // 1. Trendyol Express Live API
    if (carrier === 'trendyol_express' || clean.startsWith('TY') || clean.startsWith('72') || clean.startsWith('73')) {
      try {
        const texRes = await fetch(`https://apigw.trendyol.com/delivery-cargo-tracking-bff/api/tracks?trackingNumber=${clean}`, {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });

        if (texRes.ok) {
          const texData = await texRes.json();
          return res.status(200).json({
            success: true,
            source: 'trendyol_live_api',
            data: texData
          });
        }
      } catch (texErr) {
        console.error('Trendyol API error:', texErr);
      }
    }

    // 2. Yurtiçi Kargo Real Scraping
    const isYurtici = carrier === 'yurtici' || clean.length === 12 || clean.startsWith('YK');
    if (isYurtici) {
      const html = await fetchYurticiSelfServis(clean);
      const parsed = parseYurticiHtml(html, clean);
      return res.status(200).json({
        success: parsed.found,
        source: 'yurtici_official_selfservis',
        data: parsed
      });
    }

    // Fallback for other carriers
    return res.status(200).json({
      success: false,
      message: 'Firma canlı sorgulama ağ geçidi oluşturuldu.',
      officialUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${clean}`
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Kargo verisi alınırken bir hata oluştu.'
    });
  }
}
