import React from 'react';
import useNavigationStore from '../stores/useNavigationStore';
import versionInfo from '../version.json';
import './CommonPage.css';

function HelpPage() {
    const { navigateTo } = useNavigationStore();

    return (
        <div className="page-container">
            <div className="game-title-bar">
                <h1 className="game-title">Help & About</h1>
                <button className="control-button secondary" onClick={() => navigateTo('main')}>
                    Back
                </button>
            </div>

            <div className="game-content-center">
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    maxWidth: '800px',
                    width: '90%',
                    textAlign: 'left',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid var(--color-border)'
                }}>
                    <h2 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        App Version Information
                    </h2>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <strong style={{ color: 'var(--color-primary)' }}>Source</strong>
                            <p style={{ marginTop: '0.25rem' }}>{versionInfo.source || 'Local'}</p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--color-primary)' }}>Build Date</strong>
                            <p style={{ marginTop: '0.25rem' }}>{versionInfo.date}</p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--color-primary)' }}>Commit Hash</strong>
                            <p style={{ marginTop: '0.25rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px', display: 'inline-block' }}>
                                {versionInfo.hash}
                            </p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--color-primary)' }}>Latest Update</strong>
                            <p style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>{versionInfo.title}</p>
                        </div>
                        {versionInfo.message && (
                            <div>
                                <strong style={{ color: 'var(--color-primary)' }}>Details</strong>
                                <pre style={{
                                    marginTop: '0.5rem',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    background: 'rgba(0,0,0,0.1)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    {versionInfo.message}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpPage;
