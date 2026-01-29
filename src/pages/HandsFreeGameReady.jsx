import React from 'react';
import GameTitleBar from './submodules1/GameTitleBar';
import './CommonPage.css';
import './HandsFreeGame.css';

const HandsFreeGameReady = ({ onStart, onExit, permissionError }) => {
    return (
        <div className="page-container">
            <GameTitleBar
                title="Hands Free - Ready?"
                onExit={onExit}
            />
            <div className="game-content-center">
                <h2>Hands Free Mode</h2>
                <p style={{ maxWidth: '300px', textAlign: 'center', marginBottom: '20px' }}>
                    This mode uses your microphone and audio.
                    Please tap Start to enable permissions.
                </p>
                {permissionError && <div style={{ color: 'red', marginBottom: '10px' }}>{permissionError}</div>}
                <button
                    className="control-button primary"
                    style={{ fontSize: '1.5rem', padding: '20px 40px' }}
                    onClick={onStart}
                >
                    START GAME
                </button>
                <div style={{ marginTop: '20px', opacity: 0.7, fontSize: '0.8rem' }}>
                    Best experienced on Chrome or Safari
                </div>
            </div>
            {/* Audio element is handled by parent, but we might want to ensure it's mounted if needed here, 
                though usually it's better in the parent to persist across re-renders. 
                For this refactor, we keep the audio in the parent as per the plan. */}
        </div>
    );
};

export default HandsFreeGameReady;
