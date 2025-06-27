import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { launchGame, type LaunchConfigCustomData } from './index';
import Phaser from 'phaser';
import { useStore } from '@renderer/store/useStore';

interface PhaserGameProps {
  customData: LaunchConfigCustomData;
}

export const PhaserGame: FC<PhaserGameProps> = ({ customData }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const isSoundEnabled = useStore((s) => s.game.isSoundEnabled);
  const isMusicEnabled = useStore((s) => s.game.isMusicEnabled);
  
  // Hook 1: Creation & Destruction (Your code is perfect)
  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = launchGame(gameContainerRef.current.id, customData);
      (window as any).phaserGame = gameInstanceRef.current;
    }
    return () => {
      gameInstanceRef.current?.destroy(true);
      gameInstanceRef.current = null;
      (window as any).phaserGame = null;
    };
  }, []);

  // Hook 2: Updating Data (Your code is perfect)
  useEffect(() => {
    if (gameInstanceRef.current) {
      (gameInstanceRef.current as any).customData = customData;
    }
  }, [customData]);

  // --- MODIFIED: Hook 3: For Syncing ALL Sound States ---
  // This now runs when EITHER sound setting changes.
useEffect(() => {
    const game = gameInstanceRef.current;
    if (game) {
      // The master 'Sound' toggle controls ALL audio via the global mute. This is correct.
      game.sound.mute = !isSoundEnabled;

      // The 'Music' toggle specifically targets the music track.
      // We will look for a special 'musicTrack' property on the game instance.
      const musicTrack = (game as any).musicTrack as Phaser.Sound.BaseSound;
      
      if (musicTrack && musicTrack.isPlaying) {
          // Here we perform a type check to safely access setMute
          if ('setMute' in musicTrack) {
            (musicTrack as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setMute(!isMusicEnabled);
          }
      }
    }
  }, [isSoundEnabled, isMusicEnabled]);

  return (
    <div
      id="phaser-game-container"
      ref={gameContainerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};