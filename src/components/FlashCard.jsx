import React, { useState } from 'react';
import './FlashCard.css';

export default function FlashCard({ card, front, back }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    const displayFront = card ? card.chinese : front;
    const displayBack = card ? (
        <div className="card-back-content">
            <div className="pinyin" style={{ color: '#666', fontSize: '0.9em', marginBottom: '8px' }}>{card.pinyin}</div>
            <div className="english">{card.english}</div>
        </div>
    ) : back;

    return (
        <div className="flash-card-container" onClick={handleClick}>
            <div className={`flash-card ${isFlipped ? 'flipped' : ''}`}>
                <div className="flash-card-front">
                    {displayFront}
                </div>
                <div className="flash-card-back">
                    {displayBack}
                </div>
            </div>
        </div>
    );
}
