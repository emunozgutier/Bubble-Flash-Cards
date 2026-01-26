import { create } from 'zustand';

const useDriveStore = create((set) => ({
    isAuthorized: false,
    appFolderId: null,
    deckFileIds: {},
    isLoading: false,

    setAuthorized: (isAuthorized) => set({ isAuthorized }),
    setAppFolderId: (appFolderId) => set({ appFolderId }),
    setDeckFileIds: (deckFileIds) => set({ deckFileIds }),
    updateDeckFileId: (deckName, fileId) => set((state) => ({
        deckFileIds: { ...state.deckFileIds, [deckName]: fileId }
    })),
    setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useDriveStore;
