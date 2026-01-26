
import React, { useState, useEffect } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';
import GameTitleBar from './submodules2/GameTitleBar';
import BubbleGameBubble from './submodules2/BubbleGameBubble';

function BubbleGame() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();

    const [currentCard, setCurrentCard] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);

    // Initialize game or next round
    useEffect(() => {
        if (cards.length > 0) {
            startNewRound();
        }
    }, [cards]);

    const startNewRound = () => {
        if (!cards || cards.length === 0) return;

        // 1. Pick a random card as the question
        const cardIndex = Math.floor(Math.random() * cards.length);
        const questionCard = cards[cardIndex];

        // 2. Pick 2 distractors
        const otherCards = cards.filter(c => c.id !== questionCard.id);
        // Shuffle others to get random distractors
        const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 2);

        // 3. Combine correct answer + distractors
        const correctOption = {
            id: questionCard.id,
            text: questionCard.english || questionCard.back, // Answer is English/Back
            isCorrect: true
        };

        const wrongOptions = distractors.map(c => ({
            id: c.id,
            text: c.english || c.back,
            isCorrect: false
        }));

        const allOptions = [correctOption, ...wrongOptions];
        // Shuffle options
        const shuffledOptions = allOptions.sort(() => 0.5 - Math.random());

        setCurrentCard(questionCard);
        setOptions(shuffledOptions);
    };

    const handleOptionClick = (option) => {
        if (option.isCorrect) {
            setScore(score + 1);
            alert("Correct!");
            startNewRound();
        } else {
            alert("Try again!");
        }
    };

    if (!currentCard) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bubble-game-container">
            <GameTitleBar
                title={`Bubble Game - ${currentDeckName}`}
                onExit={() => navigateTo('main')}
            />

            <div className="game-board">
                {/* Main Question Bubble */}
                <div className="main-bubble-container">
                    <BubbleGameBubble
                        text={currentCard.chinese || currentCard.front} // Question is Chinese/Front
                        className="main-bubble"
                        style={{ width: '150px', height: '150px', fontSize: '1.5rem', backgroundColor: '#e0f7fa' }}
                    />
                </div>

                {/* Answer Bubbles - Positioned around */}
                <div className="options-container">
                    {options.map((opt, index) => {
                        // Simple positioning logic or just flex layout
                        // Requirement: "top, bottom left and botton right" relative to... something?
                        // Let's just create a nice layout area below
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
            <div className="score-board">
                Score: {score}
            </div>
        </div>
    );
}

export default BubbleGame;
