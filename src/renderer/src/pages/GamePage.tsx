import { Box, Button, Modal, Stack, Typography } from '@mui/material';
import { useStore } from '../store/useStore';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../game/PhaserGame';
import type { LaunchConfigCustomData } from '../game';
import { HighScoreModal } from '../components/HighScoreModal';
import { Options } from '@renderer/components/Options';
import type { TouchControls as IPhaserTouchControls } from '../game'; // Import the type
import { TouchControls } from '@renderer/components/TouchControls';

interface ExtendedLaunchConfigCustomData extends LaunchConfigCustomData {
  onGameOver: () => void;
  onPause: () => void;
  currentThemeId: number;
  coinScale: number;
  bombScale: number;
  onControlsCreated: (controls: IPhaserTouchControls) => void;
}

export const modalStyle = {
  position: 'absolute' as const,
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

export const GamePage = () => {
  const navigate = useNavigate();
  const [touchControls, setTouchControls] = useState<IPhaserTouchControls | null>(null);
  const { score, isGameOver, isPaused, currentThemeId, coinScale, bombScale } = useStore((s) => s.game);
  const { setScore, setGameOver, togglePause } = useStore((s) => s);

  const getGame = (): Phaser.Game | undefined => (window as any).phaserGame;

  const handleContinue = () => {
    getGame()?.scene.resume('GameScene');
    togglePause(false);
  };

  const handleRestart = () => {
    togglePause(false);
    setGameOver(false);
    getGame()?.scene.getScene('GameScene').scene.restart();
  };

  const handleMainMenu = () => {
    togglePause(false);
    setGameOver(false);
    navigate('/');
  };

  const customData = useMemo<ExtendedLaunchConfigCustomData>(
    () => ({
      onScoreUpdate: (newScore) => setScore(newScore),
      onGameOver: () => setGameOver(true),
      onPause: () => togglePause(true),
      currentThemeId: currentThemeId,
      coinScale: coinScale,
      bombScale: bombScale,
      onControlsCreated: (controls) => setTouchControls(controls),

    }),
    [setScore, setGameOver, togglePause, currentThemeId, coinScale, bombScale]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0, height: '100vh', background: '#1e1e1e' }}>
      <Box sx={{ position: 'relative', border: '0px solid white', borderRadius: '4px', overflow: 'hidden', width: '100%', flex: 1 }}>
      <Typography variant="h6" sx={{ color: '#fff', position: 'absolute', top: 5, right: 15 }}>Score: {score}</Typography>
        <PhaserGame customData={customData} />
        {touchControls && <TouchControls controls={touchControls} />}
      </Box>

      <HighScoreModal />

      <Modal open={isPaused} onClose={handleContinue}>
        <Box sx={modalStyle}>
          <Typography variant="h3" component="h2">Paused</Typography>
          <Options />
          <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
            <Button variant="contained" color="primary" onClick={handleContinue}>Continue</Button>
            <Button variant="outlined" color="error" onClick={handleRestart}>Restart</Button>
            <Button variant="outlined" color="error" onClick={handleMainMenu}>Main Menu</Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={isGameOver}>
        <Box sx={modalStyle}>
          <Typography variant="h3" component="h2">Game Over</Typography>
          <Typography sx={{ mt: 2 }}>Your final score: {score}</Typography>
          <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
            <Button variant="contained" color="primary" onClick={handleRestart}>Play Again</Button>
            <Button variant="outlined" color="error" onClick={handleMainMenu}>Main Menu</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};