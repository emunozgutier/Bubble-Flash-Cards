import { useState, useEffect } from 'react'
import './App.css'
import FlashCard from './components/FlashCard'
import { initGapi, initGis, signIn, findFile, saveFile, loadFile, createFolder } from './services/googleDriveService'

const ROOT_FOLDER_NAME = 'breadBoardApps';
const APP_FOLDER_NAME = 'BubbleFlashCards';
const DECK_NAMES = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5'];

function App() {
  const [cards, setCards] = useState([
    { id: 1, front: 'Welcome', back: 'Login to save your cards to Google Drive!' },
  ]);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Drive state
  const [appFolderId, setAppFolderId] = useState(null);
  const [currentDeckName, setCurrentDeckName] = useState(DECK_NAMES[0]);
  const [deckFileIds, setDeckFileIds] = useState({}); // Map deckName -> fileId

  useEffect(() => {
    const initializeGoogleModules = async () => {
      try {
        await initGapi();
        await initGis((accessToken) => {
          setIsAuthorized(true);
          initializeDriveStructure();
        });
      } catch (error) {
        console.error("Failed to initialize Google modules", error);
      }
    };
    initializeGoogleModules();
  }, []);

  // Initialize folders and decks
  const initializeDriveStructure = async () => {
    setIsLoading(true);
    try {
      // 1. Find or Create ROOT folder
      let rootId = null;
      const rootFiles = await findFile(ROOT_FOLDER_NAME);
      if (rootFiles && rootFiles.length > 0) {
        rootId = rootFiles[0].id;
      } else {
        const folder = await createFolder(ROOT_FOLDER_NAME);
        rootId = folder.id;
      }

      // 2. Find or Create APP folder inside ROOT
      let appId = null;
      const appFiles = await findFile(APP_FOLDER_NAME, rootId);
      if (appFiles && appFiles.length > 0) {
        appId = appFiles[0].id;
      } else {
        const folder = await createFolder(APP_FOLDER_NAME, rootId);
        appId = folder.id;
      }
      setAppFolderId(appId);

      // 3. Check for existence of all decks
      const ids = {};
      for (const deck of DECK_NAMES) {
        const filename = `${deck}.json`;
        const files = await findFile(filename, appId);
        if (files && files.length > 0) {
          ids[deck] = files[0].id;
        }
      }
      setDeckFileIds(ids);

      // 4. Load the default deck (first one)
      if (ids[DECK_NAMES[0]]) {
        await loadDeck(DECK_NAMES[0], ids[DECK_NAMES[0]]);
      } else {
        // If not found, we will create it on save, or we can create empty now?
        // Let's create empty now to be sure it exists
        await createMissingDecks(appId, ids);
      }

    } catch (err) {
      console.error("Error initializing Drive structure", err);
      alert("Error initializing storage: " + err.message);
    }
    setIsLoading(false);
  };

  const createMissingDecks = async (parentId, existingIds) => {
    const newIds = { ...existingIds };
    for (const deck of DECK_NAMES) {
      if (!newIds[deck]) {
        const filename = `${deck}.json`;
        const initialData = { cards: [] }; // Empty deck
        const res = await saveFile(filename, initialData, null, parentId);
        newIds[deck] = res.id;
      }
    }
    setDeckFileIds(newIds);
    // Load the first one after ensuring creation
    await loadDeck(DECK_NAMES[0], newIds[DECK_NAMES[0]]);
  };

  const loadDeck = async (deckName, fileId) => {
    setIsLoading(true);
    try {
      const data = await loadFile(fileId);
      if (data && data.cards) {
        setCards(data.cards);
      } else {
        setCards([]);
      }
      setCurrentDeckName(deckName);
    } catch (err) {
      console.error(`Error loading deck ${deckName}`, err);
      alert(`Failed to load ${deckName}`);
    }
    setIsLoading(false);
  };

  const handleDeckChange = async (e) => {
    const newDeck = e.target.value;
    if (newDeck === currentDeckName) return;

    // Save current deck before switching? (Optional, but good UX)
    // For now, let's just switch and load.

    const fileId = deckFileIds[newDeck];
    if (fileId) {
      await loadDeck(newDeck, fileId);
    } else {
      // Should not happen if we initialized correctly, but handle just in case
      // Create it?
      if (appFolderId) {
        try {
          // Quick create
          const res = await saveFile(`${newDeck}.json`, { cards: [] }, null, appFolderId);
          setDeckFileIds(prev => ({ ...prev, [newDeck]: res.id }));
          setCurrentDeckName(newDeck);
          setCards([]);
        } catch (err) {
          alert("Error creating new deck: " + err.message);
        }
      }
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newFront || !newBack) return;
    const newCard = {
      id: Date.now(),
      front: newFront,
      back: newBack
    };
    setCards([...cards, newCard]);
    setNewFront('');
    setNewBack('');
  };

  const handleSaveToDrive = async () => {
    if (!isAuthorized || !appFolderId) return;
    setIsLoading(true);
    try {
      const filename = `${currentDeckName}.json`;
      const fileId = deckFileIds[currentDeckName];

      const result = await saveFile(filename, { cards }, fileId, appFolderId);
      if (result.id && !fileId) {
        setDeckFileIds(prev => ({ ...prev, [currentDeckName]: result.id }));
      }
      alert(`Saved ${currentDeckName} successfully!`);
    } catch (error) {
      alert('Failed to save: ' + error.message);
    }
    setIsLoading(false);
  };




  return (
    <>
      <h1>Flash Cards</h1>

      <div className="controls">
        {!isAuthorized ? (
          <button onClick={signIn}>Sign In with Google</button>
        ) : (
          <>
            <span className="auth-status">✅ Connected</span>
            <select value={currentDeckName} onChange={handleDeckChange} disabled={isLoading}>
              {DECK_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button onClick={handleSaveToDrive} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Deck'}
            </button>
          </>
        )}
      </div>

      <form className="add-card-form" onSubmit={handleAddCard}>
        <input
          type="text"
          placeholder="Front (Question)"
          value={newFront}
          onChange={(e) => setNewFront(e.target.value)}
        />
        <input
          type="text"
          placeholder="Back (Answer)"
          value={newBack}
          onChange={(e) => setNewBack(e.target.value)}
        />
        <button type="submit">Add Card</button>
      </form>

      <div className="card-grid">
        {cards.map(card => (
          <FlashCard
            key={card.id}
            front={card.front}
            back={card.back}
          />
        ))}
      </div>
    </>
  )
}

export default App
