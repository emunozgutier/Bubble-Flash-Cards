import React from 'react';
import { Button } from 'react-bootstrap';
import useThemeStore from '../../stores/useThemeStore';

const MainPageDeckButton = ({
    name,
    lastStudied,
    progress,
    currentDeckName,
    onPlay,
    onEdit,
    onSelect
}) => {
    const { colors, fontSizes } = useThemeStore();
    const isSelected = name === currentDeckName;

    return (
        <div
            className={`d-flex align-items-center p-3 mb-3 border rounded deck-button-hover-effect ${isSelected ? 'selected' : ''}`}
            style={{
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? 'white' : colors.border,
                borderWidth: '2px',
                boxShadow: isSelected ? `0 0 25px 5px ${colors.primary}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            onClick={() => onSelect && onSelect(name)}
        >
            {/* Left Column: Deck Info */}
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
                <span className="fw-bold mb-1" style={{
                    fontSize: fontSizes.large,
                    color: isSelected ? 'white' : colors.primary
                }}>
                    {name}
                </span>
                <div style={{
                    fontSize: fontSizes.small,
                    color: isSelected ? 'rgba(255,255,255,0.9)' : colors.primary,
                    opacity: isSelected ? 1 : 0.8
                }}>
                    Last Studied: {lastStudied} • Progress: {progress}%
                </div>
            </div>

            {/* Right Column: Actions */}
            <div className="d-flex align-items-center gap-2">
                {/* Edit Button (Nut/Gear icon) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit && onEdit(name);
                    }}
                    title="Edit Deck"
                    className="d-flex align-items-center justify-content-center deck-edit-btn"
                    style={{
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        color: isSelected ? 'white' : colors.primary,
                        transition: 'opacity 0.2s',
                        opacity: isSelected ? 1 : 0.7
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </div>

                {/* Play Button (Triangle icon) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay && onPlay(name);
                    }}
                    title="Play Deck"
                    className="d-flex align-items-center justify-content-center deck-play-btn"
                    style={{
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        color: isSelected ? 'white' : colors.primary,
                        transition: 'transform 0.2s'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 3l14 9-14 9V3z"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default MainPageDeckButton;
