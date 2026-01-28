import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useDataStore from './useDataStore';

const useGameStore = create(
    persist(
        (set, get) => ({
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
            enableDrawing: true,

            setQuestionMode: (mode) => set({ questionMode: mode }),
            setEnableDrawing: (enabled) => set({ enableDrawing: enabled }),

            startGame: (allCards, mode = 'chinese') => {
                if (!allCards || allCards.length === 0) return;

                // Filter out the "Welcome" placeholder card
                const validCards = allCards.filter(c => c.front !== 'Welcome' || c.back !== 'Login to save your cards to Google Drive!');

                if (validCards.length === 0) return;

                // Shuffle and pick 16 (or fewer if deck is small)
                const shuffled = [...validCards].sort(() => 0.5 - Math.random());
                const sessionCards = shuffled.slice(0, 16);

                set({
                    deck: validCards,
                    gameQueue: sessionCards,
                    lives: 3, // Default lives, can be overridden if needed
                    score: 0,
                    gameState: 'playing',
                    cardsLeft: sessionCards.length,
                    questionMode: mode,
                    sessionResults: []
                });

                get().nextRound();
            },

            nextRound: () => {
                const { gameQueue, deck, questionMode } = get();

                if (!gameQueue || gameQueue.length === 0) {
                    set({ gameState: 'won', currentCard: null, options: [] });
                    return;
                }

                // Pop the next card
                const [nextCard, ...remainingQueue] = gameQueue;

                if (!nextCard) {
                    set({ gameState: 'won', currentCard: null, options: [] });
                    return;
                }

                // Helper to get text based on mode
                const getModeContent = (card) => {
                    if (!card) return { question: '?', answer: '?' };
                    const safeChinese = card.chinese || card.front || '???';
                    const safeEnglish = card.english || card.back || '???';
                    const safePinyin = card.pinyin || '';

                    switch (questionMode) {
                        case 'chinese_english':
                            return { question: safeChinese, answer: safeEnglish };
                        case 'english_chinese':
                            return { question: safeEnglish, answer: safeChinese };
                        case 'chinese_pinyin_english':
                            return { question: `${safeChinese}\n(${safePinyin})`, answer: safeEnglish };
                        case 'chinese_pinyin':
                            return { question: safeChinese, answer: safePinyin || safeEnglish };
                        case 'english_pinyin':
                            return { question: safeEnglish, answer: safePinyin || safeChinese };
                        case 'chinese':
                        default:
                            return { question: safeChinese, answer: safeEnglish };
                    }
                };

                const targetContent = getModeContent(nextCard);

                // Distractor Logic (Only needed for BubbleGame, but harmless here)
                const otherCards = deck.filter(c => c && c.id !== nextCard.id);
                // Simple random for now to save tokens, or keep smart logic if preferred. 
                // Keeping smart logic from original file...
                const getScore = (candidate, target) => {
                    let score = 0;
                    const targetText = target.chinese || target.front || '';
                    const candidateText = candidate.chinese || candidate.front || '';
                    if (targetText.length === candidateText.length) score += 10;
                    const targetChars = new Set(targetText.split(''));
                    const candidateChars = new Set(candidateText.split(''));
                    let shared = 0;
                    candidateChars.forEach(char => { if (targetChars.has(char)) shared++; });
                    score += shared * 5;
                    return score;
                };

                const scoredOthers = otherCards.map(c => ({
                    card: c,
                    score: getScore(c, nextCard) + Math.random()
                })).sort((a, b) => b.score - a.score);

                const distractors = scoredOthers.slice(0, 2).map(item => item.card);

                // Create options
                const correctOption = { id: nextCard.id, text: targetContent.answer, isCorrect: true };
                const wrongOptions = distractors.map(c => ({ id: c.id, text: getModeContent(c).answer, isCorrect: false }));
                let allOptions = [correctOption, ...wrongOptions];
                allOptions.sort(() => 0.5 - Math.random());
                allOptions.sort((a, b) => b.text.length - a.text.length);

                set({
                    gameQueue: remainingQueue,
                    currentCard: { ...nextCard, displayQuestion: targetContent.question, displayAnswer: targetContent.answer },
                    cardsLeft: remainingQueue.length,
                    options: allOptions
                });
            },

            // Bubble Game Interaction
            submitAnswer: (option) => {
                const { lives, score, currentCard, sessionResults } = get();
                const isCorrect = option.isCorrect;

                // Record
                const currentOptions = get().options;
                const correctOption = currentOptions.find(o => o.isCorrect);
                const correctAnswerText = correctOption ? correctOption.text : 'Unknown';

                const result = {
                    cardId: currentCard.id,
                    question: currentCard.displayQuestion,
                    correctAnswer: correctAnswerText,
                    userAnswer: option.text,
                    isCorrect: isCorrect,
                    card: currentCard
                };

                const newSessionResults = [...sessionResults, result];

                if (isCorrect) {
                    set({ score: score + 1, sessionResults: newSessionResults });
                    useDataStore.getState().updateCardProgress(currentCard.id, true);
                    return true;
                } else {
                    const newLives = lives - 1;
                    set({ lives: newLives, sessionResults: newSessionResults });
                    useDataStore.getState().updateCardProgress(currentCard.id, false);
                    if (newLives <= 0) set({ gameState: 'game_over' });
                    return false; // Return false to indicate wrong answer
                }
            },

            // Hands Free Interaction
            markCorrect: () => {
                const { score, currentCard, sessionResults } = get();
                if (!currentCard) return;

                const result = {
                    cardId: currentCard.id,
                    question: currentCard.displayQuestion,
                    correctAnswer: currentCard.displayAnswer,
                    userAnswer: '(Voice/Skipped)', // Start with generic, or pass text
                    isCorrect: true,
                    card: currentCard
                };

                set({ score: score + 1, sessionResults: [...sessionResults, result] });
                useDataStore.getState().updateCardProgress(currentCard.id, true);
                get().nextRound();
            },

            markIncorrect: () => {
                const { lives, currentCard, sessionResults } = get();
                if (!currentCard) return;

                const result = {
                    cardId: currentCard.id,
                    question: currentCard.displayQuestion,
                    correctAnswer: currentCard.displayAnswer,
                    userAnswer: '(Skipped/Wrong)',
                    isCorrect: false,
                    card: currentCard
                };

                const newLives = lives - 1;
                set({ lives: newLives, sessionResults: [...sessionResults, result] });
                useDataStore.getState().updateCardProgress(currentCard.id, false);

                if (newLives <= 0) {
                    set({ gameState: 'game_over' });
                } else {
                    get().nextRound();
                }
            },

            continueGame: () => {
                const { deck, startGame, questionMode } = get();
                startGame(deck, questionMode);
            }
        }),
        {
            name: 'bubble-flash-cards-game',
        }
    )
);

export default useGameStore;
