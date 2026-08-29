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

  // Packet deduplication — prevent double-processing from BroadcastChannel + MQTT
  private seenPackets = new Map<string, number>();
  private seenCleanupTimer: number | null = null;

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

    // Periodically clean old dedup entries
    this.seenCleanupTimer = window.setInterval(() => {
      const cutoff = Date.now() - 3000;
      for (const [key, ts] of this.seenPackets) {
        if (ts < cutoff) this.seenPackets.delete(key);
      }
    }, 5000);
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
        } catch (_err) {}
      });

      this.client.on('error', (err) => {
        console.warn('[Multiplayer] MQTT connection error:', err);
        store.setConnected(true, this.currentRoom);
      });
    } catch (err) {
      console.warn('[Multiplayer] Failed to init MQTT:', err);
      store.setConnected(true, this.currentRoom);
    }

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

  // Each packet gets a unique ID for deduplication
  private packetCounter = 0;
  public sendPacket(type: NetworkMessageType, payload: any) {
    const store = useMultiplayerStore.getState();
    const pktId = `${store.localId}_${++this.packetCounter}`;
    const packet: NetworkPacket = {
      type,
      senderId: store.localId,
      payload,
      timestamp: Date.now(),
      pktId
    };

    const serialized = JSON.stringify(packet);

    // Same-device / same-browser instantaneous sync
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(packet); } catch (_e) {}
    }

    // Global network pub/sub
    if (this.client && this.client.connected) {
      try { this.client.publish(this.currentTopic, serialized, { qos: 0 }); } catch (_e) {}
    }
  }

  /**
   * High-Performance Throttled Position Broadcast (20Hz / 50ms)
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
    if (now - this.lastStateBroadcast < 50) return;
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
    this.sendPacket('PLAYER_SHOOT', { origin, direction, weapon });
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

    // === DEDUPLICATION === 
    // The same packet arrives via BOTH BroadcastChannel (instant) and MQTT (delayed).
    // We must process it exactly ONCE.
    const pktId = (packet as any).pktId as string | undefined;
    if (pktId) {
      if (this.seenPackets.has(pktId)) return; // already processed!
      this.seenPackets.set(pktId, Date.now());
    }

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

        // Reply so newcomer discovers us
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
        // Play Chaos Vandal sound for rifle shots
        if (weapon === 'knife') {
          soundEngine.playKnifeSlash();
        } else {
          soundEngine.playChaosVandal();
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
        
        // Only process if WE are the target and alive
        if (targetId === store.localId && store.isAlive) {
          const { newHealth, isDead } = store.updateLocalHealth(damage);
          soundEngine.playHitSound(1, isHeadshot);

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

        store.updateRemotePlayer({
          id: victimId,
          health: 0,
          isAlive: false
        });

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

    // Remove peers who haven't sent data in 15 seconds
    this.cleanupInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      if (!store.isMultiplayerActive) return;

      const now = Date.now();
      Object.values(store.remotePlayers).forEach((player) => {
        if (now - player.lastUpdated > 15000) {
          store.removeRemotePlayer(player.id);
        }
      });
    }, 5000);
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
      try { this.client.end(true); } catch (_e) {}
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
