
import React, { useState, useEffect } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';
import useBubbleGameStore from '../stores/useBubbleGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import BubbleGameBubble from './submodules1/BubbleGameBubble';
import './BubbleGame.css';

function BubbleGame() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();

    const {
        lives,
        cardsLeft,
        currentCard,
        options,
        score,
        gameState,
        // startGame, // Not needed here anymore
        submitAnswer,
        continueGame,
        nextRound,
        // setQuestionMode // Not needed here anymore
        gameQueue
    } = useBubbleGameStore();

    const [poppedBubbles, setPoppedBubbles] = useState(new Set());
    const [isRoundComplete, setIsRoundComplete] = useState(false);

    // Reset to idle on mount if not already playing or to ensure fresh start logic if we want to force start screen
    // But if we want to keep state across navigations, we might not want to reset hard.
    // However, requirement implies selecting mode before playing.
    useEffect(() => {
        // If we just loaded and state is idle, we stay idle.
        // If cards changed, maybe we should reset?
        // useBubbleGameStore.setState({ gameState: 'idle' }); // Optional: Force start screen on mount
    }, []);

    // Reset local state when card changes
    useEffect(() => {
        setPoppedBubbles(new Set());
        setIsRoundComplete(false);
    }, [currentCard]);

    // Redirect to setup if no game in progress (e.g. refresh)
    useEffect(() => {
        if (gameQueue.length === 0 && gameState !== 'won') {
            navigateTo('bubbleSetup');
        }
    }, [gameQueue, gameState]);

    const handleOptionClick = (option) => {
        if (isRoundComplete || poppedBubbles.has(option.id)) return;

        const isCorrect = submitAnswer(option);

        if (isCorrect) {
            // Trigger Fall Animation
            setIsRoundComplete(true);
            // Wait for animation then next round
            setTimeout(() => {
                nextRound();
            }, 1000);
        } else {
            // Trigger Pop Animation
            setPoppedBubbles(prev => new Set(prev).add(option.id));
            if (lives <= 1) { // Will be 0 after update, so game over
                // Don't alert if game over
            } else {
                // Audio feedback?
            }
        }
    };

    if (gameState === 'idle') {
        return null; // Should redirect
    }

    if (gameState === 'game_over') {
        return (
            <div className="bubble-game-container">
                <GameTitleBar
                    title={`Bubble Game - ${currentDeckName}`}
                    onExit={() => navigateTo('main')}
                />
                <div className="game-over-screen">
                    <h2>Game Over</h2>
                    <p>You ran out of lives!</p>
                    <button
                        onClick={continueGame}
                        className="game-over-button"
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => navigateTo('main')}
                        className="game-exit-button"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'won') {
        return (
            <div className="bubble-game-container">
                <GameTitleBar
                    title={`Bubble Game - ${currentDeckName}`}
                    onExit={() => navigateTo('main')}
                />
                <div className="game-over-screen">
                    <h2>Session Complete!</h2>
                    <p>Score: {score}</p>
                    <button
                        onClick={continueGame}
                        className="game-over-button"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={() => navigateTo('main')}
                        className="game-exit-button"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return <div>Loading...</div>;
    }

    const displayCardsLeft = cardsLeft + 1;

    return (
        <div className="bubble-game-container">
            <GameTitleBar
                title={`Bubble Game - ${currentDeckName}`}
                onExit={() => navigateTo('main')}
            />

            <div className="game-stats">
                <span>Lives: {'❤️'.repeat(lives)}</span>
                <span>Cards Left: {displayCardsLeft}</span>
            </div>

            <div className="game-board">
                {/* Main Question Bubble */}
                <div className="main-bubble-container">
                    <BubbleGameBubble
                        text={currentCard.displayQuestion || currentCard.chinese || currentCard.front} // Question is Chinese/Front
                        className="main-bubble"
                    />
                </div>

                {/* Answer Bubbles - Positioned around */}
                <div className="options-container">
                    {options.map((opt, index) => {
                        let animationClass = '';
                        if (poppedBubbles.has(opt.id)) {
                            animationClass = 'bubble-pop';
                        } else if (isRoundComplete) {
                            if (!opt.isCorrect) {
                                animationClass = 'bubble-fall';
                            } else {
                                animationClass = 'bubble-correct';
                            }
                        }

                        return (
                            <BubbleGameBubble
                                key={opt.id}
                                text={opt.text}
                                onClick={() => handleOptionClick(opt)}
                                className={`option-bubble option-${index} ${animationClass}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default BubbleGame;
