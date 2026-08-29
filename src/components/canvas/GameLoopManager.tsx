import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

export const GameLoopManager: React.FC = () => {
  const tickGame = useGameStore(state => state.tickGame);

  useFrame((_, delta) => {
    tickGame(delta);
  });

  return null;
};
