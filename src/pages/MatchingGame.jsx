import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../stores/useDataStore';

function MatchingGame() {
    const navigate = useNavigate();
    const { cards, currentDeckName } = useDataStore();

    return (
        <div className="matching-game">
            <button onClick={() => navigate('/')}>Back to Deck Selection</button>
            <h1>Matching Game</h1>
            <p>Playing with deck: {currentDeckName}</p>
            <p>Total cards: {cards.length}</p>
            <div className="game-area">
                {/* Game logic will go here */}
                <p>Values to match:</p>
                <ul>
                    {cards.map(card => (
                        <li key={card.id}>{card.front} - {card.back}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MatchingGame;
