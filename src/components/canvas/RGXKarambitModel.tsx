import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface RGXKarambitModelProps {
  rgbColor: string;
}

export const RGXKarambitModel: React.FC<RGXKarambitModelProps> = ({ rgbColor }) => {
  const [fbxModel, setFbxModel] = useState<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // High-poly procedural fallback
  const bladeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.025, 0);
    shape.lineTo(-0.03, 0.06);
    shape.lineTo(-0.04, 0.07);
    shape.lineTo(-0.032, 0.14);
    shape.lineTo(-0.042, 0.15);
    shape.quadraticCurveTo(-0.045, 0.25, -0.02, 0.34);
    shape.quadraticCurveTo(0.02, 0.42, 0.08, 0.45);
    shape.quadraticCurveTo(0.01, 0.36, -0.005, 0.25);
    shape.quadraticCurveTo(-0.01, 0.15, 0.01, 0.05);
    shape.lineTo(0.015, 0);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(-0.015, 0.1);
    hole.lineTo(-0.022, 0.22);
    hole.lineTo(-0.008, 0.28);
    hole.lineTo(-0.002, 0.15);
    hole.closePath();
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.004,
      bevelThickness: 0.004
    });
  }, []);

  const neonEdgeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.005, 0);
    shape.lineTo(0.015, 0);
    shape.quadraticCurveTo(-0.01, 0.15, -0.005, 0.25);
    shape.quadraticCurveTo(0.01, 0.36, 0.08, 0.45);
    shape.quadraticCurveTo(0.04, 0.42, 0.01, 0.34);
    shape.quadraticCurveTo(-0.015, 0.24, -0.015, 0.12);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.014,
      bevelEnabled: false
    });
  }, []);

  const handleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.028, 0);
    shape.quadraticCurveTo(-0.04, -0.08, -0.035, -0.16);
    shape.lineTo(-0.015, -0.18);
    shape.quadraticCurveTo(-0.005, -0.15, -0.012, -0.12);
    shape.quadraticCurveTo(0.002, -0.09, -0.005, -0.06);
    shape.quadraticCurveTo(0.008, -0.03, 0.015, 0);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.006,
      bevelThickness: 0.006
    });
  }, []);

  useEffect(() => {
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
        // Auto-scale to 0.34 meters (standard first person knife size)
        const initialBox = new THREE.Box3().setFromObject(fbx);
        const size = initialBox.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetDimension = 0.34;
        const scaleFactor = targetDimension / (maxDimension > 0 ? maxDimension : 1);

        fbx.scale.setScalar(scaleFactor);

        // Center FBX vertices
        const centeredBox = new THREE.Box3().setFromObject(fbx);
        const center = centeredBox.getCenter(new THREE.Vector3());
        fbx.position.sub(center);

        materialsRef.current = [];

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

        setFbxModel(fbx);
      },
      undefined,
      err => {
        console.warn('Could not load hub.fbx, using procedural RGX mesh fallback:', err);
      }
    );
  }, []);

  useEffect(() => {
    materialsRef.current.forEach(mat => {
      mat.emissive.set(rgbColor);
    });
  }, [rgbColor]);

  return (
    <group position={[0, 0, 0]}>
      {fbxModel ? (
        <primitive object={fbxModel} />
      ) : (
        /* High-poly Procedural RGX 11z Pro Karambit */
        <group position={[0, 0, 0]}>
          <mesh geometry={handleGeometry} position={[0, 0, -0.013]} castShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.88} />
          </mesh>

          <mesh position={[-0.015, -0.08, 0]}>
            <boxGeometry args={[0.028, 0.1, 0.032]} />
            <meshStandardMaterial color="#1e293b" transparent opacity={0.65} roughness={0.1} metalness={0.95} />
          </mesh>

          <mesh position={[-0.015, -0.08, 0]}>
            <boxGeometry args={[0.018, 0.085, 0.02]} />
            <meshBasicMaterial color={rgbColor} />
          </mesh>

          <mesh position={[-0.038, -0.07, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.024, 0.015]} />
            <meshBasicMaterial color={rgbColor} />
          </mesh>

          <mesh position={[-0.015, -0.21, 0]} rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.026, 0.008, 20, 40]} />
            <meshStandardMaterial color="#020617" roughness={0.25} metalness={0.95} />
          </mesh>

          <mesh position={[-0.008, 0.01, 0]}>
            <boxGeometry args={[0.055, 0.025, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
          </mesh>

          <mesh geometry={bladeGeometry} position={[0, 0, -0.006]} castShadow>
            <meshStandardMaterial color="#0b0f19" roughness={0.15} metalness={0.95} />
          </mesh>

          <mesh geometry={neonEdgeGeometry} position={[0, 0, -0.007]}>
            <meshBasicMaterial color={rgbColor} transparent opacity={0.95} />
          </mesh>
        </group>
      )}

      {/* Dynamic RGB Point Light */}
      <pointLight position={[0.05, 0.15, 0.05]} color={rgbColor} intensity={3.5} distance={5} />
      <pointLight position={[-0.02, -0.08, 0]} color={rgbColor} intensity={2.2} distance={4} />
    </group>
  );
};
