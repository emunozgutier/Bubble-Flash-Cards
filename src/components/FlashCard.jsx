import React, { useState } from 'react';
import useThemeStore from '../stores/useThemeStore';
import './FlashCard.css';

export default function FlashCard({ card, front, back, flippable = true }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const { colors, fontSizes } = useThemeStore();

    const getDynamicFontSize = (content) => {
        // If content is a React element (like the back of some cards), we can't easily check length
        if (React.isValidElement(content)) return fontSizes.medium;

        const text = String(content || '');
        if (text.length > 60) return fontSizes.xsmall;
        if (text.length > 40) return fontSizes.small;
        if (text.length > 20) return fontSizes.medium;
        return fontSizes.large;
    };

    const handleClick = () => {
        if (flippable) {
            setIsFlipped(!isFlipped);
        }
    };

    const displayFront = card ? card.chinese : front;
    const displayBack = card ? (
        <div className="card-back-content text-center">
            <div
                className="pinyin mb-2"
                style={{ color: colors.textSecondary, fontSize: fontSizes.small }}
            >
                {card.pinyin}
            </div>
            <div className="english" style={{ fontSize: fontSizes.medium }}>
                {card.english}
            </div>
        </div>
    ) : back;

    // Card face style
    const faceStyle = {
        backgroundColor: colors.surface || '#ffffff',
        color: colors.text,
        border: `2px solid ${colors.border}`,
    };

    const backFaceStyle = {
        backgroundColor: colors.primary,
        color: colors.text,
        border: `2px solid ${colors.primary}`,
    };

    return (
        <div className="flash-card-container" onClick={handleClick}>
            <div className={`flash-card shadow-sm rounded ${isFlipped ? 'flipped' : ''}`}>
                <div
                    className="flash-card-front d-flex align-items-center justify-content-center p-4 rounded overflow-hidden"
                    style={faceStyle}
                >
                    <div style={{
                        fontSize: getDynamicFontSize(displayFront),
                        wordBreak: 'break-word',
                        maxHeight: '100%',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        {displayFront}
                    </div>
                </div>
                <div
                    className="flash-card-back d-flex align-items-center justify-content-center p-4 rounded overflow-hidden"
                    style={backFaceStyle}
                >
                    <div style={{
                        fontSize: getDynamicFontSize(displayBack),
                        wordBreak: 'break-word',
                        maxHeight: '100%',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        {displayBack}
                    </div>
                </div>
            </div>
        </div>
    );
}

