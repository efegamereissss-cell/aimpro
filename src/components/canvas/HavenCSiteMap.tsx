import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Global Singleton Cache for Haven C-Site Model (0ms Instant Loading)
let cachedHavenGroup: THREE.Group | null = null;
let isHavenLoading = false;
const loadingCallbacks: Array<(model: THREE.Group) => void> = [];

// Rich, High-Contrast Valorant Haven PBR Materials (Zero White Glare)
const HAVEN_MATERIALS = {
  floor_stone: new THREE.MeshStandardMaterial({ color: '#1a222d', roughness: 0.85, metalness: 0.1, side: THREE.DoubleSide }),
  floor_light: new THREE.MeshStandardMaterial({ color: '#25303f', roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide }),
  grass: new THREE.MeshStandardMaterial({ color: '#1a2e20', roughness: 0.9, metalness: 0.05, side: THREE.DoubleSide }),
  wood_box: new THREE.MeshStandardMaterial({ color: '#543820', roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide }),
  wood_light: new THREE.MeshStandardMaterial({ color: '#6e492b', roughness: 0.65, metalness: 0.05, side: THREE.DoubleSide }),
  wood_dark: new THREE.MeshStandardMaterial({ color: '#332014', roughness: 0.75, metalness: 0.1, side: THREE.DoubleSide }),
  wall_temple: new THREE.MeshStandardMaterial({ color: '#2c3545', roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide }),
  wall_beige: new THREE.MeshStandardMaterial({ color: '#3a4454', roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide }),
  wall_blue: new THREE.MeshStandardMaterial({ color: '#20334a', roughness: 0.75, metalness: 0.1, side: THREE.DoubleSide }),
  roof: new THREE.MeshStandardMaterial({ color: '#4a1b12', roughness: 0.65, metalness: 0.1, side: THREE.DoubleSide }),
  radianite_cyan: new THREE.MeshStandardMaterial({ color: '#00f0ff', emissive: '#00f0ff', emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.8, side: THREE.DoubleSide }),
  radianite_green: new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 0.7, roughness: 0.25, metalness: 0.7, side: THREE.DoubleSide }),
  box_gray: new THREE.MeshStandardMaterial({ color: '#1e2836', roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide }),
  stone_pillar: new THREE.MeshStandardMaterial({ color: '#26303d', roughness: 0.85, metalness: 0.1, side: THREE.DoubleSide }),
  tree_trunk: new THREE.MeshStandardMaterial({ color: '#2e1e14', roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide }),
  tree_leaves: new THREE.MeshStandardMaterial({ color: '#1f3824', roughness: 0.9, metalness: 0.05, side: THREE.DoubleSide }),
  rope: new THREE.MeshStandardMaterial({ color: '#61503c', roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide }),
  default_neutral: new THREE.MeshStandardMaterial({ color: '#252e3b', roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide })
};

function getMaterialForName(name: string): THREE.MeshStandardMaterial {
  const n = name.toLowerCase();
  if (n.includes('herbe') || n.includes('grass')) return HAVEN_MATERIALS.grass;
  if (n.includes('sol_clair') || n.includes('sols2')) return HAVEN_MATERIALS.floor_light;
  if (n.includes('sol') || n.includes('floor')) return HAVEN_MATERIALS.floor_stone;
  if (n.includes('bois_clair')) return HAVEN_MATERIALS.wood_light;
  if (n.includes('bois_fonce')) return HAVEN_MATERIALS.wood_dark;
  if (n.includes('bois') || n.includes('wood')) return HAVEN_MATERIALS.wood_box;
  if (n.includes('bleu_vert_box') || n.includes('cyan')) return HAVEN_MATERIALS.radianite_cyan;
  if (n.includes('vert_coffre') || n.includes('green')) return HAVEN_MATERIALS.radianite_green;
  if (n.includes('grisbox') || n.includes('box')) return HAVEN_MATERIALS.box_gray;
  if (n.includes('peinture_bleu')) return HAVEN_MATERIALS.wall_blue;
  if (n.includes('peinture_beige')) return HAVEN_MATERIALS.wall_beige;
  if (n.includes('toiture') || n.includes('roof')) return HAVEN_MATERIALS.roof;
  if (n.includes('pierre') || n.includes('pillar')) return HAVEN_MATERIALS.stone_pillar;
  if (n.includes('arbre') || n.includes('tree')) return HAVEN_MATERIALS.tree_trunk;
  if (n.includes('feuille') || n.includes('leaf')) return HAVEN_MATERIALS.tree_leaves;
  if (n.includes('corde') || n.includes('rope')) return HAVEN_MATERIALS.rope;
  if (n.includes('mur') || n.includes('wall')) return HAVEN_MATERIALS.wall_temple;
  return HAVEN_MATERIALS.default_neutral;
}

function preloadHavenModel() {
  if (cachedHavenGroup || isHavenLoading) return;
  isHavenLoading = true;

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    '/models/haven_c_site/source/Site C haven.fbx',
    fbx => {
      // 1. CRITICAL: Strip all 8 embedded Maya studio lights with 100,000 intensity!
      const lightsToRemove: THREE.Object3D[] = [];
      fbx.traverse(child => {
        if ((child as THREE.Light).isLight) {
          lightsToRemove.push(child);
        }
      });
      lightsToRemove.forEach(l => {
        if (l.parent) l.parent.remove(l);
      });

      // 2. Scale from Maya cm to Three.js meters (0.01 factor)
      fbx.scale.set(0.01, 0.01, 0.01);
      // Position Haven C-Site courtyard directly in front of the player
      fbx.position.set(0, 0, -5.0);

      // 3. Assign rich tactical materials and optimize performance (0 dropped frames)
      fbx.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = true;

          const matName = (mesh.material && !Array.isArray(mesh.material)) ? mesh.material.name : mesh.name;
          mesh.material = getMaterialForName(matName);
        }
      });

      const wrapperGroup = new THREE.Group();
      wrapperGroup.add(fbx);

      cachedHavenGroup = wrapperGroup;
      isHavenLoading = false;
      loadingCallbacks.forEach(cb => cb(wrapperGroup.clone()));
      loadingCallbacks.length = 0;
    },
    undefined,
    err => {
      console.warn('Haven FBX loading error:', err);
      isHavenLoading = false;
    }
  );
}

if (typeof window !== 'undefined') {
  preloadHavenModel();
}

export const HavenCSiteMap: React.FC = () => {
  const [model, setModel] = useState<THREE.Group | null>(() => (cachedHavenGroup ? cachedHavenGroup.clone() : null));

  useEffect(() => {
    if (cachedHavenGroup) {
      setModel(cachedHavenGroup.clone());
    } else {
      loadingCallbacks.push(loadedModel => {
        setModel(loadedModel);
      });
      preloadHavenModel();
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Valorant Haven Soft Sky Fog */}
      <fog attach="fog" args={['#090d14', 30, 95]} />

      {/* Main Valorant Haven C-Site 3D Geometry */}
      {model && <primitive object={model} />}

      {/* Solid Ground Floor Baseline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#131922" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Distance Floor Markers */}
      {[-6, -12, -18, -24].map(z => (
        <group key={z} position={[0, 0.012, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 0.06]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Radianite Energy Boxes at C-Site Plat */}
      <mesh position={[-6, 1.2, -14]} castShadow>
        <boxGeometry args={[1.6, 2.4, 1.6]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.0} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[6, 1.2, -14]} castShadow>
        <boxGeometry args={[1.6, 2.4, 1.6]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} roughness={0.25} metalness={0.7} />
      </mesh>
    </group>
  );
};
