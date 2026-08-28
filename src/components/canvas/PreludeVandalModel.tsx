import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Global Singleton Cache for Instant 0ms Weapon Switching (No Lag, No Freezing)
let cachedVandalGroup: THREE.Group | null = null;
let isVandalLoading = false;
const loadingCallbacks: Array<(group: THREE.Group) => void> = [];

function preloadPreludeVandal() {
  if (cachedVandalGroup || isVandalLoading) return;
  isVandalLoading = true;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/prelude_vandal/source/Prelude Vandal (Blue).glb',
    gltf => {
      const rootScene = gltf.scene;

      // 1. Reset root node coordinate translations
      rootScene.position.set(0, 0, 0);
      rootScene.rotation.set(0, 0, 0);
      rootScene.scale.set(1, 1, 1);

      rootScene.traverse(child => {
        if (child.name.includes('Prelude-Vandal')) {
          child.position.set(0, 0, 0);
        }

        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Ensure materials are double-sided and boost electric blue emissives
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              mat.side = THREE.DoubleSide;
              if (mat.name.includes('Emmisive') || mat.name.includes('Decal')) {
                (mat as THREE.MeshStandardMaterial).emissive = new THREE.Color('#00f0ff');
                (mat as THREE.MeshStandardMaterial).emissiveIntensity = 3.0;
              }
            });
          } else if (mesh.material) {
            mesh.material.side = THREE.DoubleSide;
            if (mesh.material.name.includes('Emmisive') || mesh.material.name.includes('Decal')) {
              (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color('#00f0ff');
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 3.0;
            }
          }
        }
      });

      // 2. Wrap in pivot group with barrel pointing forward (-Z)
      const wrapperGroup = new THREE.Group();

      // Raw geometry length is along +X -> Rotate -90 deg around Y so it points along -Z
      rootScene.rotation.set(0, -Math.PI / 2, 0);
      // Offset center and align grip with right hand
      rootScene.position.set(0, 0.02, 0.14);
      // Calibrated 76cm assault rifle length
      rootScene.scale.setScalar(0.64);

      wrapperGroup.add(rootScene);

      cachedVandalGroup = wrapperGroup;
      isVandalLoading = false;
      loadingCallbacks.forEach(cb => cb(wrapperGroup.clone()));
      loadingCallbacks.length = 0;
    },
    undefined,
    err => {
      console.warn('Could not load Prelude Vandal GLB:', err);
      isVandalLoading = false;
    }
  );
}

if (typeof window !== 'undefined') {
  preloadPreludeVandal();
}

export const PreludeVandalModel: React.FC = () => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedVandalGroup ? cachedVandalGroup.clone() : null));

  useEffect(() => {
    if (cachedVandalGroup) {
      setModel(cachedVandalGroup.clone());
    } else {
      loadingCallbacks.push(loadedGroup => {
        setModel(loadedGroup);
      });
      preloadPreludeVandal();
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {model && <primitive object={model} />}

      {/* Internal Electric Blue Core Glow */}
      <pointLight position={[0, 0.04, 0.08]} color="#00f0ff" intensity={2.5} distance={4} />
    </group>
  );
};
