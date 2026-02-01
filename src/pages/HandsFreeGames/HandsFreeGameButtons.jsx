import React from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { GiTurtle } from 'react-icons/gi';
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md';

const HandsFreeGameButtons = ({ onReplay, onCorrect, onIncorrect }) => {
    return (
        <div className="w-100 d-flex flex-column gap-4 align-items-center">
            {/* Primary Controls (Speak/Slow) */}
            <div className="d-flex gap-3 justify-content-center w-100">
                <button
                    onClick={() => onReplay(1.0)}
                    className="control-button primary d-flex align-items-center"
                >
                    <FaVolumeUp className="me-2" /> Speak
                </button>
                <button
                    onClick={() => onReplay(0.25)}
                    className="control-button secondary d-flex align-items-center"
                >
                    <GiTurtle className="me-2" /> Slow
                </button>
            </div>

            {/* Backup Controls (Skip/Next) */}
            <div className="backup-controls w-100">
                <button
                    onClick={onIncorrect}
                    className="backup-button incorrect d-flex flex-column align-items-center justify-content-center gap-1"
                >
                    <MdSkipPrevious size={32} />
                    <span>Skip / Wrong</span>
                </button>
                <button
                    onClick={onCorrect}
                    className="backup-button correct d-flex flex-column align-items-center justify-content-center gap-1"
                >
                    <span>Next / Correct</span>
                    <MdSkipNext size={32} />
                </button>
            </div>
        </div>
    );
};

export default HandsFreeGameButtons;
