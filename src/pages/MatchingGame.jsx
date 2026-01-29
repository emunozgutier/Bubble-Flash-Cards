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
    const [gameState, setGameState] = useState('playing'); // 'playing' | 'finished'

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, [cards]); // Restart if deck changes, though usually we play with loaded deck

    const startNewGame = () => {
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
        // Note: filtered by text match or object equality to ensure we remove the exact item instance if needed, 
        // but id check is safest if ids are unique per card.
        setAvailableQuestions(prev => prev.filter(item => item !== q));
        setAvailableAnswers(prev => prev.filter(item => item !== a));

        // Reset Selection
        setSelectedQuestion(null);
        setSelectedAnswer(null);

        // Check completion
        // We started with N pairs. logic: if available becomes empty.
        // But since we update state asynchronously, we check length of new lists
        if (availableQuestions.length === 1) { // 1 because we are about to remove 1, so it will be 0
            setGameState('finished');
        }
    };

    // Helper to get correctness class
    const getPairStatusClass = (pair) => {
        if (gameState !== 'finished') return '';
        return pair.question.id === pair.answer.id ? 'correct' : 'incorrect';
    };

    return (
        <div className="matching-game">
            <div className="matching-header">
                <button className="back-button" onClick={() => navigateTo('main')}>← Deck</button>
                <h1>Matching Game</h1>
                <button className="back-button" onClick={startNewGame}>Restart</button>
            </div>

            {/* Matched Pairs Area - Moves up here */}
            <div className="matched-container">
                {matchedPairs.length === 0 && <div className="placeholder" style={{ textAlign: 'center', color: 'gray', marginTop: '1rem' }}>Matches will appear here</div>}
                {matchedPairs.map((pair, idx) => (
                    <div key={idx} className={`matched-pair ${getPairStatusClass(pair)}`}>
                        <span>{pair.question.text}</span>
                        <span>=</span>
                        <span>{pair.answer.text}</span>
                    </div>
                ))}
            </div>

            {/* Unmatched Area */}
            {/* Even if empty, we keep structure?? Or maybe hide if empty */}
            {gameState === 'playing' && (
                <div className="unmatched-container">
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
                        {/* Pad with empty cells if arrays are unbalanced? (shouldn't happen in this logic) */}
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

            {gameState === 'finished' && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <h2>Game Over!</h2>
                    <p>Check your results above.</p>
                </div>
            )}

        </div>
    );
}

export default MatchingGame;
