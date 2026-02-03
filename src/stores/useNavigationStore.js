import { create } from 'zustand';


const useNavigationStore = create((set) => ({
    currentPage: 'main', // 'main', 'bubble', 'matching', 'deckInfo', 'createDeck'
    navigateTo: (page) => set({ currentPage: page }),
}));

export default useNavigationStore;
