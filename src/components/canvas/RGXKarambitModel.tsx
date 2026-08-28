import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface RGXKarambitModelProps {
  visible?: boolean;
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
      // 1. Auto-scale to exact FPS knife dimensions (26cm realistic karambit size)
      const initialBox = new THREE.Box3().setFromObject(fbx);
      const size = initialBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetDim = 0.26;
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
          mesh.castShadow = false; // Viewmodel does not need shadow caster pass
          mesh.receiveShadow = false;

          const pbrMat = new THREE.MeshStandardMaterial({
            map: baseColorMap,
            emissiveMap: emissiveMap,
            emissive: new THREE.Color('#00ff66'),
            emissiveIntensity: 2.8,
            metalnessMap: metalnessMap,
            metalness: 0.88,
            roughnessMap: roughnessMap,
            roughness: 0.22,
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

if (typeof window !== 'undefined') {
  preloadRGXModel();
}

const _tempColor = new THREE.Color();

export const RGXKarambitModel: React.FC<RGXKarambitModelProps> = ({ visible = true }) => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedFbxModel ? cachedFbxModel.clone() : null));
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);

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

  // Zero-allocation, zero-re-render high-performance Chroma shifting in Three.js render loop
  useFrame(state => {
    if (!visible) return;
    const t = state.clock.getElapsedTime();
    const hue = (t * 0.45) % 1.0;
    _tempColor.setHSL(hue, 1.0, 0.52);

    for (let i = 0; i < cachedMaterials.length; i++) {
      cachedMaterials[i].emissive.copy(_tempColor);
    }

    if (lightRef1.current) {
      lightRef1.current.color.copy(_tempColor);
    }
    if (lightRef2.current) {
      lightRef2.current.color.copy(_tempColor);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {model && <primitive object={model} rotation={[0, 0, 0]} />}

      {/* Dynamic RGB Point Lights */}
      <pointLight ref={lightRef1} position={[0.04, 0.12, 0.04]} intensity={2.8} distance={3} />
      <pointLight ref={lightRef2} position={[-0.02, -0.06, 0]} intensity={1.8} distance={2.5} />
    </group>
  );
};
