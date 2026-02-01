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
    const { colors } = useThemeStore();
    const isSelected = name === currentDeckName;

    return (
        <div
            className={`deck-item mb-3 ${isSelected ? 'selected' : ''}`}
            style={{ display: 'flex', alignItems: 'center', padding: '12px 20px' }}
            onClick={() => onSelect && onSelect(name)}
        >
            {/* Left Column: Deck Info */}
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
                <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: isSelected ? 'white' : colors.primary,
                    marginBottom: '4px'
                }}>
                    {name}
                </span>
                <div style={{
                    fontSize: '0.85rem',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary
                }}>
                    Last Studied: {lastStudied} • Progress: {progress}%
                </div>
            </div>

            {/* Right Column: Actions */}
            <div className="d-flex align-items-center gap-3">
                {/* Edit Button */}
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit && onEdit(name);
                    }}
                    title="Edit Deck"
                    className="rounded-circle d-flex align-items-center justify-content-center btn-circle-edit"
                    style={{
                        width: '38px',
                        height: '38px',
                        padding: 0,
                        backgroundColor: 'transparent',
                        border: `1px solid ${isSelected ? 'white' : colors.border}`,
                        color: isSelected ? 'white' : colors.text,
                        fontSize: '1.1rem'
                    }}
                >
                    ⚙️
                </Button>

                {/* Play Button - Now the ONLY trigger for onPlay */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay && onPlay(name);
                    }}
                    title="Play Deck"
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: isSelected ? 'white' : colors.primary,
                        color: isSelected ? colors.primary : 'white',
                        cursor: 'pointer',
                        boxShadow: isSelected ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease',
                        fontSize: '1.2rem'
                    }}
                >
                    <span style={{ marginLeft: '2px' }}>▶</span>
                </div>
            </div>
        </div>
    );
};

export default MainPageDeckButton;
