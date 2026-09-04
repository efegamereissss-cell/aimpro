import React from 'react';
import { useClipsStore } from '../../store/useClipsStore';
import { ClipCard } from './ClipCard';
import { UploadClipModal } from './UploadClipModal';
import { Film, Plus, Flame, Sparkles, Filter } from 'lucide-react';

const FILTER_AGENTS = ['all', 'Jett', 'Reyna', 'Omen', 'Iso', 'Sova', 'Raze', 'Clove'];

export const ClipsView: React.FC = () => {
  const clips = useClipsStore(state => state.clips);
  const filterAgent = useClipsStore(state => state.filterAgent);
  const setFilterAgent = useClipsStore(state => state.setFilterAgent);
  const setUploadModalOpen = useClipsStore(state => state.setUploadModalOpen);

  const filteredClips = clips.filter(clip => {
    if (filterAgent !== 'all' && clip.agent.toLowerCase() !== filterAgent.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F1420] via-[#1A1224] to-[#0F1420] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              <span>TOPLULUK CLUTCH & ACE VİDEO MERKEZİ</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
              En İyi Vuruşlarını Paylaş, <span className="text-[#FF4655]">Topluluğun Gözdesi Ol!</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 font-medium">
              Kendi bilgisayarından video yükleyebilir veya video linki girerek clutch, ace ve sıra dışı anlarını tüm Valorant oyuncularına sergileyebilirsin.
            </p>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-[#FF4655] hover:opacity-90 text-white font-black text-sm md:text-base shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>VİDEO / KLİP YÜKLE</span>
          </button>
        </div>
      </div>

      {/* Agent Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-black uppercase tracking-wider text-white/50 flex items-center gap-1 shrink-0 mr-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" /> Ajan Filtresi:
        </span>
        {FILTER_AGENTS.map(agent => {
          const isSelected = filterAgent === agent;
          return (
            <button
              key={agent}
              onClick={() => setFilterAgent(agent)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-md'
                  : 'bg-[#0F1420]/80 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {agent === 'all' ? 'Tüm Ajanlar' : agent}
            </button>
          );
        })}
      </div>

      {/* Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClips.map(clip => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </div>

      {/* Upload Modal */}
      <UploadClipModal />
    </div>
  );
};
