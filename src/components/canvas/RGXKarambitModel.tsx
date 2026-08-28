import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface RGXKarambitModelProps {
  rgbColor: string;
}

export const RGXKarambitModel: React.FC<RGXKarambitModelProps> = ({ rgbColor }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();

    // Load PBR Textures
    const baseColorMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_BaseColor.png');
    const emissiveMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_Emissive.png');
    const metalnessMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_Metalness.png');
    const roughnessMap = textureLoader.load('/models/rgx_karambit/textures/1_low_lambert13_Roughness.png');
    const normalMap = textureLoader.load('/models/rgx_karambit/textures/FX1_normal.png');
    const opacityMap = textureLoader.load('/models/rgx_karambit/textures/opacity.png');

    baseColorMap.colorSpace = THREE.SRGBColorSpace;
    emissiveMap.colorSpace = THREE.SRGBColorSpace;

    // Load FBX Model
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      '/models/rgx_karambit/source/hub.fbx',
      fbx => {
        // Calculate Bounding Box to center the model around finger ring
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());

        // Center FBX vertices
        fbx.position.sub(center);

        materialsRef.current = [];

        // Apply PBR Materials
        fbx.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const pbrMat = new THREE.MeshStandardMaterial({
              map: baseColorMap,
              emissiveMap: emissiveMap,
              emissive: new THREE.Color(rgbColor),
              emissiveIntensity: 2.2,
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
            materialsRef.current.push(pbrMat);
          }
        });

        setModel(fbx);
      },
      undefined,
      err => {
        console.warn('Failed to load FBX model, using fallback:', err);
      }
    );
  }, []);

  // Update dynamic RGB Chroma Glow on the emissive texture
  useEffect(() => {
    materialsRef.current.forEach(mat => {
      mat.emissive.set(rgbColor);
    });
  }, [rgbColor]);

  if (!model) {
    // Loading placeholder
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.04, 0.2, 0.04]} />
          <meshBasicMaterial color={rgbColor} wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Exact FBX Model scaled and oriented for first person view */}
      <primitive
        object={model}
        scale={[0.0085, 0.0085, 0.0085]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      />
      {/* RGB Blade Core Glow Light */}
      <pointLight position={[0, 0.1, 0]} color={rgbColor} intensity={3.0} distance={4} />
    </group>
  );
};
