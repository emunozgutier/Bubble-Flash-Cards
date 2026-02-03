import { create } from 'zustand';


import { persist } from 'zustand/middleware';

const useDriveStore = create(
    persist(
        (set, get) => ({
            isAuthorized: false,
            accessToken: null,
            tokenExpiry: null,
            appFolderId: null,
            deckFileIds: {},
            isLoading: false,

            setAuthorized: (isAuthorized) => set({ isAuthorized }),
            setAccessToken: (accessToken, expiresIn = 3599) => {
                const expiry = Date.now() + (expiresIn * 1000);
                set({ accessToken, tokenExpiry: expiry, isAuthorized: true });
            },
            setAppFolderId: (appFolderId) => set({ appFolderId }),
            setDeckFileIds: (deckFileIds) => set({ deckFileIds }),
            updateDeckFileId: (deckName, fileId) => set((state) => ({
                deckFileIds: { ...state.deckFileIds, [deckName]: fileId }
            })),
            removeDeckFileId: (deckName) => set((state) => {
                const newDeckFileIds = { ...state.deckFileIds };
                delete newDeckFileIds[deckName];
                return { deckFileIds: newDeckFileIds };
            }),
            setIsLoading: (isLoading) => set({ isLoading }),
            logout: () => set({
                isAuthorized: false,
                accessToken: null,
                tokenExpiry: null,
                appFolderId: null,
                deckFileIds: {},
                isLoading: false
            }),
        }),
        {
            name: 'bubble-flash-cards-drive-storage',
            partialize: (state) => ({
                appFolderId: state.appFolderId,
                deckFileIds: state.deckFileIds,
                accessToken: state.accessToken,
                tokenExpiry: state.tokenExpiry
            }),
        }
    )
);

export default useDriveStore;
