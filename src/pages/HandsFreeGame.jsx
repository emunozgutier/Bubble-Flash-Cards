import React, { useEffect, useState, useRef } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useGameStore from '../stores/useGameStore';
import GameTitleBar from './submodules1/GameTitleBar';
import GameSummary from './GameSummary';
import './BubbleGame.css'; // Shared styles? Or create new ones. We can reuse base but add specific ones.

function HandsFreeGame() {
    const { navigateTo } = useNavigationStore();
    const {
        gameState,
        lives,
        score,
        cardsLeft,
        currentCard,
        markCorrect,
        markIncorrect,
        practiceMode
    } = useGameStore();

    const [speechResult, setSpeechResult] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Initialize Media Session & Speech
    useEffect(() => {
        // Media Session
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Hands Free Practice',
                artist: 'Flash Cards',
                album: 'Bubble Game'
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                handleCorrect();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                handleIncorrect();
            });
            navigator.mediaSession.setActionHandler('play', () => { /* no-op or speak */ });
            navigator.mediaSession.setActionHandler('pause', () => { /* no-op */ });
        }

        // Web Speech API
        if (practiceMode && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true; // Keep listening? Or restart per card?
            recognition.interimResults = true;
            recognition.lang = 'en-US'; // Default to English listening. If mode is Eng->Chi, maybe listen for Chinese?
            // TODO: Detect lang based on answer. 
            // If question is Chinese, answer is English -> listen English.
            // If question is English, answer is Chinese -> listen Chinese.
            // Current Store doesn't explicitly expose 'answerLang', but we can infer or pass it.
            // For now default en-US/zh-CN based on heuristic?

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

                // Simple matching logic
                if (currentCard && finalTranscript) {
                    const answer = currentCard.displayAnswer || '';
                    if (answer && finalTranscript.toLowerCase().includes(answer.toLowerCase())) {
                        // Match found!
                        // Maybe auto-advance? Or just show "Match!"
                        // User said: "see if you get close".
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (navigator.mediaSession) {
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [practiceMode]); // Re-run if practice mode changes? usually set once.

    // Update speech lang when card changes
    useEffect(() => {
        if (recognitionRef.current && currentCard) {
            // Stop to reset logic?
            // recognitionRef.current.stop(); 
            // set lang...
            // Check if answer is Chinese or English.
            // Heuristic: if answer contains chinese characters, use zh-CN.
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
        // Play sound?
        markCorrect();
    };

    const handleIncorrect = () => {
        // Play sound?
        markIncorrect();
    };

    if (gameState === 'idle') return null; // Should redirect logic handle this?

    if (gameState === 'game_over' || gameState === 'won') {
        return <GameSummary title="Hands Free Summary" />;
    }

    if (!currentCard) return <div>Loading...</div>;

    const displayQuestion = currentCard.displayQuestion || '...';
    // const displayAnswer = currentCard.displayAnswer || '...'; // Hidden? or show after?

    return (
        <div className="bubble-game-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <GameTitleBar
                title={`Hands Free - Lives: ${lives}`}
                onExit={() => navigateTo('main')}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>

                <h1 style={{ fontSize: '3em', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                    {displayQuestion}
                </h1>

                {practiceMode && (
                    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', width: '80%' }}>
                        <div style={{ fontSize: '0.8em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Listening ({recognitionRef.current?.lang})</div>
                        <div style={{ fontStyle: 'italic', minHeight: '1.2em' }}>{speechResult || '...'}</div>
                    </div>
                )}

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
