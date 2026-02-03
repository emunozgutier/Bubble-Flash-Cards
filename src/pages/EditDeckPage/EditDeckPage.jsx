import React, { useState, useEffect } from 'react';
import useDataStore from '../../stores/useDataStore';
import useNavigationStore from '../../stores/useNavigationStore';
import useThemeStore from '../../stores/useThemeStore';
import useDriveStore from '../../stores/useDriveStore';
import { saveFile, deleteFile } from '../../services/googleDriveService';
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import '../CommonPage.css';
import './EditDeckPage.css';

const EditDeckPage = () => {
    const { cards: storeCards, currentDeckName, setCards } = useDataStore();
    const { navigateTo } = useNavigationStore();
    const { colors, fontSizes } = useThemeStore();
    const { isAuthorized, appFolderId, deckFileIds, setIsLoading, updateDeckFileId, removeDeckFileId } = useDriveStore();

    const [deckName, setDeckName] = useState(currentDeckName || '');
    const [cards, setCardsList] = useState([]);
    const [currentFront, setCurrentFront] = useState('');
    const [currentBack, setCurrentBack] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (storeCards) {
            setCardsList(storeCards.map(c => ({ ...c })));
        }
    }, [storeCards]);

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

        setCardsList([...cards, newCard]);
        setCurrentFront('');
        setCurrentBack('');
    };

    const handleDeleteCard = (id) => {
        setCardsList(cards.filter(card => card.id !== id));
    };

    const handleCardChange = (id, field, value) => {
        setCardsList(cards.map(card => {
            if (card.id === id) {
                const updatedCard = { ...card, [field]: value };

                // If text changed, reset stats
                const originalCard = storeCards.find(c => c.id === id);
                if (originalCard && (updatedCard.front !== originalCard.front || updatedCard.back !== originalCard.back)) {
                    updatedCard.proficiency = 0;
                    updatedCard.timesSeen = 0;
                    updatedCard.lastSeen = null;
                }

                return updatedCard;
            }
            return card;
        }));
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

            const fileId = deckFileIds[currentDeckName];
            const response = await saveFile(`${deckName}.json`, content, fileId, appFolderId);

            if (response && response.id) {
                // If name changed, we might need to handle the old mapping
                if (deckName !== currentDeckName) {
                    removeDeckFileId(currentDeckName);
                }
                updateDeckFileId(deckName, response.id);
            }

            setCards(cards);
            // In a real app we'd trigger a rename in the data store too if needed
            // For now, let's assume the user re-selects the deck or it refreshes.

            alert('Deck updated successfully!');
            navigateTo('main');
        } catch (error) {
            console.error('Error saving deck:', error);
            alert('Failed to save deck. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDeck = async () => {
        const fileId = deckFileIds[currentDeckName];
        if (!fileId) {
            alert('Could not find file ID for this deck. It might only exist locally.');
            return;
        }

        setIsLoading(true);
        try {
            await deleteFile(fileId);
            removeDeckFileId(currentDeckName);
            alert('Deck deleted from Google Drive.');
            navigateTo('main');
        } catch (error) {
            console.error('Error deleting deck:', error);
            alert('Failed to delete deck. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="edit-deck-page h-100 d-flex flex-column" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <div className="edit-deck-header d-flex align-items-center p-3 border-bottom" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <button
                    onClick={() => navigateTo('main')}
                    className="btn-back me-3"
                    style={{ color: colors.primary, background: 'none', border: 'none', fontSize: '24px' }}
                >
                    <FaArrowLeft />
                </button>
                <h2 className="m-0" style={{ color: colors.primary, fontSize: fontSizes.large }}>Edit Deck: {currentDeckName}</h2>
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
                        <h5 className="mb-3" style={{ color: colors.primary }}>Add New Card</h5>
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
                            <p className="text-muted italic">No cards in this deck.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="p-3 rounded border"
                                        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                    >
                                        <div className="row g-2 align-items-center">
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm bg-transparent border-0 border-bottom rounded-0"
                                                    value={card.front}
                                                    onChange={(e) => handleCardChange(card.id, 'front', e.target.value)}
                                                    style={{ color: colors.text, borderColor: colors.border }}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm bg-transparent border-0 border-bottom rounded-0"
                                                    value={card.back}
                                                    onChange={(e) => handleCardChange(card.id, 'back', e.target.value)}
                                                    style={{ color: colors.textSecondary, borderColor: colors.border }}
                                                />
                                            </div>
                                            <div className="col-md-2 d-flex justify-content-end">
                                                <button
                                                    onClick={() => handleDeleteCard(card.id)}
                                                    className="btn btn-sm text-danger"
                                                    title="Delete Card"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Delete Deck Section */}
                    <div className="mt-5 pt-5 border-top">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="btn btn-outline-danger d-flex align-items-center gap-2"
                            >
                                <FaTrash /> Delete Entire Deck
                            </button>
                        ) : (
                            <div className="alert alert-danger d-flex flex-column gap-3">
                                <div className="d-flex align-items-center gap-2 fw-bold">
                                    <FaExclamationTriangle /> Are you sure you want to delete this deck?
                                </div>
                                <p className="mb-0 small">This action will permanently remove the deck from your Google Drive.</p>
                                <div className="d-flex gap-2">
                                    <button onClick={handleDeleteDeck} className="btn btn-danger btn-sm">Yes, Delete Deck</button>
                                    <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary btn-sm">Cancel</button>
                                </div>
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
                    <FaSave /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default EditDeckPage;
