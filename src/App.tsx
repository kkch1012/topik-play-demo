import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ChosungDetective from './games/ChosungDetective'
import AntonymFinder from './games/AntonymFinder'
import CardMatching from './games/CardMatching'
import WordMath from './games/WordMath'
import LetterHideSeek from './games/LetterHideSeek'

function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/chosung-detective" element={<ChosungDetective />} />
        <Route path="/game/antonym-finder" element={<AntonymFinder />} />
        <Route path="/game/card-matching" element={<CardMatching />} />
        <Route path="/game/word-math" element={<WordMath />} />
        <Route path="/game/letter-hide-seek" element={<LetterHideSeek />} />
      </Routes>
    </div>
  )
}

export default App
