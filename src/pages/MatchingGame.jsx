import React, { useState, useEffect } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';
import './MatchingGame.css';

function MatchingGame() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();

    // Game State
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [availableAnswers, setAvailableAnswers] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // 'playing' | 'round_finished' | 'game_over' | 'victory'
    const [gameState, setGameState] = useState('playing');
    const [round, setRound] = useState(1);
    const [lives, setLives] = useState(3);
    const [roundResult, setRoundResult] = useState(''); // 'Correct' or 'Wrong'

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, [cards]);

    const startNewGame = () => {
        setRound(1);
        setLives(3);
        startRound();
    };

    const startRound = () => {
        // Need at least 4 cards, or take all if less
        if (!cards || cards.length === 0) return;

        const count = Math.min(4, cards.length);
        // Shuffle all cards then pick 'count'
        const shuffledCards = [...cards].sort(() => 0.5 - Math.random()).slice(0, count);

        // Questions (Left side) - usually Chinese/Front
        const questions = shuffledCards.map(c => ({
            id: c.id,
            text: c.chinese || c.front,
            originalCard: c
        }));

        // Answers (Right side) - usually English/Back - Shuffled independently
        const answers = shuffledCards.map(c => ({
            id: c.id,
            text: c.english || c.back,
            originalCard: c
        })).sort(() => 0.5 - Math.random());

        setAvailableQuestions(questions);
        setAvailableAnswers(answers);
        setMatchedPairs([]);
        setSelectedQuestion(null);
        setSelectedAnswer(null);
        setGameState('playing');
        setRoundResult('');
    };

    const handleQuestionClick = (q) => {
        if (gameState !== 'playing') return;

        // If clicking same, deselect
        if (selectedQuestion?.id === q.id && selectedQuestion?.text === q.text) {
            setSelectedQuestion(null);
            return;
        }

        setSelectedQuestion(q);

        // Check if we have a pair ready
        if (selectedAnswer) {
            makeMatch(q, selectedAnswer);
        }
    };

    const handleAnswerClick = (a) => {
        if (gameState !== 'playing') return;

        // If clicking same, deselect
        if (selectedAnswer?.id === a.id && selectedAnswer?.text === a.text) {
            setSelectedAnswer(null);
            return;
        }

        setSelectedAnswer(a);

        // Check if we have a pair ready
        if (selectedQuestion) {
            makeMatch(selectedQuestion, a);
        }
    };

    const makeMatch = (q, a) => {
        // Add to matched pairs
        const newPair = { question: q, answer: a };
        const newMatchedPairs = [...matchedPairs, newPair];
        setMatchedPairs(newMatchedPairs);

        // Remove from available lists
        setAvailableQuestions(prev => prev.filter(item => item !== q));
        setAvailableAnswers(prev => prev.filter(item => item !== a));

        // Reset Selection
        setSelectedQuestion(null);
        setSelectedAnswer(null);

        // Check completion
        if (availableQuestions.length === 1) {
            finishRound(newMatchedPairs);
        }
    };

    const finishRound = (finalPairs) => {
        setGameState('round_finished');

        // Check correctness
        const allCorrect = finalPairs.every(p => p.question.id === p.answer.id);

        if (allCorrect) {
            setRoundResult('Correct!');
        } else {
            setRoundResult('Wrong!');
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives === 0) {
                setGameState('game_over');
            }
        }
    };

    const handleNextRound = () => {
        if (round >= 10) {
            setGameState('victory');
        } else {
            setRound(r => r + 1);
            startRound();
        }
    };

    // Helper to get correctness class
    const getPairStatusClass = (pair) => {
        if (gameState === 'playing') return '';
        return pair.question.id === pair.answer.id ? 'correct' : 'incorrect';
    };

    return (
        <div className="matching-game">
            <div className="matching-header">
                <button className="back-button" onClick={() => navigateTo('main')}>← Deck</button>
                <div className="stats-bar">
                    <span>Round: {round}/10</span>
                    <span style={{ marginLeft: '1rem' }}>Lives: {'❤️'.repeat(lives)}</span>
                </div>
                <button className="back-button" onClick={startNewGame}>Restart</button>
            </div>

            {/* Matched Pairs Area - Moves up here */}
            <div className="matched-container" style={{ flex: matchedPairs.length }}>
                {matchedPairs.map((pair, idx) => (
                    <div key={idx} className={`matched-pair ${getPairStatusClass(pair)}`}>
                        <span>{pair.question.text}</span>
                        <span>=</span>
                        <span>{pair.answer.text}</span>
                    </div>
                ))}
            </div>

            {/* Unmatched Area */}
            {gameState === 'playing' && (
                <div className="unmatched-container" style={{ flex: availableQuestions.length }}>
                    <div className="questions-column">
                        {availableQuestions.map((q) => (
                            <div
                                key={q.text} // use text or some unique key
                                className={`card-item ${selectedQuestion === q ? 'selected' : ''}`}
                                onClick={() => handleQuestionClick(q)}
                            >
                                <span>{q.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="answers-column">
                        {availableAnswers.map((a) => (
                            <div
                                key={a.text}
                                className={`card-item ${selectedAnswer === a ? 'selected' : ''}`}
                                onClick={() => handleAnswerClick(a)}
                            >
                                <span>{a.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'round_finished' && (
                <div className="round-summary" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <h2 style={{ color: roundResult === 'Correct!' ? 'green' : 'red' }}>{roundResult}</h2>
                    <button className="action-button" onClick={handleNextRound}>Next Round</button>
                </div>
            )}

            {gameState === 'game_over' && (
                <div className="round-summary" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <h2 style={{ color: 'red' }}>Game Over!</h2>
                    <p>You ran out of lives.</p>
                    <button className="action-button" onClick={startNewGame}>Try Again</button>
                </div>
            )}

            {gameState === 'victory' && (
                <div className="round-summary" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <h2 style={{ color: 'gold' }}>Victory!</h2>
                    <p>You completed all 10 rounds!</p>
                    <button className="action-button" onClick={startNewGame}>Play Again</button>
                </div>
            )}

        </div>
    );
}

export default MatchingGame;
