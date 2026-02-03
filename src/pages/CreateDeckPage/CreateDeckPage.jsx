import React, { useState } from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import useThemeStore from '../../stores/useThemeStore';
import useDriveStore from '../../stores/useDriveStore';
import { saveFile } from '../../services/googleDriveService';
import { FaArrowLeft, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import '../CommonPage.css';
import './CreateDeckPage.css';

const CreateDeckPage = () => {
    const { navigateTo } = useNavigationStore();
    const { colors, fontSizes } = useThemeStore();
    const { isAuthorized, appFolderId, setIsLoading, updateDeckFileId } = useDriveStore();

    const [deckName, setDeckName] = useState('');
    const [cards, setCards] = useState([]);
    const [currentFront, setCurrentFront] = useState('');
    const [currentBack, setCurrentBack] = useState('');

    const handleAddCard = (e) => {
        e.preventDefault();
        if (!currentFront.trim() || !currentBack.trim()) return;

        const newCard = {
            id: Date.now(),
            front: currentFront.trim(),
            back: currentBack.trim(),
            proficiency: 0,
            timesSeen: 0,
            lastSeen: null
        };

        setCards([...cards, newCard]);
        setCurrentFront('');
        setCurrentBack('');
    };

    const handleDeleteCard = (id) => {
        setCards(cards.filter(card => card.id !== id));
    };

    const handleSaveDeck = async () => {
        if (!deckName.trim()) {
            alert('Please enter a deck name.');
            return;
        }
        if (cards.length === 0) {
            alert('Please add at least one card.');
            return;
        }

        if (!isAuthorized) {
            alert('You must be signed in to Google Drive to save decks.');
            return;
        }

        setIsLoading(true);
        try {
            const content = {
                name: deckName,
                cards: cards
            };
            const response = await saveFile(`${deckName}.json`, content, null, appFolderId);
            if (response && response.id) {
                updateDeckFileId(deckName, response.id);
            }
            alert('Deck saved successfully!');
            navigateTo('main');
        } catch (error) {
            console.error('Error saving deck:', error);
            alert('Failed to save deck. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-deck-page h-100 d-flex flex-column" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <div className="create-deck-header d-flex align-items-center p-3 border-bottom" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <button
                    onClick={() => navigateTo('main')}
                    className="btn-back me-3"
                    style={{ color: colors.primary, background: 'none', border: 'none', fontSize: '24px' }}
                >
                    <FaArrowLeft />
                </button>
                <h2 className="m-0" style={{ color: colors.primary, fontSize: fontSizes.large }}>Create New Deck</h2>
            </div>

            <div className="flex-grow-1 overflow-auto p-4">
                <div className="container-md">
                    {/* Deck Name Input */}
                    <div className="mb-4">
                        <label className="form-label" style={{ color: colors.textSecondary }}>Deck Name</label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            placeholder="e.g., Spanish Basics"
                            style={{
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderColor: colors.border
                            }}
                        />
                    </div>

                    {/* Add Card Form */}
                    <div className="card-form-container p-3 mb-4 rounded border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <h5 className="mb-3" style={{ color: colors.primary }}>Add Card</h5>
                        <form onSubmit={handleAddCard}>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <input
                                        type="text"
                                        className="form-control custom-input"
                                        value={currentFront}
                                        onChange={(e) => setCurrentFront(e.target.value)}
                                        placeholder="Front (Term)"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            color: colors.text,
                                            borderColor: colors.border
                                        }}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="text"
                                        className="form-control custom-input"
                                        value={currentBack}
                                        onChange={(e) => setCurrentBack(e.target.value)}
                                        placeholder="Back (Definition)"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            color: colors.text,
                                            borderColor: colors.border
                                        }}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button
                                        type="submit"
                                        className="btn w-100"
                                        style={{ backgroundColor: colors.primary, color: colors.text }}
                                    >
                                        <FaPlus /> Add
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Card List */}
                    <div className="card-list">
                        <h5 className="mb-3" style={{ color: colors.textSecondary }}>Cards ({cards.length})</h5>
                        {cards.length === 0 ? (
                            <p className="text-muted italic">No cards added yet.</p>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="d-flex justify-content-between align-items-center p-2 rounded backdrop-blur"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}44` }}
                                    >
                                        <div className="d-flex flex-grow-1">
                                            <div className="me-3 fw-bold" style={{ color: colors.text, minWidth: '120px' }}>{card.front}</div>
                                            <div style={{ color: colors.textSecondary }}>{card.back}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="btn btn-sm text-danger"
                                            title="Delete Card"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-top d-flex justify-content-end gap-3" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <button
                    onClick={() => navigateTo('main')}
                    className="btn btn-outline-secondary"
                    style={{ borderColor: colors.border, color: colors.text }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveDeck}
                    className="btn d-flex align-items-center gap-2"
                    style={{ backgroundColor: colors.primary, color: colors.text }}
                >
                    <FaSave /> Save Deck to Drive
                </button>
            </div>
        </div>
    );
};

export default CreateDeckPage;
