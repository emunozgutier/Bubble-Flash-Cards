import React, { useState } from 'react';
import './FlashCard.css';

export default function FlashCard({ front, back, onDelete }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="flash-card-container" onClick={handleClick}>
            <div className={`flash-card ${isFlipped ? 'flipped' : ''}`}>
                <div className="flash-card-front">
                    {front}
                </div>
                <div className="flash-card-back">
                    {back}
                </div>
            </div>
        </div>
    );
}
