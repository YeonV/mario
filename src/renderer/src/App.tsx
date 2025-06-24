import { Box, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PhaserGame } from './game/PhaserGame';
import { useStore } from './store/useStore';
import { useMemo } from 'react';
import type { LaunchConfigCustomData } from './game';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  // CORRECT: Use selectors to get state and actions.
  // This prevents re-renders when other parts of the store change.
  const score = useStore((state) => state.game.score);
  const setScore = useStore((state) => state.setScore);

  // useMemo prevents the customData object from being recreated on every render,
  // which would cause the Phaser game to re-initialize.
  const customData = useMemo<LaunchConfigCustomData>(() => ({
    onScoreUpdate: (newScore) => {
      console.log('Updating score in React:', newScore);
      setScore(newScore);
    },
  }), [setScore]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, height: '100vh', background: '#1e1e1e' }}>
        
        {/* The React UI Part */}
        <Box sx={{ width: 800, mb: 2, p: 2, border: '1px solid #444', borderRadius: 1, background: '#2d2d2d' }}>
          <Typography variant="h4" sx={{ color: '#fff' }}>Super Vitron Bros.</Typography>
          <Typography variant="h6" sx={{ color: '#fff' }}>Score: {score}</Typography>
        </Box>

        {/* The Phaser Game Part */}
        <Box sx={{ border: '2px solid white', borderRadius: '4px', overflow: 'hidden', width: 800, height: 600 }}>
          <PhaserGame customData={customData} />
        </Box>
        
      </Box>
    </ThemeProvider>
  );
}

export default App;