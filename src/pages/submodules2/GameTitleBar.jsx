import React from 'react';

const GameTitleBar = ({ title, onExit }) => {
    return (
        <div className="game-title-bar">
            <button className="exit-button" onClick={onExit}>
                Exit
            </button>
            <h2 className="game-title">{title}</h2>
            <div className="placeholder" style={{ width: '50px' }}></div>
        </div>
    );
};

export default GameTitleBar;
