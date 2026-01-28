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
        const { lives, score, nextRound } = get();

        if (option.isCorrect) {
            set({ score: score + 1 });
            // Alert logic moved to UI or handled here? user looked for alert in original code.
            // Let's return true/false so UI can alert if needed, OR just update state.
            // original had alerts "Correct!" / "Try again!".
            // "Try again" implies we trigger next round or let them retry?
            // "If you get 3 wrong the game is gone". This implies we move on or fail.
            // Usually in these games, correct -> next. Wrong -> lose life, maybe next?
            // User said: "if you get 3 wrong the game is gone".
            // Let's assume wrong -> lose life, stay on card? Or wrong -> lose life, next card?
            // "Try again" suggests stay.
            // But if I stay, I can just click 4 times.
            // Let's assume: Wrong -> Lose Life. Stay on card to learn? 
            // Or Wrong -> Lose Life.
            // If I just stay, game is trivial.
            // But if I move on, I miss the card.
            // Let's Stick to: Right -> Next. Wrong -> Lose Life. If Life > 0, Stay?
            // "when playing make sure... if you get 3 wrong game is gone".
            // Let's assume infinite retries per card until lives run out?
            // That matches "Try again!".

            submitAnswer: (option) => {
                const { lives, score } = get(); // Removed nextRound destruction

                if (option.isCorrect) {
                    set({ score: score + 1 });
                    // nextRound(); // Removed: Component handles timing
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
                    // "Asked if you want to continue"
                    // Usually "Continue" implies "Retry" or "Keep playing but reset lives"?
                    // User said: "asked if you want to continue".
                    // Use case: Child playing, lost. "Continue?" -> New game.
                    // Or "Continue" -> Reset lives to 3, keep current score/progress?
                    // "the game is gone and you are asked if you want to continue".
                    // This sounds like "Game Over. Play Again?".
                    // I will implement it as "Restart with new 16 cards".

                    // Actually, checking "Continue" in video games often means "Reset lives, keep level".
                    // But here "16 cards" is a session.
                    // I'll make continue restart the session (startGame).
                    const { deck, startGame, questionMode } = get();
                    startGame(deck, questionMode); // Restart with same deck and mode
                }
        }));

export default useBubbleGameStore;
