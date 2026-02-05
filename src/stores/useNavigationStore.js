import { create } from 'zustand';


// Helper to get initial drawing card from URL
const getDrawingCardFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const draw = params.get('draw');
    const def = params.get('def');
    if (draw && def) {
        return { chinese: draw, english: def };
    }
    return null;
};

const useNavigationStore = create((set) => ({
    currentPage: 'main', // 'main', 'bubble', 'matching', 'deckInfo', 'createDeck'
    drawingCard: getDrawingCardFromURL(),
    navigateTo: (page) => {
        // When navigating back to main from some other page, clear URL if any draw params are there
        if (page === 'main') {
            const url = new URL(window.location.href);
            url.searchParams.delete('draw');
            url.searchParams.delete('def');
            window.history.pushState({}, '', url.toString());
        }
        set({ currentPage: page });
    },
    setDrawingCard: (card) => {
        const url = new URL(window.location.href);
        if (card) {
            url.searchParams.set('draw', card.chinese || card.front);
            url.searchParams.set('def', card.english || card.back);
        } else {
            url.searchParams.delete('draw');
            url.searchParams.delete('def');
        }
        window.history.pushState({}, '', url.toString());
        set({ drawingCard: card });
    },
}));

export default useNavigationStore;
