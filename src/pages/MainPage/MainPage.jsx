import React from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import FlashCard from '../../components/FlashCard';
import useDriveStore from '../../stores/useDriveStore';
import useDataStore from '../../stores/useDataStore';
import MainPageDeckList from './MainPageDeckList';
import MainPageTitleBar from './MainPageTitleBar';
import '../CommonPage.css';

import './MainPage.css';

function MainPage() {
    const { navigateTo } = useNavigationStore();
    const { isAuthorized } = useDriveStore();
    const { cards, currentDeckName } = useDataStore();

    return (
        <div className="select-deck-page">
            <MainPageTitleBar />

            <div className="controls">
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
