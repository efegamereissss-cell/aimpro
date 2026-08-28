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

  const textureLoader = new THREE.TextureLoader();
  const bodyDiffuseMap = textureLoader.load('/models/prelude_vandal/textures/AK_DemonStone_v3_DF_0.png');
  const bodyNormalMap = textureLoader.load('/models/prelude_vandal/textures/AK_DemonStone_v3_NM_1.png');
  const magDiffuseMap = textureLoader.load('/models/prelude_vandal/textures/AK_Demonstone_Magazine_v3_DF_2.png');
  const magNormalMap = textureLoader.load('/models/prelude_vandal/textures/AK_DemonStone_Magazine_v2_NM_3.png');

  bodyDiffuseMap.colorSpace = THREE.SRGBColorSpace;
  magDiffuseMap.colorSpace = THREE.SRGBColorSpace;

  // 1. Main Body PBR Material
  const bodyMat = new THREE.MeshStandardMaterial({
    map: bodyDiffuseMap,
    normalMap: bodyNormalMap,
    roughness: 0.28,
    metalness: 0.88,
    side: THREE.DoubleSide
  });

  // 2. Magazine PBR Material
  const magMat = new THREE.MeshStandardMaterial({
    map: magDiffuseMap,
    normalMap: magNormalMap,
    roughness: 0.3,
    metalness: 0.85,
    side: THREE.DoubleSide
  });

  // 3. Glowing Electric Blue Core Material
  const emissiveMat = new THREE.MeshStandardMaterial({
    color: '#020617',
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 3.2,
    roughness: 0.1,
    metalness: 0.95,
    side: THREE.DoubleSide
  });

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/prelude_vandal/source/Prelude Vandal (Blue).glb',
    gltf => {
      const weaponGroup = new THREE.Group();

      gltf.scene.traverse(child => {
        // Reset node coordinate displacement
        if (child.name.includes('Prelude-Vandal')) {
          child.position.set(0, 0, 0);
        }

        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Apply appropriate multi-materials based on primitive slot
          if (Array.isArray(mesh.material)) {
            mesh.material = [emissiveMat, bodyMat, emissiveMat];
          } else {
            if (mesh.name.includes('Mag')) {
              mesh.material = magMat;
            } else {
              mesh.material = bodyMat;
            }
          }
        }
      });

      // Wrap in aligned group:
      // Center along X (0.245) and rotate -90 deg around Y so barrel (+X) points straight into crosshair (-Z)
      const alignedGroup = new THREE.Group();
      gltf.scene.position.set(-0.24, 0.02, 0.0);
      gltf.scene.rotation.set(0, -Math.PI / 2, 0);
      gltf.scene.scale.setScalar(0.62); // 78cm authentic assault rifle length

      alignedGroup.add(gltf.scene);

      cachedVandalGroup = alignedGroup;
      isVandalLoading = false;
      loadingCallbacks.forEach(cb => cb(alignedGroup.clone()));
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

interface PreludeVandalModelProps {
  neonAccent?: string;
}

export const PreludeVandalModel: React.FC<PreludeVandalModelProps> = ({ neonAccent = '#00f0ff' }) => {
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

      {/* Electric Blue Internal Chamber Light */}
      <pointLight position={[0, 0.06, 0.12]} color="#00f0ff" intensity={2.8} distance={4} />
    </group>
  );
};
