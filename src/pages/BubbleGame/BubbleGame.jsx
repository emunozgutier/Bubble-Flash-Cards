
import React, { useState, useEffect } from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import useDataStore from '../../stores/useDataStore';
import useGameStore from '../../stores/useGameStore';
import GameTitleBar from '../../components/GameTitleBar';
import BubbleGameBubble from './BubbleGameBubble';
import GameSummary from '../GameSummary';
import CharacterDraw from '../CharacterDraw/CharacterDraw';
import { FaHeart } from 'react-icons/fa';
import useThemeStore from '../../stores/useThemeStore';
import '../CommonPage.css';
import './BubbleGame.css';

function BubbleGame() {
    console.log('BubbleGame: Initializing stores...');
    let navigateTo, cards, currentDeckName, gameStore, colors;

    try {
        const nav = useNavigationStore();
        navigateTo = nav?.navigateTo;

        const data = useDataStore();
        cards = data?.cards;
        currentDeckName = data?.currentDeckName;

        gameStore = useGameStore();

        const theme = useThemeStore();
        colors = theme?.colors;

        console.log('BubbleGame: Stores loaded successfully', {
            hasNav: !!navigateTo,
            hasCards: !!cards,
            hasGame: !!gameStore,
            hasColors: !!colors
        });
    } catch (err) {
        console.error('BubbleGame: Error during store initialization', err);
        throw err; // Re-throw to be caught by ErrorBoundary
    }

    if (!gameStore) {
        return <div className="p-4 text-danger">Error: Game Store not available.</div>;
    }

    const {
        lives = 3,
        cardsLeft = 0,
        currentCard,
        options = [],
        gameState = 'idle',
        submitAnswer,
        nextRound,
        gameQueue = [],
        enableDrawing = true
    } = gameStore;

    if (!colors) {
        console.warn('BubbleGame: Colors not available from theme store.');
    }

    const [poppedBubbles, setPoppedBubbles] = useState(new Set());
    const [isRoundComplete, setIsRoundComplete] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false);

    // Reset to idle on mount if not already playing or to ensure fresh start logic if we want to force start screen
    // But if we want to keep state across navigations, we might not want to reset hard.
    // However, requirement implies selecting mode before playing.
    useEffect(() => {
        // If we just loaded and state is idle, we stay idle.
        // If cards changed, maybe we should reset?
        // useGameStore.setState({ gameState: 'idle' }); // Optional: Force start screen on mount
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
        return <GameSummary title="Bubble Game Summary" />;
    }

    if (!currentCard) {
        return <div>Loading...</div>;
    }

    const displayCardsLeft = cardsLeft + 1;

    return (
        <div className="bubble-game-container d-flex flex-column vh-100 overflow-hidden">
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


            <div className="flex-grow-1 overflow-hidden d-flex justify-content-center">
                <div className="d-flex flex-column h-100 px-3" style={{ width: '100%', maxWidth: '600px' }}>
                    <div className="game-stats d-flex justify-content-around p-2 border-bottom flex-shrink-0"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderColor: 'var(--color-border)'
                        }}>
                        <span className="d-flex align-items-center gap-2">
                            Lives: {Array.from({ length: Math.max(0, lives || 0) }).map((_, i) => (
                                <FaHeart key={i} style={{ color: colors?.primary || 'red' }} />
                            ))}
                        </span>
                        <span>Cards Left: {displayCardsLeft}</span>
                    </div>

                    <div className="game-board position-relative flex-grow-1 w-100 mt-2"
                        style={{ containerType: 'inline-size' }}>
                        {/* Main Question Bubble */}
                        <div className="main-bubble-container">
                            <BubbleGameBubble
                                text={currentCard.displayQuestion || currentCard.chinese || currentCard.front}
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
            </div>
        </div>
    );
}

export default BubbleGame;
