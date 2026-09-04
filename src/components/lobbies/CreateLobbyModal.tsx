import React, { useState } from 'react';
import { useLobbyStore } from '../../store/useLobbyStore';
import { ValorantRank, AgentRole, GameMode, ServerRegion, MicRequirement } from '../../types/esports';
import { X, Plus, Sparkles, Shield, MapPin, Crosshair, Users, Mic, Dices } from 'lucide-react';

export const CreateLobbyModal: React.FC = () => {
  const isCreateModalOpen = useLobbyStore(state => state.isCreateModalOpen);
  const setCreateModalOpen = useLobbyStore(state => state.setCreateModalOpen);
  const createLobby = useLobbyStore(state => state.createLobby);

  const userProfile = useLobbyStore(state => state.userProfile);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [partyCode, setPartyCode] = useState('VALO-' + Math.floor(1000 + Math.random() * 9000));
  const [hostName, setHostName] = useState(userProfile.name || '');
  const [hostTag, setHostTag] = useState(userProfile.tag || 'TR1');
  const [hostRank, setHostRank] = useState<ValorantRank>(userProfile.rank || 'platinum');
  const [targetRankMin, setTargetRankMin] = useState<ValorantRank>('gold');
  const [targetRankMax, setTargetRankMax] = useState<ValorantRank>('diamond');
  const [neededRoles, setNeededRoles] = useState<AgentRole[]>(['duelist', 'controller']);
  const [mode, setMode] = useState<GameMode>('competitive');
  const [server, setServer] = useState<ServerRegion>('istanbul');
  const [micRequirement, setMicRequirement] = useState<MicRequirement>('required');
  const [currentMembers, setCurrentMembers] = useState(3);
  const [maxMembers, setMaxMembers] = useState(5);

  React.useEffect(() => {
    if (isCreateModalOpen && userProfile.name && !hostName) {
      setHostName(userProfile.name);
      setHostTag(userProfile.tag);
      setHostRank(userProfile.rank);
    }
  }, [isCreateModalOpen, userProfile]);

  if (!isCreateModalOpen) return null;

  const applyPreset = (presetType: 'comp' | 'premier' | 'scrim' | 'casual') => {
    if (presetType === 'comp') {
      setTitle('Gece Rekabetçisi +18 Mikrofonlu Son 2 Kişi');
      setDescription('İletişim kuracak, info verecek ve tilt olmayacak takım arkadaşları arıyoruz.');
      setMode('competitive');
      setServer('istanbul');
      setMicRequirement('required');
      setCurrentMembers(3);
      setMaxMembers(5);
    } else if (presetType === 'premier') {
      setTitle('Premier Turnuva Kadrosu • Antrenmanlı 5v5');
      setDescription('Haftalık Premier maçları için düzenli oynayacak ve rolünü bilen oyuncular.');
      setMode('premier');
      setServer('istanbul');
      setMicRequirement('discord');
      setCurrentMembers(4);
      setMaxMembers(5);
    } else if (presetType === 'scrim') {
      setTitle('5v5 Özel Maç / Scrim Rakip veya Takım');
      setDescription('Turnuva öncesi harita antrenmanı ve taktik denemeleri için özel lobi.');
      setMode('custom');
      setServer('istanbul');
      setMicRequirement('required');
      setCurrentMembers(2);
      setMaxMembers(10);
    } else {
      setTitle("Spike'a Hücum / Chill Eğlence");
      setDescription('Rank kasmadan görev yapmalık, eğlencesine seri oyun.');
      setMode('spikerush');
      setServer('istanbul');
      setMicRequirement('optional');
      setCurrentMembers(2);
      setMaxMembers(5);
    }
  };

  const handleToggleRole = (role: AgentRole) => {
    if (neededRoles.includes(role)) {
      if (neededRoles.length > 1) {
        setNeededRoles(neededRoles.filter(r => r !== role));
      }
    } else {
      setNeededRoles([...neededRoles, role]);
    }
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ['VALO', 'TR', 'PREM', 'ACE', 'CLUTCH'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setPartyCode(`${prefix}-${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !partyCode.trim() || !hostName.trim()) return;

    createLobby({
      title: title.trim(),
      description: description.trim() || 'Hemen oyuna gelip partiye katılın, maça girelim!',
      partyCode: partyCode.trim().toUpperCase(),
      hostName: hostName.trim(),
      hostTag: hostTag.trim() || 'TR1',
      hostRank,
      targetRankMin,
      targetRankMax,
      neededRoles,
      mode,
      server,
      micRequirement,
      currentMembers: Number(currentMembers),
      maxMembers: Number(maxMembers),
      tags: ['Yeni Lobi', server === 'istanbul' ? 'TR Sunucusu' : 'EU Sunucusu']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F1420] border border-[#FF4655]/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4655] to-rose-600 flex items-center justify-center text-white shadow-lg">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Yeni Valorant Lobisi Oluştur</h2>
              <p className="text-xs text-white/50 font-medium">Grup kodunuzu paylaşın, oyuncular tek tıkla katılsın</p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Selection */}
        <div className="mt-5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-white/50 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF4655]" /> Hızlı Lobi Şablonu Seç (Tek Tıkla Doldur):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => applyPreset('comp')}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-[#FF4655]/20 hover:border-[#FF4655]/50 border border-white/10 font-bold text-left transition-all text-white/80 hover:text-white"
            >
              🔥 Rekabetçi Gece
            </button>
            <button
              type="button"
              onClick={() => applyPreset('premier')}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-purple-600/20 hover:border-purple-500/50 border border-white/10 font-bold text-left transition-all text-white/80 hover:text-white"
            >
              🛡️ Premier Kadro
            </button>
            <button
              type="button"
              onClick={() => applyPreset('scrim')}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/50 border border-white/10 font-bold text-left transition-all text-white/80 hover:text-white"
            >
              ⚔️ 5v5 Scrim Özel
            </button>
            <button
              type="button"
              onClick={() => applyPreset('casual')}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-white/10 font-bold text-left transition-all text-white/80 hover:text-white"
            >
              ⚡ Spike Chill
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Party Code & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1 flex items-center justify-between">
                <span>Oyun Grup Kodu *</span>
                <button
                  type="button"
                  onClick={handleGenerateRandomCode}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 font-bold"
                >
                  <Dices className="w-3 h-3" /> Kod Üret
                </button>
              </label>
              <input
                type="text"
                required
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                placeholder="VALO-8921"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-cyan-500/40 text-cyan-300 font-mono font-black text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Lobi Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Gece Rekabetçisi +18 Mikrofonlu Son 2 Kişi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4655]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
              Açıklama & Detaylar
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Oyun tarzı, aranılan ajanlar, Discord linki veya kurallar..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4655] resize-none"
            />
          </div>

          {/* Host Nickname & Tag & Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Kullanıcı Adınız *
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="cNed"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Riot Etiketi
              </label>
              <input
                type="text"
                value={hostTag}
                onChange={(e) => setHostTag(e.target.value)}
                placeholder="TR1"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Sizin Rankınız
              </label>
              <select
                value={hostRank}
                onChange={(e) => setHostRank(e.target.value as ValorantRank)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
          </div>

          {/* Target Rank Range */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Minimum Rank
              </label>
              <select
                value={targetRankMin}
                onChange={(e) => setTargetRankMin(e.target.value as ValorantRank)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Maksimum Rank
              </label>
              <select
                value={targetRankMax}
                onChange={(e) => setTargetRankMax(e.target.value as ValorantRank)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
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
          </div>

          {/* Mode & Server & Mic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Oyun Modu
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as GameMode)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              >
                <option value="competitive">Dereceli (Competitive)</option>
                <option value="unrated">Derecesiz (Unrated)</option>
                <option value="premier">Premier Turnuvası</option>
                <option value="custom">Özel Maç (Scrim 5v5)</option>
                <option value="spikerush">Spike'a Hücum</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Sunucu
              </label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value as ServerRegion)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              >
                <option value="istanbul">İstanbul (TR)</option>
                <option value="frankfurt">Frankfurt (EU)</option>
                <option value="london">Londra</option>
                <option value="paris">Paris</option>
                <option value="warsaw">Varşova</option>
                <option value="madrid">Madrid</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                İletişim
              </label>
              <select
                value={micRequirement}
                onChange={(e) => setMicRequirement(e.target.value as MicRequirement)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              >
                <option value="required">Mikrofon Şart (+18)</option>
                <option value="discord">Discord Sunucusu</option>
                <option value="optional">Farketmez</option>
              </select>
            </div>
          </div>

          {/* Needed Roles */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-2">
              Aranan Roller (Birden fazla seçebilirsiniz)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'duelist', label: 'Düellocu' },
                { id: 'initiator', label: 'Öncü' },
                { id: 'controller', label: 'Kontrol Uzmanı' },
                { id: 'sentinel', label: 'Gözcü' }
              ].map(role => {
                const isSelected = neededRoles.includes(role.id as AgentRole);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleToggleRole(role.id as AgentRole)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Members Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Mevcut Kişi Sayısı
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={currentMembers}
                onChange={(e) => setCurrentMembers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Toplam Kontenjan
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs md:text-sm transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4655] to-rose-600 hover:from-rose-600 hover:to-[#FF4655] text-white font-black text-xs md:text-sm shadow-[0_0_20px_rgba(255,70,85,0.4)] transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>LOBİYİ YAYINLA</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
