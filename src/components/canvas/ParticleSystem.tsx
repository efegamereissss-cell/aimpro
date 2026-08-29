import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const ParticleSystem: React.FC = () => {
  const particles = useGameStore(state => state.particles);
  const tracers = useGameStore(state => state.bulletTracers);
  const now = Date.now();

  return (
    <group>
      {/* 3D Exploding Shatter Particles */}
      {particles.map(p => (
        <mesh key={p.id} position={p.position}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.8}
            transparent
            opacity={p.life}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* High-Velocity Glow Tracers */}
      {tracers.map(tracer => {
        const age = now - tracer.createdAt;
        if (age > tracer.duration) return null;

        const life = Math.max(0, 1 - age / tracer.duration);
        const from = new THREE.Vector3(...tracer.from);
        const to = new THREE.Vector3(...tracer.to);
        const dir = new THREE.Vector3().subVectors(to, from);
        const len = dir.length();
        if (len < 0.1) return null;

        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );

        return (
          <mesh key={tracer.id} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.022, 0.022, len, 8]} />
            <meshBasicMaterial color={tracer.color} transparent opacity={life * 0.9} />
          </mesh>
        );
      })}
    </group>
  );
};
