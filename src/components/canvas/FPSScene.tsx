import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Arena } from './Arena';
import { PlayerController } from './PlayerController';
import { TargetManager } from './TargetManager';
import { ParticleSystem } from './ParticleSystem';
import { FloatingText3D } from './FloatingText3D';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getEffectiveVerticalFov } from '../../utils/sensitivity';

export const FPSScene: React.FC = () => {
  const videoSettings = useSettingsStore(state => state.settings.video);

  const effectiveFov = getEffectiveVerticalFov(videoSettings.fov);

  return (
    <div className="w-full h-full relative select-none bg-[#0a0d14]">
      <Canvas
        camera={{
          fov: effectiveFov,
          near: 0.05,
          far: 100,
          position: [0, 1.7, 0]
        }}
        dpr={[1, 2]} // Crisp retina DPR without pixelation
        shadows={{
          type: THREE.PCFSoftShadowMap // Smooth soft shadows
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18
        }}
      >
        {/* CS2 Dust 2 Natural Sky Ambient Radiance */}
        <ambientLight intensity={0.75} color="#fff6eb" />

        {/* Dust 2 Warm Overhead Sun Directional Light */}
        <directionalLight
          position={[14, 24, 12]}
          intensity={1.65}
          color="#fff8ed"
          castShadow={videoSettings.shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={60}
          shadow-camera-left={-24}
          shadow-camera-right={24}
          shadow-camera-top={24}
          shadow-camera-bottom={-24}
          shadow-bias={-0.0001}
        />

        {/* Soft Mediterranean Sky Fill Light */}
        <directionalLight
          position={[-14, 14, -8]}
          intensity={0.45}
          color="#a3c4f3"
        />

        <Suspense fallback={null}>
          <Arena />
          <TargetManager />
          <ParticleSystem />
          <FloatingText3D />
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
