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
    <div className="w-full h-full relative cursor-none select-none bg-[#05070d]">
      <Canvas
        camera={{
          fov: effectiveFov,
          near: 0.05,
          far: 120,
          position: [0, 1.7, 0]
        }}
        dpr={[1, 2]} // High-DPI Retina resolution for zero pixelation
        shadows={{
          type: THREE.PCFSoftShadowMap // Ultra-smooth soft shadows with zero pixelation
        }}
        gl={{
          antialias: true, // Hardware Anti-Aliasing (FXAA/MSAA)
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping, // Film-grade color grading
          toneMappingExposure: 1.12
        }}
      >
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.55} />
        
        {/* Key Overhead Directional Sun Light */}
        <directionalLight
          position={[12, 22, 10]}
          intensity={1.3}
          castShadow={videoSettings.shadows}
          shadow-mapSize-width={4096} // Ultra 4K Shadow Map for razor-sharp edges
          shadow-mapSize-height={4096}
          shadow-camera-near={0.5}
          shadow-camera-far={60}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          shadow-bias={-0.0001}
        />

        {/* Soft Fill Light from Opposite Angle */}
        <directionalLight
          position={[-15, 12, -8]}
          intensity={0.4}
          color="#38bdf8"
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
