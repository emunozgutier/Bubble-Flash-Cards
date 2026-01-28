import { create } from 'zustand';
import useDataStore from './useDataStore';

const useBubbleGameStore = create((set, get) => ({
    gameState: 'idle', // idle, playing, game_over, won
    lives: 3,
    score: 0,
    cardsLeft: 0,
    currentCard: null,
    options: [],
    deck: [], // Full deck for distractors
    gameQueue: [], // The 16 cards to play
    questionMode: 'chinese', // 'chinese', 'pinyin', 'english'
    sessionResults: [], // { cardId, question, answer, userAnswer, isCorrect, card }

    setQuestionMode: (mode) => set({ questionMode: mode }),

    startGame: (allCards, mode = 'chinese') => {
        if (!allCards || allCards.length === 0) return;

        // Shuffle and pick 16 (or fewer if deck is small)
        const shuffled = [...allCards].sort(() => 0.5 - Math.random());
        const sessionCards = shuffled.slice(0, 16);

        set({
            deck: allCards,
            gameQueue: sessionCards,
            lives: 3,
            score: 0,
            gameState: 'playing',
            cardsLeft: sessionCards.length,
            questionMode: mode,
            sessionResults: [] // Reset session results
        });

        get().nextRound();
    },

    nextRound: () => {
        const { gameQueue, deck, questionMode } = get();

        if (gameQueue.length === 0) {
            set({ gameState: 'won', currentCard: null, options: [] });
            return;
        }

        // Pop the next card
        const [nextCard, ...remainingQueue] = gameQueue;

        // Pick 2 distractors from the FULL deck
        const otherCards = deck.filter(c => c.id !== nextCard.id);
        const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 2);

        // Helper to get text based on mode
        const getModeContent = (card) => {
            switch (questionMode) {
                case 'chinese_english':
                    return { question: card.chinese, answer: card.english || card.back };
                case 'chinese_pinyin_english':
                    return { question: `${card.chinese}\n(${card.pinyin})`, answer: card.english || card.back };
                case 'chinese_pinyin':
                    return { question: card.chinese, answer: card.pinyin };
                case 'english_pinyin':
                    return { question: card.english || card.back, answer: card.pinyin };
                case 'chinese': // Backwards compatibility / default
                default:
                    return { question: card.chinese, answer: card.english || card.back };
            }
        };

        const targetContent = getModeContent(nextCard);

        // Create options
        const correctOption = {
            id: nextCard.id,
            text: targetContent.answer,
            isCorrect: true
        };

        const wrongOptions = distractors.map(c => ({
            id: c.id,
            text: getModeContent(c).answer,
            isCorrect: false
        }));

        const allOptions = [correctOption, ...wrongOptions].sort(() => 0.5 - Math.random());

        set({
            gameQueue: remainingQueue,
            currentCard: { ...nextCard, displayQuestion: targetContent.question }, // Augment card with display text
            cardsLeft: remainingQueue.length,
            options: allOptions
        });
    },

    submitAnswer: (option) => {
        const { lives, score, currentCard, sessionResults } = get();
        // Access useDataStore via direct import or assume it's available globally. 
        // Best practice is to import the hook/store.
        // We will assume 'useDataStore' is resolvable if we imported it at top.
        // Wait, I didn't import useDataStore in the file view. I need to verify imports.
        // I'll assume we need to import it. I'll add the import in a separate tool call if needed or just use `window` if it was global (unlikely).
        // Standard practice: Import it.
        // But I can't add imports with multi_replace easily if I don't target the top.
        // I'll assume I can just use `require` or I'll do a separate replace for import.
        // Actually, let's just assume I'll add the import first or use a dynamic import/access. 
        // No, I should add the import. 
        // Let's modify this chunk to just do the logic and I'll add import in another step or assume I can do it here if I target top.
        // I'll stick to logic here and do import in next step to be safe, or just use the global store if I can.
        // Better: I'll use `useDataStore.getState().updateCardProgress(currentCard.id, isCorrect)` but I need to import `useDataStore`. 

        const isCorrect = option.isCorrect;

        // Record Result
        const result = {
            cardId: currentCard.id,
            question: currentCard.displayQuestion,
            correctAnswer: option.isCorrect ? option.text : sessionResults.find(r => r.cardId === currentCard.id)?.correctAnswer, // Wait, logic for correct answer retrieval?
            // Actually currentCard doesn't have the answer text directly stored in a generic way, but we know the correct option from the options logic.
            // But 'options' might be shuffled. 
            // The 'option' passed in is the one clicked. 
            // If correct, it's correct. If wrong, we need to find the correct one? 
            // In 'nextRound' we generated options. We didn't save the correct answer text explicitly separate from options.
            // But we know 'currentCard' and 'questionMode'. 
            // Let's just store what we know.
            userAnswer: option.text,
            isCorrect: isCorrect,
            card: currentCard
        };

        // We need the correct answer text for the summary if the user got it wrong.
        // Re-deriving it might be annoying.
        // Let's look at 'options'. One of them is correct.
        const currentOptions = get().options;
        const correctOption = currentOptions.find(o => o.isCorrect);
        result.correctAnswer = correctOption ? correctOption.text : 'Unknown';

        const newSessionResults = [...sessionResults, result];



        if (isCorrect) {
            set({ score: score + 1, sessionResults: newSessionResults });
            useDataStore.getState().updateCardProgress(currentCard.id, true);
            return true;
        } else {
            const newLives = lives - 1;
            set({ lives: newLives, sessionResults: newSessionResults });
            useDataStore.getState().updateCardProgress(currentCard.id, false);
            if (newLives <= 0) {
                set({ gameState: 'game_over' });
            }
            return false;
        }
    },

    continueGame: () => {
        const { deck, startGame, questionMode } = get();
        startGame(deck, questionMode);
    }
}));

export default useBubbleGameStore;
