import Peer, { DataConnection } from 'peerjs';
import { NetworkPacket, RemotePlayerState, NetworkMessageType } from '../../types/multiplayer';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { soundEngine } from '../../audio/SoundEngine';

class MultiplayerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private heartbeatInterval: number | null = null;
  private broadcastInterval: number | null = null;
  private isDestroyed = false;
  private currentRoom: string = 'aimpro-global-dm';

  public init() {
    if (typeof window === 'undefined') return;

    try {
      this.broadcastChannel = new BroadcastChannel('aimpro-mp-network');
      this.broadcastChannel.onmessage = (event: MessageEvent<NetworkPacket>) => {
        this.handleIncomingPacket(event.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  public connect(roomCode: string = 'aimpro-global-dm') {
    this.disconnect();
    this.isDestroyed = false;
    this.currentRoom = roomCode.trim().toLowerCase();

    const store = useMultiplayerStore.getState();
    store.setConnecting(true, null);

    const localId = store.localId;
    const peerId = `aimpro_${this.currentRoom}_${localId}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', () => {
        console.log('[Multiplayer] Connected with Peer ID:', peerId);
        store.setConnected(true, this.currentRoom);

        // Connect to room host or try host connection
        this.tryConnectToHost();

        // Broadcast join packet
        this.sendPacket('PLAYER_JOIN', {
          id: localId,
          nickname: store.nickname,
          color: store.color,
          hatType: store.hatType,
          position: [0, 1.62, 0],
          health: 100
        });

        // Start periodic sync loops
        this.startHeartbeat();
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('[Multiplayer] PeerJS warning/error:', err.type, err.message);
        store.setConnecting(false, null);
        store.setConnected(true, this.currentRoom); // Keep local broadcast channel fully operational
      });

      this.peer.on('disconnected', () => {
        console.log('[Multiplayer] Disconnected from peer broker.');
      });
    } catch (err: any) {
      console.warn('[Multiplayer] PeerJS initialization fallback:', err);
      store.setConnected(true, this.currentRoom);
      this.startHeartbeat();
    }
  }

  private tryConnectToHost() {
    if (!this.peer || this.peer.destroyed) return;
    const hostPeerId = `aimpro_${this.currentRoom}_host`;
    if (this.peer.id !== hostPeerId && !this.connections.has(hostPeerId)) {
      try {
        const conn = this.peer.connect(hostPeerId, { reliable: true });
        this.setupConnection(conn);
      } catch (e) {}
    }
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log('[Multiplayer] Data connection opened with:', conn.peer);

      // Send local state immediately
      const store = useMultiplayerStore.getState();
      conn.send({
        type: 'PLAYER_JOIN',
        senderId: store.localId,
        payload: {
          id: store.localId,
          nickname: store.nickname,
          color: store.color,
          hatType: store.hatType,
          health: store.health,
          maxHealth: store.maxHealth,
          isAlive: store.isAlive,
          kills: store.kills,
          deaths: store.deaths
        },
        timestamp: Date.now()
      });
    });

    conn.on('data', (data: any) => {
      this.handleIncomingPacket(data as NetworkPacket);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });

    conn.on('error', () => {
      this.connections.delete(conn.peer);
    });
  }

  public sendPacket(type: NetworkMessageType, payload: any) {
    const store = useMultiplayerStore.getState();
    const packet: NetworkPacket = {
      type,
      senderId: store.localId,
      payload,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel (Zero-latency instant multi-tab sync)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (e) {}
    }

    // 2. WebRTC P2P Mesh
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(packet);
        } catch (e) {}
      }
    });
  }

  public broadcastLocalState(
    position: [number, number, number],
    rotation: [number, number, number],
    velocity: [number, number, number],
    activeWeapon: 'vandal' | 'sheriff' | 'knife',
    isJumping: boolean
  ) {
    const store = useMultiplayerStore.getState();
    if (!store.isMultiplayerActive) return;

    this.sendPacket('PLAYER_STATE', {
      id: store.localId,
      nickname: store.nickname,
      color: store.color,
      hatType: store.hatType,
      position,
      rotation,
      velocity,
      activeWeapon,
      health: store.health,
      maxHealth: store.maxHealth,
      isAlive: store.isAlive,
      isJumping,
      kills: store.kills,
      deaths: store.deaths,
      ping: 15
    });
  }

  public broadcastShoot(
    origin: [number, number, number],
    direction: [number, number, number],
    weapon: 'vandal' | 'sheriff' | 'knife'
  ) {
    this.sendPacket('PLAYER_SHOOT', {
      origin,
      direction,
      weapon
    });
  }

  public sendDamage(
    targetId: string,
    damage: number,
    isHeadshot: boolean,
    weapon: 'vandal' | 'sheriff' | 'knife'
  ) {
    const store = useMultiplayerStore.getState();
    this.sendPacket('PLAYER_DAMAGE', {
      attackerId: store.localId,
      attackerName: store.nickname,
      attackerColor: store.color,
      targetId,
      damage,
      isHeadshot,
      weapon
    });
  }

  private handleIncomingPacket(packet: NetworkPacket) {
    const store = useMultiplayerStore.getState();
    if (!packet || !packet.senderId || packet.senderId === store.localId) return;

    switch (packet.type) {
      case 'PLAYER_JOIN': {
        const p = packet.payload;
        // Register newly joined player
        store.updateRemotePlayer({
          id: p.id,
          nickname: p.nickname || 'Player',
          color: p.color || '#00f0ff',
          hatType: p.hatType || 'triangle',
          position: p.position || [0, 1.62, 0],
          rotation: [0, 0, 0],
          velocity: [0, 0, 0],
          activeWeapon: 'vandal',
          health: p.health || 100,
          maxHealth: 100,
          isAlive: true,
          isFiring: false,
          isJumping: false,
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          ping: 15,
          lastUpdated: Date.now()
        });

        // Respond with our own state so the new player immediately sees us
        this.sendPacket('PLAYER_STATE', {
          id: store.localId,
          nickname: store.nickname,
          color: store.color,
          hatType: store.hatType,
          health: store.health,
          maxHealth: store.maxHealth,
          isAlive: store.isAlive,
          kills: store.kills,
          deaths: store.deaths
        });

        // Connect PeerJS connection if not already connected
        if (this.peer && !this.peer.destroyed) {
          const targetPeerId = `aimpro_${this.currentRoom}_${p.id}`;
          if (!this.connections.has(targetPeerId)) {
            try {
              const conn = this.peer.connect(targetPeerId, { reliable: true });
              this.setupConnection(conn);
            } catch (e) {}
          }
        }
        break;
      }

      case 'PLAYER_STATE': {
        const p = packet.payload as RemotePlayerState;
        store.updateRemotePlayer({
          ...p,
          position: p.position || [0, 1.62, 0],
          rotation: p.rotation || [0, 0, 0],
          velocity: p.velocity || [0, 0, 0],
          activeWeapon: p.activeWeapon || 'vandal',
          health: p.health !== undefined ? p.health : 100,
          maxHealth: 100,
          isAlive: p.isAlive !== undefined ? p.isAlive : true,
          lastUpdated: Date.now()
        });
        break;
      }

      case 'PLAYER_SHOOT': {
        const { weapon } = packet.payload;
        if (weapon === 'knife') {
          soundEngine.playKnifeSlash();
        } else if (weapon === 'sheriff') {
          soundEngine.playGunshot('pistol');
        } else {
          soundEngine.playGunshot('rifle');
        }
        break;
      }

      case 'PLAYER_DAMAGE': {
        const { attackerId, attackerName, attackerColor, targetId, damage, isHeadshot, weapon } = packet.payload;
        if (targetId === store.localId && store.isAlive) {
          const { isDead } = store.updateLocalHealth(damage);

          if (isDead) {
            // Broadcast death event
            this.sendPacket('PLAYER_DEATH', {
              killerId: attackerId,
              killerName: attackerName,
              killerColor: attackerColor,
              victimId: store.localId,
              victimName: store.nickname,
              victimColor: store.color,
              weapon,
              isHeadshot
            });

            // Add to killfeed
            store.addKillfeedEntry({
              killerId: attackerId,
              killerName: attackerName,
              killerColor: attackerColor,
              victimId: store.localId,
              victimName: store.nickname,
              victimColor: store.color,
              weapon,
              isHeadshot
            });
          }
        }
        break;
      }

      case 'PLAYER_DEATH': {
        const { killerId, killerName, killerColor, victimId, victimName, victimColor, weapon, isHeadshot } = packet.payload;

        if (killerId === store.localId) {
          store.incrementLocalKill();
          soundEngine.playKillBannerSound(store.streak);
        }

        store.addKillfeedEntry({
          killerId,
          killerName,
          killerColor,
          victimId,
          victimName,
          victimColor,
          weapon,
          isHeadshot
        });
        break;
      }

      case 'PLAYER_LEAVE': {
        store.removeRemotePlayer(packet.payload.id);
        break;
      }
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.broadcastInterval) clearInterval(this.broadcastInterval);

    // 1. Periodic State Beacon (every 100ms) to ensure continuous synchronization
    this.broadcastInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      if (!store.isMultiplayerActive) return;

      this.sendPacket('PLAYER_STATE', {
        id: store.localId,
        nickname: store.nickname,
        color: store.color,
        hatType: store.hatType,
        health: store.health,
        maxHealth: store.maxHealth,
        isAlive: store.isAlive,
        kills: store.kills,
        deaths: store.deaths
      });
    }, 120);

    // 2. Inactive peer cleanup (after 6s of no signal)
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      const now = Date.now();

      Object.values(store.remotePlayers).forEach((player) => {
        if (now - player.lastUpdated > 6000) {
          store.removeRemotePlayer(player.id);
        }
      });
    }, 1500);
  }

  public disconnect() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }

    const store = useMultiplayerStore.getState();
    if (store.isConnected) {
      this.sendPacket('PLAYER_LEAVE', { id: store.localId });
    }

    this.connections.forEach((conn) => conn.close());
    this.connections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    store.setConnected(false);
    store.clearRemotePlayers();
  }
}

export const multiplayerService = new MultiplayerService();
if (typeof window !== 'undefined') {
  multiplayerService.init();
}
