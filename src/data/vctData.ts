import { VctMatch } from '../types/esports';

export const VCT_MATCHES: VctMatch[] = [
  {
    id: 'match-1',
    tournament: 'VCT EMEA Stage 2 - Büyük Türk Derbisi',
    teamA: {
      name: 'FUT Esports',
      tag: 'FUT',
      score: 1,
      logoColor: '#ff2d55'
    },
    teamB: {
      name: 'BBL Esports',
      tag: 'BBL',
      score: 1,
      logoColor: '#f59e0b'
    },
    status: 'live',
    time: 'CANLI YAYINDA (3. Harita: Bind)',
    map: 'Bind',
    streamUrl: 'https://twitch.tv/valorant_turkiye'
  },
  {
    id: 'match-2',
    tournament: 'VCT Champions Seul - Çeyrek Final',
    teamA: {
      name: 'Fnatic',
      tag: 'FNC',
      logoColor: '#ff7700'
    },
    teamB: {
      name: 'Sentinels',
      tag: 'SEN',
      logoColor: '#ef4444'
    },
    status: 'upcoming',
    time: 'Bugün 20:00',
    map: 'BO3 Formatı'
  },
  {
    id: 'match-3',
    tournament: 'VCT EMEA Stage 2 - Üst Grup',
    teamA: {
      name: 'Team Heretics',
      tag: 'TH',
      logoColor: '#eab308'
    },
    teamB: {
      name: 'Natus Vincere',
      tag: 'NAVI',
      logoColor: '#eab308'
    },
    status: 'upcoming',
    time: 'Yarın 18:00',
    map: 'BO3 Formatı'
  },
  {
    id: 'match-4',
    tournament: 'VCT Masters Madrid - Final',
    teamA: {
      name: 'Sentinels',
      tag: 'SEN',
      score: 3,
      logoColor: '#ef4444'
    },
    teamB: {
      name: 'Gen.G Esports',
      tag: 'GEN',
      score: 2,
      logoColor: '#aa7c11'
    },
    status: 'finished',
    time: 'ŞAMPİYON: SENTINELS',
    map: 'Icebox (13-8)'
  }
];
