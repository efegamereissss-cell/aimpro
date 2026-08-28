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

  const handleSelectScenario = (scenario: any) => {
    setScenario(scenario);
    startGame();
    // Request pointer lock synchronously on user click
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  const handleQuickPlay = () => {
    const gridshot = ALL_SCENARIOS.find(s => s.id === 'gridshot_ultimate') || ALL_SCENARIOS[0];
    handleSelectScenario(gridshot);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cyber-bg font-sans select-none text-cyber-text">
      {/* 3D FPS Three.js Canvas Scene */}
      <div className="absolute inset-0 z-0">
        <FPSScene />
      </div>

      {/* 1. IDLE STATE: Main Lobby or Scenario Browser */}
      {gameStatus === 'idle' && (
        <div className="relative z-10 w-full h-full overflow-y-auto bg-cyber-bg/75 backdrop-blur-md flex flex-col justify-between py-6">
          {currentMenu === 'main' ? (
            <MainMenu
              onQuickPlay={handleQuickPlay}
              onOpenBrowser={() => setCurrentMenu('browser')}
              onOpenStudio={() => setShowStudio(true)}
              onOpenStats={() => setShowStats(true)}
              onOpenSettings={() => setShowSettings(true)}
            />
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
    </div>
  );
};
