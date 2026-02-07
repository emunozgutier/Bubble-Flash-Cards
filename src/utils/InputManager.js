const STORAGE_KEY = 'hands_free_input_mappings';

const DEFAULT_MAPPINGS = {
    correct: ['ArrowRight', 'Space', 'MediaTrackNext'],
    incorrect: ['ArrowLeft', 'MediaTrackPrevious'],
    replay: ['MediaPlayPause']
};

// Load mappings from storage or use defaults
export const getMappings = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load input mappings", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_MAPPINGS)); // Deep copy defaults
};

export const saveMappings = (newMappings) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMappings));
        // Dispatch event so active listeners can reload if needed (optional optimization)
        window.dispatchEvent(new Event('input-mappings-changed'));
    } catch (e) {
        console.error("Failed to save input mappings", e);
    }
};

export const resetMappings = () => {
    saveMappings(DEFAULT_MAPPINGS);
    return DEFAULT_MAPPINGS;
};

export const setupInputListeners = ({ onCorrect, onIncorrect, onReplay, log = console.log }) => {
    let currentMappings = getMappings();

    const handleMappingsChanged = () => {
        currentMappings = getMappings();
        // log("Input mappings updated");
    };

    const handleKeyDown = (e) => {
        // log(`Key: ${e.code} (${e.key})`); // moved to debug listener mostly

        // Check mappings
        const isCorrect = currentMappings.correct.includes(e.code);
        const isIncorrect = currentMappings.incorrect.includes(e.code);
        const isReplay = currentMappings.replay.includes(e.code);

        if (isCorrect) {
            if (e.code === 'Space') e.preventDefault(); // Prevent scroll
            if (onCorrect) onCorrect();
        } else if (isIncorrect) {
            if (onIncorrect) onIncorrect();
        } else if (isReplay) {
            e.preventDefault();
            if (onReplay) onReplay();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('input-mappings-changed', handleMappingsChanged);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('input-mappings-changed', handleMappingsChanged);
    };
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
