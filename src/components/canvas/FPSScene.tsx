import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
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
    <div className="w-full h-full relative cursor-none select-none">
      <Canvas
        camera={{ fov: effectiveFov, near: 0.05, far: 100 }}
        shadows={videoSettings.shadows}
        gl={{
          antialias: videoSettings.antialiasing,
          powerPreference: 'high-performance'
        }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[10, 20, 15]}
          intensity={1.2}
          castShadow={videoSettings.shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
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
