import React, { useState } from 'react';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { multiplayerService } from '../../services/multiplayer/MultiplayerService';
import { useGameStore } from '../../store/useGameStore';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { HatType } from '../../types/multiplayer';
import { X, Users, Globe, Play, Sparkles, Shield, Swords, Crown } from 'lucide-react';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { id: '#00f0ff', label: 'Cyan' },
  { id: '#ff0055', label: 'Neon Pembe' },
  { id: '#ffea00', label: 'Elektrik Sarı' },
  { id: '#00ff66', label: 'Lime Yeşil' },
  { id: '#a855f7', label: 'Siber Mor' },
  { id: '#ff6600', label: 'Lava Turuncu' }
];

const HAT_OPTIONS: { id: HatType; label: string; icon: string }[] = [
  { id: 'triangle', label: 'Üçgen Külah', icon: '🔺' },
  { id: 'crown', label: 'Altın Taç', icon: '👑' },
  { id: 'horns', label: 'Siber Boynuz', icon: '😈' },
  { id: 'pyramid', label: 'Radyanit Piramit', icon: '🔷' },
  { id: 'cube', label: 'Geometrik Küp', icon: '🧊' },
  { id: 'none', label: 'Şapkasız', icon: '🚫' }
];

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({ isOpen, onClose }) => {
  const nickname = useMultiplayerStore(state => state.nickname);
  const color = useMultiplayerStore(state => state.color);
  const hatType = useMultiplayerStore(state => state.hatType);
  const roomCode = useMultiplayerStore(state => state.roomCode);
  const setCustomization = useMultiplayerStore(state => state.setCustomization);
  const setMultiplayerActive = useMultiplayerStore(state => state.setMultiplayerActive);

  const setScenario = useGameStore(state => state.setScenario);
  const startGame = useGameStore(state => state.startGame);

  const [inputNick, setInputNick] = useState(nickname);
  const [selectedColor, setSelectedColor] = useState(color);
  const [selectedHat, setSelectedHat] = useState<HatType>(hatType);
  const [inputRoom, setInputRoom] = useState(roomCode);

  if (!isOpen) return null;

  const handleJoinDM = (customRoom?: string) => {
    const finalRoom = (customRoom || inputRoom || 'aimpro-global-dm').trim().toLowerCase();
    const finalNick = inputNick.trim() || 'Player' + Math.floor(Math.random() * 999);

    setCustomization({
      nickname: finalNick,
      color: selectedColor,
      hatType: selectedHat
    });

    setMultiplayerActive(true);
    multiplayerService.connect(finalRoom);

    // Launch Arena scenario
    const baseScenario = ALL_SCENARIOS[0];
    setScenario({
      ...baseScenario,
      id: 'online_deathmatch_arena',
      name: `Online Deathmatch [${finalRoom}]`,
      duration: 600, // 10 minutes match
      targetCount: 0, // No bots in multiplayer DM!
      tags: ['Online Deathmatch', 'Multiplayer', 'Redmatch 2']
    });
    startGame();
    onClose();

    // Lock cursor
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl p-6 md:p-8 rounded-3xl border border-cyber-primary/40 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyber-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-black font-black shadow-[0_0_25px_rgba(0,240,255,0.5)]">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                  ONLINE DEATHMATCH
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40">
                  REDMATCH 2 STYLE
                </span>
              </div>
              <p className="text-xs text-cyber-muted font-bold tracking-wider">
                Gerçek Oyuncularla 100 Canlı Silah Düellosu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Body */}
        <div className="space-y-4 relative z-10">
          {/* 1. Nickname Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-cyber-muted tracking-wider">
              Oyuncu İsmi (Nickname)
            </label>
            <input
              type="text"
              value={inputNick}
              onChange={(e) => setInputNick(e.target.value)}
              placeholder="İsminizi yazın..."
              maxLength={18}
              className="w-full bg-cyber-card/90 border border-white/15 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-cyber-primary shadow-inner"
            />
          </div>

          {/* 2. Redmatch 2 Neon Body Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-cyber-muted tracking-wider">
              Karakter Rengi
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`h-10 rounded-xl border-2 transition-all flex items-center justify-center shadow-md ${
                    selectedColor === c.id
                      ? 'border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.id }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* 3. Geometric Hat / Accessory */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-cyber-muted tracking-wider">
              Geometrik Şapka / Kostüm
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HAT_OPTIONS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHat(h.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedHat === h.id
                      ? 'bg-cyber-primary/20 border-cyber-primary text-white font-black shadow-sm'
                      : 'bg-white/5 border-white/5 text-cyber-muted hover:text-white'
                  }`}
                >
                  <span className="text-base">{h.icon}</span>
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Room Code */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-black uppercase text-cyber-muted tracking-wider">
              Özel Oda Kodu (Opsiyonel)
            </label>
            <input
              type="text"
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
              placeholder="aimpro-global-dm"
              className="w-full bg-cyber-card/90 border border-white/15 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyber-primary"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center gap-3 relative z-10 pt-2">
          <button
            onClick={() => handleJoinDM('aimpro-global-dm')}
            className="w-full flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:scale-102"
          >
            <Globe className="w-5 h-5" />
            Genel DM Odasına Bağlan
          </button>
          {inputRoom && inputRoom !== 'aimpro-global-dm' && (
            <button
              onClick={() => handleJoinDM(inputRoom)}
              className="w-full md:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              Özel Odaya Gir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
