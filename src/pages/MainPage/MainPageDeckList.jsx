import React from 'react';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import MainPageDeckBlock from './MainPageDeckBlock';

// Only used for the names list now, effectively
const DECK_NAMES = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5'];

const MainPageDeckList = ({ onPlay, onEdit }) => {
    const { deckFileIds } = useDriveStore();
    const { deckStats, currentDeckName } = useDataStore();

    // Use state for 'now' to ensure rendering is pure
    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        setNow(Date.now());
    }, []);

    const availableDecks = Array.from(new Set([...DECK_NAMES, ...Object.keys(deckFileIds)]));

    const formatLastStudied = (timestamp) => {
        if (!timestamp) return 'Never';
        const diff = now - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <div className="deck-list-container">
            <div className="deck-list">
                {availableDecks.map(name => {
                    const stats = deckStats[name] || {};
                    const lastStudied = formatLastStudied(stats.lastStudied);
                    const progress = stats.progress || 0;

                    return (
                        <MainPageDeckBlock
                            key={name}
                            name={name}
                            lastStudied={lastStudied}
                            progress={progress}
                            currentDeckName={currentDeckName}
                            onPlay={onPlay}
                            onEdit={onEdit}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MainPageDeckList;
