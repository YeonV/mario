import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import { MainMenuPage } from './pages/MainMenuPage';
import { GamePage } from './pages/GamePage';
import { HighScoresPage } from './pages/HighScoresPage';

const theme = createTheme({ palette: { mode: 'dark' } });

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainMenuPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/highscores" element={<HighScoresPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;