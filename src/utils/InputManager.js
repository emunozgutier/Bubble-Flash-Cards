export const setupInputListeners = ({ onCorrect, onIncorrect, onReplay, log = console.log }) => {
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

export const setupDiagnosticListeners = (onInput) => {
    const handleKeyDown = (e) => {
        if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        onInput({
            type: 'Keyboard',
            code: e.code,
            key: e.key,
            timestamp: new Date().toLocaleTimeString()
        });
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 'Down' : 'Up';
        onInput({
            type: 'Wheel',
            code: `Scroll ${direction}`,
            key: `deltaY: ${Math.round(e.deltaY)}`,
            timestamp: new Date().toLocaleTimeString()
        });
    };

    const handleMouseDown = (e) => {
        const buttons = ['Left', 'Middle', 'Right'];
        onInput({
            type: 'Mouse',
            code: `${buttons[e.button] || 'Unknown'} Click`,
            key: `Button ID: ${e.button}`,
            timestamp: new Date().toLocaleTimeString()
        });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousedown', handleMouseDown);
    };
};

export const setupDebugKeyboardListener = (onKeyUpdate) => {
    const debugListener = (e) => {
        const keyInfo = `${e.code} (${e.key})`;
        onKeyUpdate(keyInfo);
    };
    window.addEventListener('keydown', debugListener);
    return () => window.removeEventListener('keydown', debugListener);
};

