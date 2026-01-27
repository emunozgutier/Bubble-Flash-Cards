import React, { useEffect } from 'react';
import './App.css';
import MainPage from './pages/MainPage';
import BubbleGame from './pages/BubbleGame';
import MatchingGame from './pages/MatchingGame';
import useNavigationStore from './stores/useNavigationStore';
import useThemeStore from './stores/useThemeStore';

function App() {
  const { currentPage } = useNavigationStore();
  const { colors } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
  }, [colors]);

  return (
    <>
      {currentPage === 'main' && <MainPage />}
      {currentPage === 'bubble' && <BubbleGame />}
      {currentPage === 'matching' && <MatchingGame />}
    </>
  );
}

export default App;
