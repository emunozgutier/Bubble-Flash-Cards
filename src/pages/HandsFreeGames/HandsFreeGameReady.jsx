import GameTitleBar from '../../components/GameTitleBar';
import useThemeStore from '../../stores/useThemeStore';
import '../CommonPage.css';
import './HandsFreeGame.css';

const HandsFreeGameReady = ({ onStart, onExit, permissionError }) => {
    const { colors } = useThemeStore();

    return (
        <div className="page-container">
            <GameTitleBar
                title="Hands Free - Ready?"
                onExit={onExit}
            />
            <div className="game-content-center">
                <h2 style={{ color: colors.text }}>Hands Free Mode</h2>
                <p className="text-center mb-4" style={{ maxWidth: '300px', color: colors.text }}>
                    This mode uses your microphone and audio.
                    Please tap Start to enable permissions.
                </p>
                {permissionError && (
                    <div className="mb-3" style={{ color: colors.primary }}>
                        {permissionError}
                    </div>
                )}
                <button
                    className="control-button primary fs-4 py-3 px-5"
                    onClick={onStart}
                >
                    START GAME
                </button>
                <div className="mt-4 opacity-75 small" style={{ color: colors.textSecondary }}>
                    Best experienced on Chrome or Safari
                </div>
            </div>
        </div>
    );
};

export default HandsFreeGameReady;
