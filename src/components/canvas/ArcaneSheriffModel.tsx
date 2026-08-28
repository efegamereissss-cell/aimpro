import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Global Singleton Cache for Instant 0ms Weapon Switching (No Lag, No Freezing)
let cachedSheriffGroup: THREE.Group | null = null;
let isSheriffLoading = false;
const loadingCallbacks: Array<(group: THREE.Group) => void> = [];

function preloadArcaneSheriff() {
  if (cachedSheriffGroup || isSheriffLoading) return;
  isSheriffLoading = true;

  const textureLoader = new THREE.TextureLoader();
  const diffuseMap = textureLoader.load('/models/arcane_sheriff/textures/Revolver_XP1_DF_0.png');
  const normalMap = textureLoader.load('/models/arcane_sheriff/textures/Revolver_XP1_NM_1.png');

  diffuseMap.colorSpace = THREE.SRGBColorSpace;

  const pbrMat = new THREE.MeshStandardMaterial({
    map: diffuseMap,
    normalMap: normalMap,
    roughness: 0.35,
    metalness: 0.85,
    side: THREE.DoubleSide
  });

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/arcane_sheriff/source/Arcane Sheriff.glb',
    gltf => {
      const weaponGroup = new THREE.Group();
      let foundMesh = false;

      gltf.scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh && !foundMesh) {
          const original = child as THREE.Mesh;
          foundMesh = true;

          // 1. Clone raw vertex geometry
          const geom = original.geometry.clone();
          geom.center();
          geom.computeVertexNormals();

          // 2. Create clean static Mesh with PBR materials
          const staticMesh = new THREE.Mesh(geom, pbrMat);
          staticMesh.castShadow = true;
          staticMesh.receiveShadow = true;

          // 3. Orient gun forward into the screen / crosshair
          staticMesh.rotation.set(0, -Math.PI / 2, 0);
          staticMesh.scale.setScalar(0.72); // 30cm authentic revolver length
          staticMesh.position.set(0, 0.02, 0.05); // Clean hand grip placement

          weaponGroup.add(staticMesh);
        }
      });

      if (weaponGroup.children.length > 0) {
        cachedSheriffGroup = weaponGroup;
        isSheriffLoading = false;
        loadingCallbacks.forEach(cb => cb(weaponGroup.clone()));
        loadingCallbacks.length = 0;
      }
    },
    undefined,
    err => {
      console.warn('GLB load error:', err);
      isSheriffLoading = false;
    }
  );
}

if (typeof window !== 'undefined') {
  preloadArcaneSheriff();
}

export const ArcaneSheriffModel: React.FC = () => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedSheriffGroup ? cachedSheriffGroup.clone() : null));

  useEffect(() => {
    if (cachedSheriffGroup) {
      setModel(cachedSheriffGroup.clone());
    } else {
      loadingCallbacks.push(loadedGroup => {
        setModel(loadedGroup);
      });
      preloadArcaneSheriff();
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {model && <primitive object={model} />}
    </group>
  );
};
