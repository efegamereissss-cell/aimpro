export type HatType = 'none' | 'triangle' | 'crown' | 'horns' | 'pyramid' | 'cube';

export interface PlayerCustomization {
  nickname: string;
  color: string;
  hatType: HatType;
}

export interface RemotePlayerState {
  id: string;
  nickname: string;
  color: string;
  hatType: HatType;
  position: [number, number, number];
  rotation: [number, number, number]; // [pitch, yaw, roll]
  velocity: [number, number, number];
  activeWeapon: 'vandal' | 'sheriff' | 'knife';
  health: number;
  maxHealth: number;
  isAlive: boolean;
  isFiring: boolean;
  isJumping: boolean;
  kills: number;
  deaths: number;
  ping: number;
  lastUpdated: number;
}

export interface KillfeedEntry {
  id: string;
  killerId: string;
  killerName: string;
  killerColor: string;
  victimId: string;
  victimName: string;
  victimColor: string;
  weapon: 'vandal' | 'sheriff' | 'knife';
  isHeadshot: boolean;
  timestamp: number;
}

export type NetworkMessageType =
  | 'PLAYER_STATE'
  | 'PLAYER_SHOOT'
  | 'PLAYER_DAMAGE'
  | 'PLAYER_DEATH'
  | 'PLAYER_RESPAWN'
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE'
  | 'CHAT_MESSAGE';

export interface NetworkPacket {
  type: NetworkMessageType;
  senderId: string;
  payload: any;
  timestamp: number;
}
