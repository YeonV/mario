import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { launchGame, type LaunchConfigCustomData } from './index';
import Phaser from 'phaser';

interface PhaserGameProps {
  customData: LaunchConfigCustomData;
}

export const PhaserGame: FC<PhaserGameProps> = ({ customData }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  // Keep a ref to the game instance to prevent re-initialization
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Only create the game if the ref is null and the container exists
    if (gameContainerRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = launchGame(gameContainerRef.current.id, customData);
    }

    // The cleanup function will run when the component unmounts
    return () => {
      gameInstanceRef.current?.destroy(true);
      // IMPORTANT: Set the ref back to null on cleanup
      gameInstanceRef.current = null;
    };
  }, [customData]); // The dependency array is correct

  return <div id="phaser-game-container" ref={gameContainerRef} style={{ width: '100%', height: '100%' }} />;
};