import React, { useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { ALL_SCENARIOS } from './data/scenarios';
import { FPSScene } from './components/canvas/FPSScene';
import { GameHUD } from './components/hud/GameHUD';
import { CountdownOverlay } from './components/hud/CountdownOverlay';
import { ResultScreen } from './components/hud/ResultScreen';
import { MainMenu } from './components/menus/MainMenu';
import { ScenarioBrowser } from './components/menus/ScenarioBrowser';
import { PauseMenu } from './components/menus/PauseMenu';
import { SettingsModal } from './components/menus/SettingsModal';
import { StatsModal } from './components/menus/StatsModal';
import { CustomScenarioModal } from './components/menus/CustomScenarioModal';
import { ReactionBenchmarkModal } from './components/menus/ReactionBenchmarkModal';
import { PlaylistModal } from './components/menus/PlaylistModal';
import { PlaylistConfig } from './data/playlists';

export const App: React.FC = () => {
  const gameStatus = useGameStore(state => state.status);
  const setScenario = useGameStore(state => state.setScenario);
  const startGame = useGameStore(state => state.startGame);
  const resumeGame = useGameStore(state => state.resumeGame);
  const restartGame = useGameStore(state => state.restartGame);
  const exitToMenu = useGameStore(state => state.exitToMenu);

  // Menu navigation states
  const [currentMenu, setCurrentMenu] = useState<'main' | 'browser'>('main');
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showReactionTest, setShowReactionTest] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);

  // Active playlist session
  const [activePlaylist, setActivePlaylist] = useState<PlaylistConfig | null>(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  const handleSelectScenario = (scenario: any) => {
    setScenario(scenario);
    startGame();
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  const handleQuickPlay = () => {
    const gridshot = ALL_SCENARIOS.find(s => s.id === 'gridshot_ultimate') || ALL_SCENARIOS[0];
    handleSelectScenario(gridshot);
  };

  const handleStartPlaylist = (playlist: PlaylistConfig) => {
    setActivePlaylist(playlist);
    setCurrentPlaylistIndex(0);
    setShowPlaylists(false);
    const firstScenario = ALL_SCENARIOS.find(s => s.id === playlist.scenarioIds[0]) || ALL_SCENARIOS[0];
    handleSelectScenario(firstScenario);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090e] font-sans select-none text-cyber-text">
      {/* 3D FPS Three.js Canvas Scene */}
      <div className="absolute inset-0 z-0">
        <FPSScene />
      </div>

      {/* 1. IDLE STATE: Main Lobby or Scenario Browser */}
      {gameStatus === 'idle' && (
        <div className="relative z-10 w-full h-full overflow-y-auto bg-black/65 backdrop-blur-md flex flex-col justify-between py-6">
          {currentMenu === 'main' ? (
            <div className="space-y-4">
              <MainMenu
                onQuickPlay={handleQuickPlay}
                onOpenBrowser={() => setCurrentMenu('browser')}
                onOpenStudio={() => setShowStudio(true)}
                onOpenStats={() => setShowStats(true)}
                onOpenSettings={() => setShowSettings(true)}
              />

              {/* Extra Floating Quick Tools Bar */}
              <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPlaylists(true)}
                  className="px-4 py-2 rounded-xl bg-cyber-card hover:bg-cyber-primary hover:text-black text-white text-xs font-bold transition-all border border-cyber-border shadow-md"
                >
                  🏆 Pro Playlists
                </button>
                <button
                  onClick={() => setShowReactionTest(true)}
                  className="px-4 py-2 rounded-xl bg-cyber-card hover:bg-cyber-neon hover:text-black text-white text-xs font-bold transition-all border border-cyber-border shadow-md"
                >
                  ⚡ Reaction Benchmark
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="max-w-7xl mx-auto w-full px-6 md:px-8">
                <button
                  onClick={() => setCurrentMenu('main')}
                  className="text-xs font-bold text-cyber-primary hover:underline uppercase tracking-wider flex items-center gap-1.5"
                >
                  ← Return to Main Menu
                </button>
              </div>
              <ScenarioBrowser
                onSelectScenario={handleSelectScenario}
                onCreateCustom={() => setShowStudio(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* 2. PLAYING IN-GAME HUD */}
      {gameStatus === 'playing' && <GameHUD />}

      {/* 3. PAUSED STATE */}
      {gameStatus === 'paused' && (
        <PauseMenu
          onResume={() => {
            const canvas = document.querySelector('canvas');
            if (canvas && document.pointerLockElement !== canvas) {
              canvas.requestPointerLock();
            }
            resumeGame();
          }}
          onRestart={() => {
            const canvas = document.querySelector('canvas');
            if (canvas && document.pointerLockElement !== canvas) {
              canvas.requestPointerLock();
            }
            restartGame();
          }}
          onOpenBrowser={() => {
            exitToMenu();
            setCurrentMenu('browser');
          }}
          onGoHome={() => {
            exitToMenu();
            setCurrentMenu('main');
          }}
        />
      )}

      {/* 4. POST-MATCH RESULTS SCREEN */}
      {gameStatus === 'results' && (
        <ResultScreen
          onPlayAgain={() => {
            const canvas = document.querySelector('canvas');
            if (canvas && document.pointerLockElement !== canvas) {
              canvas.requestPointerLock();
            }
            startGame();
          }}
          onOpenBrowser={() => {
            exitToMenu();
            setCurrentMenu('browser');
          }}
          onGoHome={() => {
            exitToMenu();
            setCurrentMenu('main');
          }}
        />
      )}

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showStudio && (
        <CustomScenarioModal
          onClose={() => setShowStudio(false)}
          onStartScenario={scenario => {
            setShowStudio(false);
            handleSelectScenario(scenario);
          }}
        />
      )}
      {showReactionTest && <ReactionBenchmarkModal onClose={() => setShowReactionTest(false)} />}
      {showPlaylists && (
        <PlaylistModal
          onClose={() => setShowPlaylists(false)}
          onStartPlaylist={handleStartPlaylist}
        />
      )}
    </div>
  );
};
