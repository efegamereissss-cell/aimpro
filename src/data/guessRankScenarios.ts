import { GuessRankScenario } from '../types/esports';

export const GUESS_RANK_SCENARIOS: GuessRankScenario[] = [
  {
    id: 'guess-1',
    title: 'B Long Yürüyen Reyna (Spray Kontrolü & Aim)',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    correctRank: 'gold',
    playerStats: {
      kd: '1.14',
      hsPercent: '19%',
      agent: 'Reyna',
      map: 'Bind'
    },
    analysisNote: 'Crosshair placement orta seviyede (Gold seviyesi), ancak köşeleri kontrol etmeden koşturarak çıkması ve yetenek kullanım zamanlaması tipik bir Altın 2 oyuncusu.'
  },
  {
    id: 'guess-2',
    title: 'Haven Garajda 1v3 Şok Dart & Phantom Flick',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    correctRank: 'immortal',
    playerStats: {
      kd: '1.42',
      hsPercent: '34%',
      agent: 'Sova',
      map: 'Haven'
    },
    analysisNote: 'Mükemmel mikro-flick düzeltmesi, mini harita takibi ve duvar arkası ses kasma yeteneği tartışmasız Ölümsüzlük 2 seviyesini kanıtlıyor.'
  },
  {
    id: 'guess-3',
    title: 'Ascent Midte Yere Bakarak Yürüyen Brimstone',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    correctRank: 'bronze',
    playerStats: {
      kd: '0.78',
      hsPercent: '9%',
      agent: 'Brimstone',
      map: 'Ascent'
    },
    analysisNote: 'Crosshair sürekli yer seviyesinde, dumanları raunt başladıktan 40 saniye sonra rastgele atıyor ve mermi sekerken yürümeye devam ediyor: Bronz 1.'
  },
  {
    id: 'guess-4',
    title: 'Split A Heaven Jett Operatör Flick & Bıçak Hareketi',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    correctRank: 'radiant',
    playerStats: {
      kd: '1.68',
      hsPercent: '38%',
      agent: 'Jett',
      map: 'Split'
    },
    analysisNote: '0.12 saniyelik insanüstü tepki süresi, kusursuz açı avantajı (peekers advantage) kullanımı ve hata yapmayan pozisyonlanma: Gerçek bir Radyant!'
  }
];
