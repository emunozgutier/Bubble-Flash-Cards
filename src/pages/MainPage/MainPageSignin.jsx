import React, { useEffect } from 'react';
import { initGapi, initGis, signIn, signOut } from '../../services/GoogleDriveSignin';
import { ROOT_FOLDER_NAME, APP_FOLDER_NAME } from '../../services/GoogleDriveConstants';
import { findFile, loadFile, listFiles } from '../../services/GoogleDriveReadServices';
import { saveFile, createFolder } from '../../services/GoogleDriveWriteServices';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import useThemeStore from '../../stores/useThemeStore';

import { DEFAULT_DECKS, DECK_NAMES } from '../../utils/deckData';



const MainPageSignin = () => {
    const { isAuthorized, setAuthorized, setAppFolderId, setDeckFileIds, setIsLoading, accessToken, tokenExpiry, setAccessToken, logout } = useDriveStore();
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
                // Use default data if available, otherwise empty
                const initialData = DEFAULT_DECKS[deck] || { cards: [] };
                const res = await saveFile(filename, initialData, null, parentId);
                newIds[deck] = res.id;
            }
        }
        setDeckFileIds(newIds);
        // Load the first one after ensuring creation
        await loadDeck(DECK_NAMES[0], newIds[DECK_NAMES[0]]);
    };

    const repairEmptyDecks = async (files) => {
        if (!files || files.length === 0) return;

        for (const file of files) {
            const deckName = file.name.replace(/\.(json|csv)$/i, '');
            // We now rely on loadFile's internal recovery logic
            if (DECK_NAMES.includes(deckName)) {
                try {
                    await loadFile(file.id, file.name);
                } catch (err) {
                    console.error(`Failed to verify/repair ${deckName}`, err);
                }
            }
        }
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
                    const deckName = file.name.replace(/\.(json|csv)$/i, '');
                    ids[deckName] = file.id;
                });
            }

            setDeckFileIds(ids);

            // 4. Repair any existing empty files
            await repairEmptyDecks(files);

            // 5. Ensure default decks exist (create if missing)
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

                // Check if we have a valid persisted token
                const { accessToken, tokenExpiry, setAccessToken } = useDriveStore.getState();
                const now = Date.now();

                if (accessToken && tokenExpiry && now < tokenExpiry) {
                    // Restore session
                    console.log("Restoring Google Session...");
                    window.gapi.client.setToken({ access_token: accessToken });
                    setAuthorized(true);
                    // Initialize structure with existing token
                    initializeDriveStructure();
                }

                await initGis((accessToken, expiresIn) => {
                    // Update store with new token
                    const { setAccessToken } = useDriveStore.getState();
                    // setAccessToken comes from store but using getState inside callback to be safe or use destructured
                    // Actually, let's just use the prop from useDriveStore hook if stable, or getState.
                    // useDriveStore hook values are stable.
                    setAccessToken(accessToken, expiresIn);
                    // setAuthorized is handled by setAccessToken in our store update, but we can call it explicitly if needed.
                    // effectively:
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

    const handleSignOut = () => {
        signOut();
        logout();
        alert("Signed out from Google Drive.");
    };

    if (isAuthorized) {
        return (
            <div className="d-flex align-items-center gap-2">
                <span className="fw-medium" style={{ color: colors.text, fontSize: fontSizes.medium }}>✅ Connected</span>
                <button
                    className="btn btn-outline-danger btn-sm px-2 py-0"
                    onClick={handleSignOut}
                    style={{ fontSize: '0.8rem' }}
                >
                    Sign Out
                </button>
            </div>
        );
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
