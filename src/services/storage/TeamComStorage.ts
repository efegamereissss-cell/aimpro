import mqtt, { MqttClient } from 'mqtt';
import { Lobby, VideoClip } from '../../types/esports';

const DB_NAME = 'TeamComDB';
const DB_VERSION = 3;
const STORE_LOBBIES = 'lobbies';
const STORE_CLIPS = 'clips';

const NTFY_TOPIC = 'teamcom_v2_lobbies_live';
const NTFY_BASE_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

const MQTT_TOPIC_LOBBIES = 'teamcom/v2/lobbies_global';
const MQTT_TOPIC_CLIPS = 'teamcom/v2/clips_global';

export const getLocalUserId = (): string => {
  if (typeof window === 'undefined') return 'guest';
  try {
    let uid = localStorage.getItem('teamcom_user_uid');
    if (!uid) {
      uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      localStorage.setItem('teamcom_user_uid', uid);
    }
    return uid;
  } catch {
    return 'guest';
  }
};

type SyncPayload =
  | { type: 'UPSERT_LOBBY'; lobby: Lobby; sender: string }
  | { type: 'DELETE_LOBBY'; lobbyId: string; sender: string }
  | { type: 'BATCH_LOBBIES'; lobbies: Lobby[]; sender: string }
  | { type: 'UPSERT_CLIP'; clip: VideoClip; sender: string }
  | { type: 'DELETE_CLIP'; clipId: string; sender: string };

/**
 * TeamCom Multi-Engine Global Synchronization & Storage
 * 1. EventSource / SSE & HTTPS Relay (Worldwide push notification in <200ms)
 * 2. 24-Hour Cache Polling on Boot (Fetches all active lobbies created worldwide)
 * 3. Fallback MQTT WebSockets (Multi-broker resilience)
 * 4. Browser BroadcastChannel (Instant multi-tab local sync)
 * 5. IndexedDB + LocalStorage (Permanent offline & refresh protection)
 */
class TeamComStorageService {
  private db: IDBDatabase | null = null;
  private mqttClient: MqttClient | null = null;
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  private onLobbiesRemoteUpdate?: (lobbies: Lobby[]) => void;
  private onClipsRemoteUpdate?: (clips: VideoClip[]) => void;
  private localClientId = getLocalUserId();

  public async init(
    onLobbiesUpdate?: (lobbies: Lobby[]) => void,
    onClipsUpdate?: (clips: VideoClip[]) => void
  ) {
    this.onLobbiesRemoteUpdate = onLobbiesUpdate;
    this.onClipsRemoteUpdate = onClipsUpdate;

    if (typeof window === 'undefined') return;

    // 1. Setup IndexedDB
    try {
      this.db = await this.openDatabase();
    } catch (err) {
      console.warn('[TeamComStorage] IndexedDB fallback to localStorage:', err);
    }

    // 2. Setup Local BroadcastChannel for instant cross-tab sync
    if ('BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('teamcom_local_mesh');
        this.broadcastChannel.onmessage = (ev) => {
          this.handleIncomingPayload(ev.data);
        };
      } catch {}
    }

    // 3. Setup Global Real-Time SSE (Server-Sent Events)
    this.initServerSentEvents();

    // 4. Initial Cache Fetch from Global Relay (Last 24 hours of lobbies)
    this.fetchGlobalHistory();

