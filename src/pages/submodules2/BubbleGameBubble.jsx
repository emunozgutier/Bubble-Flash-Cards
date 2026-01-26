import React from 'react';

const BubbleGameBubble = ({ text, onClick, className, style }) => {
    return (
        <div
            className={`bubble-game-bubble ${className || ''}`}
            onClick={onClick}
            style={style}
        >
            <span className="bubble-text">{text}</span>
        </div>
    );
};

export default BubbleGameBubble;
