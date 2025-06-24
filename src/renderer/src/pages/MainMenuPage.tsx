import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const MainMenuPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h1" gutterBottom>Super Vitron Bros.</Typography>
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Button component={Link} to="/game" variant="contained" size="large">Start Game</Button>
        <Button component={Link} to="/highscores" variant="outlined" size="large">High Scores</Button>
      </Stack>
    </Box>
  );
};