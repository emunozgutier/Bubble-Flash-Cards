import React from 'react';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import { saveFile, loadFile } from '../../services/googleDriveService';

import hsk1Data from '../../data/decks/HSK1.json';
import hsk2Data from '../../data/decks/HSK2.json';
import hsk3Data from '../../data/decks/HSK3.json';
import hsk4Data from '../../data/decks/HSK4.json';
import hsk5Data from '../../data/decks/HSK5.json';

const DECK_NAMES = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5'];
const DEFAULT_DECKS = {
    'HSK1': hsk1Data,
    'HSK2': hsk2Data,
    'HSK3': hsk3Data,
    'HSK4': hsk4Data,
    'HSK5': hsk5Data
};

const MainPageDeckList = () => {
    const { isAuthorized, appFolderId, deckFileIds, isLoading, updateDeckFileId, setIsLoading } = useDriveStore();
    const {
        cards,
        currentDeckName,
        setCards,
        setCurrentDeckName,
        deckStats
    } = useDataStore();

    const loadDeck = async (deckName, fileId) => {
        setIsLoading(true);
        try {
            const data = await loadFile(fileId);
            // Set name first so the store updates stats for the correct deck
            setCurrentDeckName(deckName);
            if (data && data.cards) {
                setCards(data.cards);
            } else {
                setCards([]);
            }
        } catch (err) {
            console.error(`Error loading deck ${deckName}`, err);
            alert(`Failed to load ${deckName}`);
        }
        setIsLoading(false);
    };

    const handleDeckChange = async (newDeck) => {
        if (newDeck === currentDeckName) return;

        const fileId = deckFileIds[newDeck];
        if (fileId) {
            await loadDeck(newDeck, fileId);
        } else {
            if (appFolderId) {
                try {
                    const defaultData = DEFAULT_DECKS[newDeck] || { cards: [] };
                    // If defaultData has "cards" property (which it does from our script), use it.
                    // The saveFile expects an object content.
                    const contentToSave = defaultData.cards ? defaultData : { cards: defaultData.cards || [] };

                    const res = await saveFile(`${newDeck}.json`, contentToSave, null, appFolderId);
                    updateDeckFileId(newDeck, res.id);
                    setCurrentDeckName(newDeck);
                    setCards(contentToSave.cards);
                } catch (err) {
                    alert("Error creating new deck: " + err.message);
                }
            }
        }
    };

    const handleSaveToDrive = async () => {
        if (!isAuthorized || !appFolderId) return;
        setIsLoading(true);
        try {
            const filename = `${currentDeckName}.json`;
            const fileId = deckFileIds[currentDeckName];

            const result = await saveFile(filename, { cards }, fileId, appFolderId);
            if (result.id && !fileId) {
                updateDeckFileId(currentDeckName, result.id);
            }
            alert(`Saved ${currentDeckName} successfully!`);
        } catch (error) {
            alert('Failed to save: ' + error.message);
        }
        setIsLoading(false);
    };

    if (!isAuthorized) {
        return null; // Or handle as you see fit, but generally this component is shown when authorized
    }

    const availableDecks = Array.from(new Set([...DECK_NAMES, ...Object.keys(deckFileIds)]));

    // Use state for 'now' to ensure rendering is pure (deterministic based on state)
    const [now, setNow] = React.useState(Date.now());

    React.useEffect(() => {
        setNow(Date.now());
    }, []);

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
                        <button
                            key={name}
                            className={`deck-item ${name === currentDeckName ? 'active' : ''}`}
                            onClick={() => handleDeckChange(name)}
                            disabled={isLoading}
                        >
                            <div className="deck-item-header">
                                <span>{name}</span>
                            </div>
                            <div className="deck-stats">
                                <div className="stat-row">
                                    <span>Last Studied:</span>
                                    <span>{lastStudied}</span>
                                </div>
                                <div className="stat-row">
                                    <span>Progress:</span>
                                    <span>{progress}%</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className="deck-actions">
                <button onClick={handleSaveToDrive} disabled={isLoading || !currentDeckName}>
                    {isLoading ? 'Saving...' : 'Save Current Deck'}
                </button>
            </div>
        </div>
    );
};

export default MainPageDeckList;
