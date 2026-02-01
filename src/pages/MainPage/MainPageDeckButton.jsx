import React from 'react';
import { Button } from 'react-bootstrap';
import { FaGear, FaPlay, FaCircleInfo } from 'react-icons/fa6';
import useThemeStore from '../../stores/useThemeStore';

const MainPageDeckButton = ({
    name,
    lastStudied,
    progress,
    currentDeckName,
    onPlay,
    onEdit,
    onInfo,
    onSelect
}) => {
    const { colors, fontSizes } = useThemeStore();
    const isSelected = name === currentDeckName;

    return (
        <div
            className={`d-flex align-items-center p-3 border rounded deck-button-hover-effect ${isSelected ? 'selected' : ''}`}
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
            <div className="flex-grow-1 d-flex flex-column justify-content-center" style={{ minWidth: 0 }}>
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
                {/* Info Button (i icon) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onInfo && onInfo(name);
                    }}
                    title="Deck Info"
                    className="d-flex align-items-center justify-content-center deck-info-btn"
                    style={{
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        color: isSelected ? 'white' : colors.primary,
                        transition: 'opacity 0.2s',
                        opacity: isSelected ? 1 : 0.7
                    }}
                >
                    <FaCircleInfo size={24} />
                </div>

                {/* Edit Button (Gear icon) */}
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
                    <FaGear size={22} />
                </div>

                {/* Play Button (Play icon) */}
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
                    <FaPlay size={24} />
                </div>
            </div>
        </div>
    );
};

export default MainPageDeckButton;
