/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';

export interface HighScore {
  name: string;
  score: number;
}
// 1. Add isGameOver to the state shape
export const storeGame = {
  score: 0,
  isGameOver: false,
  isPaused: false,
  awaitingHighScoreName: false,
  highScores: [] as HighScore[]
};

export const storeGameActions = (set: any, get: any) => ({
  setScore: (to: number): void =>
    set(
      produce((state: any) => {
        state.game.score = to;
      }),
      false,
      'game/setScore' // Renamed for clarity
    ),

  togglePause: (isPaused: boolean): void =>
    set(
      produce((state: any) => {
        state.game.isPaused = isPaused;
      }),
      false,
      'game/togglePause'
    ),
  addHighScore: (name: string): void => {
    const newScore: HighScore = { name, score: get().game.score };
    // This action now directly modifies the state.
    // Zustand's persist middleware will automatically save the new state to localStorage.
    set(
      produce((state: any) => {
        const scores = [...state.game.highScores, newScore];
        scores.sort((a, b) => b.score - a.score); // Sort descending
        state.game.highScores = scores.slice(0, 10); // Keep only top 10
        state.game.awaitingHighScoreName = false; // Hide the input modal
        state.game.isGameOver = true; // Now show the game over modal
      }),
      false,
      'game/addHighScore'
    );
  },

  checkForHighScore: (): void => {
    const score = get().game.score;
    const scores = get().game.highScores;
    if (scores.length < 10 || score > (scores[scores.length - 1]?.score ?? 0)) {
      set(produce((state: any) => { state.game.awaitingHighScoreName = true; }), false, 'game/checkForHighScore');
    } else {
      set(produce((state: any) => { state.game.isGameOver = true; }), false, 'game/setGameOver');
    }
  },
  
  setGameOver: (isOver: boolean): void => {
    if (isOver) {
      get().checkForHighScore();
    } else {
      set(
        produce((state: any) => {
          state.game.isGameOver = false;
          state.game.score = 0;
        }),
        false,
        'game/resetGame'
      );
    }
  },

});