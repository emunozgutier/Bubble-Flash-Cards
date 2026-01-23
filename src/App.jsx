import { useState, useEffect } from 'react'
import './App.css'
import FlashCard from './components/FlashCard'
import { initGapi, initGis, signIn, findFile, saveFile, loadFile } from './services/googleDriveService'

const DATA_FILENAME = 'flashcards_v1.json';

function App() {
  const [cards, setCards] = useState([
    { id: 1, front: 'Welcome', back: 'Login to save your cards to Google Drive!' },
  ]);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFileId, setDriveFileId] = useState(null);

  useEffect(() => {
    const initializeGoogleModules = async () => {
      try {
        await initGapi();
        await initGis((accessToken) => {
          setIsAuthorized(true);
          // Auto-load if possible? Maybe better to let user click "Load" or auto-check
          checkForExistingFile();
        });
      } catch (error) {
        console.error("Failed to initialize Google modules", error);
      }
    };
    initializeGoogleModules();
  }, []);

  const checkForExistingFile = async () => {
    try {
      const files = await findFile(DATA_FILENAME);
      if (files && files.length > 0) {
        setDriveFileId(files[0].id);
        alert("Found existing flashcards file in your Drive! Click 'Load' to restore.");
      }
    } catch (err) {
      console.error("Error checking for file", err);
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
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const result = await saveFile(DATA_FILENAME, { cards }, driveFileId);
      if (result.id) setDriveFileId(result.id);
      alert('Saved successfully!');
    } catch (error) {
      alert('Failed to save: ' + error.message);
    }
    setIsLoading(false);
  };

  const handleLoadFromDrive = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      // If we don't have the ID yet, search again
      let id = driveFileId;
      if (!id) {
        const files = await findFile(DATA_FILENAME);
        if (files && files.length > 0) id = files[0].id;
      }

      if (id) {
        const data = await loadFile(id);
        if (data && data.cards) {
          setCards(data.cards);
          setDriveFileId(id);
          alert('Loaded successfully!');
        }
      } else {
        alert('No save file found in your Drive.');
      }
    } catch (error) {
      alert('Failed to load: ' + error.message);
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
          <span className="auth-status">Google Drive Connected ✅</span>
        )}
        <button onClick={handleSaveToDrive} disabled={!isAuthorized || isLoading}>
          {isLoading ? 'Saving...' : 'Save to Drive'}
        </button>
        <button onClick={handleLoadFromDrive} disabled={!isAuthorized || isLoading}>
          {isLoading ? 'Loading...' : 'Load from Drive'}
        </button>
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
