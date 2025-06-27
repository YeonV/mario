import { Box, Fab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import PauseIcon from '@mui/icons-material/Pause';
import { TouchControls as IPhaserTouchControls } from '../game';
import { useEffect, useRef } from 'react'; // <-- Import useRef and useEffect

interface TouchControlsProps {
  controls: IPhaserTouchControls;
  onPauseClick: () => void;
}

export const TouchControls = ({ controls, onPauseClick }: TouchControlsProps) => {
  // --- Create refs for each button that needs non-passive listeners ---
  const leftButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const rightButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const jumpButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const pauseButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

  // --- Use useEffect to add event listeners with the correct options ---
  useEffect(() => {
    // A helper function to add listeners to a button
    const addListeners = (
      ref: React.RefObject<HTMLButtonElement>,
      startAction: (e: Event) => void,
      endAction?: (e: Event) => void
    ) => {
      const element = ref.current;
      if (!element) return;

      const options = { passive: false }; // <-- The crucial part!

      element.addEventListener('touchstart', startAction, options);
      if (endAction) {
        element.addEventListener('touchend', endAction, options);
        element.addEventListener('touchcancel', endAction, options);
      }

      // Cleanup function to remove listeners when component unmounts
      return () => {
        element.removeEventListener('touchstart', startAction);
        if (endAction) {
          element.removeEventListener('touchend', endAction);
          element.removeEventListener('touchcancel', endAction);
        }
      };
    };

    // Define the actions
    const onLeftStart = (e: Event) => { e.preventDefault(); controls.left(true); };
    const onLeftEnd = (e: Event) => { e.preventDefault(); controls.left(false); };
    const onRightStart = (e: Event) => { e.preventDefault(); controls.right(true); };
    const onRightEnd = (e: Event) => { e.preventDefault(); controls.right(false); };
    const onJump = (e: Event) => { e.preventDefault(); controls.up(); };
    const onPause = (e: Event) => { e.preventDefault(); onPauseClick(); };

    // Add the listeners
    
    const cleanupLeft = addListeners(leftButtonRef, onLeftStart, onLeftEnd);
    const cleanupRight = addListeners(rightButtonRef, onRightStart, onRightEnd);
    const cleanupJump = addListeners(jumpButtonRef, onJump);
    const cleanupPause = addListeners(pauseButtonRef, onPause);

    return () => {
      // Call all cleanup functions
      cleanupLeft?.();
      cleanupRight?.();
      cleanupJump?.();
      cleanupPause?.();
    };
  }, [controls, onPauseClick]); // Rerun effect if controls or onPauseClick change


  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 200,
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
        {/* Pause Button */}
        <Box sx={{ display: 'flex',pointerEvents: 'auto', position: 'absolute', bottom: -30, left: '50%' }}>
        {/* <Fab
          ref={pauseButtonRef} // <-- Assign ref
          color="primary"
          aria-label="pause"
          onMouseDown={(e) => { e.preventDefault(); onPauseClick(); console.log('Pause clicked'); }}
        //   onTouchStart={(e) => { e.preventDefault(); onPauseClick(); }} // Touch event for mobile
        >
          <PauseIcon />
        </Fab> */}
        </Box>
                    
                          {/* Left/Right Buttons */}
      <Box sx={{ display: 'flex', gap: 2, pointerEvents: 'auto' }}>
        <Fab
          ref={leftButtonRef} // <-- Assign ref
          color="primary"
          aria-label="left"
          // Keep mouse events for desktop, remove touch events
          onMouseDown={(e) => { e.preventDefault(); controls.left(true); }}
          onMouseUp={(e) => { e.preventDefault(); controls.left(false); }}
          onMouseLeave={(e) => { e.preventDefault(); controls.left(false); }} // Good practice
        >
          <ArrowBackIcon />
        </Fab>
        <Fab
          ref={rightButtonRef} // <-- Assign ref
          color="primary"
          aria-label="right"
          onMouseDown={(e) => { e.preventDefault(); controls.right(true); }}
          onMouseUp={(e) => { e.preventDefault(); controls.right(false); }}
          onMouseLeave={(e) => { e.preventDefault(); controls.right(false); }}
        >
          <ArrowForwardIcon />
        </Fab>
      </Box>

      {/* Jump Button */}
      <Box sx={{ pointerEvents: 'auto' }}>
        <Fab
          ref={jumpButtonRef} // <-- Assign ref
          color="primary"
          aria-label="jump"
          onMouseDown={(e) => { e.preventDefault(); controls.up(); }}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Box>
    </Box>
  );
};