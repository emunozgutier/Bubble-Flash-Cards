import { create } from 'zustand';

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
            questionMode: mode
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
        const { lives, score } = get();

        if (option.isCorrect) {
            set({ score: score + 1 });
            return true;
        } else {
            const newLives = lives - 1;
            set({ lives: newLives });
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
