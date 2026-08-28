import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Arena } from './Arena';
import { BhopParkourMap } from './BhopParkourMap';
import { PlayerController } from './PlayerController';
import { TargetManager } from './TargetManager';
import { ParticleSystem } from './ParticleSystem';
import { FloatingText3D } from './FloatingText3D';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { getEffectiveVerticalFov } from '../../utils/sensitivity';

export const FPSScene: React.FC = () => {
  const videoSettings = useSettingsStore(state => state.settings.video);
  const activeScenario = useGameStore(state => state.activeScenario);

  const effectiveFov = getEffectiveVerticalFov(videoSettings.fov);
  const isBhopMap = activeScenario.id.includes('bhop');

  return (
    <div className="w-full h-full relative select-none bg-[#070a10]">
      <Canvas
        camera={{
          fov: effectiveFov,
          near: 0.05,
          far: 140,
          position: [0, 2.7, 0]
        }}
        dpr={[1, 2]} // Crisp retina DPR without pixelation
        shadows={{
          type: THREE.PCFSoftShadowMap // Ultra smooth soft contact shadows
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.22
        }}
      >
        {/* Soft Ambient Radiance */}
        <ambientLight intensity={0.65} color="#e0e7ff" />

        {/* Primary Sun Directional Key Light with 4K Soft Shadows */}
        <directionalLight
          position={[16, 26, 14]}
          intensity={1.8}
          color="#ffffff"
          castShadow={videoSettings.shadows}
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
        />

        {/* Secondary Cyber Cyan Rim Light */}
        <directionalLight
          position={[-18, 16, -10]}
          intensity={0.7}
          color="#00f0ff"
        />

        {/* Deep Ground Fill Light */}
        <directionalLight
          position={[0, -10, 0]}
          intensity={0.25}
          color="#1e1b4b"
        />

        <Suspense fallback={null}>
          {isBhopMap ? <BhopParkourMap /> : <Arena />}
          <TargetManager />
          <ParticleSystem />
          <FloatingText3D />
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
