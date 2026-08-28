import React from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';

export const FloatingText3D: React.FC = () => {
  const texts = useGameStore(state => state.floatingTexts);
  const now = Date.now();

  return (
    <group>
      {texts.map(item => {
        const age = now - item.createdAt;
        const progress = Math.min(age / item.lifetime, 1);
        const yOffset = progress * 0.8;
        const opacity = 1 - progress;

        return (
          <group
            key={item.id}
            position={[item.position[0], item.position[1] + yOffset, item.position[2]]}
          >
            <Html center distanceFactor={12}>
              <div
                style={{
                  color: item.color,
                  opacity,
                  transform: `scale(${1 + progress * 0.3})`,
                  textShadow: `0 0 10px ${item.color}`,
                  fontWeight: 900,
                  fontSize: '22px',
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                {item.text}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
