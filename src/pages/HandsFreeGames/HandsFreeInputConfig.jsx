import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';
import { getMappings, saveMappings, resetMappings } from '../../utils/InputManager';
import useThemeStore from '../../stores/useThemeStore';

const HandsFreeInputConfig = ({ show, onHide }) => {
    const { colors } = useThemeStore();
    const [mappings, setMappings] = useState(getMappings());
    const [listeningFor, setListeningFor] = useState(null); // 'correct', 'incorrect', 'replay' or null

    useEffect(() => {
        if (show) {
            setMappings(getMappings());
            setListeningFor(null);
        }
    }, [show]);

    useEffect(() => {
        if (!listeningFor) return;

        const handleKeyDown = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const code = e.code;

            // Avoid adding duplicates to the same action
            if (!mappings[listeningFor].includes(code)) {
                const newMappings = {
                    ...mappings,
                    [listeningFor]: [...mappings[listeningFor], code]
                };
                setMappings(newMappings);
                saveMappings(newMappings);
            }

            setListeningFor(null);
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [listeningFor, mappings]);

    const handleRemoveKey = (action, keyToRemove) => {
        const newMappings = {
            ...mappings,
            [action]: mappings[action].filter(k => k !== keyToRemove)
        };
        setMappings(newMappings);
        saveMappings(newMappings);
    };

    const handleReset = () => {
        const defaults = resetMappings();
        setMappings(defaults);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: colors.background, color: colors.text }}>
                <Modal.Title>Button Configuration</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: colors.background, color: colors.text }}>

                {listeningFor && (
                    <div className="alert alert-info text-center mb-3">
                        Scanning... Press any key to assign to <strong>{listeningFor.toUpperCase()}</strong>
                    </div>
                )}

                <Table bordered hover variant={colors.mode === 'dark' ? 'dark' : 'light'}>
                    <thead>
                        <tr>
                            <th style={{ width: '20%' }}>Action</th>
                            <th>Assigned Keys</th>
                            <th style={{ width: '15%' }}>Add</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['correct', 'incorrect', 'replay'].map(action => (
                            <tr key={action}>
                                <td className="text-capitalize fw-bold align-middle">{action}</td>
                                <td className="align-middle">
                                    <div className="d-flex flex-wrap gap-2">
                                        {mappings[action].map(key => (
                                            <Badge
                                                key={key}
                                                bg="secondary"
                                                className="d-flex align-items-center gap-2 p-2"
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                {key}
                                                <span
                                                    role="button"
                                                    onClick={() => handleRemoveKey(action, key)}
                                                    style={{ cursor: 'pointer', opacity: 0.7 }}
                                                    title="Remove key"
                                                >
                                                    &times;
                                                </span>
                                            </Badge>
                                        ))}
                                        {mappings[action].length === 0 && <span className="text-muted fst-italic">No keys assigned</span>}
                                    </div>
                                </td>
                                <td className="align-middle text-center">
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => setListeningFor(action)}
                                        disabled={!!listeningFor}
                                    >
                                        + Add Key
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="text-muted small mt-2">
                    Note: "Media" keys (Play/Pause, Next Track) may not be detectable in all browsers without explicit user interaction first.
                </div>

            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: colors.background, borderTopColor: colors.border }}>
                <div className="w-100 d-flex justify-content-between">
                    <Button variant="danger" onClick={handleReset}>
                        Reset to Defaults
                    </Button>
                    <Button variant="primary" onClick={onHide}>
                        Done
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default HandsFreeInputConfig;
