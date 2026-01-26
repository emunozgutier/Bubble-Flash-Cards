import React from 'react';
import './App.css';
import MainPage from './pages/MainPage';
import BubbleGame from './pages/BubbleGame';
import MatchingGame from './pages/MatchingGame';
import useNavigationStore from './stores/useNavigationStore';

function App() {
  const { currentPage } = useNavigationStore();

  return (
    <>
      {currentPage === 'main' && <MainPage />}
      {currentPage === 'bubble' && <BubbleGame />}
      {currentPage === 'matching' && <MatchingGame />}
    </>
  );
}

export default App;
