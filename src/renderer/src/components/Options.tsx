import { Box, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, Switch, Typography } from '@mui/material';
import { useStore } from '../store/useStore';

export const Options = () => {
  // Get all the state and actions this component needs from the store
  const { availableThemes, currentThemeId, coinScale, bombScale, isSoundEnabled, isMusicEnabled } = useStore((s) => s.game);
  const { setTheme, setCoinScale, setBombScale, toggleSound, toggleMusic } = useStore((s) => s);

  // We don't need the restart logic here, as the parent component will handle it.
  const handleThemeChange = (event: SelectChangeEvent<number>) => {
    setTheme(event.target.value as number);
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          labelId="theme-select-label"
          value={currentThemeId}
          label="Theme"
          onChange={handleThemeChange}
        >
          {availableThemes.map(theme => (
            <MenuItem key={theme.id} value={theme.id}>{theme.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 1 }}>
        <Typography gutterBottom>Coin Size</Typography>
        <Slider
          value={coinScale}
          onChange={(_event, newValue) => setCoinScale(newValue as number)}
          min={0.1}
          max={1.0}
          step={0.05}
          aria-labelledby="coin-scale-slider"
        />
      </Box>
      
      <Box sx={{ mb: 1 }}>
        <Typography gutterBottom>Bomb Size</Typography>
        <Slider
          value={bombScale}
          onChange={(_event, newValue) => setBombScale(newValue as number)}
          min={0.5}
          max={2.0}
          step={0.1}
          aria-labelledby="bomb-scale-slider"
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
        <FormControlLabel
          control={<Switch checked={isSoundEnabled} onChange={toggleSound} />}
          label="Sound FX"
        />
        <FormControlLabel
          control={<Switch checked={isMusicEnabled} onChange={toggleMusic} />}
          label="Music"
        />
      </Box>
    </Box>
  );
};