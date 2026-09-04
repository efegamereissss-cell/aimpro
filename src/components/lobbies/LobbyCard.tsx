import React, { useState } from 'react';
import { Lobby, AgentRole } from '../../types/esports';
import { RankBadge } from '../ui/RankBadge';
import { useLobbyStore } from '../../store/useLobbyStore';
import { getLocalUserId } from '../../services/storage/TeamComStorage';
import { Copy, Check, Users, Mic, MicOff, MapPin, Radio, Crosshair, Share2, Trash2, HelpCircle, UserCheck, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface LobbyCardProps {
  lobby: Lobby;
}

const ROLE_ICONS: Record<AgentRole, { label: string; color: string; border: string }> = {
  duelist: { label: 'Düellocu', color: 'text-rose-400', border: 'border-rose-500/40 bg-rose-500/10' },
  initiator: { label: 'Öncü', color: 'text-cyan-400', border: 'border-cyan-500/40 bg-cyan-500/10' },
  controller: { label: 'Kontrol', color: 'text-amber-400', border: 'border-amber-500/40 bg-amber-500/10' },
  sentinel: { label: 'Gözcü', color: 'text-emerald-400', border: 'border-emerald-500/40 bg-emerald-500/10' },
  any: { label: 'Her Rol', color: 'text-slate-300', border: 'border-slate-500/40 bg-slate-500/10' }
};

const MODE_LABELS: Record<string, string> = {
  competitive: 'Dereceli (Competitive)',
  unrated: 'Derecesiz',
  premier: 'Premier Turnuvası',
  custom: 'Özel Maç (5v5 Scrim)',
  spikerush: "Spike'a Hücum"
};

const SERVER_LABELS: Record<string, string> = {
  istanbul: 'İstanbul (TR)',
  frankfurt: 'Frankfurt (EU)',
  london: 'Londra (EU)',
  paris: 'Paris (EU)',
  warsaw: 'Varşova (EU)',
  madrid: 'Madrid (EU)'
};

export const LobbyCard: React.FC<LobbyCardProps> = ({ lobby }) => {
  const copyPartyCode = useLobbyStore(state => state.copyPartyCode);
  const copiedLobbyId = useLobbyStore(state => state.copiedLobbyId);
  const toggleLobbyFull = useLobbyStore(state => state.toggleLobbyFull);
  const deleteLobby = useLobbyStore(state => state.deleteLobby);

  const [showJoinHelp, setShowJoinHelp] = useState(false);

  const currentUserId = getLocalUserId();
  const isOwner = lobby.ownerId === currentUserId;
  const isCopied = copiedLobbyId === lobby.id;

  const timeAgo = (ms: number) => {
    const diff = Math.floor((Date.now() - ms) / 1000);
    if (diff < 60) return `${diff} sn önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    return `${Math.floor(diff / 3600)} saat önce`;
  };

  const remainingSlots = Math.max(0, lobby.maxMembers - lobby.currentMembers);

  return (
    <div
      className={`group relative rounded-3xl border p-5 md:p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-2xl ${
        lobby.isFull
          ? 'bg-[#0A0D15]/80 border-white/5 opacity-65'
          : 'bg-[#0E1322]/95 hover:bg-[#131A2F] border-white/10 hover:border-[#FF4655]/50 shadow-xl hover:shadow-[0_0_35px_rgba(255,70,85,0.2)]'
      }`}
    >
      {/* Top Accent Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] transition-all ${
        isOwner
          ? 'bg-gradient-to-r from-cyan-500 via-[#FF4655] to-cyan-500'
          : 'bg-gradient-to-r from-transparent via-[#FF4655]/40 to-transparent group-hover:via-[#FF4655]'
      }`} />

      <div>
        {/* Header: Badges & Creator Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#FF4655]/15 text-[#FF4655] border border-[#FF4655]/30 flex items-center gap-1 shadow-sm">
              <Crosshair className="w-3 h-3" />
              {MODE_LABELS[lobby.mode] || lobby.mode}
            </span>

            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-white/80 bg-white/5 border border-white/10 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {SERVER_LABELS[lobby.server] || lobby.server}
            </span>

            {isOwner && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" />
                SENİN İLANIN
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            {lobby.isFull ? (
              <span className="text-red-400 bg-red-500/15 px-2 py-0.5 rounded-lg border border-red-500/30 text-[10px] font-black">
                DOLU
              </span>
            ) : remainingSlots === 1 ? (
              <span className="text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30 text-[10px] font-black animate-pulse">
                SON 1 KİŞİ!
              </span>
            ) : (
              <span className="text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AÇIK
              </span>
            )}

            <span className="text-white/40 text-[11px] font-mono">{timeAgo(lobby.createdAt)}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base md:text-lg font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight line-clamp-1">
          {lobby.title}
        </h3>
        <p className="text-xs md:text-sm text-white/70 font-medium mt-1 line-clamp-2 leading-relaxed">
          {lobby.description}
        </p>

        {/* Host & Target Rank Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          {/* Host Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md border border-white/20">
              {lobby.hostName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{lobby.hostName}</span>
                <span className="text-[10px] font-mono text-white/40">#{lobby.hostTag}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-white/50 font-semibold">Kurucu:</span>
                <RankBadge rank={lobby.hostRank} size="sm" />
              </div>
            </div>
          </div>

          {/* Target Rank Range */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Aranan:</span>
            <RankBadge rank={lobby.targetRankMin} size="sm" />
            <span className="text-white/40 text-xs font-bold">-</span>
            <RankBadge rank={lobby.targetRankMax} size="sm" />
          </div>
        </div>

        {/* Roles Needed & Slots Visualizer */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Needed Roles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-white/50">Roller:</span>
            {lobby.neededRoles.map((role, idx) => {
              const roleInfo = ROLE_ICONS[role] || ROLE_ICONS.any;
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleInfo.border} ${roleInfo.color}`}
                >
                  {roleInfo.label}
                </span>
              );
            })}
          </div>

          {/* Slots Visualizer */}
          <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-xl border border-white/10">
            <div className="flex items-center gap-1">
              {Array.from({ length: lobby.maxMembers }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < lobby.currentMembers
                      ? 'bg-[#FF4655] shadow-[0_0_6px_#FF4655]'
                      : 'border border-white/30 bg-transparent'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-white/80 ml-1">
              {lobby.currentMembers}/{lobby.maxMembers}
            </span>
          </div>
        </div>
      </div>

      {/* How To Join Tip Box (Collapsible) */}
      {showJoinHelp && (
        <div className="mt-4 p-3.5 rounded-2xl bg-black/70 border border-cyan-500/30 text-xs text-white/80 space-y-1.5 animate-in fade-in duration-150">
          <div className="font-bold text-cyan-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Nasıl Katılacaksınız?
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-white/70">
            <li>Valorant'ı açın ve sağ alttaki <span className="text-white font-bold">Grup</span> simgesine tıklayın.</li>
            <li><span className="text-cyan-300 font-bold">Grup Koduyla Katıl</span> seçeneğine tıklayın.</li>
            <li>Aşağıdaki kopyaladığınız kodu (<span className="text-[#FF4655] font-mono font-bold">{lobby.partyCode}</span>) yapıştırın.</li>
            <li>Veya oyun içi sohbete yazın: <span className="font-mono text-cyan-300">/partyjoin {lobby.partyCode}</span></li>
          </ol>
        </div>
      )}

      {/* Action Footer: Party Code & Copy Button & Creator Tools */}
      <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/50 uppercase">Grup Kodu:</span>
          <button
            onClick={() => copyPartyCode(lobby.id, lobby.partyCode)}
            title="Kopyalamak için tıklayın"
            className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-black/80 border border-cyan-500/40 text-cyan-300 tracking-wider hover:border-cyan-400 hover:text-cyan-200 transition-colors shadow-inner"
          >
            {lobby.partyCode}
          </button>
          
          <button
            onClick={() => setShowJoinHelp(!showJoinHelp)}
            title="Nasıl Katılınır?"
            className="p-1 rounded-lg text-white/40 hover:text-cyan-400 hover:bg-white/5 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Creator Management Actions */}
          {isOwner && (
            <>
              <button
                onClick={() => toggleLobbyFull(lobby.id)}
                className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors"
                title={lobby.isFull ? 'Açık olarak işaretle' : 'Dolu olarak işaretle'}
              >
                {lobby.isFull ? 'Açık Yap' : 'Dolu Yap'}
              </button>
              <button
                onClick={() => deleteLobby(lobby.id)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors"
                title="İlanı Sil / Kapat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Copy Code CTA */}
          <button
            onClick={() => copyPartyCode(lobby.id, lobby.partyCode)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-md active:scale-95 ${
              isCopied
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-[#FF4655] hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(255,70,85,0.3)] hover:scale-105'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>KOPYALANDI!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" />
                <span>KODU KOPYALA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
