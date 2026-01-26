import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import SelectDeckAndGame from './SelectDeckAndGame'
import BubbleGame from './pages/BubbleGame'
import MatchingGame from './pages/MatchingGame'
import { initGapi, initGis, findFile, saveFile, loadFile, createFolder, listFiles } from './services/googleDriveService'
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

      // 3. Find ALL json files in APP folder
      const files = await listFiles(appId);
      const ids = {};
      if (files && files.length > 0) {
        files.forEach(file => {
          // Remove .json extension for the deck name key if preferred, or keep it.
          // The current app uses "HSK1" logic, so let's strip .json if present.
          const deckName = file.name.replace(/\.json$/i, '');
          ids[deckName] = file.id;
        });
      }

      setDeckFileIds(ids);

      // 4. Ensure default decks exist (create if missing)
      // This will check if HSK1 etc exist in our 'ids' map. If not, create them.
      await createMissingDecks(appId, ids);

      // Update ids after creation
      // Note: createMissingDecks calls setDeckFileIds with new merged ids, so we don't need to do it here again manually
      // but we do need the updated list for loading the default deck.

      // We can just rely on the fact that if HSK1 was missing, it's created and added to state in createMissingDecks.
      // But for local reasoning let's just use the merged map that createMissingDecks computes.
      // Actually createMissingDecks logic is:
      // const newIds = { ...existingIds }; ... setDeckFileIds(newIds);

      // So let's load the default deck (first one)
      // We need to re-read what createMissingDecks did or pass the updated ids back?
      // Simpler: createMissingDecks internally updates state. But we want to call loadDeck here.
      // Let's rely on the fact that we know HSK1 is index 0.

      // Wait, createMissingDecks is async and updates state. State update might not reflect immediately in this closure.
      // Let's modify createMissingDecks to return the new ids object.


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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<SelectDeckAndGame />} />
        <Route path="/bubble" element={<BubbleGame />} />
        <Route path="/matching" element={<MatchingGame />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
