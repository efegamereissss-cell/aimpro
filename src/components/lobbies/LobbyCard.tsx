import React from 'react';
import { Lobby, AgentRole } from '../../types/esports';
import { RankBadge } from '../ui/RankBadge';
import { useLobbyStore } from '../../store/useLobbyStore';
import { Copy, Check, Users, Mic, MicOff, MapPin, Radio, Shield, Crosshair, Sparkles, Eye } from 'lucide-react';

interface LobbyCardProps {
  lobby: Lobby;
}

const ROLE_ICONS: Record<AgentRole, { label: string; color: string; border: string }> = {
  duelist: { label: 'Düellocu', color: 'text-rose-400', border: 'border-rose-500/30 bg-rose-500/10' },
  initiator: { label: 'Öncü', color: 'text-cyan-400', border: 'border-cyan-500/30 bg-cyan-500/10' },
  controller: { label: 'Kontrol', color: 'text-amber-400', border: 'border-amber-500/30 bg-amber-500/10' },
  sentinel: { label: 'Gözcü', color: 'text-emerald-400', border: 'border-emerald-500/30 bg-emerald-500/10' },
  any: { label: 'Her Rol', color: 'text-slate-300', border: 'border-slate-500/30 bg-slate-500/10' }
};

const MODE_LABELS: Record<string, string> = {
  competitive: 'Dereceli (Rekabetçi)',
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

  const isCopied = copiedLobbyId === lobby.id;

  const timeAgo = (ms: number) => {
    const diff = Math.floor((Date.now() - ms) / 1000);
    if (diff < 60) return `${diff} sn önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    return `${Math.floor(diff / 3600)} saat önce`;
  };

  return (
    <div
      className={`group relative rounded-2xl border p-5 md:p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl ${
        lobby.isFull
          ? 'bg-[#0E121A]/60 border-white/5 opacity-60'
          : 'bg-[#0F1420]/80 hover:bg-[#131A2B]/90 border-white/10 hover:border-[#FF4655]/50 shadow-xl hover:shadow-[0_0_30px_rgba(255,70,85,0.15)]'
      }`}
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4655]/40 to-transparent group-hover:via-[#FF4655] transition-all" />

      <div>
        {/* Header: Mode & Server & Mic Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#FF4655]/15 text-[#FF4655] border border-[#FF4655]/30 flex items-center gap-1">
              <Crosshair className="w-3 h-3" />
              {MODE_LABELS[lobby.mode] || lobby.mode}
            </span>

            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white/70 bg-white/5 border border-white/10 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {SERVER_LABELS[lobby.server] || lobby.server}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            {lobby.micRequirement === 'required' ? (
              <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                <Mic className="w-3 h-3" /> Mic Şart
              </span>
            ) : lobby.micRequirement === 'discord' ? (
              <span className="text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px]">
                <Radio className="w-3 h-3" /> Discord
              </span>
            ) : (
              <span className="text-white/50 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px]">
                <MicOff className="w-3 h-3" /> Mic Farketmez
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

        {/* Host & Rank Range Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          {/* Host Info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md">
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

        {/* Needed Roles & Member Slots */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {/* Needed Roles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-white/50">Roller:</span>
            {lobby.neededRoles.map((role, idx) => {
              const roleInfo = ROLE_ICONS[role] || ROLE_ICONS.any;
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.border} ${roleInfo.color}`}
                >
                  {roleInfo.label}
                </span>
              );
            })}
          </div>

          {/* Party Members Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-white">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {lobby.currentMembers} / {lobby.maxMembers}
            </span>
          </div>
        </div>
      </div>

      {/* Action: Copy Party Code & Join Button */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white/50 uppercase">Grup Kodu:</span>
          <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-cyan-400 tracking-wider">
            {lobby.partyCode}
          </span>
        </div>

        <button
          onClick={() => copyPartyCode(lobby.id, lobby.partyCode)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-md active:scale-95 ${
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
  );
};
