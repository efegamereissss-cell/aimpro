import React, { useState } from 'react';
import { useLobbyStore } from '../../store/useLobbyStore';
import { ValorantRank, AgentRole, GameMode, ServerRegion, MicRequirement } from '../../types/esports';
import { Search, RotateCcw, MapPin, Award, Crosshair, Mic, Users, Zap, CheckCircle, UserCheck, Shield, Edit3, X } from 'lucide-react';

export const LobbyFilters: React.FC = () => {
  const filters = useLobbyStore(state => state.filters);
  const setFilters = useLobbyStore(state => state.setFilters);
  const resetFilters = useLobbyStore(state => state.resetFilters);
  const userProfile = useLobbyStore(state => state.userProfile);
  const setUserProfile = useLobbyStore(state => state.setUserProfile);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileTag, setProfileTag] = useState(userProfile.tag);
  const [profileRank, setProfileRank] = useState<ValorantRank>(userProfile.rank);
  const [profileRole, setProfileRole] = useState<AgentRole>(userProfile.role);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      name: profileName.trim() || 'Oyuncu',
      tag: profileTag.trim() || 'TR1',
      rank: profileRank,
      role: profileRole
    });
    setIsProfileModalOpen(false);
  };

  const isQuickIstanbul = filters.server === 'istanbul';
  const isQuickRanked = filters.mode === 'competitive';
  const isQuickPremier = filters.mode === 'premier';
  const isQuickMic = filters.mic === 'required';
  const isQuickAscendant = filters.rank === 'ascendant';
  const isQuickDiamond = filters.rank === 'diamond';

  return (
    <div className="bg-[#0D121F]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl space-y-4 relative">
      
      {/* Search Input Row & Player Quick Identity */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            placeholder="Lobi başlığı, oyuncu adı veya oyun grup kodu (örn: VALO-1234) ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#FF4655] transition-all"
          />
        </div>

        {/* Quick User Riot ID Identity Setup */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setProfileName(userProfile.name);
              setProfileTag(userProfile.tag);
              setProfileRank(userProfile.rank);
              setProfileRole(userProfile.role);
              setIsProfileModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-white text-xs font-bold transition-all shrink-0 group"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF4655] to-rose-600 flex items-center justify-center text-white text-[10px] font-black">
              {userProfile.name ? userProfile.name.substring(0, 1).toUpperCase() : 'P'}
            </div>
            <div className="text-left">
              <span className="text-white/50 text-[10px] block leading-none">Riot Profilin:</span>
              <span className="text-white group-hover:text-cyan-300 transition-colors text-xs font-mono font-bold">
                {userProfile.name ? `${userProfile.name}#${userProfile.tag}` : 'Kimlik Belirle'}
              </span>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-400 ml-1" />
          </button>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold transition-all shrink-0"
            title="Tüm filtreleri temizle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        </div>

      </div>

      {/* Quick Filter Tag Chips (One-Click) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[10px] font-mono font-black uppercase text-white/40 shrink-0 mr-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#FF4655]" /> HIZLI FİLTRELER:
        </span>

        {/* Istanbul Chip */}
        <button
          onClick={() => setFilters({ server: isQuickIstanbul ? 'all' : 'istanbul' })}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
            isQuickIstanbul
              ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          🇹🇷 İstanbul Sunucusu
        </button>

        {/* Competitive Chip */}
        <button
          onClick={() => setFilters({ mode: isQuickRanked ? 'all' : 'competitive' })}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
            isQuickRanked
              ? 'bg-cyan-500 border-cyan-500 text-black shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          ⚔️ Dereceli (Ranked)
        </button>

        {/* Premier Chip */}
        <button
          onClick={() => setFilters({ mode: isQuickPremier ? 'all' : 'premier' })}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
            isQuickPremier
              ? 'bg-purple-600 border-purple-600 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          🛡️ Premier Takımı
        </button>

        {/* Mic Required Chip */}
        <button
          onClick={() => setFilters({ mic: isQuickMic ? 'all' : 'required' })}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
            isQuickMic
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          🎙️ Mikrofon Şart
        </button>

        {/* Ascendant/Immortal Chip */}
        <button
          onClick={() => setFilters({ rank: isQuickAscendant ? 'all' : 'ascendant' })}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
            isQuickAscendant
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          👑 Yücelik & Radyant
        </button>

        {/* Diamond Chip */}
        <button
          onClick={() => setFilters({ rank: isQuickDiamond ? 'all' : 'diamond' })}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
            isQuickDiamond
              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          💎 Platin & Elmas
        </button>
      </div>

      {/* Advanced Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 border-t border-white/5">
        
        {/* Rank Filter */}
        <div>
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1 block flex items-center gap-1">
            <Award className="w-3 h-3 text-[#FF4655]" /> Rank
          </label>
          <select
            value={filters.rank}
            onChange={(e) => setFilters({ rank: e.target.value as ValorantRank | 'all' })}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
          >
            <option value="all">Farketmez</option>
            <option value="required">Mikrofon Şart (+18)</option>
            <option value="discord">Discord Sunucusu</option>
            <option value="optional">İsteğe Bağlı</option>
          </select>
        </div>

      </div>

      {/* User Quick Identity Setup Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0F1422] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Riot Oyuncu Kimliğin</h3>
                  <p className="text-xs text-white/50">Lobi oluştururken bu bilgilerin otomatik doldurulur</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-white/70 block mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Örn: cNed"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/70 block mb-1">Etiket</label>
                  <input
                    type="text"
                    required
                    value={profileTag}
                    onChange={(e) => setProfileTag(e.target.value)}
                    placeholder="TR1"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Mevcut Rankın</label>
                <select
                  value={profileRank}
                  onChange={(e) => setProfileRank(e.target.value as ValorantRank)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
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

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Ana Rolün</label>
                <select
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value as AgentRole)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="duelist">Düellocu (Duelist)</option>
                  <option value="initiator">Öncü (Initiator)</option>
                  <option value="controller">Kontrol Uzmanı (Controller)</option>
                  <option value="sentinel">Gözcü (Sentinel)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-lg"
                >
                  KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
