import mqtt, { MqttClient } from 'mqtt';
import { Lobby, VideoClip } from '../../types/esports';

const DB_NAME = 'TeamComDB';
const DB_VERSION = 2;
const STORE_LOBBIES = 'lobbies';
const STORE_CLIPS = 'clips';

/**
 * Permanent Hybrid Storage Engine for TeamCom
 * Combines:
 * 1. IndexedDB (survives refreshes, stores video blobs up to 1GB+)
 * 2. LocalStorage (instant sync fallback)
 * 3. Global Cloud MQTT (syncs lobbies across all devices & Vercel visitors in real time)
 */
class TeamComStorageService {
  private db: IDBDatabase | null = null;
  private client: MqttClient | null = null;
  private isReady = false;
  private onLobbiesRemoteUpdate?: (lobbies: Lobby[]) => void;
  private onClipsRemoteUpdate?: (clips: VideoClip[]) => void;

  public async init(
    onLobbiesUpdate?: (lobbies: Lobby[]) => void,
    onClipsUpdate?: (clips: VideoClip[]) => void
  ) {
    this.onLobbiesRemoteUpdate = onLobbiesUpdate;
    this.onClipsRemoteUpdate = onClipsUpdate;

    if (typeof window === 'undefined') return;

    // 1. Initialize IndexedDB
    try {
      this.db = await this.openDatabase();
      this.isReady = true;
    } catch (err) {
      console.warn('[TeamComStorage] IndexedDB fallback to localStorage:', err);
    }

    // 2. Connect to Global Cloud Relay
    this.initCloudSync();
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

  private initCloudSync() {
    try {
      const clientId = 'teamcom_' + Math.random().toString(16).substring(2, 8);
      this.client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2500,
        keepalive: 30
      });

      this.client.on('connect', () => {
        if (!this.client) return;
        this.client.subscribe(['teamcom/cloud/lobbies', 'teamcom/cloud/clips'], { qos: 0 });
      });

      this.client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          if (topic === 'teamcom/cloud/lobbies' && Array.isArray(data)) {
            if (this.onLobbiesRemoteUpdate) this.onLobbiesRemoteUpdate(data);
          } else if (topic === 'teamcom/cloud/clips' && Array.isArray(data)) {
            if (this.onClipsRemoteUpdate) this.onClipsRemoteUpdate(data);
          }
        } catch {}
      });
    } catch {}
  }

  // ===========================================================================
  // LOBBIES PERSISTENCE (Never disappears on refresh)
  // ===========================================================================

  public async getLobbies(): Promise<Lobby[]> {
    // 1. Try IndexedDB
    if (this.db) {
      try {
        const lobbies = await this.getAllFromStore<Lobby>(STORE_LOBBIES);
        if (Array.isArray(lobbies) && lobbies.length > 0) return lobbies;
      } catch {}
    }

    // 2. Try LocalStorage
    try {
      const raw = localStorage.getItem('teamcom_lobbies_permanent');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  }

  public async saveLobbies(lobbies: Lobby[]) {
    // 1. Save to LocalStorage
    try {
      localStorage.setItem('teamcom_lobbies_permanent', JSON.stringify(lobbies));
    } catch {}

    // 2. Save to IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_LOBBIES, 'readwrite');
        const store = tx.objectStore(STORE_LOBBIES);
        await new Promise<void>((resolve, reject) => {
          const clearReq = store.clear();
          clearReq.onsuccess = () => {
            lobbies.forEach(lobby => store.put(lobby));
            resolve();
          };
          clearReq.onerror = () => reject(clearReq.error);
        });
      } catch (err) {
        console.warn('[TeamComStorage] Failed to save lobbies to IndexedDB:', err);
      }
    }

    // 3. Broadcast to Cloud
    if (this.client && this.client.connected) {
      try {
        this.client.publish('teamcom/cloud/lobbies', JSON.stringify(lobbies), { qos: 0, retain: true });
      } catch {}
    }
  }

  // ===========================================================================
  // CLIPS PERSISTENCE (Stores video blobs so uploaded clips survive refreshes!)
  // ===========================================================================

  public async getClips(): Promise<VideoClip[]> {
    if (this.db) {
      try {
        const rawClips = await this.getAllFromStore<any>(STORE_CLIPS);
        if (Array.isArray(rawClips) && rawClips.length > 0) {
          // Re-create object URLs for any stored video blobs
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
    // 1. IndexedDB permanent blob storage
    if (this.db) {
      try {
        const recordToSave = {
          ...clip,
          videoBlob: videoBlob || null
        };
        const tx = this.db.transaction(STORE_CLIPS, 'readwrite');
        const store = tx.objectStore(STORE_CLIPS);
        store.put(recordToSave);
      } catch (err) {
        console.warn('[TeamComStorage] Failed to save clip to IndexedDB:', err);
      }
    }

    // 2. LocalStorage metadata backup (without huge binary blobs)
    try {
      const existing = await this.getClips();
      const metaOnly = existing.map(c => ({
        ...c,
        videoUrl: c.videoUrl.startsWith('blob:') ? '' : c.videoUrl
      }));
      localStorage.setItem('teamcom_clips_permanent', JSON.stringify(metaOnly));
    } catch {}

    // 3. Cloud broadcast if it has an external URL
    if (this.client && this.client.connected && !clip.videoUrl.startsWith('blob:')) {
      try {
        const allClips = await this.getClips();
        this.client.publish('teamcom/cloud/clips', JSON.stringify(allClips), { qos: 0, retain: true });
      } catch {}
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
