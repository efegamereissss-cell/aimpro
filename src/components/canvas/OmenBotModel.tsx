import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface OmenBotModelProps {
  isHit?: boolean;
  hitColor?: string;
}

// Global Singleton Cache for Instant 0ms Omen Bot Spawning (No Lag, No Freezing)
let cachedOmenModel: THREE.Group | null = null;
let isOmenLoading = false;
const loadingCallbacks: Array<(model: THREE.Group) => void> = [];

function preloadOmenModel() {
  if (cachedOmenModel || isOmenLoading) return;
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
    roughness: 0.45,
    metalness: 0.65,
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
      // 1. Calculate raw dimensions & center
      const initialBox = new THREE.Box3().setFromObject(fbx);
      const size = initialBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      // Normalize to 1.85m tall tactical humanoid bot
      const targetHeight = 1.85;
      const scaleFactor = targetHeight / (maxDim > 0 ? maxDim : 1);
      fbx.scale.setScalar(scaleFactor);

      const centeredBox = new THREE.Box3().setFromObject(fbx);
      const center = centeredBox.getCenter(new THREE.Vector3());
      fbx.position.x -= center.x;
      fbx.position.y -= center.y;
      fbx.position.z -= center.z;

      // 2. Assign high-fidelity Valorant materials & shadow properties
      fbx.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // If material is multi-material or named head/body
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat, idx) => {
              return idx === 1 || mat.name.toLowerCase().includes('head') ? headMaterial : bodyMaterial;
            });
          } else {
            // Check name for head vs body
            const name = (mesh.material?.name || '').toLowerCase();
            mesh.material = name.includes('head') ? headMaterial : bodyMaterial;
          }
        }
      });

      const wrapperGroup = new THREE.Group();
      // Orient Omen to face forward towards player (+Z)
      fbx.rotation.set(0, Math.PI, 0);
      fbx.position.set(0, 0, 0);
      wrapperGroup.add(fbx);

      cachedOmenModel = wrapperGroup;
      isOmenLoading = false;
      loadingCallbacks.forEach(cb => cb(wrapperGroup.clone()));
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
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedOmenModel ? cachedOmenModel.clone() : null));
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (cachedOmenModel) {
      setModel(cachedOmenModel.clone());
    } else {
      loadingCallbacks.push(loadedModel => {
        setModel(loadedModel);
      });
      preloadOmenModel();
    }
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {model && <primitive object={model} />}

      {/* Iconic Omen Glowing Facial Slits Point Light */}
      <pointLight position={[0, 0.65, 0.25]} color="#00f0ff" intensity={isHit ? 6.0 : 2.5} distance={4} />

      {/* Torso Dark Energy Core Aura */}
      <pointLight position={[0, 0.1, 0.15]} color="#7c3aed" intensity={1.5} distance={3} />
    </group>
  );
};
