import React, { useEffect, useState, useRef } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useGameStore from '../stores/useGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import GameSummary from './GameSummary';
import { SILENT_MP3, speak, initMediaSession, updateMediaMetadata } from '../utils/AudioManager';
import { setupKeyboardListeners } from '../utils/KeyboardManager';
import './CommonPage.css';
import './BubbleGame.css';
import './HandsFreeGame.css';
import HandsFreeGameReady from './HandsFreeGameReady';
function HandsFreeGame() {
    const { navigateTo } = useNavigationStore();
    console.log('HandsFreeGame: Imported useGameStore:', useGameStore);
    const gameStore = useGameStore && typeof useGameStore === 'function' ? useGameStore() : null;

    // Debugging Crash
    if (!gameStore) {
        console.error("CRITICAL: useGameStore() returned undefined or useGameStore hook is missing.");
        return <div style={{ color: 'red', padding: '20px' }}>Error: Game Store not initialized. Please check console.</div>;
    }

    const {
        gameState,
        lives,
        score,
        cardsLeft,
        currentCard,
        markCorrect,
        markIncorrect,
        practiceMode
    } = gameStore;

    const [speechResult, setSpeechResult] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [debugKeys, setDebugKeys] = useState([]);
    const [debugLogs, setDebugLogs] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);

    const log = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 10)); // Keep last 10
    };

    // Helper wrappers that log events
    const handleCorrect = () => {
        log("Action: Correct");
        setShowAnswer(false); // Immediate reset
        window.speechSynthesis.cancel();
        markCorrect();
    };

    const handleIncorrect = () => {
        log("Action: Incorrect");
        setShowAnswer(false); // Immediate reset
        window.speechSynthesis.cancel();
        markIncorrect();
    };



    const handleReplay = (rate = 1.0) => {
        if (currentCard) {
            speak(currentCard.displayQuestion || currentCard.displayAnswer, rate, log);
        }
    };

    // Keyboard Listener
    useEffect(() => {
        // Log key presses for debug overlay
        const debugListener = (e) => {
            const keyInfo = `${e.code} (${e.key})`;
            setDebugKeys(prev => [keyInfo, ...prev].slice(0, 5));
        };
        window.addEventListener('keydown', debugListener);

        const cleanupKeyboard = setupKeyboardListeners({
            onCorrect: handleCorrect,
            onIncorrect: handleIncorrect,
            onReplay: () => handleReplay(1.0),
            log
        });

        return () => {
            window.removeEventListener('keydown', debugListener);
            cleanupKeyboard();
        };
    }, [currentCard]); // Re-bind when currentCard changes for closure

    // Initial Audio Playback to unlock Audio Context
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.1; // Minimal volume
            audioRef.current.play().catch(e => log(`Autoplay blocked: ${e.message}`));
        }
    }, [currentCard]);

    // Initialize Media Session & Speech
    useEffect(() => {
        const cleanupMedia = initMediaSession({
            onNext: handleCorrect,
            onPrev: handleIncorrect,
            onPlay: () => handleReplay(1.0),
            onPause: () => handleReplay(0.25),
            log
        });

        // Web Speech API
        if (practiceMode && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setSpeechResult(finalTranscript || interimTranscript);

                if (currentCard && finalTranscript) {
                    const answer = currentCard.displayAnswer || '';
                    if (answer && finalTranscript.toLowerCase().includes(answer.toLowerCase())) {
                        log("Voice Match!");
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                log(`Speech Error: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            cleanupMedia();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [practiceMode, currentCard]);

    // Update Media Metadata
    useEffect(() => {
        if (currentCard) {
            updateMediaMetadata(
                currentCard.displayQuestion || 'Deep Focus',
                `Lives: ${lives} | Left: ${cardsLeft + 1}`
            );
        }
    }, [currentCard, lives, cardsLeft]);


    const [gameStarted, setGameStarted] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    // ... (keep existing effects but modifying auto-start logic slightly in next steps or implicitly via gameStarted check)

    const handleStartGame = async () => {
        log("Game Starting... initializing audio/speech");

        // 1. Resume Audio Context / Play Silent Audio
        if (audioRef.current) {
            try {
                audioRef.current.volume = 0.1;
                await audioRef.current.play();
                log("Audio Context resumed");
            } catch (e) {
                log(`Audio Error: ${e.message}`);
            }
        }

        // 2. Initialize Speech Recognition (if available)
        if (practiceMode && recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                log("Speech Recognition started");
            } catch (e) {
                log(`Speech Start Error: ${e.message}`);
                // Often error is 'no-speech' or 'aborted' if already started
            }
        } else if (practiceMode && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setPermissionError("Speech Recognition not supported in this browser. Try Chrome or Safari.");
        }

        // 3. Warm up Speech Synthesis
        window.speechSynthesis.cancel();
        // Speak empty string to prompt permission prompt if needed
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);

        setGameStarted(true);
    };

    // Auto-Speak on Card Load - ONLY if game started
    useEffect(() => {
        if (currentCard && gameStarted) {
            setShowAnswer(false); // Reset answer visibility
            const timer = setTimeout(() => {
                const textToSpeak = currentCard.displayQuestion;
                speak(textToSpeak, 1.0, log);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentCard, gameStarted]);

    // Delayed Answer Reveal
    useEffect(() => {
        if (currentCard && gameStarted) {
            const timer = setTimeout(() => {
                setShowAnswer(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentCard, gameStarted]);

    // Update speech lang when card changes
    useEffect(() => {
        if (recognitionRef.current && currentCard && gameStarted) {
            const hasChinese = (text) => /[\u4E00-\u9FFF]/.test(text);
            const answer = currentCard.displayAnswer || '';
            const newLang = hasChinese(answer) ? 'zh-CN' : 'en-US';

            if (recognitionRef.current.lang !== newLang) {
                recognitionRef.current.lang = newLang;
            }

            // Only attempt restart if not listening, avoiding loop
            if (!isListening) {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (e) { /* ignore */ }
            }
        }
        setSpeechResult('');
    }, [currentCard, practiceMode, isListening, gameStarted]);


    if (gameState === 'idle') return null;

    if (gameState === 'game_over' || gameState === 'won') {
        window.speechSynthesis.cancel(); // Stop any pending speech
        return <GameSummary title="Hands Free Summary" />;
    }

    if (!currentCard) return <div>Loading...</div>;

    // Render shared elements (Audio) outside conditionals
    const audioComponent = (
        <audio
            ref={audioRef}
            src={SILENT_MP3}
            loop
            playsInline
            style={{ display: 'none' }}
        />
    );

    if (!gameStarted) {
        return (
            <>
                <HandsFreeGameReady
                    onStart={handleStartGame}
                    onExit={() => navigateTo('main')}
                    permissionError={permissionError}
                />
                {audioComponent}
            </>
        );
    }

    const displayQuestion = currentCard.displayQuestion || '...';

    return (
        <div className="page-container">
            <GameTitleBar
                title={`Hands Free - Lives: ${lives}`}
                onExit={() => navigateTo('main')}
            />

            {audioComponent}

            {/* Split Screen Layout */}
            <div className="split-screen-container" key={currentCard?.id || 'empty'}>
                {/* Top Half: Question */}
                <div className="split-top">
                    <h1 className="question-text">
                        {displayQuestion}
                    </h1>
                </div>

                {/* Bottom Half: Answer & Controls */}
                <div className="split-bottom">
                    <div className={`answer-text ${showAnswer ? 'visible' : 'hidden'}`}>
                        {currentCard?.displayAnswer || ''}
                    </div>

                    <div className="controls-container">
                        <button
                            onClick={() => handleReplay(1.0)}
                            className="control-button primary"
                        >
                            🔊 Speak
                        </button>
                        <button
                            onClick={() => handleReplay(0.25)}
                            className="control-button secondary"
                        >
                            🐢 Slow
                        </button>
                    </div>

                    {practiceMode && (
                        <div className="speech-status">
                            <div className="speech-status-label">Listening ({recognitionRef.current?.lang})</div>
                            <div className="speech-result">{speechResult || '...'}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Backup Controls */}
            <div className="backup-controls">
                <button
                    onClick={handleIncorrect}
                    className="backup-button incorrect"
                >
                    <span>⏮</span>
                    <span>Skip / Wrong</span>
                </button>
                <button
                    onClick={handleCorrect}
                    className="backup-button correct"
                >
                    <span>Next / Correct</span>
                    <span>⏭</span>
                </button>
            </div>
        </div>
    );
}

export default HandsFreeGame;
