import { Box, Fab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { TouchControls as IPhaserTouchControls } from '../game'; // We will define this type next

interface TouchControlsProps {
  // The object containing the functions to call in Phaser
  controls: IPhaserTouchControls;
}

export const TouchControls = ({ controls }: TouchControlsProps) => {
  // These handlers prevent the default browser behavior on touch, like scrolling or zooming.
  const handleInteractionStart = (action: (isDown: boolean) => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    action(true);
  };
  
  const handleInteractionEnd = (action: (isDown: boolean) => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    action(false);
  };

  const handleJump = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    controls.up();
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        p: 3,
        pointerEvents: 'none', // Allow clicks to pass through the container
      }}
    >
      {/* Left/Right Buttons */}
      <Box sx={{ display: 'flex', gap: 2, pointerEvents: 'auto' }}>
        <Fab
          color="primary"
          aria-label="left"
          onMouseDown={handleInteractionStart(controls.left)}
          onMouseUp={handleInteractionEnd(controls.left)}
          onTouchStart={handleInteractionStart(controls.left)}
          onTouchEnd={handleInteractionEnd(controls.left)}
        >
          <ArrowBackIcon />
        </Fab>
        <Fab
          color="primary"
          aria-label="right"
          onMouseDown={handleInteractionStart(controls.right)}
          onMouseUp={handleInteractionEnd(controls.right)}
          onTouchStart={handleInteractionStart(controls.right)}
          onTouchEnd={handleInteractionEnd(controls.right)}
        >
          <ArrowForwardIcon />
        </Fab>
      </Box>

      {/* Jump Button */}
      <Box sx={{ pointerEvents: 'auto' }}>
        <Fab
          color="primary"
          aria-label="jump"
          onMouseDown={handleJump}
          onTouchStart={handleJump}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Box>
    </Box>
  );
};