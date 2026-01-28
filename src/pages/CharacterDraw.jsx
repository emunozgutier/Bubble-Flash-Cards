
import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import './CharacterDraw.css'; // We'll need some styles

const CharacterDraw = ({ characters, englishDefinition, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGuided, setIsGuided] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [writerInstance, setWriterInstance] = useState(null);
    const writerTargetRef = useRef(null);

    const currentChar = characters ? characters[currentIndex] : '';

    useEffect(() => {
        if (!currentChar) {
            onComplete();
            return;
        }

        setIsLoading(true);
        setHasError(false);
        setWriterInstance(null); // Clear previous instance

        // Clear previous content
        if (writerTargetRef.current) {
            writerTargetRef.current.innerHTML = '';
        }

        try {
            const writer = HanziWriter.create(writerTargetRef.current, currentChar, {
                width: 300,
                height: 300,
                padding: 20,
                showOutline: true, // Always show outline initially?
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 200, // Speed up animation
                charDataLoader: (char, onComplete, onLoadingError) => {
                    // Use default loader but hook into error
                    fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
                        .then(res => {
                            if (!res.ok) throw new Error('Network response was not ok');
                            return res.json();
                        })
                        .then(onComplete)
                        .catch(onLoadingError);
                },
                onLoadCharDataError: (err) => {
                    console.error("Failed to load char data", err);
                    setHasError(true);
                    setIsLoading(false);
                },
                onLoadCharDataSuccess: () => {
                    setIsLoading(false);
                }
            });

            setWriterInstance(writer);

        } catch (err) {
            console.error("Error creating HanziWriter", err);
            setHasError(true);
            setIsLoading(false);
        }

        // Cleanup
        return () => {
            // accessible if we needed to cancel something, but HanziWriter instance is standalone
        };

    }, [currentChar]);

    // Handle Guided/Unguided changes and Quiz restart
    useEffect(() => {
        if (writerInstance && !isLoading && !hasError) {
            startQuiz();
        }
    }, [writerInstance, isLoading, isGuided, hasError]);

    const startQuiz = () => {
        if (!writerInstance) return;

        // "Guided" -> Show outline/hints more aggressively or simple quizzing with hints on mistake
        // "Unguided" -> Strict

        // Actually, HanziWriter 'quiz' method has options
        writerInstance.quiz({
            onMistake: function (strokeData) {
                console.log('Oh no! you made a mistake on stroke ' + strokeData.strokeNum);
            },
            onComplete: function (summaryData) {
                console.log('You did it! You finished drawing ' + currentChar);
                // Maybe auto-advance or nice checkmark?
                // For now, let's wait a moment then advance or let user click Next
                // Let's simple animate a success and wait
                setTimeout(() => {
                    handleNext();
                }, 1000);
            },
            showOutline: isGuided, // If guided, show the gray background character
            showHintAfterMisses: isGuided ? 1 : 3, // Show hint sooner if guided
            highlightOnComplete: true
        });
    };

    const handleNext = () => {
        if (currentIndex < characters.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        // Skip current character
        handleNext();
    };

    if (!characters) return null;

    return (
        <div className="character-draw-container">
            <div className="draw-header">
                <h2>Draw the Character</h2>
                <div className="english-hint">{englishDefinition}</div>
                <div className="progress-indicator">
                    Character {currentIndex + 1} of {characters.length}: <span className="target-char">{currentChar}</span>
                </div>
            </div>

            <div className="draw-area">
                {/* SVG Container */}
                <div ref={writerTargetRef} className="hanzi-target" />

                {isLoading && <div className="loading-overlay">Loading stroke data...</div>}

                {hasError && (
                    <div className="error-overlay">
                        <p>Could not load character data (Offline?).</p>
                        <button onClick={handleSkip} className="skip-btn">Skip this Character</button>
                    </div>
                )}
            </div>

            <div className="draw-controls">
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={isGuided}
                        onChange={(e) => setIsGuided(e.target.checked)}
                    />
                    <span className="slider round"></span>
                    <span className="label-text">{isGuided ? "Guided" : "Unguided"}</span>
                </label>

                <button onClick={handleNext} className="next-btn">
                    Skip / Next
                </button>
            </div>
        </div>
    );
};

export default CharacterDraw;
