import React from 'react';
import { FaGear } from 'react-icons/fa6';
import useNavigationStore from '../../stores/useNavigationStore';
import useThemeStore from '../../stores/useThemeStore';
import MainPageSignin from './MainPageSignin';

const MainPageTitleBar = () => {
    const { navigateTo } = useNavigationStore();
    const { colors } = useThemeStore();

    return (
        <div className="d-flex justify-content-between align-items-center px-4 py-2 w-100 border-bottom" style={{
            backgroundColor: colors.surface,
            borderColor: colors.border
        }}>
            <button
                onClick={() => navigateTo('help')}
                className="title-bar-help-btn"
                style={{
                    color: colors.text
                }}
                title="Help & Version"
            >
                <FaGear size={24} />
            </button>

            <div className="login-container">
                <MainPageSignin />
            </div>
        </div>
    );
};

export default MainPageTitleBar;
