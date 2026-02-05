import { create } from 'zustand';


const useNavigationStore = create((set) => ({
    currentPage: 'main', // 'main', 'bubble', 'matching', 'deckInfo', 'createDeck'
    drawingCard: null,
    navigateTo: (page) => set({ currentPage: page }),
    setDrawingCard: (card) => set({ drawingCard: card }),
}));

export default useNavigationStore;
