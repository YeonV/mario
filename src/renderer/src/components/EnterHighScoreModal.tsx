import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { modalStyle } from '@renderer/pages/GamePage';


export const EnterHighScoreModal = () => {
  const [name, setName] = useState('');
  const score = useStore((s) => s.game.score);
  const addHighScore = useStore((s) => s.addHighScore);
  const isVisible = useStore((s) => s.game.awaitingHighScoreName);

  const handleSave = () => {
    if (name.trim().length === 3) {
      addHighScore(name.trim().toUpperCase());
    }
  };

  return (
    <Modal open={isVisible}>
      <Box sx={modalStyle}>
        <Typography variant="h4">New High Score!</Typography>
        <Typography variant="h5" sx={{ mt: 1 }}>Score: {score}</Typography>
        <TextField
          label="Enter Your Initials (3 letters)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          inputProps={{ maxLength: 3 }}
          sx={{ mt: 3, width: '100%' }}
        />
        <Button onClick={handleSave} disabled={name.trim().length !== 3} sx={{ mt: 2 }} variant="contained">
          Save Score
        </Button>
      </Box>
    </Modal>
  );
};