import React from 'react';
import { Modal, Button, Container } from 'react-bootstrap';
import useNavigationStore from '../stores/useNavigationStore';
import useThemeStore from '../stores/useThemeStore';

const GameSelectionModal = ({ show, onHide, deckName }) => {
    const { navigateTo } = useNavigationStore();
    const { colors } = useThemeStore();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton style={{
                backgroundColor: colors.surface,
                color: colors.text,
                borderBottom: `1px solid ${colors.border}`
            }}>
                <Modal.Title>Play {deckName}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
                backgroundColor: colors.surface,
                color: colors.text
            }}>
                <Container fluid className="d-flex flex-column justify-content-center p-0">
                    <h5 className="mb-3 text-center">Select Game Mode</h5>
                    <div className="d-grid gap-3">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => {
                                navigateTo('bubbleSetup');
                                onHide();
                            }}
                            className="w-100 shadow-sm"
                            style={{ backgroundColor: colors.primary, borderColor: colors.primary, color: colors.text }}
                        >
                            🛁 Play Bubble Game
                        </Button>
                        <Button
                            variant="success"
                            size="lg"
                            onClick={() => {
                                navigateTo('handsFreeSetup');
                                onHide();
                            }}
                            className="w-100 shadow-sm"
                        // Success usually green, but if strict theme needed... leaving standard unless requested to override
                        >
                            🙌 Play Hands Free
                        </Button>
                        <Button
                            variant="info"
                            size="lg"
                            onClick={() => {
                                navigateTo('matching');
                                onHide();
                            }}
                            className="w-100 shadow-sm text-white"
                        >
                            🧩 Play Matching Game
                        </Button>
                    </div>
                </Container>
            </Modal.Body>
            <Modal.Footer style={{
                backgroundColor: colors.surface,
                borderTop: `1px solid ${colors.border}`
            }}>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GameSelectionModal;
