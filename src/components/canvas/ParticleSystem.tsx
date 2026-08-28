import React from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const ParticleSystem: React.FC = () => {
  const particles = useGameStore(state => state.particles);
  const tracers = useGameStore(state => state.bulletTracers);

  return (
    <group>
      {/* Exploding Shatter Particles */}
      {particles.map(p => (
        <mesh key={p.id} position={p.position}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshBasicMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}

      {/* High Velocity Bullet Tracers */}
      {tracers.map(tracer => {
        const from = new THREE.Vector3(...tracer.from);
        const to = new THREE.Vector3(...tracer.to);
        const dir = new THREE.Vector3().subVectors(to, from);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );

        return (
          <mesh key={tracer.id} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.018, 0.018, len, 6]} />
            <meshBasicMaterial color={tracer.color} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
};
