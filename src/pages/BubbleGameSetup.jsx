import React from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';
import useBubbleGameStore from '../stores/useBubbleGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import './BubbleGame.css'; // Re-use Bubble Game styles

function BubbleGameSetup() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();
    const { startGame } = useBubbleGameStore();

    const handleStart = (mode) => {
        if (cards.length > 0) {
            startGame(cards, mode);
            navigateTo('bubble');
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
