import React, { useEffect, useState } from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useGameStore from '../stores/useGameStore';
import GameTitleBar from '../components/GameTitleBar';
import useDataStore from '../stores/useDataStore';
import './CommonPage.css'; // Re-use bubble game css or add new ones

import { saveFile } from '../services/googleDriveService';
import useDriveStore from '../stores/useDriveStore';

function GameSummary({ title = 'Game Summary' }) {
    const { navigateTo } = useNavigationStore();
    const {
        score,
        continueGame,
        gameState,
        sessionResults
    } = useGameStore();
    const { cards, currentDeckName } = useDataStore();
    const { isAuthorized, deckFileIds } = useDriveStore();

    const [syncStatus, setSyncStatus] = useState(''); // '', 'Saving...', 'Saved', 'Error'

    useEffect(() => {
        const autoSave = async () => {
            // Only save if authorized and we have a file mapped
            if (isAuthorized && currentDeckName && deckFileIds[currentDeckName]) {
                try {
                    setSyncStatus('Saving to Drive...');
                    const fileId = deckFileIds[currentDeckName];
                    await saveFile(`${currentDeckName}.json`, { cards }, fileId);
                    setSyncStatus('Progress Saved to Drive ✅');
                } catch (err) {
                    console.error("Auto-save failed", err);
                    setSyncStatus('Save Failed ❌');
                }
            }
        };

        // Save immediately on summary load
        autoSave();
    }, [isAuthorized, currentDeckName, deckFileIds, cards]); // Depend on cards to ensure we save latest version

    const getProficiency = (cardId) => {
        const card = cards.find(c => c.id === cardId);
        return card ? card.proficiency : 0;
    };

    const handleExit = () => {
        navigateTo('main');
    };

    return (
        <div className="bubble-game-container">
            <GameTitleBar
                title={title}
                onExit={handleExit}
            />
            <div className="summary-screen" style={{ overflowY: 'auto', padding: '20px', height: '100%', boxSizing: 'border-box' }}>
                <h2>{gameState === 'won' ? 'Great Job!' : 'Game Over'}</h2>
                <h3>Score: {score}</h3>
                {syncStatus && <div style={{ marginTop: '10px', color: 'var(--color-primary)', fontStyle: 'italic' }}>{syncStatus}</div>}
            </div>

            <div className="summary-list">
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>Question</th>
                            <th style={{ padding: '8px' }}>Correct Answer</th>
                            <th style={{ padding: '8px' }}>Your Answer</th>
                            <th style={{ padding: '8px' }}>Result</th>
                            <th style={{ padding: '8px' }}>Proficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessionResults.map((result, index) => {
                            const currentProf = getProficiency(result.cardId);
                            const isCorrect = result.isCorrect;
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{result.question}</div>
                                    </td>
                                    <td style={{ padding: '8px' }}>{result.correctAnswer}</td>
                                    <td style={{ padding: '8px', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                                        {result.userAnswer || '-'}
                                    </td>
                                    <td style={{ padding: '8px', color: isCorrect ? 'lime' : 'red' }}>
                                        {isCorrect ? '✓' : '✗'}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        {/* Show stars or number */}
                                        {'★'.repeat(currentProf) + '☆'.repeat(5 - (currentProf || 0))}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', paddingBottom: '20px' }}>
                <button
                    onClick={continueGame}
                    className="game-over-button"
                >
                    Play Again
                </button>
                <button
                    onClick={handleExit}
                    className="game-exit-button"
                >
                    Exit
                </button>
            </div>
        </div>
        </div >
    );
}

export default GameSummary;
