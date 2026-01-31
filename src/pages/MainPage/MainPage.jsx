import React from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import FlashCard from '../../components/FlashCard';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import MainPageSignin from './MainPageSignin';
import MainPageDeckList from './MainPageDeckList';
import '../CommonPage.css';

function MainPage() {
    const { navigateTo } = useNavigationStore();
    const { isAuthorized } = useDriveStore();
    const { cards, currentDeckName } = useDataStore();

    return (
        <div className="select-deck-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 style={{ margin: 0 }}>Bubble Flash Cards</h1>
                <button
                    onClick={() => navigateTo('help')}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        background: 'transparent',
                        border: '1px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Help & Version
                </button>
            </div>

            <div className="controls">
                <MainPageSignin />
                <MainPageDeckList />
            </div>

            {currentDeckName && (
                <div className="game-selection">
                    <button onClick={() => navigateTo('bubbleSetup')}>Play Bubble Game</button>
                    <button onClick={() => navigateTo('handsFreeSetup')}>Play Hands Free</button>
                    <button onClick={() => navigateTo('matching')}>Play Matching Game</button>
                </div>
            )}

        </div>
    );
}

export default MainPage;
