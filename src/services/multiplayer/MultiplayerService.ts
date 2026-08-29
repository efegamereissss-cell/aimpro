import Peer, { DataConnection } from 'peerjs';
import { NetworkPacket, RemotePlayerState, NetworkMessageType } from '../../types/multiplayer';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { soundEngine } from '../../audio/SoundEngine';

class MultiplayerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private heartbeatInterval: number | null = null;
  private isDestroyed = false;

  public init() {
    if (typeof window === 'undefined') return;

    // Set up local BroadcastChannel for zero-latency multi-tab testing
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

    const store = useMultiplayerStore.getState();
    store.setConnecting(true, null);

    const localId = store.localId;
    const peerId = `aimpro_${roomCode}_${localId}`;

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
        console.log('[Multiplayer] Connected to PeerJS with ID:', peerId);
        store.setConnected(true, roomCode);

        // Start 60Hz/30Hz heartbeat broadcast
        this.startHeartbeat();

        // Broadcast join packet
        this.sendPacket('PLAYER_JOIN', {
          id: localId,
          nickname: store.nickname,
          color: store.color,
          hatType: store.hatType
        });
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('[Multiplayer] PeerJS error:', err);
        // If Peer ID is taken or network error, fallback to local BroadcastChannel mesh gracefully
        store.setConnecting(false, err.message);
        store.setConnected(true, roomCode); // Keep local connectivity active
      });

      this.peer.on('disconnected', () => {
        console.log('[Multiplayer] Disconnected from broker.');
      });
    } catch (err: any) {
      console.warn('[Multiplayer] Could not initialize PeerJS, running in local mesh mode:', err);
      store.setConnected(true, roomCode);
    }
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log('[Multiplayer] Peer connection established with:', conn.peer);

      // Send local state immediately to new peer
      const store = useMultiplayerStore.getState();
      conn.send({
        type: 'PLAYER_STATE',
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

    // 1. Send via local BroadcastChannel (instant multi-tab sync)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (e) {}
    }

    // 2. Send via WebRTC P2P mesh
    const jsonString = packet;
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(jsonString);
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
    if (!packet || packet.senderId === store.localId) return;

    switch (packet.type) {
      case 'PLAYER_STATE': {
        const p = packet.payload as RemotePlayerState;
        store.updateRemotePlayer({
          ...p,
          lastUpdated: Date.now()
        });
        break;
      }

      case 'PLAYER_SHOOT': {
        // Play remote gunshot audio
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
          const { newHealth, isDead } = store.updateLocalHealth(damage);

          if (isDead) {
            // Send death event to all peers
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

            // Add to local killfeed
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

        // If local player was the killer:
        if (killerId === store.localId) {
          store.incrementLocalKill();
          soundEngine.playKillBannerSound(store.streak);
        }

        // Add to killfeed
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

    // Clean up disconnected players after 4 seconds of inactivity
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      const now = Date.now();

      Object.values(store.remotePlayers).forEach((player) => {
        if (now - player.lastUpdated > 4500) {
          store.removeRemotePlayer(player.id);
        }
      });
    }, 1000);
  }

  public disconnect() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
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
