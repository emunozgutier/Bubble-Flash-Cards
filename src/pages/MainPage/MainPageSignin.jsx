import React, { useEffect } from 'react';
import { initGapi, initGis, findFile, saveFile, loadFile, createFolder, listFiles, signIn } from '../../services/googleDriveService';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import useThemeStore from '../../stores/useThemeStore';

const ROOT_FOLDER_NAME = 'breadBoardApps';
const APP_FOLDER_NAME = 'BubbleFlashCards';
const DECK_NAMES = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5'];

const MainPageSignin = () => {
    const { isAuthorized, setAuthorized, setAppFolderId, setDeckFileIds, setIsLoading } = useDriveStore();
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
                    const deckName = file.name.replace(/\.json$/i, '');
                    ids[deckName] = file.id;
                });
            }

            setDeckFileIds(ids);

            // 4. Ensure default decks exist (create if missing)
            await createMissingDecks(appId, ids);

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

    const { colors, fontSizes } = useThemeStore();

    if (isAuthorized) {
        return <span className="fw-medium" style={{ color: colors.text, fontSize: fontSizes.medium }}>✅ Connected</span>;
    }

    return (
        <button
            className="btn btn-outline-primary px-3 py-1"
            onClick={signIn}
            style={{
                color: colors.text,
                borderColor: colors.border,
                fontSize: fontSizes.medium
            }}
        >
            Sign In with Google
        </button>
    );

};

export default MainPageSignin;
