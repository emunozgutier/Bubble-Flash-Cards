
import React, { useState, useEffect } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';
import useBubbleGameStore from '../stores/useBubbleGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import BubbleGameBubble from './submodules1/BubbleGameBubble';
import BubbleGameSummary from './BubbleGameSummary';
import CharacterDraw from './CharacterDraw';
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
        gameQueue,
        enableDrawing
    } = useBubbleGameStore();

    const [poppedBubbles, setPoppedBubbles] = useState(new Set());
    const [isRoundComplete, setIsRoundComplete] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false);

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
        // setIsDrawing(false); // Should strictly be handled by drawComplete, but safety here? No, might cause flicker.
    }, [currentCard]);

    // Redirect to setup if no game in progress (e.g. refresh)
    // Redirect to setup if no game in progress (e.g. refresh)
    useEffect(() => {
        // Only redirect if:
        // 1. Queue is empty AND NO current card (so really nothing to do)
        // 2. AND we haven't won (won state is valid end state)
        // 3. Or simply if gameState is 'idle' (covers refresh case)
        if (gameState === 'idle') {
            navigateTo('bubbleSetup');
        } else if (gameQueue.length === 0 && !currentCard && gameState !== 'won' && gameState !== 'game_over') {
            navigateTo('bubbleSetup');
        }
    }, [gameQueue, gameState, currentCard]);

    const handleDrawComplete = () => {
        setIsDrawing(false);
        nextRound();
    };

    const handleOptionClick = (option) => {
        if (isRoundComplete || poppedBubbles.has(option.id)) return;

        const isCorrect = submitAnswer(option);

        if (isCorrect) {
            // Trigger Fall Animation
            setIsRoundComplete(true);
            // Wait for animation then start drawing phase
            setTimeout(() => {
                // Check if we have chinese characters to draw
                const charsToDraw = currentCard.chinese || currentCard.front;
                if (enableDrawing && charsToDraw && typeof charsToDraw === 'string' && !charsToDraw.match(/[a-zA-Z]/)) { // basic check if it's not English
                    setIsDrawing(true);
                } else {
                    // Skip drawing if no valid chinese
                    nextRound();
                }
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

    if (gameState === 'game_over' || gameState === 'won') {
        return <BubbleGameSummary />;
    }

    if (!currentCard) {
        return <div>Loading...</div>;
    }

    const displayCardsLeft = cardsLeft + 1;

    return (
        <div className="bubble-game-container">
            {isDrawing && currentCard && (
                <CharacterDraw
                    characters={currentCard.chinese || currentCard.front}
                    englishDefinition={currentCard.english || currentCard.back}
                    onComplete={handleDrawComplete}
                />
            )}

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
