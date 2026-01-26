import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import SelectDeckAndGame from './SelectDeckAndGame'
import BubbleGame from './pages/BubbleGame'
import MatchingGame from './pages/MatchingGame'
import { initGapi, initGis, findFile, saveFile, loadFile, createFolder } from './services/googleDriveService'
import useDriveStore from './stores/useDriveStore'
import useDataStore from './stores/useDataStore'

const ROOT_FOLDER_NAME = 'breadBoardApps';
const APP_FOLDER_NAME = 'BubbleFlashCards';
const DECK_NAMES = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5'];

function App() {
  const { setAuthorized, setAppFolderId, setDeckFileIds, setIsLoading } = useDriveStore();
  const { setCards, setCurrentDeckName } = useDataStore();

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

  useEffect(() => {
    const initializeGoogleModules = async () => {
      try {
        await initGapi();
        await initGis(() => {
          setAuthorized(true);
          initializeDriveStructure();
        });
      } catch (error) {
        console.error("Failed to initialize Google modules", error);
      }
    };
    initializeGoogleModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectDeckAndGame />} />
        <Route path="/bubble" element={<BubbleGame />} />
        <Route path="/matching" element={<MatchingGame />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
