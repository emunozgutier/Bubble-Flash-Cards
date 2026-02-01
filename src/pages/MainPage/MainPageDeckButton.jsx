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
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                backgroundColor: isSelected ? colors.primary : colors.surface,
                border: `1px solid ${isSelected ? 'white' : colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            onClick={() => onSelect && onSelect(name)}
        >
            {/* Left Column: Deck Info */}
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
                <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: isSelected ? 'white' : colors.text,
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
            <div className="d-flex align-items-center gap-2">
                {/* Edit Button (Nut/Gear icon) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit && onEdit(name);
                    }}
                    title="Edit Deck"
                    style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isSelected ? 'white' : colors.text,
                        opacity: isSelected ? 1 : 0.7,
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = isSelected ? '1' : '0.7'}
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
                    style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isSelected ? 'white' : (colors.primary === '#000000' ? colors.text : colors.primary),
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
