import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Global Singleton Cache for Haven C-Site Model (0ms Instant Loading)
let cachedHavenModel: THREE.Group | null = null;
let isHavenLoading = false;
const loadingCallbacks: Array<(model: THREE.Group) => void> = [];

function preloadHavenModel() {
  if (cachedHavenModel || isHavenLoading) return;
  isHavenLoading = true;

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    '/models/haven_c_site/source/Site C haven.fbx',
    fbx => {
      // 1. Calculate map dimensions & center
      const initialBox = new THREE.Box3().setFromObject(fbx);
      const size = initialBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      // Scale to tactical map dimensions (approx 75m playable tactical courtyard)
      const targetSize = 75.0;
      const scaleFactor = targetSize / (maxDim > 0 ? maxDim : 1);
      fbx.scale.setScalar(scaleFactor);

      const centeredBox = new THREE.Box3().setFromObject(fbx);
      const center = centeredBox.getCenter(new THREE.Vector3());
      fbx.position.x -= center.x;
      fbx.position.y -= center.y;
      fbx.position.z -= center.z;

      // 2. Enable shadows and clean tactical PBR materials
      fbx.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                mat.side = THREE.DoubleSide;
                if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                  (mat as THREE.MeshStandardMaterial).roughness = 0.7;
                  (mat as THREE.MeshStandardMaterial).metalness = 0.15;
                }
              });
            } else {
              mesh.material.side = THREE.DoubleSide;
              if ((mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                (mesh.material as THREE.MeshStandardMaterial).roughness = 0.7;
                (mesh.material as THREE.MeshStandardMaterial).metalness = 0.15;
              }
            }
          }
        }
      });

      const wrapperGroup = new THREE.Group();
      // Orient Haven C-Site Long facing player
      fbx.rotation.set(0, 0, 0);
      fbx.position.set(0, 0.1, 0);
      wrapperGroup.add(fbx);

      cachedHavenModel = wrapperGroup;
      isHavenLoading = false;
      loadingCallbacks.forEach(cb => cb(wrapperGroup.clone()));
      loadingCallbacks.length = 0;
    },
    undefined,
    err => {
      console.warn('Haven FBX loading error:', err);
      isHavenLoading = false;
    }
  );
}

if (typeof window !== 'undefined') {
  preloadHavenModel();
}

export const HavenCSiteMap: React.FC = () => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedHavenModel ? cachedHavenModel.clone() : null));

  useEffect(() => {
    if (cachedHavenModel) {
      setModel(cachedHavenModel.clone());
    } else {
      loadingCallbacks.push(loadedModel => {
        setModel(loadedModel);
      });
      preloadHavenModel();
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Dynamic Atmospheric Fog for Valorant Haven */}
      <fog attach="fog" args={['#1e293b', 30, 95]} />

      {/* Main Haven C-Site 3D Geometry */}
      {model && <primitive object={model} />}

      {/* Tactical Ground Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* C-Site Boundary Floor Marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -12]} receiveShadow>
        <planeGeometry args={[32, 24]} />
        <meshStandardMaterial color="#1a202c" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* C-Site Distance Marker Rings */}
      {[-8, -14, -20, -26].map(z => (
        <group key={z} position={[0, 0.015, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[28, 0.06]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
          </mesh>
        </group>
      ))}

      {/* Haven C-Site Tactical Sun Key Lighting */}
      <directionalLight
        position={[24, 35, 18]}
        intensity={2.2}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Sky Blue Ambient Fill Light */}
      <ambientLight intensity={0.75} color="#e0f2fe" />
    </group>
  );
};
