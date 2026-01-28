import React, { useEffect, useState, useRef } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useGameStore from '../stores/useGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import GameSummary from './GameSummary';
import './BubbleGame.css';

// Short silent MP3 to keep media session active
const SILENT_MP3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA//OEMAAAAAAAEfAAAAAAAAAAASW5mbwAAAA8AAAAZAAABFwAAA0cAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAALavZjgAAAAAABFwAAAAAAAAAAAA';

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
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);

    // Debug: Listen for keyboard presses
    useEffect(() => {
        const handleKeyDown = (e) => {
            const keyInfo = `${e.code} (${e.key})`;
            setDebugKeys(prev => [keyInfo, ...prev].slice(0, 5)); // Keep last 5

            // Optional: Map keys to actions for testing
            if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
                // handleCorrect(); // Uncomment to enable control
            }
            if (e.code === 'ArrowLeft') {
                // handleIncorrect(); // Uncomment to enable control
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const log = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 10)); // Keep last 10
    };

    // Initial Audio Playback to unlock Audio Context
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.1; // Minimal volume
            audioRef.current.play().catch(e => log(`Autoplay blocked: ${e.message}`));
        }
    }, [currentCard]);

    // Helper: Speak Text
    const speak = (text, rate = 1.0) => {
        if (!text) return;
        log(`Speaking: ${text.substring(0, 10)}... @ ${rate}`);

        // Cancel persistent synthesis (or overlap?)
        window.speechSynthesis.cancel();

        // Use Chinese voice if text has Chinese, else English
        // Heuristic: Check for Chinese characters
        const isChinese = /[\u4E00-\u9FFF]/.test(text);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate; // 1.0 = normal, 0.25 = slow

        // Find voice
        const voices = window.speechSynthesis.getVoices();
        if (isChinese) {
            const zhVoice = voices.find(v => v.lang.includes('zh')); // zh-CN, zh-HK, zh-TW
            if (zhVoice) utterance.voice = zhVoice;
        } else {
            // Prefer English
            const enVoice = voices.find(v => v.lang.startsWith('en'));
            if (enVoice) utterance.voice = enVoice;
        }

        window.speechSynthesis.speak(utterance);
    };

    // Keyboard Listener (Standard Keys)
    useEffect(() => {
        const handleKeyDown = (e) => {
            log(`Key: ${e.code} (${e.key})`);

            if (e.code === 'ArrowRight' || e.code === 'Space' || e.code === 'MediaTrackNext') {
                // Prevent scroll for space
                if (e.code === 'Space') e.preventDefault();
                handleCorrect();
            } else if (e.code === 'ArrowLeft' || e.code === 'MediaTrackPrevious') {
                handleIncorrect();
            } else if (e.code === 'MediaPlayPause') {
                e.preventDefault();
                speak(currentCard ? (currentCard.displayQuestion || currentCard.displayAnswer) : '', 1.0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentCard]); // Needs currentCard via closure in handles

    // Initialize Media Session & Speech
    useEffect(() => {
        // Media Session
        if ('mediaSession' in navigator) {
            log("MediaSession available");
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Hands Free Practice',
                artist: 'Flash Cards',
                album: 'Bubble Game'
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => { log("Media: Next"); handleCorrect(); });
            navigator.mediaSession.setActionHandler('previoustrack', () => { log("Media: Prev"); handleIncorrect(); });

            // Replay standard speed
            navigator.mediaSession.setActionHandler('play', () => {
                log("Media: Play");
                if (currentCard) speak(currentCard.displayQuestion || currentCard.displayAnswer, 1.0);
            });
            // Replay slow speed
            navigator.mediaSession.setActionHandler('pause', () => {
                log("Media: Pause");
                if (currentCard) speak(currentCard.displayQuestion || currentCard.displayAnswer, 0.25);
            });
        } else {
            log("MediaSession NOT available");
        }

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
            if (navigator.mediaSession) {
                // Keep handlers? Removing might break persistence if component remounts quickly?
                // But good practice to clean up if leaving the game.
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [practiceMode, currentCard]);
    // Handlers need latest closure values, so dependency on currentCard is vital unless using refs.

    // Auto-Speak on Card Load
    useEffect(() => {
        if (currentCard) {
            // Auto-play the question
            const textToSpeak = currentCard.displayQuestion;
            speak(textToSpeak, 1.0);
        }
    }, [currentCard]);

    // Update speech lang when card changes
    useEffect(() => {
        if (recognitionRef.current && currentCard) {
            const hasChinese = (text) => /[\u4E00-\u9FFF]/.test(text);
            const answer = currentCard.displayAnswer || '';
            const newLang = hasChinese(answer) ? 'zh-CN' : 'en-US';

            if (recognitionRef.current.lang !== newLang) {
                recognitionRef.current.lang = newLang;
            }

            try {
                if (!isListening) {
                    recognitionRef.current.start();
                    setIsListening(true);
                }
            } catch (e) {
                // Ignore if already started
            }
        }
        setSpeechResult('');
    }, [currentCard, practiceMode, isListening]);

    // Update Media Metadata
    useEffect(() => {
        if ('mediaSession' in navigator && currentCard) {
            navigator.mediaSession.metadata.title = currentCard.displayQuestion || 'Deep Focus';
            navigator.mediaSession.metadata.artist = `Lives: ${lives} | Left: ${cardsLeft + 1}`;
        }
    }, [currentCard, lives, cardsLeft]);


    const handleCorrect = () => {
        log("Action: Correct");
        window.speechSynthesis.cancel();
        markCorrect();
    };

    const handleIncorrect = () => {
        log("Action: Incorrect");
        window.speechSynthesis.cancel();
        markIncorrect();
    };

    if (gameState === 'idle') return null;

    if (gameState === 'game_over' || gameState === 'won') {
        window.speechSynthesis.cancel(); // Stop any pending speech
        return <GameSummary title="Hands Free Summary" />;
    }

    if (!currentCard) return <div>Loading...</div>;

    const displayQuestion = currentCard.displayQuestion || '...';

    return (
        <div className="bubble-game-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <GameTitleBar
                title={`Hands Free - Lives: ${lives}`}
                onExit={() => navigateTo('main')}
            />

            {/* Debug Window */}
            <div style={{
                position: 'absolute',
                top: '50px',
                right: '10px',
                width: '200px',
                background: 'rgba(0,0,0,0.7)',
                color: '#0f0',
                fontSize: '0.7em',
                padding: '5px',
                borderRadius: '5px',
                pointerEvents: 'none',
                fontFamily: 'monospace',
                zIndex: 9999
            }}>
                <strong>Debug Log:</strong>
                {debugLogs.map((l, i) => <div key={i}>{l}</div>)}
            </div>

            {/* Hidden Audio Loop for Media Session Persistence */}
            <audio
                ref={audioRef}
                src={SILENT_MP3}
                loop
                autoPlay
                playsInline
                style={{ display: 'none' }}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>

                <h1 style={{ fontSize: '3em', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                    {displayQuestion}
                </h1>

                {/* Visual Audio Controls */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <button
                        onClick={() => speak(currentCard.displayQuestion, 1.0)}
                        style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}
                    >
                        🔊 Speak
                    </button>
                    <button
                        onClick={() => speak(currentCard.displayQuestion, 0.25)}
                        style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: 'var(--color-secondary)', color: 'white', cursor: 'pointer' }}
                    >
                        🐢 Slow
                    </button>
                </div>

                {practiceMode && (
                    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', width: '80%' }}>
                        <div style={{ fontSize: '0.8em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Listening ({recognitionRef.current?.lang})</div>
                        <div style={{ fontStyle: 'italic', minHeight: '1.2em' }}>{speechResult || '...'}</div>
                    </div>
                )}

            </div>

            {/* Debug Overlay for Keyboard */}
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#0f0',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 9999,
                pointerEvents: 'none'
            }}>
                <div>KEYBOARD DEBUG</div>
                {debugKeys.length === 0 && <div style={{ opacity: 0.5 }}>(Press any key)</div>}
                {debugKeys.map((k, i) => (
                    <div key={i}>{k}</div>
                ))}
            </div>

            {/* Backup Controls */}
            <div style={{
                height: '150px',
                width: '100%',
                display: 'flex',
                gap: '10px',
                padding: '10px',
                boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <button
                    onClick={handleIncorrect}
                    style={{
                        flex: 1,
                        background: '#dc3545',
                        color: 'white',
                        fontSize: '1.5em',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <span>⏮</span>
                    <span>Skip / Wrong</span>
                </button>
                <button
                    onClick={handleCorrect}
                    style={{
                        flex: 1,
                        background: '#28a745',
                        color: 'white',
                        fontSize: '1.5em',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <span>Next / Correct</span>
                    <span>⏭</span>
                </button>
            </div>
        </div>
    );
}

export default HandsFreeGame;
