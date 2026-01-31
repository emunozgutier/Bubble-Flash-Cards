import React from 'react';
import { Button } from 'react-bootstrap';
import useThemeStore from '../../stores/useThemeStore';

const MainPageDeckBlock = ({
    name,
    lastStudied,
    progress,
    currentDeckName,
    onPlay,
    onEdit
}) => {
    const { colors } = useThemeStore();
    const isSelected = name === currentDeckName;

    // Style configuration
    const containerStyle = {
        backgroundColor: colors.surface,
        color: colors.text,
        border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isSelected ? `0 0 10px ${colors.primary}4D` : 'none', // 30% opacity hex
        transition: 'all 0.2s ease'
    };

    return (
        <div className="deck-item d-flex flex-column mb-3" style={containerStyle}>
            {/* Top: Name Bar */}
            <div className="p-2 border-bottom" style={{ borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isSelected ? colors.primary : 'inherit' }}>{name}</span>
            </div>

            {/* Bottom: Split Stats and Actions */}
            <div className="d-flex w-100">
                {/* Left Box: Stats */}
                <div className="p-2 flex-grow-1 border-end d-flex flex-column justify-content-center"
                    style={{ borderColor: colors.border, minWidth: '50%' }}>
                    <div style={{ fontSize: '0.9rem', color: colors.textSecondary }}>
                        <div>Last Studied: {lastStudied}</div>
                        <div>Progress: {progress}%</div>
                    </div>
                </div>

                {/* Right Box: Actions */}
                <div className="d-flex align-items-center justify-content-center gap-3 p-2" style={{ minWidth: '40%' }}>
                    {/* Edit Button (Wrench/Cog) */}
                    <Button
                        onClick={() => onEdit && onEdit(name)}
                        title="Edit Deck"
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: '36px',
                            height: '36px',
                            padding: 0,
                            border: `1px solid ${colors.border}`,
                            color: colors.text
                        }}
                    >
                        ⚙️
                    </Button>

                    {/* Play Button (Triangle) */}
                    <Button
                        onClick={() => onPlay && onPlay(name)}
                        title="Play Deck"
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: '48px',
                            height: '48px',
                            padding: 0,
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                            color: colors.text
                        }}
                    >
                        <span style={{ marginLeft: '4px', fontSize: '1.2rem' }}>▶</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MainPageDeckBlock;
