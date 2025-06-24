import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

// Define the shape of the data we'll pass from React to our Phaser scenes
export interface LaunchConfigCustomData {
  onScoreUpdate: (score: number) => void;
}

export const launchGame = (containerId: string, customData: LaunchConfigCustomData): Phaser.Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: containerId,
    backgroundColor: '#000000',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 450 },
        // debug: import.meta.env.DEV,
      },
    },
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.FIT, // This is the equivalent of "object-fit: contain"
      autoCenter: Phaser.Scale.CENTER_BOTH, // This centers the canvas vertically and horizontally
    }
  };

  const game = new Phaser.Game(config);

  // A clean way to pass data to the scene is to add it to the game instance
  // and retrieve it in the scene's init method.
  (game as any).customData = customData;

  return game;
};