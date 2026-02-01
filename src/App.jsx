import React, { useEffect } from 'react';
import './App.css';
import MainPage from './pages/MainPage/MainPage';
import BubbleGame from './pages/BubbleGame/BubbleGame';
import BubbleGameSetup from './pages/BubbleGame/BubbleGameSetup';
import HandsFreeGameSetup from './pages/HandsFreeGames/HandsFreeGameSetup';
import HandsFreeGame from './pages/HandsFreeGames/HandsFreeGame';
import MatchingGame from './pages/MatchingGame/MatchingGame';
import DeckInfoPage from './pages/DeckInfoPage/DeckInfoPage';
import HelpPage from './pages/HelpPage';
import ErrorBoundary from './components/ErrorBoundary';
import useNavigationStore from './stores/useNavigationStore';
import useThemeStore from './stores/useThemeStore';

import PageBorder from './components/PageBorder';

function App() {
  const { currentPage } = useNavigationStore();
  const { colors, fontFamily } = useThemeStore();

  useEffect(() => {
    if (!colors) {
      console.warn('App: Colors not available yet.');
      return;
    }
    const root = document.documentElement;
    try {
      root.style.setProperty('--color-background', colors.background || '#000');
      root.style.setProperty('--color-surface', colors.surface || '#111');
      root.style.setProperty('--color-primary', colors.primary || '#D32F2F');
      root.style.setProperty('--color-primary-hover', colors.primaryHover || '#B71C1C');
      root.style.setProperty('--color-text', colors.text || '#FFF');
      root.style.setProperty('--color-text-secondary', colors.textSecondary || '#EEE');
      root.style.setProperty('--color-border', colors.border || '#D32F2F');
      root.style.setProperty('--font-family', fontFamily || "system-ui, sans-serif");
    } catch (e) {
      console.error('App: Error setting CSS variables', e);
    }
  }, [colors]);

  return (
    <PageBorder>
      <ErrorBoundary>
        {currentPage === 'main' && <MainPage />}
        {currentPage === 'bubbleSetup' && <BubbleGameSetup />}
        {currentPage === 'bubble' && <BubbleGame />}
        {currentPage === 'handsFreeSetup' && <HandsFreeGameSetup />}
        {currentPage === 'handsFree' && <HandsFreeGame />}
        {currentPage === 'matching' && <MatchingGame />}
        {currentPage === 'deckInfo' && <DeckInfoPage />}
        {currentPage === 'help' && <HelpPage />}
      </ErrorBoundary>
    </PageBorder>
  );
}

export default App;
