import { Box, Typography, CssBaseline, ThemeProvider, createTheme, Modal, Button, Stack } from '@mui/material'; // Add Modal, Button
import { PhaserGame } from './game/PhaserGame';
import { useStore } from './store/useStore';
import { useMemo } from 'react';
// --- NEW: Import the full config data type ---
import type { LaunchConfigCustomData } from './game'; 

interface ExtendedLaunchConfigCustomData extends LaunchConfigCustomData {
  onGameOver: () => void;
  onPause: () => void;
}

const theme = createTheme({ palette: { mode: 'dark' } });

// Style for the Game Over modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

function App() {
  const score = useStore((state) => state.game.score);
  const isGameOver = useStore((state) => state.game.isGameOver); // Get game over state
  const isPaused = useStore((state) => state.game.isPaused);
  const setScore = useStore((state) => state.setScore);
  const setGameOver = useStore((state) => state.setGameOver); // Get game over action
  const togglePause = useStore((state) => state.togglePause);

  const getGame = (): Phaser.Game | undefined => (window as any).phaserGame;


  const handleContinue = () => {
    getGame()?.scene.resume('GameScene');
    togglePause(false);
  };

  const handleRestart = () => {
    togglePause(false); // Close pause menu if open
    setGameOver(false); // Close game over menu if open
    getGame()?.scene.getScene('GameScene').scene.restart();
  };
  
  const handleQuit = () => {
    window.api.quit(); // Use our new preload function
  };

  const customData = useMemo<ExtendedLaunchConfigCustomData>(() => ({
    onScoreUpdate: (newScore) => setScore(newScore),
    onGameOver: () => setGameOver(true),
    onPause: () => togglePause(true), // Tell Zustand to pause
  }), [setScore, setGameOver, togglePause]);


  // A bit of a hack to get the game instance for restarting.
  // We'll expose it on the window object from PhaserGame component.
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, height: '100vh', background: '#1e1e1e' }}>
        
        <Box sx={{ width: 800, mb: 2, p: 2, border: '1px solid #444', borderRadius: 1, background: '#2d2d2d' }}>
          <Typography variant="h4" sx={{ color: '#fff' }}>Super Vitron Bros.</Typography>
          <Typography variant="h6" sx={{ color: '#fff' }}>Score: {score}</Typography>
        </Box>

        <Box sx={{ position: 'relative', border: '2px solid white', borderRadius: '4px', overflow: 'hidden', width: 800, height: 600 }}>
          <PhaserGame customData={customData} />
        </Box>

        <Modal open={isPaused} onClose={handleContinue}>
          <Box sx={modalStyle}>
            <Typography variant="h3" component="h2">Paused</Typography>
            <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
              <Button variant="contained" color="primary" onClick={handleContinue}>Continue</Button>
              <Button variant="outlined" color="secondary" onClick={handleRestart}>Restart</Button>
              <Button variant="outlined" color="error" onClick={handleQuit}>Quit Game</Button>
            </Stack>
          </Box>
        </Modal>
        {/* --- NEW: Game Over Modal --- */}
        <Modal
          open={isGameOver}
          aria-labelledby="game-over-modal-title"
          aria-describedby="game-over-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="game-over-modal-title" variant="h3" component="h2">
              Game Over
            </Typography>
            <Typography id="game-over-modal-description" sx={{ mt: 2 }}>
              Your final score: {score}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleRestart} sx={{ mt: 3 }}>
              Restart Game
            </Button>
          </Box>
        </Modal>
        
      </Box>
    </ThemeProvider>
  );
}

export default App;