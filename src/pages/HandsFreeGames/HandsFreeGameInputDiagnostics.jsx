import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useThemeStore from '../../stores/useThemeStore';
import { setupDiagnosticListeners } from '../../utils/InputManager';

const HandsFreeGameInputDiagnostics = ({ show, onHide, logs }) => {
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
            <Modal.Body style={{ backgroundColor: colors.surface, color: colors.text }}>
                <p className="text-center mb-4 p-4 opacity-75" style={{ fontSize: '1.1rem' }}>
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
                            <div className="mb-2 fw-bold small text-uppercase" style={{ color: colors.primary }}>
                                LAST DETECTED ({lastInput.type.toUpperCase()}):
                            </div>
                            <div className="display-4 fw-bold text-center mb-1" style={{ color: colors.text }}>
                                {lastInput.code}
                            </div>
                            <div className="fs-5 opacity-75">
                                {lastInput.type === 'Keyboard' ? `(Key: "${lastInput.key}")` : `(${lastInput.key})`}
                            </div>
                            <div className="mt-3 small opacity-50">
                                {lastInput.timestamp}
                            </div>
                        </>
                    ) : (
                        <div className="fs-5 opacity-50 fst-italic text-center">
                            Waiting for input...<br />
                            <small>(Keyboard, Mouse, or Wheel)</small>
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

                {logs && logs.length > 0 && (
                    <div className="mt-4">
                        <div className="fw-bold mb-2">System Logs (Last 10):</div>
                        <div
                            className="p-2 rounded overflow-auto font-monospace"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                maxHeight: '150px',
                                fontSize: '0.8rem',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 border-bottom border-secondary pb-1 last:border-0">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
