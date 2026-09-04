import React from 'react';
import { useLobbyStore } from '../../store/useLobbyStore';
import { ValorantRank, AgentRole, GameMode, ServerRegion, MicRequirement } from '../../types/esports';
import { Search, Filter, RotateCcw, MapPin, Award, Crosshair, Mic, Users } from 'lucide-react';

export const LobbyFilters: React.FC = () => {
  const filters = useLobbyStore(state => state.filters);
  const setFilters = useLobbyStore(state => state.setFilters);
  const resetFilters = useLobbyStore(state => state.resetFilters);

  return (
    <div className="bg-[#0F1420]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl space-y-4">
      
      {/* Search Input Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            placeholder="Lobi başlığı, açıklama veya kurucu adına göre ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#FF4655] transition-colors"
          />
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all shrink-0 self-end md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Filtreleri Sıfırla</span>
        </button>
      </div>

      {/* Filter Dropdowns / Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        
        {/* Rank Filter */}
        <div>
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1 block flex items-center gap-1">
            <Award className="w-3 h-3 text-[#FF4655]" /> Rank
          </label>
          <select
            value={filters.rank}
            onChange={(e) => setFilters({ rank: e.target.value as ValorantRank | 'all' })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
          >
            <option value="all">Tüm Ranklar</option>
            <option value="iron">Demir</option>
            <option value="bronze">Bronz</option>
            <option value="silver">Gümüş</option>
            <option value="gold">Altın</option>
            <option value="platinum">Platin</option>
            <option value="diamond">Elmas</option>
            <option value="ascendant">Yücelik</option>
            <option value="immortal">Ölümsüzlük</option>
            <option value="radiant">Radyant</option>
          </select>
        </div>

        {/* Game Mode */}
        <div>
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1 block flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-cyan-400" /> Oyun Modu
          </label>
          <select
            value={filters.mode}
            onChange={(e) => setFilters({ mode: e.target.value as GameMode | 'all' })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
          >
            <option value="all">Tüm Modlar</option>
            <option value="competitive">Dereceli (Competitive)</option>
            <option value="unrated">Derecesiz (Unrated)</option>
            <option value="premier">Premier Turnuvası</option>
            <option value="custom">Özel Maç (Scrim 5v5)</option>
            <option value="spikerush">Spike'a Hücum</option>
          </select>
        </div>

        {/* Server Region */}
        <div>
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1 block flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" /> Sunucu
          </label>
          <select
            value={filters.server}
            onChange={(e) => setFilters({ server: e.target.value as ServerRegion | 'all' })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
          >
            <option value="all">Tüm Sunucular</option>
            <option value="istanbul">İstanbul (TR)</option>
            <option value="frankfurt">Frankfurt (EU)</option>
            <option value="london">Londra</option>
            <option value="paris">Paris</option>
            <option value="warsaw">Varşova</option>
            <option value="madrid">Madrid</option>
          </select>
        </div>

        {/* Role Needed */}
        <div>
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1 block flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-400" /> Aranan Rol
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ role: e.target.value as AgentRole | 'all' })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
          >
            <option value="all">Tüm Roller</option>
            <option value="duelist">Düellocu (Duelist)</option>
            <option value="initiator">Öncü (Initiator)</option>
            <option value="controller">Kontrol Uzmanı</option>
            <option value="sentinel">Gözcü (Sentinel)</option>
          </select>
        </div>

        {/* Mic Requirement */}
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1 block flex items-center gap-1">
            <Mic className="w-3 h-3 text-indigo-400" /> İletişim
          </label>
          <select
            value={filters.mic}
            onChange={(e) => setFilters({ mic: e.target.value as MicRequirement | 'all' })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
          >
            <option value="all">Farketmez</option>
            <option value="required">Mikrofon Şart (+18/Info)</option>
            <option value="discord">Discord Sunucusu</option>
            <option value="optional">Mikrofon İsteğe Bağlı</option>
          </select>
        </div>

      </div>

    </div>
  );
};
