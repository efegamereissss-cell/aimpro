import React, { useMemo } from 'react';
import * as THREE from 'three';

interface RGXKarambitModelProps {
  rgbColor: string;
}

export const RGXKarambitModel: React.FC<RGXKarambitModelProps> = ({ rgbColor }) => {
  // 1. Precise Curved Talon Blade Geometry with Center Skeletal Slot
  const bladeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at hilt base
    shape.moveTo(-0.025, 0);
    // Outer spine curve with stepped tactical serrations
    shape.lineTo(-0.03, 0.06);
    shape.lineTo(-0.04, 0.07);
    shape.lineTo(-0.032, 0.14);
    shape.lineTo(-0.042, 0.15);
    shape.quadraticCurveTo(-0.045, 0.25, -0.02, 0.34);
    // Sharp Talon Claw Hook Tip
    shape.quadraticCurveTo(0.02, 0.42, 0.08, 0.45);
    // Inner razor-sharp cutting edge
    shape.quadraticCurveTo(0.01, 0.36, -0.005, 0.25);
    shape.quadraticCurveTo(-0.01, 0.15, 0.01, 0.05);
    shape.lineTo(0.015, 0);
    shape.closePath();

    // Skeletal aerodynamic cutout slot
    const hole = new THREE.Path();
    hole.moveTo(-0.015, 0.1);
    hole.lineTo(-0.022, 0.22);
    hole.lineTo(-0.008, 0.28);
    hole.lineTo(-0.002, 0.15);
    hole.closePath();
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.012,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.004,
      bevelThickness: 0.004
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // 2. Glowing Neon Blade Edge Insert Geometry
  const neonEdgeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.005, 0);
    shape.lineTo(0.015, 0);
    shape.quadraticCurveTo(-0.01, 0.15, -0.005, 0.25);
    shape.quadraticCurveTo(0.01, 0.36, 0.08, 0.45);
    shape.quadraticCurveTo(0.04, 0.42, 0.01, 0.34);
    shape.quadraticCurveTo(-0.015, 0.24, -0.015, 0.12);
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.014,
      bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // 3. Ergonomic Handle Shape with 3 Deep Finger Grooves
  const handleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.028, 0);
    // Left outer curve
    shape.quadraticCurveTo(-0.04, -0.08, -0.035, -0.16);
    // Bottom connecting to ring
    shape.lineTo(-0.015, -0.18);
    // Inner finger grooves (3 ergonomic scallops)
    shape.quadraticCurveTo(-0.005, -0.15, -0.012, -0.12);
    shape.quadraticCurveTo(0.002, -0.09, -0.005, -0.06);
    shape.quadraticCurveTo(0.008, -0.03, 0.015, 0);
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.026,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.006,
      bevelThickness: 0.006
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Carbon-Fiber & Matte Titanium Ergonomic Handle */}
      <mesh geometry={handleGeometry} position={[0, 0, -0.013]} castShadow>
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.3}
          metalness={0.88}
        />
      </mesh>

      {/* 2. Transparent Polycarbonate Acrylic Window */}
      <mesh position={[-0.015, -0.08, 0]}>
        <boxGeometry args={[0.028, 0.1, 0.032]} />
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* 3. Internal Glowing RGB Motherboard Circuit PCB */}
      <mesh position={[-0.015, -0.08, 0]}>
        <boxGeometry args={[0.018, 0.085, 0.02]} />
        <meshBasicMaterial color={rgbColor} />
      </mesh>

      {/* 4. Digital LED Kill Counter Screen on Handle */}
      <mesh position={[-0.038, -0.07, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.024, 0.015]} />
        <meshBasicMaterial color={rgbColor} />
      </mesh>

      {/* 5. Rear Index Finger Retention Ring (Center of Rotation) */}
      <mesh position={[-0.015, -0.21, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.026, 0.008, 20, 40]} />
        <meshStandardMaterial color="#020617" roughness={0.25} metalness={0.95} />
      </mesh>

      {/* 6. Titanium Blade Hilt Crossguard Bracket */}
      <mesh position={[-0.008, 0.01, 0]}>
        <boxGeometry args={[0.055, 0.025, 0.03]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* 7. High-Poly Curved Talon Blade Chassis */}
      <mesh geometry={bladeGeometry} position={[0, 0, -0.006]} castShadow>
        <meshStandardMaterial
          color="#0b0f19"
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      {/* 8. Glowing RGB Razor Cutting Edge */}
      <mesh geometry={neonEdgeGeometry} position={[0, 0, -0.007]}>
        <meshBasicMaterial color={rgbColor} transparent opacity={0.95} />
      </mesh>

      {/* 9. Glowing Blade Tip RGB Emitter */}
      <pointLight position={[0.05, 0.35, 0]} color={rgbColor} intensity={3.5} distance={6} />
      <pointLight position={[-0.015, -0.08, 0]} color={rgbColor} intensity={2.0} distance={4} />
    </group>
  );
};
