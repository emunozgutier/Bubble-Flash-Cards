import React, { useState } from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import useDataStore from '../../stores/useDataStore';
import useGameStore from '../../stores/useGameStore';
import useThemeStore from '../../stores/useThemeStore';
import GameTitleBar from '../../components/GameTitleBar';
import '../CommonPage.css';
import '../BubbleGame/BubbleGame.css'; // Re-use Bubble Game styles for consistency
import './HandsFreeGameSetup.css';

function HandsFreeGameSetup() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();
    const { startGame } = useGameStore();
    const { colors } = useThemeStore();

    // Local state for practice mode and selected language mode
    const [practiceMode, setPracticeMode] = useState(false);
    const [selectedMode, setSelectedMode] = useState('chinese_english');

    const handleStart = (mode) => {
        if (cards.length > 0) {
            const success = startGame(cards, mode);
            if (success) {
                // ... existing code ...
                useGameStore.setState({ practiceMode });

                navigateTo('handsFree');
            } else {
                alert("No playable cards found in this deck. (Note: The 'Welcome' card is excluded).");
            }
        } else {
            alert('This deck is empty! Please add cards or select a different non-empty deck.');
        }
    };

    return (
        <div className="bubble-game-container">
            <GameTitleBar
                title={`Hands Free Setup - ${currentDeckName}`}
                onExit={() => navigateTo('main')}
            />
            <div className="hands-free-setup-wrapper" style={{ backgroundColor: colors.background }}>
                <h2 className="setup-title" style={{ color: colors.text }}>Select Mode</h2>

                <div className="setup-content-row">
                    {/* Left Column: Game Mode Buttons */}
                    <div className="setup-column buttons-col">
                        <button
                            onClick={() => setSelectedMode('chinese_english')}
                            className={`game-over-button setup-mode-btn ${selectedMode === 'chinese_english' ? 'active' : ''}`}
                        >
                            Chinese ➔ English
                        </button>
                        <button
                            onClick={() => setSelectedMode('english_chinese')}
                            className={`game-over-button setup-mode-btn ${selectedMode === 'english_chinese' ? 'active' : ''}`}
                        >
                            English ➔ Chinese
                        </button>
                        <button
                            onClick={() => setSelectedMode('chinese')}
                            className={`game-over-button setup-mode-btn ${selectedMode === 'chinese' ? 'active' : ''}`}
                        >
                            Random Mixed
                        </button>
                    </div>

                    {/* Right Column: Voice Practice Toggle & Accept button */}
                    <div className="setup-column voice-practice-col">
                        <div className="voice-practice-card" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
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

                        <button
                            onClick={() => handleStart(selectedMode)}
                            className="setup-accept-btn"
                        >
                            Accept & Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HandsFreeGameSetup;
