import crypto from 'crypto';

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1545554328629022730/jcqHWBqPbNjpQ2IkS9T7ulVgZWikciEdo1GzVg_aiTAYJL-zOSt6gTw2krPhvEmOtVVL';

function getClientHash(req: any): string {
  const forwarded = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
  return crypto.createHash('sha256').update(ip + '_kargocom_visit').digest('hex').slice(0, 8);
}

// Simple cooldown so the same visitor doesn't flood Discord on page refresh
const recentVisits = new Map<string, number>();

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientHash = getClientHash(req);
  const now = Date.now();
  const lastVisit = recentVisits.get(clientHash) || 0;

  // 5 seconds cooldown per client hash to prevent double firing while being real-time
  if (now - lastVisit < 5 * 1000) {
    return res.status(200).json({ ok: true, cached: true });
  }
  recentVisits.set(clientHash, now);

  const { device, browser, path } = req.body || {};
  const timeStr = new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR');

  if (DISCORD_WEBHOOK) {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'KargoCom Giriş Takip',
          avatar_url: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg',
          embeds: [
            {
              title: '🌐 Siteye Yeni Ziyaretçi Girişi Yapıldı',
              color: 0x3B82F6, // Blue
              description: 'KargoCom platformuna yeni bir kullanıcı oturumu bağlandı.',
              fields: [
                { name: '📱 Cihaz', value: device || 'Masaüstü / Bilinmiyor', inline: true },
                { name: '🌐 Tarayıcı', value: browser || 'Web Tarayıcı', inline: true },
                { name: '📍 Sayfa', value: path || 'Ana Sayfa', inline: true },
                { name: '🔒 Oturum No', value: `\`#${clientHash}\``, inline: true },
                { name: '🕒 Giriş Zamanı', value: timeStr, inline: false }
              ],
              footer: { text: 'KargoCom Ziyaretçi Telemetrisi • KVKK/GDPR Uyumlu Anonim Veri' },
              timestamp: new Date().toISOString()
            }
          ]
        })
      });
    } catch (e) {
      console.error('Visit webhook error:', e);
    }
  }

  return res.status(200).json({ ok: true });
}
