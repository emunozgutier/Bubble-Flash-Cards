import React, { useState } from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import useDataStore from '../../stores/useDataStore';
import useGameStore from '../../stores/useGameStore';
import useThemeStore from '../../stores/useThemeStore';
import GameTitleBar from '../../components/GameTitleBar';
import '../CommonPage.css';
import '../BubbleGame/BubbleGame.css'; // Re-use Bubble Game styles for consistency

function HandsFreeGameSetup() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();
    const { startGame } = useGameStore();
    const { colors } = useThemeStore();

    // Local state for practice mode since it's specific to this session until started
    const [practiceMode, setPracticeMode] = useState(false);

    const handleStart = (mode) => {
        if (cards.length > 0) {
            const success = startGame(cards, mode);
            if (success) {
                // We might want to store practiceMode in the store if the game needs it
                // For now, let's assume we pass it or set a separate flag if needed.
                // Since useGameStore doesn't have practiceMode yet, we can add it or just pass it as metadata purely for the UI?
                // Actually, HandsFreeGame needs to know. I should add it to the store or rely on component state?
                // Store is better for persistence across reloads. 
                // I'll add setPracticeMode action to store later or just augment state now via direct set for quickness if I don't want to refactor store again immediately.
                // Cleaner: Add to store. But for now, let's just set it directly on the store state object if possible or just use a query param logic.
                // I'll add a `setPracticeMode` to the store in the next step or just assume the game component defaults to false if not set.
                // Let's add it to store state directly for now.
                useGameStore.setState({ practiceMode });

                navigateTo('handsFree');
            } else {
                alert('No valid cards to play with! (Welcome card is excluded)');
            }
        } else {
            alert('No cards available in this deck!');
        }
    };

    return (
        <div className="bubble-game-container">
            <GameTitleBar
                title={`Hands Free Setup - ${currentDeckName}`}
                onExit={() => navigateTo('main')}
            />
            <div className="game-over-screen w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: colors.background, position: 'relative' }}>
                <h2 className="mb-4" style={{ color: colors.text }}>Select Mode</h2>

                <div className="mb-4 d-flex align-items-center gap-3 p-3 rounded" style={{ backgroundColor: colors.surface }}>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={practiceMode}
                            onChange={(e) => setPracticeMode(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <div className="text-start">
                        <span className="fw-bold d-block" style={{ color: colors.text }}>Voice Practice Mode</span>
                        <span className="small d-block" style={{ color: colors.textSecondary }}>
                            Listen & match your voice (Chrome/Safari)
                        </span>
                    </div>
                </div>

                <div className="d-flex flex-column gap-3" style={{ width: '300px' }}>
                    <button
                        onClick={() => handleStart('chinese_english')}
                        className="game-over-button m-0"
                    >
                        Chinese ➔ English
                    </button>
                    <button
                        onClick={() => handleStart('english_chinese')}
                        className="game-over-button m-0"
                    >
                        English ➔ Chinese
                    </button>
                    <button
                        onClick={() => handleStart('chinese')}
                        className="game-over-button m-0"
                    >
                        Random Mixed
                    </button>
                </div>

                <button
                    onClick={() => navigateTo('main')}
                    className="game-exit-button mt-5"
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default HandsFreeGameSetup;
