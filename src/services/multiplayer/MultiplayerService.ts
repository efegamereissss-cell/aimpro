import mqtt, { MqttClient } from 'mqtt';
import { NetworkPacket, RemotePlayerState, NetworkMessageType } from '../../types/multiplayer';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../audio/SoundEngine';

class MultiplayerService {
  private client: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private heartbeatInterval: number | null = null;
  private isDestroyed = false;
  private currentTopic: string = 'aimpro/dm/global';
  private currentRoom: string = 'aimpro-global-dm';

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
      // Connect to high-speed public MQTT broker over secure WebSockets
      this.client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2000,
        keepalive: 30
      });

      this.client.on('connect', () => {
        console.log('[Multiplayer] Connected to global MQTT broker on topic:', this.currentTopic);
        store.setConnected(true, this.currentRoom);

        if (this.client) {
          this.client.subscribe(this.currentTopic, (err) => {
            if (!err) {
              console.log('[Multiplayer] Subscribed successfully to:', this.currentTopic);
              // Broadcast join packet
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
        console.warn('[Multiplayer] MQTT connection error, falling back:', err);
        store.setConnected(true, this.currentRoom);
      });

      this.client.on('offline', () => {
        console.log('[Multiplayer] MQTT client offline.');
      });
    } catch (err) {
      console.warn('[Multiplayer] Failed to init MQTT:', err);
      store.setConnected(true, this.currentRoom);
    }

    // Start 120ms heartbeat state sync and stale player cleanup
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

    const serialized = JSON.stringify(packet);

    // 1. Local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (e) {}
    }

    // 2. Global MQTT PubSub (Cross-browser, cross-device)
    if (this.client && this.client.connected) {
      try {
        this.client.publish(this.currentTopic, serialized, { qos: 0 });
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
        // 1. Add / update remote player in store
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

        // 2. Acknowledge with local player state so the newcomer sees us
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

        // Add remote player bullet tracer
        if (origin && direction && weapon !== 'knife') {
          const from = origin as [number, number, number];
          const to = [
            from[0] + direction[0] * 50,
            from[1] + direction[1] * 50,
            from[2] + direction[2] * 50
          ] as [number, number, number];
          useGameStore.getState().addBulletTracer(from, to, '#f59e0b');
        }
        break;
      }

      case 'PLAYER_DAMAGE': {
        const { attackerId, attackerName, attackerColor, targetId, damage, isHeadshot, weapon } = packet.payload;
        if (targetId === store.localId && store.isAlive) {
          const { newHealth, isDead } = store.updateLocalHealth(damage);
          soundEngine.playHitSound(1, false);

          // Broadcast updated state immediately
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
            maxHealth: store.maxHealth,
            isAlive: newHealth > 0,
            kills: store.kills,
            deaths: isDead ? store.deaths + 1 : store.deaths
          });

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
        } else if (attackerId === store.localId) {
          // Optimistically reduce target remote player HP on attacker's HUD
          const targetPlayer = store.remotePlayers[targetId];
          if (targetPlayer) {
            const nextHp = Math.max(0, targetPlayer.health - damage);
            store.updateRemotePlayer({
              id: targetId,
              health: nextHp,
              isAlive: nextHp > 0
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

    // Continuous 120ms heartbeat
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      const store = useMultiplayerStore.getState();
      if (!store.isMultiplayerActive) return;

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

      // Stale player cleanup (after 10s of inactivity)
      const now = Date.now();
      Object.values(store.remotePlayers).forEach((player) => {
        if (now - player.lastUpdated > 10000) {
          store.removeRemotePlayer(player.id);
        }
      });
    }, 120);
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
