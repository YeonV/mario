/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';

// 1. Add isGameOver to the state shape
export const storeGame = {
  score: 0,
  isGameOver: false,
  isPaused: false, 
};

export const storeGameActions = (set: any) => ({
  setScore: (to: number): void =>
    set(
      produce((state: any) => {
        state.game.score = to;
      }),
      false,
      'game/setScore' // Renamed for clarity
    ),
  
  // 2. Add a new action to handle game over
  setGameOver: (isOver: boolean): void =>
    set(
      produce((state: any) => {
        state.game.isGameOver = isOver;
        // Optional: Also reset score on new game start
        if (!isOver) {
          state.game.score = 0;
        }
      }),
      false,
      'game/setGameOver'
    ),
  togglePause: (isPaused: boolean): void =>
    set(
      produce((state: any) => {
        state.game.isPaused = isPaused;
      }),
      false,
      'game/togglePause'
    ),
});