    // 5. Setup Fallback MQTT Cloud Relay
    this.initMqttSync();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_LOBBIES)) {
          db.createObjectStore(STORE_LOBBIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CLIPS)) {
          db.createObjectStore(STORE_CLIPS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ===========================================================================
  // REAL-TIME CLOUD RELAY (SSE & HTTP POST)
  // ===========================================================================

  private initServerSentEvents() {
    if (typeof window === 'undefined' || !window.EventSource) return;

    try {
      if (this.eventSource) this.eventSource.close();

      this.eventSource = new EventSource(`${NTFY_BASE_URL}/sse`);

      this.eventSource.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw.event === 'message' && raw.message) {
            const payload: SyncPayload = JSON.parse(raw.message);
            this.handleIncomingPayload(payload);
          }
        } catch {}
      };

      this.eventSource.onerror = () => {
        // Will auto-reconnect via EventSource native backoff
      };
    } catch (err) {
      console.warn('[TeamComStorage] SSE init error:', err);
    }
  }

  private async fetchGlobalHistory() {
    try {
      const res = await fetch(`${NTFY_BASE_URL}/json?poll=1&since=24h`, {
        cache: 'no-store'
      });
      if (!res.ok) return;

      const lines = (await res.text()).trim().split('\n');
      const incomingLobbies: Lobby[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          if (item.event === 'message' && item.message) {
            const payload: SyncPayload = JSON.parse(item.message);
            if (payload.type === 'UPSERT_LOBBY' && payload.lobby) {
              incomingLobbies.push(payload.lobby);
            } else if (payload.type === 'BATCH_LOBBIES' && Array.isArray(payload.lobbies)) {
              incomingLobbies.push(...payload.lobbies);
            }
          }
        } catch {}
      }

      if (incomingLobbies.length > 0) {
        await this.mergeLobbiesList(incomingLobbies);
      }
    } catch (err) {
      console.warn('[TeamComStorage] Failed fetching global history:', err);
    }
  }

  private async broadcastPayload(payload: SyncPayload) {
    // 1. Broadcast locally across browser tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {}
    }

    // 2. Broadcast to global SSE relay
    try {
      fetch(NTFY_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}

    // 3. Broadcast to MQTT as secondary relay
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        if (payload.type === 'UPSERT_LOBBY' || payload.type === 'DELETE_LOBBY' || payload.type === 'BATCH_LOBBIES') {
          const currentLobbies = await this.getLobbies();
          this.mqttClient.publish(MQTT_TOPIC_LOBBIES, JSON.stringify(currentLobbies), { qos: 0, retain: true });
        }
      } catch {}
    }
  }

  private async handleIncomingPayload(payload: SyncPayload) {
    if (!payload || !payload.type) return;
    if (payload.sender === this.localClientId) return; // Don't self-echo

    if (payload.type === 'UPSERT_LOBBY' && payload.lobby) {
      await this.upsertSingleLobby(payload.lobby);
    } else if (payload.type === 'DELETE_LOBBY' && payload.lobbyId) {
      await this.removeSingleLobby(payload.lobbyId);
    } else if (payload.type === 'BATCH_LOBBIES' && Array.isArray(payload.lobbies)) {
      await this.mergeLobbiesList(payload.lobbies);
    } else if (payload.type === 'UPSERT_CLIP' && payload.clip) {
      await this.upsertSingleClip(payload.clip);
    } else if (payload.type === 'DELETE_CLIP' && payload.clipId) {
      await this.removeSingleClip(payload.clipId);
    }
  }

  // ===========================================================================
  // MQTT BACKUP RELAY
  // ===========================================================================

  private initMqttSync() {
    try {
      this.mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: 'tc_cl_' + this.localClientId,
        clean: true,
        connectTimeout: 6000,
        reconnectPeriod: 3000,
        keepalive: 60
      });

      this.mqttClient.on('connect', () => {
        if (!this.mqttClient) return;
        this.mqttClient.subscribe([MQTT_TOPIC_LOBBIES, MQTT_TOPIC_CLIPS], { qos: 0 });
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const raw = message.toString();
          const parsed = JSON.parse(raw);

          if (topic === MQTT_TOPIC_LOBBIES && Array.isArray(parsed)) {
            this.mergeLobbiesList(parsed);
          } else if (topic === MQTT_TOPIC_CLIPS && Array.isArray(parsed)) {
            if (this.onClipsRemoteUpdate) this.onClipsRemoteUpdate(parsed);
          }
        } catch {}
      });
    } catch {}
  }

  // ===========================================================================
  // LOBBIES MANAGEMENT
  // ===========================================================================

  public async getLobbies(): Promise<Lobby[]> {
    // 1. LocalStorage
    try {
      const raw = localStorage.getItem('teamcom_lobbies_permanent');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    // 2. IndexedDB
    if (this.db) {
      try {
        const lobbies = await this.getAllFromStore<Lobby>(STORE_LOBBIES);
        if (Array.isArray(lobbies)) return lobbies;
      } catch {}
    }

    return [];
  }

  public async saveLobbies(lobbies: Lobby[]) {
    // Save locally
    this.persistLocalLobbies(lobbies);

    // Global broadcast
    this.broadcastPayload({
      type: 'BATCH_LOBBIES',
      lobbies,
      sender: this.localClientId
    });
  }

  public async broadcastCreateLobby(lobby: Lobby) {
    const local = await this.getLobbies();
    const updated = [lobby, ...local.filter(l => l.id !== lobby.id)];
    this.persistLocalLobbies(updated);

    this.broadcastPayload({
      type: 'UPSERT_LOBBY',
      lobby,
      sender: this.localClientId
    });
  }

  public async broadcastDeleteLobby(lobbyId: string) {
    const local = await this.getLobbies();
    const updated = local.filter(l => l.id !== lobbyId);
    this.persistLocalLobbies(updated);

    this.broadcastPayload({
      type: 'DELETE_LOBBY',
      lobbyId,
      sender: this.localClientId
    });
  }

  private async upsertSingleLobby(lobby: Lobby) {
    const local = await this.getLobbies();
    const map = new Map<string, Lobby>();
    local.forEach(l => map.set(l.id, l));
    map.set(lobby.id, lobby);

    const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    this.persistLocalLobbies(merged);

    if (this.onLobbiesRemoteUpdate) {
      this.onLobbiesRemoteUpdate(merged);
    }
  }

  private async removeSingleLobby(lobbyId: string) {
    const local = await this.getLobbies();
    const updated = local.filter(l => l.id !== lobbyId);
    this.persistLocalLobbies(updated);

    if (this.onLobbiesRemoteUpdate) {
      this.onLobbiesRemoteUpdate(updated);
    }
  }

  private async mergeLobbiesList(incomingList: Lobby[]) {
    const local = await this.getLobbies();
    const map = new Map<string, Lobby>();

    // Put incoming first
    incomingList.forEach(l => map.set(l.id, l));
    // Put local (keeps any local edits or recent additions)
    local.forEach(l => map.set(l.id, l));

    const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    this.persistLocalLobbies(merged);

    if (this.onLobbiesRemoteUpdate) {
      this.onLobbiesRemoteUpdate(merged);
    }
  }

  private persistLocalLobbies(lobbies: Lobby[]) {
    try {
      localStorage.setItem('teamcom_lobbies_permanent', JSON.stringify(lobbies));
    } catch {}

    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_LOBBIES, 'readwrite');
        const store = tx.objectStore(STORE_LOBBIES);
        store.clear();
        lobbies.forEach(lobby => store.put(lobby));
      } catch {}
    }
  }

  // ===========================================================================
  // CLIPS MANAGEMENT
  // ===========================================================================

  public async getClips(): Promise<VideoClip[]> {
    if (this.db) {
      try {
        const rawClips = await this.getAllFromStore<any>(STORE_CLIPS);
        if (Array.isArray(rawClips) && rawClips.length > 0) {
          return rawClips.map(clip => {
            if (clip.videoBlob instanceof Blob) {
              const freshUrl = URL.createObjectURL(clip.videoBlob);
              return { ...clip, videoUrl: freshUrl };
            }
            return clip;
          });
        }
      } catch {}
    }

    try {
      const raw = localStorage.getItem('teamcom_clips_permanent');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  }

  public async saveClip(clip: VideoClip, videoBlob?: Blob) {
    // 1. IndexedDB with Blob
    if (this.db) {
      try {
        const record = { ...clip, videoBlob: videoBlob || null };
        const tx = this.db.transaction(STORE_CLIPS, 'readwrite');
        const store = tx.objectStore(STORE_CLIPS);
        store.put(record);
      } catch {}
    }

    // 2. LocalStorage metadata
    try {
      const existing = await this.getClips();
      const updated = [clip, ...existing.filter(c => c.id !== clip.id)];
      const metaOnly = updated.map(c => ({
        ...c,
        videoUrl: c.videoUrl.startsWith('blob:') ? '' : c.videoUrl
      }));
      localStorage.setItem('teamcom_clips_permanent', JSON.stringify(metaOnly));
    } catch {}

    // 3. Global broadcast if it's an external URL (YouTube, TikTok, Streamable, MP4 URL)
    if (!clip.videoUrl.startsWith('blob:')) {
      this.broadcastPayload({
        type: 'UPSERT_CLIP',
        clip,
        sender: this.localClientId
      });
    }
  }

  public async broadcastDeleteClip(clipId: string) {
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_CLIPS, 'readwrite');
        const store = tx.objectStore(STORE_CLIPS);
        store.delete(clipId);
      } catch {}
    }

    try {
      const existing = await this.getClips();
      const updated = existing.filter(c => c.id !== clipId);
      localStorage.setItem('teamcom_clips_permanent', JSON.stringify(updated));
    } catch {}

    this.broadcastPayload({
      type: 'DELETE_CLIP',
      clipId,
      sender: this.localClientId
    });
  }

  private async upsertSingleClip(clip: VideoClip) {
    const current = await this.getClips();
    const updated = [clip, ...current.filter(c => c.id !== clip.id)];
    try {
      localStorage.setItem('teamcom_clips_permanent', JSON.stringify(updated));
    } catch {}
    if (this.onClipsRemoteUpdate) {
      this.onClipsRemoteUpdate(updated);
    }
  }

  private async removeSingleClip(clipId: string) {
    const current = await this.getClips();
    const updated = current.filter(c => c.id !== clipId);
    try {
      localStorage.setItem('teamcom_clips_permanent', JSON.stringify(updated));
    } catch {}
    if (this.onClipsRemoteUpdate) {
      this.onClipsRemoteUpdate(updated);
    }
  }

  private getAllFromStore<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}

export const teamComStorage = new TeamComStorageService();
