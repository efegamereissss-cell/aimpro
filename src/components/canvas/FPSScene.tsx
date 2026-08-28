import React, { Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Arena } from './Arena';
import { BhopParkourMap } from './BhopParkourMap';
import { PlayerController } from './PlayerController';
import { TargetManager } from './TargetManager';
import { ParticleSystem } from './ParticleSystem';
import { FloatingText3D } from './FloatingText3D';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';

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
  const isBhopMap = activeScenario.id.includes('bhop');

  return (
    <div className="w-full h-full relative select-none bg-[#070a10]">
      <Canvas
        camera={{
          fov: 70.5328, // Exact Valorant 103° Horizontal FOV at 16:9
          near: 0.05,
          far: 140,
          position: [0, 2.7, 0]
        }}
        dpr={[1, 2]}
        shadows={videoSettings.shadows ? { type: THREE.PCFSoftShadowMap } : false}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.22
        }}
      >
        <DynamicValorantCameraManager />

        {/* Soft Ambient Radiance */}
        <ambientLight intensity={0.65} color="#e0e7ff" />

        {/* Primary Sun Directional Key Light with High-Performance Shadows */}
        <directionalLight
          position={[16, 26, 14]}
          intensity={1.75}
          color="#ffffff"
          castShadow={videoSettings.shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={65}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-bias={-0.0001}
        />

        {/* Secondary Cyber Cyan Rim Light */}
        <directionalLight
          position={[-18, 16, -10]}
          intensity={0.65}
          color="#00f0ff"
        />

        {/* Deep Ground Fill Light */}
        <directionalLight
          position={[0, -10, 0]}
          intensity={0.22}
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
