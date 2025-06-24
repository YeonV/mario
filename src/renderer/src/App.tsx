import { Box, Typography, CssBaseline, ThemeProvider, createTheme, Modal, Button } from '@mui/material'; // Add Modal, Button
import { PhaserGame } from './game/PhaserGame';
import { useStore } from './store/useStore';
import { useMemo } from 'react';
// --- NEW: Import the full config data type ---
import type { LaunchConfigCustomData } from './game'; 

interface ExtendedLaunchConfigCustomData extends LaunchConfigCustomData {
  onGameOver: () => void;
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
  const setScore = useStore((state) => state.setScore);
  const setGameOver = useStore((state) => state.setGameOver); // Get game over action

  // When we restart, we need to tell Phaser to restart the scene
  const handleRestart = () => {
    // This is a bit of a hack. A better way would be an event bus.
    // We signal a restart by setting isGameOver to false.
    setGameOver(false);
    // Find the running game instance and restart its main scene.
    const game = (window as any).phaserGame as Phaser.Game;
    if (game) {
      game.scene.getScene('GameScene').scene.restart();
    }
  };
  
  const customData = useMemo<ExtendedLaunchConfigCustomData>(() => ({
    onScoreUpdate: (newScore) => setScore(newScore),
    // --- NEW: Define the onGameOver function to pass to Phaser ---
    onGameOver: () => setGameOver(true),
  }), [setScore, setGameOver]);

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