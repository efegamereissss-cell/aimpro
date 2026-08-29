import { NetworkPacket, RemotePlayerState, NetworkMessageType } from '../../types/multiplayer';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { soundEngine } from '../../audio/SoundEngine';

class MultiplayerService {
  private broadcastChannel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private heartbeatInterval: number | null = null;
  private isDestroyed = false;
  private currentRoom: string = 'aimpro-global-dm';

  public init() {
    if (typeof window === 'undefined') return;

    // 1. BroadcastChannel (Same-browser multi-tab sync)
    try {
      this.broadcastChannel = new BroadcastChannel('aimpro-mp-network');
      this.broadcastChannel.onmessage = (event: MessageEvent<NetworkPacket>) => {
        this.handleIncomingPacket(event.data);
      };
    } catch (e) {
      console.warn('[Multiplayer] BroadcastChannel not supported:', e);
    }

    // 2. LocalStorage Storage Event Bus (Cross-tab / Incognito sync)
    try {
      window.addEventListener('storage', (e) => {
        if (e.key === 'aimpro_mp_packet' && e.newValue) {
          try {
            const packet = JSON.parse(e.newValue) as NetworkPacket;
            this.handleIncomingPacket(packet);
          } catch (err) {}
        }
      });
    } catch (e) {}
  }

  public connect(roomCode: string = 'aimpro-global-dm') {
    this.disconnect();
    this.isDestroyed = false;
    this.currentRoom = roomCode.trim().toLowerCase();

    const store = useMultiplayerStore.getState();
    store.setConnecting(true, null);

    // 3. Connect to Public High-Availability WebSocket Relay for Cross-Browser/Cross-Device play
    try {
      // Connect to public Piesocket / Free WebSockets channel
      const wsUrl = `wss://free.blr2.piesocket.com/v3/${encodeURIComponent(this.currentRoom)}?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self=0`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Multiplayer] Connected to WebSocket Relay for room:', this.currentRoom);
        store.setConnected(true, this.currentRoom);

        // Send initial join packet
        this.broadcastLocalJoin();
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data) as NetworkPacket;
          this.handleIncomingPacket(packet);
        } catch (err) {}
      };

      this.ws.onerror = (err) => {
        console.warn('[Multiplayer] WebSocket Relay fallback to local channels:', err);
        store.setConnected(true, this.currentRoom);
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          store.setConnected(true, this.currentRoom);
        }
      };
    } catch (err) {
      console.warn('[Multiplayer] WebSocket fallback:', err);
      store.setConnected(true, this.currentRoom);
    }

    // Always enable local and storage mesh immediately
    store.setConnected(true, this.currentRoom);
    this.broadcastLocalJoin();
    this.startHeartbeat();
  }

  public broadcastLocalJoin() {
    const store = useMultiplayerStore.getState();
    this.sendPacket('PLAYER_JOIN', {
      id: store.localId,
      nickname: store.nickname,
      color: store.color,
      hatType: store.hatType,
      position: store.position,
      rotation: store.rotation,
      velocity: store.velocity,
      activeWeapon: 'vandal',
      health: store.health,
      kills: store.kills,
      deaths: store.deaths
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

    // 1. Send to BroadcastChannel (Instant for all tabs)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (e) {}
    }

    // 2. Send via LocalStorage event
    try {
      localStorage.setItem('aimpro_mp_packet', JSON.stringify(packet));
    } catch (e) {}

    // 3. Send via WebSocket Relay (for different browsers / devices)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(packet));
      } catch (e) {}
    }
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

    store.setLocalTransform(position, rotation, velocity);

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
        // 1. Add remote player to store
        store.updateRemotePlayer({
          id: p.id,
          nickname: p.nickname || 'Player',
          color: p.color || '#00f0ff',
          hatType: p.hatType || 'triangle',
          position: p.position || [0, 1.62, 0],
          rotation: p.rotation || [0, 0, 0],
          velocity: p.velocity || [0, 0, 0],
          activeWeapon: p.activeWeapon || 'vandal',
          health: p.health !== undefined ? p.health : 100,
          maxHealth: 100,
          isAlive: true,
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          ping: 15
        });

        // 2. Immediately reply with local state so the other player sees us too
        this.sendPacket('PLAYER_STATE', {
          id: store.localId,
          nickname: store.nickname,
          color: store.color,
          hatType: store.hatType,
          position: store.position,
          rotation: store.rotation,
          velocity: store.velocity,
          activeWeapon: 'vandal',
          health: store.health,
          maxHealth: store.maxHealth,
          isAlive: store.isAlive,
          kills: store.kills,
          deaths: store.deaths
        });
        break;
      }

      case 'PLAYER_STATE': {
        const p = packet.payload;
        store.updateRemotePlayer({
          id: p.id,
          nickname: p.nickname,
          color: p.color,
          hatType: p.hatType,
          position: p.position || [0, 1.62, 0],
          rotation: p.rotation || [0, 0, 0],
          velocity: p.velocity || [0, 0, 0],
          activeWeapon: p.activeWeapon || 'vandal',
          health: p.health !== undefined ? p.health : 100,
          maxHealth: 100,
          isAlive: p.isAlive !== undefined ? p.isAlive : true,
          isJumping: p.isJumping || false,
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          ping: 15
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

    // Continuous 150ms heartbeat broadcast
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      if (!store.isMultiplayerActive) return;

      // Broadcast full state with position
      this.sendPacket('PLAYER_STATE', {
        id: store.localId,
        nickname: store.nickname,
        color: store.color,
        hatType: store.hatType,
        position: store.position,
        rotation: store.rotation,
        velocity: store.velocity,
        activeWeapon: 'vandal',
        health: store.health,
        maxHealth: store.maxHealth,
        isAlive: store.isAlive,
        kills: store.kills,
        deaths: store.deaths
      });

      // Cleanup stale players (after 8s of inactivity)
      const now = Date.now();
      Object.values(store.remotePlayers).forEach((player) => {
        if (now - player.lastUpdated > 8000) {
          store.removeRemotePlayer(player.id);
        }
      });
    }, 150);
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

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    store.setConnected(false);
    store.clearRemotePlayers();
  }
}

export const multiplayerService = new MultiplayerService();
if (typeof window !== 'undefined') {
  multiplayerService.init();
}
