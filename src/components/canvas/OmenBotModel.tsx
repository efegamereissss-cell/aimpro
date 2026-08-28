import React, { useEffect, useState } from 'react';
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
      let rawMesh: THREE.Mesh | null = null;

      // Extract geometry from FBX SkinnedMesh and convert to static high-perf Mesh
      fbx.traverse(child => {
        if ((child as THREE.Mesh).isMesh && child.name.includes('Omen')) {
          rawMesh = child as THREE.Mesh;
        }
      });

      if (!rawMesh) {
        fbx.traverse(child => {
          if ((child as THREE.Mesh).isMesh && !rawMesh) {
            rawMesh = child as THREE.Mesh;
          }
        });
      }

      const wrapper = new THREE.Group();

      if (rawMesh) {
        // Create static Mesh with multi-materials (Group 0: Body, Group 1: Head)
        const omenMesh = new THREE.Mesh((rawMesh as THREE.Mesh).geometry, [bodyMaterial, headMaterial]);
        omenMesh.castShadow = true;
        omenMesh.receiveShadow = true;

        // Orient FBX Z-up to Three.js Y-up and face front
        omenMesh.rotation.set(-Math.PI / 2, 0, Math.PI);
        // Scale 210.84cm to exact 1.85 meters
        const scale = 0.8774 * 0.01;
        omenMesh.scale.set(scale, scale, scale);
        omenMesh.position.set(0, 0, 0);

        wrapper.add(omenMesh);
      }

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
      <pointLight position={[0, 1.68, 0.22]} color="#00f0ff" intensity={isHit ? 5.5 : 2.2} distance={3.0} />

      {/* Torso Dark Energy Core Aura */}
      <pointLight position={[0, 1.0, 0.15]} color="#7c3aed" intensity={1.0} distance={2.0} />
    </group>
  );
};
