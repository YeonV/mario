import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { launchGame, type LaunchConfigCustomData } from './index';
import Phaser from 'phaser';

// The props interface remains the same
interface PhaserGameProps {
  customData: LaunchConfigCustomData;
}

export const PhaserGame: FC<PhaserGameProps> = ({ customData }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  // --- HOOK 1: For Game Creation & Destruction ---
  // This effect runs only ONCE when the component mounts, and its cleanup
  // runs only ONCE when the component unmounts. The empty dependency array [] ensures this.
  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      // Create the game instance
      gameInstanceRef.current = launchGame(
        gameContainerRef.current.id,
        customData
      );
      // Expose it on the window for our restart handlers
      (window as any).phaserGame = gameInstanceRef.current;
    }

    return () => {
      // Destroy the game instance on unmount
      gameInstanceRef.current?.destroy(true);
      gameInstanceRef.current = null;
      (window as any).phaserGame = null;
    };
  }, []); // <-- CRITICAL: Empty dependency array

  // --- HOOK 2: For Updating Data on the Running Game ---
  // This effect runs whenever the `customData` prop changes.
  useEffect(() => {
    // If the game instance exists, just update its customData property.
    // This does NOT restart the game. It just makes the new data
    // available for the *next* time the scene's init() method is called (e.g., on restart).
    if (gameInstanceRef.current) {
      (gameInstanceRef.current as any).customData = customData;
    }
  }, [customData]); // <-- This now safely updates data without restarting

  return (
    <div
      id="phaser-game-container"
      ref={gameContainerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};