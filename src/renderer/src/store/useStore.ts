/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { storeBears, storeBearsActions } from './storeBears';
import { storeTours, storeToursActions } from './storeTours';
import { storeUI, storeUIActions } from './storeUI';
import { storeGame, storeGameActions } from './storeGame';


export type AppState = {
  hackedBy: string;
  ui: typeof storeUI;
  tours: typeof storeTours;
  example: typeof storeBears;
  game: typeof storeGame;
} & ReturnType<typeof storeUIActions> &
  ReturnType<typeof storeBearsActions> &
  ReturnType<typeof storeToursActions> &
  ReturnType<typeof storeGameActions> 

export const useStore = create<AppState>()(
  devtools(
    persist(
      combine(
        {
          hackedBy: 'Blade',
          ui: storeUI,
          tours: storeTours,
          example: storeBears,
          game: storeGame,
        },
        (set: any, get: any) => ({
          ...storeUIActions(set),
          ...storeBearsActions(set),
          ...storeToursActions(set),
          ...storeGameActions(set, get),
        })
      ),
      {
        name: 'mario-storage',
        partialize: (state: AppState) => ({
          ...state,
          // Remove isPaused and isGameOver from persisted game state
          game: {
            ...state.game,
            isPaused: undefined,
            isGameOver: undefined,
          },
        }),
      }
    )
  )
);