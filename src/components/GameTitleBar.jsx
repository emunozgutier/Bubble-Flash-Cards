import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import useThemeStore from '../stores/useThemeStore';

const GameTitleBar = ({ title, onExit, onHelp }) => {
    const { colors } = useThemeStore();

    return (
        <div className="game-title-bar" style={{
            backgroundColor: colors.surface,
            borderColor: colors.border
        }}>
            <button className="exit-button" onClick={onExit} style={{ color: colors.text }}>
                Exit
            </button>
            <h2 className="game-title" style={{ color: colors.primary }}>{title}</h2>
            <div className="title-bar-actions">
                {onHelp && (
                    <button
                        className="help-button"
                        onClick={onHelp}
                        style={{ color: colors.text, background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Input Help"
                    >
                        <FaQuestionCircle size={24} />
                    </button>
                )}
                {!onHelp && <div className="placeholder" style={{ width: '50px' }}></div>}
            </div>
        </div>
    );
};

export default GameTitleBar;
