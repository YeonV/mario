import { Box, Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const HighScoresPage = () => {
  const highScores = useStore((s) => s.game.highScores);

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h2" gutterBottom>High Scores</Typography>
      <Paper sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
        <List>
          {highScores?.map((score, index) => (
            <ListItem key={index} divider>
              <ListItemText 
                primary={`${index + 1}. ${score.name}`} 
                secondary={`Score: ${score.score}`} 
              />
            </ListItem>
          ))}
          {highScores.length === 0 && (
            <ListItem><ListItemText primary="No scores yet. Be the first!" /></ListItem>
          )}
        </List>
      </Paper>
      <Button component={Link} to="/" variant="contained">Back to Menu</Button>
    </Box>
  );
};