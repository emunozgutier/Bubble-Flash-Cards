import React from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import useDataStore from '../stores/useDataStore';

function BubbleGame() {
    const { navigateTo } = useNavigationStore();
    const { cards, currentDeckName } = useDataStore();

    return (
        <div className="bubble-game">
            <button onClick={() => navigateTo('main')}>Back to Deck Selection</button>
            <h1>Bubble Game</h1>
            <p>Playing with deck: {currentDeckName}</p>
            <p>Total cards: {cards.length}</p>
            <div className="game-area">
                {/* Game logic will go here */}
                <p>Values to match:</p>
                <ul>
                    {cards.map(card => (
                        <li key={card.id}>
                            {card.chinese || card.front} - {card.english || card.back}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default BubbleGame;
