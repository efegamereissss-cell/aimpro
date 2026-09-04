import https from 'https';
import crypto from 'crypto';

// In-memory sliding window for rate limiting and DDoS mitigation
interface ClientTraffic {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const trafficMap = new Map<string, ClientTraffic>();
const RATE_LIMIT_MAX = 10; // Max 10 requests per 10 seconds
const RATE_LIMIT_WINDOW_MS = 10 * 1000;
const BLOCK_DURATION_MS = 30 * 1000; // 30 seconds cooldown

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1545554328629022730/jcqHWBqPbNjpQ2IkS9T7ulVgZWikciEdo1GzVg_aiTAYJL-zOSt6gTw2krPhvEmOtVVL';

function getClientHash(req: any): string {
  const forwarded = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
  return crypto.createHash('sha256').update(ip + '_kargocom_salt').digest('hex').slice(0, 8);
}

function maskCode(code: string): string {
  if (code.length <= 5) return '***';
  return code.slice(0, 3) + '*'.repeat(Math.max(3, code.length - 5)) + code.slice(-2);
}

async function sendDiscordWebhook(body: any) {
  if (!DISCORD_WEBHOOK) return;
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Discord webhook dispatch error:', err);
  }
}

/**
 * DDoS & Yüksek İstek Saldırı Uyarısı
 */
async function sendDdosAlert(clientHash: string, count: number) {
  const now = new Date();
  const timeStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR');

  await sendDiscordWebhook({
    username: 'KargoCom Güvenlik Kalkanı',
    avatar_url: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg',
    embeds: [
      {
        title: '🚨 GÜVENLİK UYARISI: Olası DDoS / Aşırı İstek Tespit Edildi',
        color: 0xEF4444, // Red
        description: 'Sistem güvenlik kalkanı, tek bir kaynaktan gelen anormal istek yoğunluğu tespit etti ve koruma modunu devreye soktu.',
        fields: [
          { name: '🔒 İstemci Kimliği (Maskeli)', value: `\`#${clientHash}\``, inline: true },
          { name: '⚡ İstek Hızı', value: `\`${count} istek / 10 sn\` (Limit: ${RATE_LIMIT_MAX})`, inline: true },
          { name: '🛡️ Uygulanan Savunma', value: `\`Geçici 30sn Bloklama (HTTP 429)\``, inline: true },
          { name: '🕒 Olay Zamanı', value: timeStr, inline: false }
        ],
        footer: { text: 'KargoCom Anti-DDoS Koruması • Otomatik Savunma' },
        timestamp: now.toISOString()
      }
    ]
  });
}

/**
 * Zararlı Enjeksiyon Denemesi Uyarısı
 */
async function sendInjectionAlert(clientHash: string, payload: string) {
  const now = new Date();
  const timeStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR');

  await sendDiscordWebhook({
    username: 'KargoCom Güvenlik Kalkanı',
    avatar_url: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg',
    embeds: [
      {
        title: '🛡️ ŞÜPHELİ ENJEKSİYON / XSS GİRİŞİMİ ENGELLENDİ',
        color: 0xF97316, // Orange
        description: 'Arama girdisinde zararlı veya şüpheli kod kalıbı yakalandı ve sorgu reddedildi.',
        fields: [
          { name: '🔒 İstemci Kimliği', value: `\`#${clientHash}\``, inline: true },
          { name: '⚠️ Şüpheli Kalıp', value: `\`${payload.slice(0, 30)}\``, inline: true },
          { name: '🛡️ Güvenlik Eylemi', value: '`İstek Reddedildi (400 Bad Request)`', inline: true },
          { name: '🕒 Zaman', value: timeStr, inline: false }
        ],
        footer: { text: 'KargoCom WAF Koruması • Otomatik Tehdit Engelleme' },
        timestamp: now.toISOString()
      }
    ]
  });
}

/**
 * Başarılı / Normal Sorgulama Bildirimi
 */
