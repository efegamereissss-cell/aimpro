import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface OmenBotModelProps {
  isHit?: boolean;
  hitColor?: string;
}

// Global Singleton Cache for Instant 0ms Omen Bot Spawning (No Lag, No Freezing)
let cachedOmenGroup: THREE.Group | null = null;
let isOmenLoading = false;
const loadingCallbacks: Array<(model: THREE.Group) => void> = [];

function preloadOmenModel() {
  if (cachedOmenGroup || isOmenLoading) return;
  isOmenLoading = true;

  const textureLoader = new THREE.TextureLoader();
  const bodyDiffuse = textureLoader.load('/models/omen_bot/textures/TP_Wraith_S0_DF.TGA.png');
  const bodyNormal = textureLoader.load('/models/omen_bot/textures/TP_Wraith_S0_NM.TGA.png');
  const headDiffuse = textureLoader.load('/models/omen_bot/textures/TP_Wraith_S0_Head_DF.TGA.png');
  const headEmissive = textureLoader.load('/models/omen_bot/textures/TP_Wraith_S0_Head_EM.TGA.png');

  bodyDiffuse.colorSpace = THREE.SRGBColorSpace;
  headDiffuse.colorSpace = THREE.SRGBColorSpace;
  headEmissive.colorSpace = THREE.SRGBColorSpace;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    map: bodyDiffuse,
    normalMap: bodyNormal,
    roughness: 0.5,
    metalness: 0.6,
    side: THREE.DoubleSide
  });

  const headMaterial = new THREE.MeshStandardMaterial({
    map: headDiffuse,
    emissiveMap: headEmissive,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 3.5,
    roughness: 0.35,
    metalness: 0.75,
    side: THREE.DoubleSide
  });

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    '/models/omen_bot/source/New_Omen.fbx',
    fbx => {
      // 1. Reset root FBX transforms
      fbx.position.set(0, 0, 0);
      fbx.rotation.set(0, 0, 0);
      fbx.scale.set(1, 1, 1);

      // 2. Reset and re-orient child mesh (Z-up in FBX -> Y-up in Three.js)
      fbx.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.material = [bodyMaterial, headMaterial];
          mesh.position.set(0, 0, 0);
          mesh.rotation.set(-Math.PI / 2, 0, Math.PI);
          mesh.scale.set(1, 1, 1);
        }
      });

      // 3. Normalize scale so total height is EXACTLY 1.85 meters (Valorant agent size)
      const rawBox = new THREE.Box3().setFromObject(fbx);
      const rawHeight = rawBox.max.y - rawBox.min.y;
      const targetHeight = 1.85;
      const scale = targetHeight / (rawHeight > 0 ? rawHeight : 2.1084);
      fbx.scale.setScalar(scale);

      // 4. Align feet perfectly to ground plane (Y = 0.00) and center on X=0, Z=0
      const scaledBox = new THREE.Box3().setFromObject(fbx);
      fbx.position.y = -scaledBox.min.y;
      fbx.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
      fbx.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;

      const wrapper = new THREE.Group();
      wrapper.add(fbx);

      cachedOmenGroup = wrapper;
      isOmenLoading = false;
      loadingCallbacks.forEach(cb => cb(wrapper.clone()));
      loadingCallbacks.length = 0;
    },
    undefined,
    err => {
      console.warn('Omen FBX loading error:', err);
      isOmenLoading = false;
    }
  );
}

if (typeof window !== 'undefined') {
  preloadOmenModel();
}

export const OmenBotModel: React.FC<OmenBotModelProps> = ({ isHit = false, hitColor = '#00f0ff' }) => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedOmenGroup ? cachedOmenGroup.clone() : null));

  useEffect(() => {
    if (cachedOmenGroup) {
      setModel(cachedOmenGroup.clone());
    } else {
      loadingCallbacks.push(loadedModel => {
        setModel(loadedModel);
      });
      preloadOmenModel();
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {model && <primitive object={model} />}

      {/* Iconic Omen Glowing Facial Slits Point Light */}
      <pointLight position={[0, 1.68, 0.22]} color="#00f0ff" intensity={isHit ? 5.0 : 2.0} distance={3.0} />

      {/* Torso Dark Energy Core Aura */}
      <pointLight position={[0, 1.0, 0.15]} color="#7c3aed" intensity={1.0} distance={2.0} />
    </group>
  );
};
