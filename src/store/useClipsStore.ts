import { create } from 'zustand';
import { VideoClip } from '../types/esports';
import { teamComStorage } from '../services/storage/TeamComStorage';

interface ClipsStore {
  clips: VideoClip[];
  filterAgent: string | 'all';
  isUploadModalOpen: boolean;
  activePlayingClipId: string | null;

  // Actions
  init: () => Promise<void>;
  setFilterAgent: (agent: string | 'all') => void;
  likeClip: (clipId: string) => Promise<void>;
  addClip: (
    clip: Omit<VideoClip, 'id' | 'likes' | 'views' | 'commentsCount' | 'createdAt'>,
    videoBlob?: Blob
  ) => Promise<void>;
  setUploadModalOpen: (open: boolean) => void;
  setActivePlayingClipId: (id: string | null) => void;
}

const getImmediateLocalClips = (): VideoClip[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('teamcom_clips_permanent');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export const useClipsStore = create<ClipsStore>((set, get) => ({
  clips: getImmediateLocalClips(),
  filterAgent: 'all',
  isUploadModalOpen: false,
  activePlayingClipId: null,

  init: async () => {
    await teamComStorage.init(undefined, (remoteClips) => {
      set({ clips: remoteClips });
    });
    const loaded = await teamComStorage.getClips();
    if (loaded && loaded.length > 0) {
      set({ clips: loaded });
    }
  },

  setFilterAgent: (agent) => set({ filterAgent: agent }),

  likeClip: async (clipId) => {
    const updated = get().clips.map(c => {
      if (c.id === clipId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
        };
      }
      return c;
    });

    set({ clips: updated });
    const target = updated.find(c => c.id === clipId);
    if (target) {
      await teamComStorage.saveClip(target);
    }
  },

  addClip: async (clipData, videoBlob) => {
    const newClip: VideoClip = {
      ...clipData,
      id: 'clip-' + Math.random().toString(36).substring(2, 9),
      likes: 1,
      isLiked: true,
      views: 1,
      commentsCount: 0,
      createdAt: Date.now()
    };

    const current = get().clips;
    const updated = [newClip, ...current];

    set({
      clips: updated,
      isUploadModalOpen: false
    });

    // Permanent IndexedDB Blob save (survives refreshes!)
    await teamComStorage.saveClip(newClip, videoBlob);
  },

  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  setActivePlayingClipId: (id) => set({ activePlayingClipId: id })
}));

// Auto-run init on client
if (typeof window !== 'undefined') {
  useClipsStore.getState().init();
}
