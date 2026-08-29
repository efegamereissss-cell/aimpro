import mqtt, { MqttClient } from 'mqtt';
import { NetworkPacket, RemotePlayerState, NetworkMessageType } from '../../types/multiplayer';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../audio/SoundEngine';

class MultiplayerService {
  private client: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private cleanupInterval: number | null = null;
  private isDestroyed = false;
  private currentTopic: string = 'aimpro/dm/global';
  private currentRoom: string = 'aimpro-global-dm';
  private lastStateBroadcast = 0;

  public init() {
    if (typeof window === 'undefined') return;

    try {
      this.broadcastChannel = new BroadcastChannel('aimpro-mp-network');
      this.broadcastChannel.onmessage = (event: MessageEvent<NetworkPacket>) => {
        this.handleIncomingPacket(event.data);
      };
    } catch (e) {
      console.warn('[Multiplayer] BroadcastChannel not supported:', e);
    }
  }

  public connect(roomCode: string = 'aimpro-global-dm') {
    this.disconnect();
    this.isDestroyed = false;
    this.currentRoom = roomCode.trim().toLowerCase();
    this.currentTopic = `aimpro/dm/${this.currentRoom.replace(/[^a-z0-9_-]/g, '_')}`;

    const store = useMultiplayerStore.getState();
    store.setConnecting(true, null);

    const clientId = `aimpro_${store.localId}_${Math.random().toString(16).substring(2, 8)}`;

    try {
      // Connect to global high-speed MQTT broker
      this.client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 1500,
        keepalive: 30
      });

      this.client.on('connect', () => {
        console.log('[Multiplayer] Connected to global broker on topic:', this.currentTopic);
        store.setConnected(true, this.currentRoom);

        if (this.client) {
          this.client.subscribe(this.currentTopic, { qos: 0 }, (err) => {
            if (!err) {
              console.log('[Multiplayer] Subscribed successfully to:', this.currentTopic);
              this.broadcastLocalJoin();
            }
          });
        }
      });

      this.client.on('message', (_topic, message) => {
        try {
          const packet = JSON.parse(message.toString()) as NetworkPacket;
          this.handleIncomingPacket(packet);
        } catch (err) {}
      });

