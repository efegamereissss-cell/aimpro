import { VideoClip } from '../types/esports';

export const INITIAL_CLIPS: VideoClip[] = [
  {
    id: 'clip-1',
    title: '1v4 İmkansız Bind Clutch (A Sitesi Tek Mermi Ace)',
    description: 'Son round 11-12 iken gelen hayatımın clutch anı. Jett dash ile spike kurulduktan sonra temizledim.',
    authorName: 'cNed_Vibes',
    authorRank: 'immortal',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    agent: 'Jett',
    map: 'Bind',
    likes: 342,
    views: 2840,
    commentsCount: 28,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    tags: ['Clutch', '1v4', 'Ace', 'Immortal']
  },
  {
    id: 'clip-2',
    title: 'Omen One-Way Smoke ile 5 Saniyede B Sitesi Temizliği',
    description: 'Ascent B main attığım gizli one-way dumanına yürüyen 4 kişiyi tek tek avladım.',
    authorName: 'ShadowKing',
    authorRank: 'ascendant',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    agent: 'Omen',
    map: 'Ascent',
    likes: 198,
    views: 1450,
    commentsCount: 14,
    createdAt: Date.now() - 1000 * 60 * 60 * 14,
    tags: ['Omen', 'Lineup', 'Ascent']
  },
  {
    id: 'clip-3',
    title: 'Sova Dartı Sayesinde Duvar Arkası Odin Ace!',
    description: 'Sunset B sitesinde Sova double shock dart + Odin taraması ile raunt başladıktan 7 saniye sonra round bitti.',
    authorName: 'DartMaster_TR',
    authorRank: 'diamond',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    agent: 'Sova',
    map: 'Sunset',
    likes: 512,
    views: 4920,
    commentsCount: 63,
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
    tags: ['Sova', 'Odin', 'Komik', 'Ace']
  },
  {
    id: 'clip-4',
    title: 'Iso Kalkanı + Ulti ile Radyant Lobisinde Maç Çeviren Hareket',
    description: 'Lotus C sitesinde 1v2 kaldığımda önce ulti ile birini çektim, çıkışta kalkanla kafadan mermi yemeyip kazandım.',
    authorName: 'IsoMain01',
    authorRank: 'radiant',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    agent: 'Iso',
    map: 'Lotus',
    likes: 840,
    views: 8900,
    commentsCount: 110,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    tags: ['Radiant', 'Iso', 'Clutch']
  }
];
