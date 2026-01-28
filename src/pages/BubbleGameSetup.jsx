import React from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';
import useGameStore from '../stores/useGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import './CommonPage.css';
import './BubbleGame.css'; // Re-use Bubble Game styles for container if needed

function BubbleGameSetup() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();
    const { startGame } = useGameStore();

    const handleStart = (mode) => {
        if (cards.length > 0) {
            try {
                startGame(cards, mode);
                navigateTo('bubble');
            } catch (error) {
                console.error("Failed to start game:", error);
                alert("Error starting game with this deck. Please try another deck.");
            }
        } else {
            alert('No cards available in this deck!');
        }
    };

    return (
        <div className="bubble-game-container">
            <GameTitleBar
                title={`Bubble Game Setup - ${currentDeckName}`}
                onExit={() => navigateTo('main')}
            />
            <div className="game-over-screen" style={{ backgroundColor: 'var(--color-background)', position: 'relative' }}>
                <h2 style={{ marginBottom: '30px' }}>Select Game Mode</h2>

                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={useGameStore(state => state.enableDrawing)}
                            onChange={(e) => useGameStore.getState().setEnableDrawing(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span style={{ color: 'var(--color-text)', fontWeight: 'bold' }}>Enable Character Writing</span>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', width: '300px' }}>
                    <button
                        onClick={() => handleStart('chinese_english')}
                        className="game-over-button"
                        style={{ marginTop: 0 }}
                    >
                        Chinese ➔ English
                    </button>
                    <button
                        onClick={() => handleStart('chinese_pinyin_english')}
                        className="game-over-button"
                        style={{ marginTop: 0 }}
                    >
                        Chinese + Pinyin ➔ English
                    </button>
                    <button
                        onClick={() => handleStart('chinese_pinyin')}
                        className="game-over-button"
                        style={{ marginTop: 0 }}
                    >
                        Chinese ➔ Pinyin
                    </button>
                    <button
                        onClick={() => handleStart('english_pinyin')}
                        className="game-over-button"
                        style={{ marginTop: 0 }}
                    >
                        English ➔ Pinyin
                    </button>
                </div>

                <button
                    onClick={() => navigateTo('main')}
                    className="game-exit-button"
                    style={{ marginTop: '40px' }}
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default BubbleGameSetup;
