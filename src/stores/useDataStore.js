import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDataStore = create(
    persist(
        (set, get) => ({
            cards: [
                { id: 1, front: 'Welcome', back: 'Login to save your cards to Google Drive!' },
            ],
            currentDeckName: 'HSK1',
            draftCard: { front: '', back: '' },
            deckStats: {}, // { [deckName]: { lastStudied: timestamp, progress: percentage } }

            setCards: (cards) => {
                set({ cards });
                // Update stats for the current deck whenever cards are set (loaded)
                const { currentDeckName, updateDeckStats } = get();
                if (currentDeckName) {
                    updateDeckStats(currentDeckName, cards);
                }
            },
            addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
            setCurrentDeckName: (currentDeckName) => set({ currentDeckName }),
            setDraftCardFront: (front) => set((state) => ({
                draftCard: { ...state.draftCard, front }
            })),
            setDraftCardBack: (back) => set((state) => ({
                draftCard: { ...state.draftCard, back }
            })),
            resetDraftCard: () => set({ draftCard: { front: '', back: '' } }),

            updateDeckStats: (deckName, cards) => {
                if (!cards || cards.length === 0) return;

                // Calculate last studied
                const timestamps = cards
                    .map(c => c.lastSeen)
                    .filter(t => t !== null && t !== undefined);
                const lastStudied = timestamps.length > 0 ? Math.max(...timestamps) : null;

                // Calculate progress (e.g., cards with proficiency > 1 or just seen)
                // Assuming proficiency > 1 means "learned" or at least "in progress" beyond new
                // For now, let's use: has been seen (lastSeen != null) as a proxy for "started"
                // Or user wanted "progress learning". Let's say proficiency > 1 is "learned".
                // But initially all are 1. Let's count proficiency > 1.
                const learnedCount = cards.filter(c => c.proficiency > 1).length;
                const progress = Math.round((learnedCount / cards.length) * 100);

                set((state) => ({
                    deckStats: {
                        ...state.deckStats,
                        [deckName]: { lastStudied, progress }
                    }
                }));
            },
        }),
        {
            name: 'bubble-flash-cards-storage', // unique name
            partialize: (state) => ({ deckStats: state.deckStats }), // only persist stats, not the cards (which are in Drive)
        }
    )
);

export default useDataStore;
