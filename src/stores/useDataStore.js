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

            updateCardProgress: (cardId, isCorrect) => {
                set((state) => {
                    const cards = state.cards.map(card => {
                        if (card.id !== cardId) return card;

                        const now = Date.now();
                        let newProficiency = card.proficiency || 0;
                        let newTimesSeen = (card.timesSeen || 0) + 1;

                        if (isCorrect) {
                            newProficiency = Math.min((newProficiency || 0) + 1, 5); // Max proficiency 5
                        } else {
                            newProficiency = Math.max((newProficiency || 0) - 1, 0); // Min proficiency 0
                        }

                        return {
                            ...card,
                            lastSeen: now,
                            proficiency: newProficiency,
                            timesSeen: newTimesSeen
                        };
                    });

                    // Trigger deck stats update after card update
                    // We need to do this carefully as we are inside a setState. 
                    // But we can just return the new state here and rely on subsequent calls or just accept stats update on next load/setCards. 
                    // Ideally we should update stats immediately but let's keep it simple first.
                    // Actually, let's try to update stats if we can identify the deck.
                    const { currentDeckName, updateDeckStats } = get();
                    // We can't call get() or external actions easily inside set() updater if we want to be pure, 
                    // but here we can just update the cards.
                    // To update stats properly we might need a useEffect or just fire it after.
                    // Let's just update cards for now.
                    return { cards };
                });

                // Fire and forget stats update
                const { currentDeckName, cards, updateDeckStats } = get();
                if (currentDeckName) {
                    updateDeckStats(currentDeckName, cards);
                }
            },
        }),
        {
            name: 'bubble-flash-cards-storage', // unique name
        }
    )
);

export default useDataStore;
