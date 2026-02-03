import React, { useMemo } from 'react';
import useDataStore from '../../stores/useDataStore';
import useNavigationStore from '../../stores/useNavigationStore';
import useThemeStore from '../../stores/useThemeStore';
import FlashCard from '../../components/FlashCard';
import { FaArrowLeft, FaStar, FaRegStar, FaPenToSquare as FaEdit } from 'react-icons/fa6';
import './DeckInfoPage.css';

const DeckInfoPage = () => {
    const { cards, currentDeckName } = useDataStore();
    const { navigateTo } = useNavigationStore();
    const { colors } = useThemeStore();

    const sortedCards = useMemo(() => {
        return [...cards].sort((a, b) => {
            // Primary sort: Proficiency (descending)
            const profA = a.proficiency || 0;
            const profB = b.proficiency || 0;
            if (profB !== profA) {
                return profB - profA;
            }
            // Secondary sort: Last Seen (descending)
            const seenA = a.lastSeen || 0;
            const seenB = b.lastSeen || 0;
            return seenB - seenA;
        });
    }, [cards]);

    const renderProficiencyStars = (proficiency) => {
        const stars = [];
        const level = proficiency || 0;
        for (let i = 1; i <= 5; i++) {
            if (i <= level) {
                stars.push(<FaStar key={i} className="proficiency-star" />);
            } else {
                stars.push(<FaRegStar key={i} className="proficiency-star empty" />);
            }
        }
        return <div className="proficiency-indicator">{stars}</div>;
    };

    const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'Never studied';
        const date = new Date(timestamp);
        return `Last seen: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="deck-info-page min-vh-100 d-flex flex-column">
            <header className="deck-info-header d-flex align-items-center">
                <button
                    className="deck-info-back-btn"
                    onClick={() => navigateTo('main')}
                    aria-label="Back to Main Page"
                >
                    <FaArrowLeft />
                    <span>Back</span>
                </button>
                <div className="ms-4 d-flex align-items-center gap-3">
                    <div>
                        <h1 className="h3 mb-0" style={{ color: colors.primary }}>{currentDeckName} Progress</h1>
                        <p className="small mb-0 opacity-75">Showing learning status for {cards.length} cards</p>
                    </div>
                    <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                        onClick={() => navigateTo('edit-deck')}
                        style={{ borderColor: `${colors.primary}44`, color: colors.primary }}
                    >
                        <FaEdit /> Edit Deck
                    </button>
                </div>
            </header>

            <main className="deck-info-content flex-grow-1">
                {sortedCards.length === 0 ? (
                    <div className="text-center mt-5 opacity-50">
                        <h3>No cards in this deck yet.</h3>
                    </div>
                ) : (
                    <div className="card-progress-grid">
                        {sortedCards.map(card => (
                            <div
                                key={card.id || `${card.front}-${card.back}`}
                                className="progress-container"
                                data-proficiency={card.proficiency || 0}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                                    {renderProficiencyStars(card.proficiency)}
                                    <div className="d-flex flex-column align-items-end">
                                        <span className="last-seen-text">{formatLastSeen(card.lastSeen)}</span>
                                        <span className="times-seen-text" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Seen: {card.timesSeen || 0} times</span>
                                    </div>
                                </div>
                                <FlashCard card={card} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeckInfoPage;
