import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import MainPage from './pages/MainPage'
import BubbleGame from './pages/BubbleGame'
import MatchingGame from './pages/MatchingGame'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/bubble" element={<BubbleGame />} />
        <Route path="/matching" element={<MatchingGame />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
