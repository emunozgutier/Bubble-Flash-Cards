import { create } from 'zustand';

const useDataStore = create((set) => ({
    cards: [
        { id: 1, front: 'Welcome', back: 'Login to save your cards to Google Drive!' },
    ],
    currentDeckName: 'HSK1',
    draftCard: { front: '', back: '' },

    setCards: (cards) => set({ cards }),
    addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
    setCurrentDeckName: (currentDeckName) => set({ currentDeckName }),
    setDraftCardFront: (front) => set((state) => ({
        draftCard: { ...state.draftCard, front }
    })),
    setDraftCardBack: (back) => set((state) => ({
        draftCard: { ...state.draftCard, back }
    })),
    resetDraftCard: () => set({ draftCard: { front: '', back: '' } }),
}));

export default useDataStore;
