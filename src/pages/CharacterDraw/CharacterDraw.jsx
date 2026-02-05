
import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../CommonPage.css';
import './CharacterDraw.css'; // We'll need some styles

const CharacterDraw = ({ characters, englishDefinition, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGuided, setIsGuided] = useState(true);
    const [fontStyle, setFontStyle] = useState('regular'); // regular, messy, brush
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);

    const currentChar = characters ? characters[currentIndex] : '';

    const handleStyleChange = (style) => {
        setFontStyle(style);
    };

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const size = Math.min(300, window.innerWidth - 80);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 12;
            ctx.strokeStyle = '#ffffff';
            setContext(ctx);
            // Clear on char change
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [currentChar]);

    const startDrawing = useCallback((e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        if (context) {
            context.beginPath();
            context.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        }
    }, [context]);

    const draw = useCallback((e) => {
        if (!isDrawing || !context) return;
        const { offsetX, offsetY } = getCoordinates(e);
        context.lineTo(offsetX, offsetY);
        context.stroke();
    }, [isDrawing, context]);

    const stopDrawing = useCallback(() => {
        if (isDrawing && context) {
            context.closePath();
            setIsDrawing(false);
        }
    }, [isDrawing, context]);

    const getCoordinates = (e) => {
        if (e.touches && e.touches.length > 0) {
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY
        };
    };

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
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
            <div className="draw-card">
                <div className="draw-header">
                    <h2>Draw the Character</h2>
                    <div className="english-hint">{englishDefinition}</div>
                    <div className="progress-indicator">
                        Character {currentIndex + 1} of {characters.length}: <span className={`target-char ${fontStyle !== 'regular' ? fontStyle + '-font' : ''}`}>{currentChar}</span>
                    </div>
                    <a
                        href={`https://fonts.google.com/?preview.text=${encodeURIComponent(currentChar)}&lang=zh_Hans`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="google-fonts-link"
                    >
                        View on Google Fonts
                    </a>
                </div>

                <div className="draw-area">
                    {isGuided && currentChar && (
                        <div className="ghost-char-container">
                            <span className={`ghost-char ${fontStyle !== 'regular' ? fontStyle + '-font' : ''}`}>{currentChar}</span>
                        </div>
                    )}

                    <canvas
                        ref={canvasRef}
                        className="drawing-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />

                    <button className="clear-canvas-btn" onClick={clearCanvas} title="Clear Drawing">
                        Clear
                    </button>
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

                    <div className="style-selector">
                        <button
                            className={`style-btn ${fontStyle === 'regular' ? 'active' : ''}`}
                            onClick={() => handleStyleChange('regular')}
                        >
                            Print
                        </button>
                        <button
                            className={`style-btn ${fontStyle === 'brush' ? 'active' : ''}`}
                            onClick={() => handleStyleChange('brush')}
                        >
                            Brush
                        </button>
                        <button
                            className={`style-btn ${fontStyle === 'fast' ? 'active' : ''}`}
                            onClick={() => handleStyleChange('fast')}
                        >
                            Fast
                        </button>
                        <button
                            className={`style-btn ${fontStyle === 'messy' ? 'active' : ''}`}
                            onClick={() => handleStyleChange('messy')}
                        >
                            Messy
                        </button>
                    </div>

                    <button onClick={handleNext} className="next-btn">
                        Skip / Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterDraw;
