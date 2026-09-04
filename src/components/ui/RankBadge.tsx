import React from 'react';
import { ValorantRank } from '../../types/esports';
import { Shield, Award, Crown, Sparkles, Flame, Zap } from 'lucide-react';

interface RankBadgeProps {
  rank: ValorantRank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RANK_INFO: Record<ValorantRank, { name: string; color: string; bgGradient: string; borderColor: string; icon: any }> = {
  iron: {
    name: 'Demir',
    color: '#94a3b8',
    bgGradient: 'from-slate-700 to-slate-900',
    borderColor: 'border-slate-500/40',
    icon: Shield
  },
  bronze: {
    name: 'Bronz',
    color: '#cd7f32',
    bgGradient: 'from-amber-900/60 to-amber-950',
    borderColor: 'border-amber-700/50',
    icon: Shield
  },
  silver: {
    name: 'Gümüş',
    color: '#cbd5e1',
    bgGradient: 'from-slate-400/30 to-slate-700',
    borderColor: 'border-slate-300/50',
    icon: Shield
  },
  gold: {
    name: 'Altın',
    color: '#fbbf24',
    bgGradient: 'from-amber-500/30 to-amber-800',
    borderColor: 'border-amber-400/60',
    icon: Award
  },
  platinum: {
    name: 'Platin',
    color: '#22d3ee',
    bgGradient: 'from-cyan-500/30 to-teal-800',
    borderColor: 'border-cyan-400/60',
    icon: Award
  },
  diamond: {
    name: 'Elmas',
    color: '#c084fc',
    bgGradient: 'from-purple-500/30 to-violet-900',
    borderColor: 'border-purple-400/60',
    icon: Sparkles
  },
  ascendant: {
    name: 'Yücelik',
    color: '#34d399',
    bgGradient: 'from-emerald-500/30 to-emerald-900',
    borderColor: 'border-emerald-400/60',
    icon: Flame
  },
  immortal: {
    name: 'Ölümsüzlük',
    color: '#f43f5e',
    bgGradient: 'from-rose-600/40 to-red-950',
    borderColor: 'border-rose-500/70',
    icon: Zap
  },
  radiant: {
    name: 'Radyant',
    color: '#fef08a',
    bgGradient: 'from-amber-400/40 via-yellow-500/30 to-amber-900',
    borderColor: 'border-yellow-300',
    icon: Crown
  }
};

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', showLabel = true }) => {
  const info = RANK_INFO[rank] || RANK_INFO.gold;
  const Icon = info.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-black'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border bg-gradient-to-r ${info.bgGradient} ${info.borderColor} shadow-sm backdrop-blur-sm select-none ${sizeClasses[size]}`}
      style={{ color: info.color }}
    >
      <Icon className={`${iconSizes[size]} shrink-0`} style={{ color: info.color }} />
      {showLabel && <span>{info.name}</span>}
    </span>
  );
};
