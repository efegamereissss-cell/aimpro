import React, { useEffect, useState, useRef } from 'react';
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
      const model = gltf.scene;

      // 1. Auto-scale to realistic 29cm FPS revolver dimensions
      const initialBox = new THREE.Box3().setFromObject(model);
      const size = initialBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetDim = 0.29;
      const scaleFactor = targetDim / (maxDim > 0 ? maxDim : 1);
      model.scale.setScalar(scaleFactor);

      // 2. Center vertices around trigger guard / grip
      const centeredBox = new THREE.Box3().setFromObject(model);
      const center = centeredBox.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // 3. Apply High-Fidelity PBR Materials
      model.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const pbrMat = new THREE.MeshStandardMaterial({
            map: diffuseMap,
            normalMap: normalMap,
            roughness: 0.35,
            metalness: 0.85,
            side: THREE.DoubleSide
          });

          mesh.material = pbrMat;
        }
      });

      cachedSheriffModel = model;
      isSheriffLoading = false;
      loadingCallbacks.forEach(cb => cb(model.clone()));
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
      <pointLight position={[0, 0.02, 0.02]} color="#00f0ff" intensity={1.8} distance={3} />
    </group>
  );
};
