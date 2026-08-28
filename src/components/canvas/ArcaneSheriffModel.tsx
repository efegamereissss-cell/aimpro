import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Global Singleton Cache for Instant 0ms Weapon Switching (No Lag, No Freezing)
let cachedSheriffModel: THREE.Group | null = null;
let isSheriffLoading = false;
const loadingCallbacks: Array<(model: THREE.Group) => void> = [];

function preloadArcaneSheriff() {
  if (cachedSheriffModel || isSheriffLoading) return;
  isSheriffLoading = true;

  const textureLoader = new THREE.TextureLoader();
  const diffuseMap = textureLoader.load('/models/arcane_sheriff/textures/Revolver_XP1_DF_0.png');
  const normalMap = textureLoader.load('/models/arcane_sheriff/textures/Revolver_XP1_NM_1.png');

  diffuseMap.colorSpace = THREE.SRGBColorSpace;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/arcane_sheriff/source/Arcane Sheriff.glb',
    gltf => {
      const rootScene = gltf.scene;

      // 1. Reset all root node and child root offset translations
      rootScene.position.set(0, 0, 0);
      rootScene.rotation.set(0, 0, 0);
      rootScene.scale.set(1, 1, 1);

      rootScene.traverse(child => {
        if (child.name === 'Arcane-Sheriff') {
          child.position.set(0, 0, 0);
        }
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const pbrMat = new THREE.MeshStandardMaterial({
            map: diffuseMap,
            normalMap: normalMap,
            roughness: 0.32,
            metalness: 0.88,
            side: THREE.DoubleSide
          });

          mesh.material = pbrMat;
        }
      });

      // 2. Wrap in pivot group with barrel pointed forward (-Z) and grip centered
      const wrapperGroup = new THREE.Group();
      
      // Rotate 90 degrees around Y so barrel pointing +X turns to point along -Z
      rootScene.rotation.set(0, -Math.PI / 2, 0);
      // Offset so trigger and grip sit naturally in hand
      rootScene.position.set(0, -0.02, 0.12);
      // Calibrated scale (30cm length)
      rootScene.scale.setScalar(0.76);

      wrapperGroup.add(rootScene);

      cachedSheriffModel = wrapperGroup;
      isSheriffLoading = false;
      loadingCallbacks.forEach(cb => cb(wrapperGroup.clone()));
      loadingCallbacks.length = 0;
    },
    undefined,
    err => {
      console.warn('Could not load Arcane Sheriff GLB:', err);
      isSheriffLoading = false;
    }
  );
}

if (typeof window !== 'undefined') {
  preloadArcaneSheriff();
}

interface ArcaneSheriffModelProps {
  neonAccent?: string;
}

export const ArcaneSheriffModel: React.FC<ArcaneSheriffModelProps> = ({ neonAccent = '#00f0ff' }) => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedSheriffModel ? cachedSheriffModel.clone() : null));

  useEffect(() => {
    if (cachedSheriffModel) {
      setModel(cachedSheriffModel.clone());
    } else {
      loadingCallbacks.push(loadedModel => {
        setModel(loadedModel);
      });
      preloadArcaneSheriff();
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {model && (
        <primitive
          object={model}
          rotation={[0, 0, 0]}
        />
      )}

      {/* Hextech Glowing Cyan Aura on Cylinder */}
      <pointLight position={[0, 0.02, 0.05]} color="#00f0ff" intensity={1.8} distance={3} />
    </group>
  );
};
