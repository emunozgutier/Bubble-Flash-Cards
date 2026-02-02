import React, { useState } from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import useDataStore from '../../stores/useDataStore';
import useDriveStore from '../../stores/useDriveStore';
import useThemeStore from '../../stores/useThemeStore';
import { loadFile } from '../../services/googleDriveService';
import MainPageDeckList from './MainPageDeckList';
import MainPageTitleBar from './MainPageTitleBar';
import GameSelectionModal from '../../components/GameSelectionModal';
import '../CommonPage.css';
import './MainPage.css';

// Bootstrap imports
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Default data imports for fallback loading
import { DEFAULT_DECKS } from '../../utils/deckData';

function MainPage() {
    const { navigateTo } = useNavigationStore();
    const { setCurrentDeckName, setCards } = useDataStore();
    const { isAuthorized, deckFileIds, setIsLoading, appFolderId } = useDriveStore();
    const { colors, fontSizes } = useThemeStore();
    const [showModal, setShowModal] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState(null);

    const handleInfo = (deckName) => {
        navigateTo('deckInfo');
    };

    const loadDeckData = async (deckName) => {
        setIsLoading(true);
        const fileId = deckFileIds[deckName];

        try {
            if (isAuthorized && fileId) {
                const data = await loadFile(fileId);
                setCards(data && data.cards ? data.cards : []);
            } else {
                // Local default or fallback
                const defaultData = DEFAULT_DECKS[deckName];
                setCards(defaultData ? defaultData.cards : []);
            }
            setCurrentDeckName(deckName);
        } catch (err) {
            console.error("Error loading deck", err);
            const defaultData = DEFAULT_DECKS[deckName];
            setCards(defaultData ? defaultData.cards : []);
            setCurrentDeckName(deckName);
        }
        setIsLoading(false);
    };

    const handlePlay = async (deckName) => {
        setSelectedDeck(deckName);
        await loadDeckData(deckName);
        setShowModal(true);
    };

    const handleEdit = async (deckName) => {
        await loadDeckData(deckName);
        alert(`Edit ${deckName} (Feature coming soon!)`);
    };

    return (
        <div className="d-flex flex-column vh-100 overflow-hidden bg-black">
            {/* Header / Title Bar */}
            <div className="flex-shrink-0">
                <MainPageTitleBar />
            </div>

            {/* Main Content Area */}
            <Container fluid className="flex-grow-1 overflow-hidden p-3">
                <Row className="h-100 justify-content-center">
                    <Col md={10} lg={8} className="d-flex flex-column h-100 overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="border rounded p-3 h-100 d-flex flex-column shadow-sm overflow-hidden"
                            style={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border
                            }}>
                            <h5 className="mb-3" style={{ color: colors.primary, fontSize: fontSizes.large }}>Your Decks</h5>
                            <div className="flex-grow-1 overflow-y-auto overflow-x-hidden p-4"
                                style={{
                                    scrollbarGutter: 'stable'
                                }}>
                                <MainPageDeckList onPlay={handlePlay} onEdit={handleEdit} onInfo={handleInfo} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            <GameSelectionModal
                show={showModal}
                onHide={() => setShowModal(false)}
                deckName={selectedDeck}
            />
        </div>
    );
}

export default MainPage;
