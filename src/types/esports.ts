export type ValorantRank =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'ascendant'
  | 'immortal'
  | 'radiant';

export type AgentRole = 'duelist' | 'initiator' | 'controller' | 'sentinel' | 'any';

export type GameMode = 'competitive' | 'unrated' | 'premier' | 'custom' | 'spikerush';

export type ServerRegion = 'istanbul' | 'frankfurt' | 'london' | 'paris' | 'warsaw' | 'madrid';

export type MicRequirement = 'required' | 'optional' | 'discord';

export interface Lobby {
  id: string;
  title: string;
  description: string;
  partyCode: string; // The in-game Valorant party code (e.g. VALO-7842)
  hostName: string;
  hostTag: string; // e.g. TR1
  hostRank: ValorantRank;
  hostAvatar?: string;
  ownerId?: string; // Client ID of the creator for management/deletion
  targetRankMin: ValorantRank;
  targetRankMax: ValorantRank;
  neededRoles: AgentRole[];
  mode: GameMode;
  server: ServerRegion;
  micRequirement: MicRequirement;
  currentMembers: number;
  maxMembers: number;
  createdAt: number;
  isFull: boolean;
  tags?: string[];
  discordInvite?: string;
}

export interface LobbyFilterState {
  searchQuery: string;
  rank: ValorantRank | 'all';
  role: AgentRole | 'all';
  mode: GameMode | 'all';
  server: ServerRegion | 'all';
  mic: MicRequirement | 'all';
  onlyOpen?: boolean;
}

export interface VideoClip {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorRank: ValorantRank;
  videoUrl: string; // Direct video URL or Blob URL
  thumbnailUrl?: string;
  agent: string;
  map: string;
  likes: number;
  isLiked?: boolean;
  views: number;
  commentsCount: number;
  createdAt: number;
  ownerId?: string;
  tags: string[];
}

export interface GuessRankScenario {
  id: string;
  title: string;
  videoUrl: string;
  correctRank: ValorantRank;
  playerStats: {
    kd: string;
    hsPercent: string;
    agent: string;
    map: string;
  };
  analysisNote: string;
}

export interface ProCrosshair {
  id: string;
  playerName: string;
  team: string;
  role: string;
  code: string;
  color: string;
  tags: string[];
}

export interface VctMatch {
  id: string;
  tournament: string;
  teamA: {
    name: string;
    tag: string;
    score?: number;
    logoColor: string;
  };
  teamB: {
    name: string;
    tag: string;
    score?: number;
    logoColor: string;
  };
  status: 'live' | 'upcoming' | 'finished';
  time: string;
  map?: string;
  streamUrl?: string;
}
