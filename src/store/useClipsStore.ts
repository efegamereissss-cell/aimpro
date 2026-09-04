import { create } from 'zustand';
import { VideoClip } from '../types/esports';
import { INITIAL_CLIPS } from '../data/mockClips';

interface ClipsStore {
  clips: VideoClip[];
  filterAgent: string | 'all';
  isUploadModalOpen: boolean;
  activePlayingClipId: string | null;

  // Actions
  setFilterAgent: (agent: string | 'all') => void;
  likeClip: (clipId: string) => void;
  addClip: (clip: Omit<VideoClip, 'id' | 'likes' | 'views' | 'commentsCount' | 'createdAt'>) => void;
  setUploadModalOpen: (open: boolean) => void;
  setActivePlayingClipId: (id: string | null) => void;
}

const STORAGE_KEY = 'teamcom_clips_v2';

const loadClips = (): VideoClip[] => {
  if (typeof window === 'undefined') return INITIAL_CLIPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_CLIPS;
};

export const useClipsStore = create<ClipsStore>((set) => ({
  clips: loadClips(),
  filterAgent: 'all',
  isUploadModalOpen: false,
  activePlayingClipId: null,

  setFilterAgent: (agent) => set({ filterAgent: agent }),

  likeClip: (clipId) => {
    set(state => {
      const updated = state.clips.map(c => {
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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return { clips: updated };
    });
  },

  addClip: (clipData) => {
    const newClip: VideoClip = {
      ...clipData,
      id: 'clip-' + Math.random().toString(36).substring(2, 9),
      likes: 1,
      isLiked: true,
      views: 1,
      commentsCount: 0,
      createdAt: Date.now()
    };

    set(state => {
      const updated = [newClip, ...state.clips];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return {
        clips: updated,
        isUploadModalOpen: false
      };
    });
  },

  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  setActivePlayingClipId: (id) => set({ activePlayingClipId: id })
}));