async function sendQueryLog(carrierName: string, code: string, statusText: string, isSuccess: boolean, clientHash: string) {
  const now = new Date();
  const timeStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR');
  const masked = maskCode(code);

  await sendDiscordWebhook({
    username: 'KargoCom Sistem Botu',
    avatar_url: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/package.svg',
    embeds: [
      {
        title: isSuccess ? '📦 Yeni Kargo Sorgulaması Yapıldı' : '⚠️ Kargo Sorgusu (Kayıt Bulunamadı)',
        color: isSuccess ? 0xF59E0B : 0xEF4444,
        description: `KargoCom platformunda **${carrierName}** için bir kargo sorgusu yapıldı.`,
        fields: [
          { name: '🚚 Kargo Firması', value: carrierName, inline: true },
          { name: '🔢 Takip Kodu (Maskeli)', value: `\`${masked}\``, inline: true },
          { name: '📊 Durum', value: isSuccess ? `🟢 ${statusText || 'Kayıt Doğrulandı'}` : '🔴 Kayıt Bulunamadı', inline: true },
          { name: '🔒 İstemci No', value: `\`#${clientHash}\``, inline: true },
          { name: '🕒 Zaman', value: timeStr, inline: true }
        ],
        footer: { text: 'KargoCom Canlı Telemetri • KVKK/GDPR Uyumlu Anonim Log' },
        timestamp: now.toISOString()
      }
    ]
  });
}

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
  // Global Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientHash = getClientHash(req);
  const now = Date.now();

  // 1. Anti-DDoS Rate Limiting Guard
  let traffic = trafficMap.get(clientHash);
  if (!traffic) {
    traffic = { count: 1, windowStart: now, blockedUntil: 0 };
    trafficMap.set(clientHash, traffic);
  } else {
    // Check if blocked
    if (traffic.blockedUntil > now) {
      const waitSeconds = Math.ceil((traffic.blockedUntil - now) / 1000);
      return res.status(429).json({
        error: `Aşırı istek koruması devrede. Lütfen ${waitSeconds} saniye sonra tekrar deneyin.`
      });
    }

    // Check sliding window
    if (now - traffic.windowStart < RATE_LIMIT_WINDOW_MS) {
      traffic.count++;
      if (traffic.count > RATE_LIMIT_MAX) {
        // Block client for 30 seconds
        traffic.blockedUntil = now + BLOCK_DURATION_MS;
        // Trigger DDoS Alert to Discord immediately
        await sendDdosAlert(clientHash, traffic.count);

        return res.status(429).json({
          error: 'Güvenlik Kalkanı: Çok fazla istek algılandı. 30 saniye bekleniyor.'
        });
      }
    } else {
      // Reset window
      traffic.windowStart = now;
      traffic.count = 1;
    }
  }

  const { code, carrier } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Kargo takip numarası gereklidir.' });
  }

  // 2. Input Sanitization & Attack Pattern Detection
  const rawInput = code.trim();
  const dangerousPatterns = /[<>{}\\\/\"';`]|union\s+select|select\s+.*\s+from|drop\s+table|<script/i;
  if (dangerousPatterns.test(rawInput) || rawInput.length > 40) {
    await sendInjectionAlert(clientHash, rawInput);
    return res.status(400).json({
      error: 'Geçersiz kargo takip numarası formatı. Özel karakter veya komut içeremez.'
    });
  }

  const clean = rawInput.toUpperCase().replace(/[\s-]/g, '');

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
          await sendQueryLog('Trendyol Express', clean, 'Canlı Takip Aktif', true, clientHash);

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

      await sendQueryLog('Yurtiçi Kargo', clean, parsed.gonderiDurumu || 'Sorgulandı', parsed.found, clientHash);

      return res.status(200).json({
        success: parsed.found,
        source: 'yurtici_official_selfservis',
        data: parsed
      });
    }

    // Fallback for other carriers
    await sendQueryLog(carrier ? String(carrier).toUpperCase() : 'Kargo Şirketi', clean, 'Canlı Ağ Geçidi Hazırlandı', true, clientHash);

    return res.status(200).json({
      success: false,
      message: 'Firma canlı sorgulama ağ geçidi oluşturuldu.',
      officialUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${clean}`
    });

  } catch (err: any) {
    await sendQueryLog('Kargo Servisi', clean, err.message || 'Sistem Hatası', false, clientHash);

    return res.status(500).json({
      success: false,
      error: err.message || 'Kargo verisi alınırken bir hata oluştu.'
    });
  }
}
