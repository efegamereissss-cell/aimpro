import React from 'react';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { RedmatchPlayerModel } from './RedmatchPlayerModel';

export const RemotePlayersManager: React.FC = () => {
  const isMultiplayerActive = useMultiplayerStore(state => state.isMultiplayerActive);
  const remotePlayers = useMultiplayerStore(state => state.remotePlayers);

  if (!isMultiplayerActive) return null;

  const playersList = Object.values(remotePlayers);

  return (
    <group>
      {playersList.map(player => (
        <RedmatchPlayerModel key={player.id} player={player} />
      ))}
    </group>
  );
};
