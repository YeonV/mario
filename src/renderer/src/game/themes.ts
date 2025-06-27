export interface Theme {
  id: number;   // The theme's index, e.g., 1, 2, 3
  name: string; // The display name, e.g., "Night Mode"
}

// This is now our single source of truth for available themes.
export const THEMES: Theme[] = [
  {
    id: 1,
    name: 'Night Mode',
  },
  {
    id: 2,
    name: 'Day Mode',
  },
  {
    id: 3,
    name: 'Mario Mode',
  },
];