      this.client.on('error', (err) => {
        console.warn('[Multiplayer] MQTT connection error:', err);
        store.setConnected(true, this.currentRoom);
      });
    } catch (err) {
      console.warn('[Multiplayer] Failed to init MQTT:', err);
      store.setConnected(true, this.currentRoom);
    }

    // Start cleanup interval for stale peers (runs every 3 seconds)
    this.startStaleCleanup();
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

    const serialized = JSON.stringify(packet);

    // 1. Same-device / same-browser instantaneous sync
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (e) {}
    }

    // 2. Global network pub/sub
    if (this.client && this.client.connected) {
      try {
        this.client.publish(this.currentTopic, serialized, { qos: 0 });
      } catch (e) {}
    }
  }

  /**
   * High-Performance Throttled Position Broadcast (25Hz / 40ms)
   * Eliminates MQTT network congestion and packet queuing lag!
   */
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

    const now = Date.now();
    // Throttle to 25Hz (40ms) to ensure zero network queue lag
    if (now - this.lastStateBroadcast < 40) return;
    this.lastStateBroadcast = now;

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

  public broadcastRespawn(newPosition: [number, number, number]) {
    const store = useMultiplayerStore.getState();
    this.sendPacket('PLAYER_RESPAWN', {
      id: store.localId,
      nickname: store.nickname,
      color: store.color,
      hatType: store.hatType,
      position: newPosition,
      health: 100,
      isAlive: true
    });
  }

  private handleIncomingPacket(packet: NetworkPacket) {
    const store = useMultiplayerStore.getState();
    if (!packet || !packet.senderId || packet.senderId === store.localId) return;

    switch (packet.type) {
      case 'PLAYER_JOIN': {
        const p = packet.payload;
        store.updateRemotePlayer({
          id: p.id,
          nickname: p.nickname || 'Player',
          color: p.color || '#00f0ff',
          hatType: p.hatType || 'triangle',
          position: p.position && Array.isArray(p.position) ? p.position : [0, 1.62, 0],
          rotation: p.rotation && Array.isArray(p.rotation) ? p.rotation : [0, 0, 0],
          velocity: p.velocity && Array.isArray(p.velocity) ? p.velocity : [0, 0, 0],
          activeWeapon: p.activeWeapon || 'vandal',
          health: p.health !== undefined ? p.health : 100,
          maxHealth: 100,
          isAlive: true,
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          ping: 15
        });

        // Send local player state back so newcomer discovers us
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
          position: p.position && Array.isArray(p.position) ? p.position : [0, 1.62, 0],
          rotation: p.rotation && Array.isArray(p.rotation) ? p.rotation : [0, 0, 0],
          velocity: p.velocity && Array.isArray(p.velocity) ? p.velocity : [0, 0, 0],
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
        const { weapon, origin, direction } = packet.payload;
        if (weapon === 'knife') {
          soundEngine.playKnifeSlash();
        } else if (weapon === 'sheriff') {
          soundEngine.playGunshot('pistol');
        } else {
          soundEngine.playGunshot('rifle');
        }

        if (origin && direction && weapon !== 'knife') {
          const from = origin as [number, number, number];
          const to = [
            from[0] + direction[0] * 60,
            from[1] + direction[1] * 60,
            from[2] + direction[2] * 60
          ] as [number, number, number];
          useGameStore.getState().addBulletTracer(from, to, '#00f0ff');
        }
        break;
      }

      case 'PLAYER_DAMAGE': {
        const { attackerId, attackerName, attackerColor, targetId, damage, isHeadshot, weapon } = packet.payload;
        
        // Check if WE are the target who took damage
        if (targetId === store.localId && store.isAlive) {
          const { newHealth, isDead } = store.updateLocalHealth(damage);
          soundEngine.playHitSound(1, isHeadshot);

          if (isDead) {
            // Broadcast authoritative death event to everyone
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
          } else {
            // Broadcast new health state
            this.sendPacket('PLAYER_STATE', {
              id: store.localId,
              nickname: store.nickname,
              color: store.color,
              hatType: store.hatType,
              position: store.position,
              rotation: store.rotation,
              velocity: store.velocity,
              activeWeapon: 'vandal',
              health: newHealth,
              maxHealth: 100,
              isAlive: true,
              kills: store.kills,
              deaths: store.deaths
            });
          }
        }
        break;
      }

      case 'PLAYER_DEATH': {
        const { killerId, killerName, killerColor, victimId, victimName, victimColor, weapon, isHeadshot } = packet.payload;

        // Mark victim as dead in remote players
        store.updateRemotePlayer({
          id: victimId,
          health: 0,
          isAlive: false
        });

        // If WE were the killer: award kill & play victory kill banner sound!
        if (killerId === store.localId) {
          store.incrementLocalKill();
          soundEngine.playKillBannerSound(store.streak);
        }

        // Add to killfeed for all players
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

      case 'PLAYER_RESPAWN': {
        const { id, position } = packet.payload;
        store.updateRemotePlayer({
          id,
          position: (position && Array.isArray(position) && position.length >= 3 ? [position[0], position[1], position[2]] : [0, 1.62, 0]) as [number, number, number],
          health: 100,
          isAlive: true
        });
        break;
      }

      case 'PLAYER_LEAVE': {
        store.removeRemotePlayer(packet.payload.id);
        break;
      }
    }
  }

  private startStaleCleanup() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);

    // Runs every 3 seconds to cleanly remove peers who closed their tab/browser
    this.cleanupInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      if (!store.isMultiplayerActive) return;

      const now = Date.now();
      Object.values(store.remotePlayers).forEach((player) => {
        if (now - player.lastUpdated > 10000) {
          store.removeRemotePlayer(player.id);
        }
      });
    }, 3000);
  }

  public disconnect() {
    this.isDestroyed = true;
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    const store = useMultiplayerStore.getState();
    if (store.isConnected) {
      this.sendPacket('PLAYER_LEAVE', { id: store.localId });
    }

    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {}
      this.client = null;
    }

    store.setConnected(false);
    store.clearRemotePlayers();
  }
}

export const multiplayerService = new MultiplayerService();
if (typeof window !== 'undefined') {
  multiplayerService.init();
}
