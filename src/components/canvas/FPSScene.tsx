import React, { Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Arena } from './Arena';
import { BhopParkourMap } from './BhopParkourMap';
import { HavenCSiteMap } from './HavenCSiteMap';
import { FlatOpenDeathmatchMap } from './FlatOpenDeathmatchMap';
import { GameLoopManager } from './GameLoopManager';
import { PlayerController } from './PlayerController';
import { TargetManager } from './TargetManager';
import { ParticleSystem } from './ParticleSystem';
import { FloatingText3D } from './FloatingText3D';
import { RemotePlayersManager } from './RemotePlayersManager';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';

/**
 * Ensures 1:1 Pixel-Perfect Valorant 103° Horizontal FOV projection
 * dynamically matched to real-time viewport aspect ratio.
 */
const DynamicValorantCameraManager: React.FC = () => {
  const { camera, size } = useThree();
  const fovSetting = useSettingsStore(state => state.settings.video.fov);

  useFrame(() => {
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera && size.height > 0) {
      const pCam = camera as THREE.PerspectiveCamera;
      const currentAspect = size.width / size.height;
      const targetHFov = fovSetting || 103; // Valorant 103° Hor+
      
      const hRad = (targetHFov * Math.PI) / 180;
      const vRad = 2 * Math.atan(Math.tan(hRad / 2) / currentAspect);
      const vFovDeg = (vRad * 180) / Math.PI;

      if (Math.abs(pCam.fov - vFovDeg) > 0.005 || Math.abs(pCam.aspect - currentAspect) > 0.005) {
        pCam.fov = vFovDeg;
        pCam.aspect = currentAspect;
        pCam.updateProjectionMatrix();
      }
    }
  });

  return null;
};

export const FPSScene: React.FC = () => {
  const videoSettings = useSettingsStore(state => state.settings.video);
  const activeScenario = useGameStore(state => state.activeScenario);
  const isMultiplayerActive = useMultiplayerStore(state => state.isMultiplayerActive);

  const isBhopMap = activeScenario.id.includes('bhop');
  const isHavenMap = activeScenario.id === 'tactical_bot_duel_peeking' || (activeScenario.tags && activeScenario.tags.includes('Bot Peeking'));

  return (
    <div className="w-full h-full relative select-none bg-[#070a10]">
      <Canvas
        camera={{
          fov: 70.5328, // Exact Valorant 103° Horizontal FOV at 16:9
          near: 0.05,
          far: 200,
          position: [0, 2.7, 0]
        }}
        dpr={[1, 2]}
        shadows={videoSettings.shadows ? { type: THREE.PCFSoftShadowMap } : false}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isMultiplayerActive ? 1.15 : 1.05
        }}
      >
        <DynamicValorantCameraManager />

        {/* Balanced Ambient Radiance - Bright daylight for open deathmatch */}
        <ambientLight intensity={isMultiplayerActive ? 0.85 : 0.45} color={isMultiplayerActive ? '#f0f9ff' : '#e2e8f0'} />

        {/* Primary Sun Directional Key Light */}
        <directionalLight
          position={[24, 40, 20]}
          intensity={isMultiplayerActive ? 1.6 : 1.35}
          color="#ffffff"
          castShadow={videoSettings.shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={90}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-bias={-0.0001}
        />

        {/* Secondary Sky Fill Light */}
        <directionalLight
          position={[-20, 25, -15]}
          intensity={isMultiplayerActive ? 0.65 : 0.45}
          color={isMultiplayerActive ? '#7dd3fc' : '#00f0ff'}
        />

        <Suspense fallback={null}>
          <GameLoopManager />
          {isMultiplayerActive ? (
            <FlatOpenDeathmatchMap />
          ) : isBhopMap ? (
            <BhopParkourMap />
          ) : isHavenMap ? (
            <HavenCSiteMap />
          ) : (
            <Arena />
          )}
          {!isMultiplayerActive && <TargetManager />}
          <RemotePlayersManager />
          <ParticleSystem />
          <FloatingText3D />
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
