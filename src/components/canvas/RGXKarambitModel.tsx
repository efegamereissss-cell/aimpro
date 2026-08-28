import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface RGXKarambitModelProps {
  rgbColor: string;
}

// Global Singleton Cache for Instant 0ms Weapon Switching (No Lag, No Freezing)
let cachedFbxModel: THREE.Group | null = null;
let isFbxLoading = false;
const cachedMaterials: THREE.MeshStandardMaterial[] = [];
const loadingCallbacks: Array<(model: THREE.Group) => void> = [];

function preloadRGXModel() {
  if (cachedFbxModel || isFbxLoading) return;
  isFbxLoading = true;

  const textureLoader = new THREE.TextureLoader();
  const baseColorMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_BaseColor.png');
  const emissiveMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_Emissive.png');
  const metalnessMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_Metalness.png');
  const roughnessMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_Roughness.png');
  const normalMap = textureLoader.load('/models/rgx_karambit/textures/FX1_normal.png');
  const opacityMap = textureLoader.load('/models/rgx_karambit/textures/opacity.png');

  baseColorMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.colorSpace = THREE.SRGBColorSpace;

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    '/models/rgx_karambit/source/hub.fbx',
    fbx => {
      // 1. Auto-scale to exact FPS knife dimensions (32cm)
      const initialBox = new THREE.Box3().setFromObject(fbx);
      const size = initialBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetDim = 0.32;
      const scaleFactor = targetDim / (maxDim > 0 ? maxDim : 1);
      fbx.scale.setScalar(scaleFactor);

      // 2. Center vertices around rotation ring
      const centeredBox = new THREE.Box3().setFromObject(fbx);
      const center = centeredBox.getCenter(new THREE.Vector3());
      fbx.position.sub(center);

      // 3. Apply high-fidelity PBR Materials
      cachedMaterials.length = 0;
      fbx.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const pbrMat = new THREE.MeshStandardMaterial({
            map: baseColorMap,
            emissiveMap: emissiveMap,
            emissive: new THREE.Color('#00ff66'),
            emissiveIntensity: 2.5,
            metalnessMap: metalnessMap,
            metalness: 0.85,
            roughnessMap: roughnessMap,
            roughness: 0.25,
            normalMap: normalMap,
            alphaMap: opacityMap,
            transparent: true,
            side: THREE.DoubleSide
          });

          mesh.material = pbrMat;
          cachedMaterials.push(pbrMat);
        }
      });

      cachedFbxModel = fbx;
      isFbxLoading = false;
      loadingCallbacks.forEach(cb => cb(fbx.clone()));
      loadingCallbacks.length = 0;
    },
    undefined,
    err => {
      console.warn('FBX preload error:', err);
      isFbxLoading = false;
    }
  );
}

// Start preloading in the background immediately
if (typeof window !== 'undefined') {
  preloadRGXModel();
}

export const RGXKarambitModel: React.FC<RGXKarambitModelProps> = ({ rgbColor }) => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedFbxModel ? cachedFbxModel.clone() : null));

  useEffect(() => {
    if (cachedFbxModel) {
      setModel(cachedFbxModel.clone());
    } else {
      loadingCallbacks.push(loadedModel => {
        setModel(loadedModel);
      });
      preloadRGXModel();
    }
  }, []);

  // Update dynamic RGB Chroma Glow on materials in real-time
  useEffect(() => {
    cachedMaterials.forEach(mat => {
      mat.emissive.set(rgbColor);
    });
  }, [rgbColor]);

  return (
    <group position={[0, 0, 0]}>
      {model && (
        <primitive
          object={model}
          rotation={[0, 0, 0]}
        />
      )}

      {/* Dynamic RGB Point Lights */}
      <pointLight position={[0.04, 0.12, 0.04]} color={rgbColor} intensity={3.5} distance={5} />
      <pointLight position={[-0.02, -0.06, 0]} color={rgbColor} intensity={2.0} distance={4} />
    </group>
  );
};
