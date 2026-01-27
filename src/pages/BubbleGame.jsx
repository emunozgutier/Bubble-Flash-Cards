
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
        startGame,
        submitAnswer,
        continueGame
    } = useBubbleGameStore();

    // Start game when cards are loaded or deck changes
    useEffect(() => {
        if (cards.length > 0) {
            startGame(cards);
        }
    }, [cards]);

    const handleOptionClick = (option) => {
        const isCorrect = submitAnswer(option);
        if (!isCorrect) {
            if (lives > 1) {
                alert("Try again!");
            }
        }
    };

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
                        text={currentCard.chinese || currentCard.front} // Question is Chinese/Front
                        className="main-bubble"
                    />
                </div>

                {/* Answer Bubbles - Positioned around */}
                <div className="options-container">
                    {options.map((opt, index) => {
                        return (
                            <BubbleGameBubble
                                key={opt.id}
                                text={opt.text}
                                onClick={() => handleOptionClick(opt)}
                                className={`option-bubble option-${index}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default BubbleGame;
