export const setupKeyboardListeners = ({ onCorrect, onIncorrect, onReplay, log = console.log }) => {
    const handleKeyDown = (e) => {
        log(`Key: ${e.code} (${e.key})`);

        if (e.code === 'ArrowRight' || e.code === 'Space' || e.code === 'MediaTrackNext') {
            // Prevent scroll for space
            if (e.code === 'Space') e.preventDefault();
            if (onCorrect) onCorrect();
        } else if (e.code === 'ArrowLeft' || e.code === 'MediaTrackPrevious') {
            if (onIncorrect) onIncorrect();
        } else if (e.code === 'MediaPlayPause') {
            e.preventDefault();
            if (onReplay) onReplay();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
};
