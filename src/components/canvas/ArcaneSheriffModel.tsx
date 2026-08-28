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
    roughness: 0.28,
    metalness: 0.88,
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

          // 1. Clone raw vertex geometry (completely eliminates bone/skeleton offsets)
          const geom = original.geometry.clone();
          geom.center(); // Center around origin (0, 0, 0)
          geom.computeVertexNormals();

          // 2. Create static Mesh
          const staticMesh = new THREE.Mesh(geom, pbrMat);
          staticMesh.castShadow = true;
          staticMesh.receiveShadow = true;

          // 3. Raw geometry length is along +X -> Rotate 90 deg around Y so it points along +Z
          // (which under parent 180 deg viewmodel rotation points forward into crosshair)
          staticMesh.rotation.set(0, Math.PI / 2, 0);
          staticMesh.scale.setScalar(0.72); // 30cm authentic revolver length
          staticMesh.position.set(0, 0.02, -0.05); // Grip alignment

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

interface ArcaneSheriffModelProps {
  neonAccent?: string;
}

export const ArcaneSheriffModel: React.FC<ArcaneSheriffModelProps> = ({ neonAccent = '#00f0ff' }) => {
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
      {model ? (
        <primitive object={model} />
      ) : (
        /* High-Detail Procedural Arcane Revolver Fallback */
        <group position={[0, 0, 0]}>
          {/* Heavy Hextech Barrel */}
          <mesh position={[0, 0.04, 0.12]} castShadow>
            <boxGeometry args={[0.046, 0.065, 0.28]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.9} />
          </mesh>
          {/* Cylindrical Hextech Chamber */}
          <mesh position={[0, 0.035, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.09, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.95} />
          </mesh>
          {/* Revolver Handle / Wooden-Metal Grip */}
          <mesh position={[0, -0.07, -0.08]} rotation={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.042, 0.14, 0.065]} />
            <meshStandardMaterial color="#451a03" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Glowing Hextech Energy Core */}
          <mesh position={[0, 0.035, -0.02]}>
            <cylinderGeometry args={[0.02, 0.02, 0.092, 12]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>
      )}

      {/* Hextech Glowing Cyan Light */}
      <pointLight position={[0, 0.04, 0.02]} color="#00f0ff" intensity={2.2} distance={4} />
    </group>
  );
};
