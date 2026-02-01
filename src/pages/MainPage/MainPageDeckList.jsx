import React from 'react';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import MainPageDeckButton from './MainPageDeckButton';

// Default deck names
const DECK_NAMES = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5'];

const MainPageDeckList = ({ onPlay, onEdit, onInfo }) => {
    const { deckFileIds } = useDriveStore();
    const { deckStats, currentDeckName, setCurrentDeckName } = useDataStore();

    // Use state for 'now' to ensure rendering is stable relative to timestamps
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
        <div className="d-flex flex-column gap-3 w-100">
            {availableDecks.map(name => {
                const stats = deckStats[name] || {};
                const lastStudied = formatLastStudied(stats.lastStudied);
                const progress = stats.progress || 0;

                return (
                    <MainPageDeckButton
                        key={name}
                        name={name}
                        lastStudied={lastStudied}
                        progress={progress}
                        currentDeckName={currentDeckName}
                        onPlay={onPlay}
                        onEdit={onEdit}
                        onInfo={onInfo}
                        onSelect={(id) => setCurrentDeckName(id)}
                    />
                );
            })}
        </div>
    );
};

export default MainPageDeckList;
