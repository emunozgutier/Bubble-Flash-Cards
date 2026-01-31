import React from 'react';
import useNavigationStore from '../../stores/useNavigationStore';
import useThemeStore from '../../stores/useThemeStore';
import MainPageSignin from './MainPageSignin';

const MainPageTitleBar = () => {
    const { navigateTo } = useNavigationStore();
    const { colors } = useThemeStore();

    return (
        <div className="main-page-title-bar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`
        }}>
            <button
                onClick={() => navigateTo('help')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.text
                }}
                title="Help & Version"
            >
                {/* Wrench/Nut Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
            </button>

            <div className="login-container">
                <MainPageSignin />
            </div>
        </div>
    );
};

export default MainPageTitleBar;
