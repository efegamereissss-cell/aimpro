import React from 'react';
import { useLobbyStore } from '../../store/useLobbyStore';
import { LobbyCard } from './LobbyCard';
import { LobbyFilters } from './LobbyFilters';
import { CreateLobbyModal } from './CreateLobbyModal';
import { Users, Plus, ShieldAlert, Sparkles, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export const LobbiesView: React.FC = () => {
  const lobbies = useLobbyStore(state => state.lobbies);
  const filters = useLobbyStore(state => state.filters);
  const setCreateModalOpen = useLobbyStore(state => state.setCreateModalOpen);
  const toastMessage = useLobbyStore(state => state.toastMessage);

  // Filter lobbies based on active criteria
  const filteredLobbies = lobbies.filter(lobby => {
    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = lobby.title.toLowerCase().includes(q);
      const matchDesc = lobby.description.toLowerCase().includes(q);
      const matchHost = lobby.hostName.toLowerCase().includes(q);
      const matchCode = lobby.partyCode.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchHost && !matchCode) return false;
    }

    // Rank filter
    if (filters.rank !== 'all') {
      if (lobby.targetRankMin !== filters.rank && lobby.targetRankMax !== filters.rank && lobby.hostRank !== filters.rank) {
        return false;
      }
    }

    // Mode filter
    if (filters.mode !== 'all' && lobby.mode !== filters.mode) {
      return false;
    }

    // Server filter
    if (filters.server !== 'all' && lobby.server !== filters.server) {
      return false;
    }

    // Role filter
    if (filters.role !== 'all' && !lobby.neededRoles.includes(filters.role) && !lobby.neededRoles.includes('any')) {
      return false;
    }

    // Mic filter
    if (filters.mic !== 'all' && lobby.micRequirement !== filters.mic) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs md:text-sm shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F1420] via-[#161D2E] to-[#0F1420] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF4655]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4655]/20 border border-[#FF4655]/30 text-[#FF4655] text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>TEAMCOM • VALORANT TAKIM & PREMADE MERKEZİ</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Grup Kodunu Paylaş, <span className="text-[#FF4655]">Takımını Topla!</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 font-medium">
              Oyun içi grup kodunu girerek hemen lobi oluşturabilir ya da açık lobilerin kodunu tek tıkla kopyalayıp oyundaki partiye saniyeler içinde katılabilirsiniz.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FF4655] hover:bg-rose-600 text-white font-black text-sm md:text-base shadow-[0_0_25px_rgba(255,70,85,0.4)] hover:shadow-[0_0_35px_rgba(255,70,85,0.6)] hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>LOBİ OLUŞTUR</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <LobbyFilters />

      {/* Lobbies List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              Aktif Takım İlanları
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold text-xs">
              {filteredLobbies.length}
            </span>
          </div>

          <span className="text-xs text-white/50 font-bold hidden sm:inline">
            Canlı listeleme • Kodu kopyalayıp oyuna girin
          </span>
        </div>

        {/* Lobbies Grid */}
        {filteredLobbies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredLobbies.map(lobby => (
              <LobbyCard key={lobby.id} lobby={lobby} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 rounded-3xl bg-[#0F1420]/60 border border-white/10 shadow-2xl space-y-5 max-w-xl mx-auto my-6">
            <div className="w-16 h-16 rounded-3xl bg-[#FF4655]/10 border border-[#FF4655]/30 flex items-center justify-center text-[#FF4655] mx-auto shadow-lg">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white tracking-tight">
                Şu Anda Açık Lobi Bulunmuyor
              </h3>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                Valorant'ta lobi kodunu alıp ilk takım ilanını sen ver! İlanın anında sitede yayınlansın ve oyuncular tek tıkla partine katılsın.
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF4655] hover:bg-rose-600 text-white font-black text-xs md:text-sm shadow-[0_0_20px_rgba(255,70,85,0.4)] hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>İLK LOBİYİ SEN OLUŞTUR</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateLobbyModal />
    </div>
  );
};
