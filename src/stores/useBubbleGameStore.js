import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useDataStore from './useDataStore';

const useBubbleGameStore = create(
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

                if (validCards.length === 0) {
                    // If we only had the welcome card, we can't play.
                    // But maybe we should alert? For now just return or let it fail gracefully?
                    // If we return, nothing happens.
                    return;
                }

                // Shuffle and pick 16 (or fewer if deck is small)
                const shuffled = [...validCards].sort(() => 0.5 - Math.random());
                const sessionCards = shuffled.slice(0, 16);

                set({
                    deck: validCards,
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

                if (!gameQueue || gameQueue.length === 0) {
                    set({ gameState: 'won', currentCard: null, options: [] });
                    return;
                }

                // Pop the next card
                const [nextCard, ...remainingQueue] = gameQueue;

                if (!nextCard) {
                    // Should not happen due to check above, but safe guard
                    set({ gameState: 'won', currentCard: null, options: [] });
                    return;
                }

                // Pick 2 distractors from the FULL deck
                // Smart Distractor Logic
                const otherCards = deck.filter(c => c && c.id !== nextCard.id);

                const getScore = (candidate, target) => {
                    let score = 0;
                    const targetText = target.chinese || target.front || '';
                    const candidateText = candidate.chinese || candidate.front || '';

                    // Length similarity (+10)
                    if (targetText.length === candidateText.length) score += 10;

                    // Shared characters (+5 each)
                    const targetChars = new Set(targetText.split(''));
                    const candidateChars = new Set(candidateText.split(''));
                    let shared = 0;
                    candidateChars.forEach(char => {
                        if (targetChars.has(char)) shared++;
                    });
                    score += shared * 5;

                    return score;
                };

                // Add randomness to top scorers to avoid same distractors every time
                const scoredOthers = otherCards.map(c => ({
                    card: c,
                    score: getScore(c, nextCard) + Math.random() // Add small jitter
                }));

                scoredOthers.sort((a, b) => b.score - a.score);

                // Pick top 2
                const distractors = scoredOthers.slice(0, 2).map(item => item.card);

                // Helper to get text based on mode
                const getModeContent = (card) => {
                    if (!card) return { question: '?', answer: '?' };

                    // Fallbacks
                    const safeChinese = card.chinese || card.front || '???';
                    const safeEnglish = card.english || card.back || '???';
                    const safePinyin = card.pinyin || '';

                    switch (questionMode) {
                        case 'chinese_english':
                            return { question: safeChinese, answer: safeEnglish };
                        case 'chinese_pinyin_english':
                            return { question: `${safeChinese}\n(${safePinyin})`, answer: safeEnglish };
                        case 'chinese_pinyin':
                            // If pinyin is missing, fallback to english/back helps avoid empty bubble
                            return { question: safeChinese, answer: safePinyin || safeEnglish };
                        case 'english_pinyin':
                            return { question: safeEnglish, answer: safePinyin || safeChinese };
                        case 'chinese': // Backwards compatibility / default
                        default:
                            return { question: safeChinese, answer: safeEnglish };
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

                let allOptions = [correctOption, ...wrongOptions];

                // Sort by text length descending so longest are first (Top/Bottom slots)
                // We shuffle first to ensure if lengths are equal, position is random
                allOptions.sort(() => 0.5 - Math.random());
                allOptions.sort((a, b) => b.text.length - a.text.length);

                set({
                    gameQueue: remainingQueue,
                    currentCard: { ...nextCard, displayQuestion: targetContent.question }, // Augment card with display text
                    cardsLeft: remainingQueue.length,
                    options: allOptions
                });
            },

            submitAnswer: (option) => {
                const { lives, score, currentCard, sessionResults } = get();
                // Access useDataStore via direct import since it is imported at the top of the file

                const isCorrect = option.isCorrect;

                // Record Result
                // We need to resolve the correct answer text for the summary
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
        }),
        {
            name: 'bubble-flash-cards-game',
        }
    )
);

export default useBubbleGameStore;
