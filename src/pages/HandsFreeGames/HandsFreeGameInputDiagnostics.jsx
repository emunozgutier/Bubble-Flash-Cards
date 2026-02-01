import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useThemeStore from '../../stores/useThemeStore';
import { setupDiagnosticListeners } from '../../utils/InputManager';

const HandsFreeGameInputDiagnostics = ({ show, onHide }) => {
    const { colors } = useThemeStore();
    const [lastInput, setLastInput] = useState(null);

    useEffect(() => {
        if (!show) {
            setLastInput(null);
            return;
        }

        const cleanup = setupDiagnosticListeners((input) => {
            setLastInput(input);
        });

        return cleanup;
    }, [show]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="md"
            contentClassName="border-0 shadow-lg"
        >
            <Modal.Header closeButton style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}>
                <Modal.Title>Input Diagnostic</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: colors.surface, color: colors.text, padding: '30px' }}>
                <p className="text-center mb-4" style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                    Press any key or button on your remote to see its identifier.
                </p>

                <div
                    className="diagnostic-display border rounded p-4 d-flex flex-column align-items-center justify-content-center"
                    style={{
                        minHeight: '220px',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderColor: colors.border,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {lastInput ? (
                        <>
                            <div className="mb-2" style={{ fontSize: '0.9rem', color: colors.primary, fontWeight: 'bold' }}>
                                LAST DETECTED ({lastInput.type.toUpperCase()}):
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
                                {lastInput.code}
                            </div>
                            <div style={{ fontSize: '1.2rem', opacity: 0.7 }}>
                                {lastInput.type === 'Keyboard' ? `(Key: "${lastInput.key}")` : `(${lastInput.key})`}
                            </div>
                            <div className="mt-3" style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                {lastInput.timestamp}
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: '1.2rem', opacity: 0.5, fontStyle: 'italic', textAlign: 'center' }}>
                            Waiting for input...<br />
                            (Keyboard, Mouse, or Wheel)
                        </div>
                    )}
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.1)', fontSize: '0.9rem' }}>
                    <div className="fw-bold mb-1">Common Keys:</div>
                    <ul className="mb-0">
                        <li><strong>ArrowRight / ArrowLeft</strong>: Typically "Next" / "Previous"</li>
                        <li><strong>MediaPlayPause</strong>: Play/Pause button</li>
                        <li><strong>Enter</strong>: Select/Action</li>
                    </ul>
                </div>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <Button variant="secondary" onClick={onHide} style={{ backgroundColor: colors.border, border: 'none' }}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default HandsFreeGameInputDiagnostics;
