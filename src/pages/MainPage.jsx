import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlashCard from '../components/FlashCard';
import useDriveStore from '../stores/useDriveStore';
import useDataStore from '../stores/useDataStore';
import MainPageSignin from './submodules1/MainPageSignin';
import MainPageDeckList from './submodules1/MainPageDeckList';

function MainPage() {
    const navigate = useNavigate();
    const { isAuthorized } = useDriveStore();
    const { cards, draftCard, addCard, setDraftCardFront, setDraftCardBack, resetDraftCard } = useDataStore();

    const handleAddCard = (e) => {
        e.preventDefault();
        if (!draftCard.front || !draftCard.back) return;
        const newCard = {
            id: Date.now(),
            front: draftCard.front,
            back: draftCard.back
        };
        addCard(newCard);
        resetDraftCard();
    };

    return (
        <div className="select-deck-page">
            <h1>Flash Cards Manager</h1>

            <div className="controls">
                <MainPageSignin />
                <MainPageDeckList />
            </div>

            {isAuthorized && (
                <div className="game-selection">
                    <button onClick={() => navigate('/bubble')}>Play Bubble Game</button>
                    <button onClick={() => navigate('/matching')}>Play Matching Game</button>
                </div>
            )}

            <form className="add-card-form" onSubmit={handleAddCard}>
                <input
                    type="text"
                    placeholder="Front (Question)"
                    value={draftCard.front}
                    onChange={(e) => setDraftCardFront(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Back (Answer)"
                    value={draftCard.back}
                    onChange={(e) => setDraftCardBack(e.target.value)}
                />
                <button type="submit">Add Card</button>
            </form>

            <div className="card-grid">
                {cards.map(card => (
                    <FlashCard
                        key={card.id}
                        card={card}
                        front={card.front}
                        back={card.back}
                    />
                ))}
            </div>
        </div>
    );
}

export default MainPage;
