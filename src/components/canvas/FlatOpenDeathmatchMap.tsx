import React from 'react';
import * as THREE from 'three';

export const FlatOpenDeathmatchMap: React.FC = () => {
  return (
    <group>
      {/* ========================================================================= */}
      {/* 1. VIBRANT BRIGHT BLUE ATMOSPHERIC SKY DOME */}
      {/* ========================================================================= */}
      {/* Outer Sky Sphere */}
      <mesh>
        <sphereGeometry args={[110, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.BackSide} />
      </mesh>

      {/* Atmospheric Horizon Haze Ring */}
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[108, 108, 40, 32, 1, true]} />
        <meshBasicMaterial color="#bae6fd" side={THREE.BackSide} transparent opacity={0.65} />
      </mesh>

      {/* Radiant Sun Disc in Sky */}
      <mesh position={[40, 60, -50]}>
        <sphereGeometry args={[7, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[40, 60, -50]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.35} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. COMPLETELY FLAT WIDE OPEN ARENA FLOOR (120m x 120m) */}
      {/* ========================================================================= */}
      {/* Main High-Performance Concrete / Tactical Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Central Combat Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8, 8.2, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[22, 22.3, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>

      {/* Precision Tactical Grid Lines across entire flat arena */}
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map(x => (
        <mesh key={`grid_x_${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, 0]}>
          <planeGeometry args={[0.06, 100]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.45} />
        </mesh>
      ))}
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map(z => (
        <mesh key={`grid_z_${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[100, 0.06]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Outer Boundary Glowing Edge Rails */}
      <mesh position={[0, 0.5, -50]}>
        <boxGeometry args={[100, 1.0, 0.4]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 50]}>
        <boxGeometry args={[100, 1.0, 0.4]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-50, 0.5, 0]}>
        <boxGeometry args={[0.4, 1.0, 100]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[50, 0.5, 0]}>
        <boxGeometry args={[0.4, 1.0, 100]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>

      {/* Symmetrical Low-Profile Spawn Platforms (Flat on ground) */}
      {[
        [-25, -25],
        [25, -25],
        [-25, 25],
        [25, 25],
        [0, -35],
        [0, 35],
        [-35, 0],
        [35, 0]
      ].map(([px, pz], idx) => (
        <group key={idx} position={[px, 0.015, pz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.5, 32]} />
            <meshBasicMaterial color={idx % 2 === 0 ? '#00f0ff' : '#ff0055'} transparent opacity={0.25} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.4, 2.5, 32]} />
            <meshBasicMaterial color={idx % 2 === 0 ? '#00f0ff' : '#ff0055'} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
