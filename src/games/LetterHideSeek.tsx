import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameResult from '../components/GameResult';
import { sounds, vibrate } from '../utils/sound';
import { pickRandom } from '../utils/shuffle';

interface HiddenWord {
  word: string;
  meaning: string;
  level: number;
}

const WORDS: HiddenWord[] = [
  { word: '사과', meaning: 'apple', level: 1 },
  { word: '학교', meaning: 'school', level: 1 },
  { word: '바다', meaning: 'sea', level: 1 },
  { word: '친구', meaning: 'friend', level: 1 },
  { word: '음식', meaning: 'food', level: 1 },
  { word: '노래', meaning: 'song', level: 1 },
  { word: '시간', meaning: 'time', level: 1 },
  { word: '가방', meaning: 'bag', level: 1 },
  { word: '나라', meaning: 'country', level: 1 },
  { word: '의자', meaning: 'chair', level: 1 },
  { word: '컴퓨터', meaning: 'computer', level: 2 },
  { word: '도서관', meaning: 'library', level: 2 },
  { word: '운동장', meaning: 'playground', level: 2 },
  { word: '비행기', meaning: 'airplane', level: 2 },
  { word: '냉장고', meaning: 'refrigerator', level: 2 },
  { word: '텔레비전', meaning: 'television', level: 3 },
  { word: '인공지능', meaning: 'artificial intelligence', level: 3 },
  { word: '도서관', meaning: 'library', level: 2 },
  { word: '경찰서', meaning: 'police station', level: 2 },
  { word: '소방서', meaning: 'fire station', level: 2 },
];

const RANDOM_CHARS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ가나다라마바사아자차카타파하고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후'.split('');

const GRID_ROWS = 7;
const GRID_COLS = 7;
const TOTAL_ROUNDS = 8;
const TIME_PER_ROUND = 20;

type Direction = [number, number];
const DIRECTIONS: Direction[] = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
  [0, -1],  // left
  [-1, 0],  // up
];

function placeWord(grid: string[][], word: string): { positions: [number, number][] } | null {
  const attempts = 50;
  for (let a = 0; a < attempts; a++) {
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const startRow = Math.floor(Math.random() * GRID_ROWS);
    const startCol = Math.floor(Math.random() * GRID_COLS);

    const positions: [number, number][] = [];
    let valid = true;

    for (let i = 0; i < word.length; i++) {
      const r = startRow + dir[0] * i;
      const c = startCol + dir[1] * i;

      if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) { valid = false; break; }
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) { valid = false; break; }
      positions.push([r, c]);
    }

    if (valid) {
      positions.forEach(([r, c], i) => { grid[r][c] = word[i]; });
      return { positions };
    }
  }
  return null;
}

export default function LetterHideSeek() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetWord, setTargetWord] = useState<HiddenWord | null>(null);
  const [wordPositions, setWordPositions] = useState<[number, number][]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [level, setLevel] = useState(1);
  const isDragging = useRef(false);

  const generateRound = useCallback(() => {
    const available = WORDS.filter(w => w.level <= level);
    const word = pickRandom(available, 1)[0];

    const newGrid: string[][] = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(''));
    const result = placeWord(newGrid, word.word);

    if (!result) {
      // Fallback: place horizontally at row 3
      const startCol = Math.floor((GRID_COLS - word.word.length) / 2);
      const positions: [number, number][] = [];
      for (let i = 0; i < word.word.length; i++) {
        newGrid[3][startCol + i] = word.word[i];
        positions.push([3, startCol + i]);
      }
      setWordPositions(positions);
    } else {
      setWordPositions(result.positions);
    }

    // Fill empty cells with random chars
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
        }
      }
    }

    setGrid(newGrid);
    setTargetWord(word);
    setSelectedCells([]);
    setFoundCells(new Set());
    setFeedback(null);
    setTimeLeft(TIME_PER_ROUND);
  }, [level]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setRound(1);
    setLevel(1);
  };

  useEffect(() => {
    if (gameState === 'playing' && round > 0) generateRound();
  }, [round, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || feedback) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timeout - show answer
          setFeedback('wrong');
          setFoundCells(new Set(wordPositions.map(([r, c]) => `${r}-${c}`)));
          sounds.wrong();
          setCombo(0);
          setTimeout(() => {
            if (round >= TOTAL_ROUNDS) {
              setGameState('result');
              sounds.gameOver();
            } else {
              setRound(r => r + 1);
            }
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, feedback, round, wordPositions]);

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const handleCellDown = (r: number, c: number) => {
    if (feedback) return;
    isDragging.current = true;
    setSelectedCells([[r, c]]);
    sounds.click();
  };

  const handleCellEnter = (r: number, c: number) => {
    if (!isDragging.current || feedback) return;
    setSelectedCells(prev => {
      if (prev.some(([pr, pc]) => pr === r && pc === c)) return prev;
      return [...prev, [r, c]];
    });
  };

  const handleCellUp = () => {
    if (!isDragging.current || feedback) return;
    isDragging.current = false;

    // Check if selected cells match word positions
    if (selectedCells.length === wordPositions.length) {
      const selectedSet = new Set(selectedCells.map(([r, c]) => cellKey(r, c)));
      const targetSet = new Set(wordPositions.map(([r, c]) => cellKey(r, c)));
      const isMatch = [...targetSet].every(k => selectedSet.has(k)) && selectedSet.size === targetSet.size;

      if (isMatch) {
        setFeedback('correct');
        setFoundCells(selectedSet);
        sounds.correct();
        vibrate(30);
        const newCombo = combo + 1;
        const timeBonus = Math.floor(timeLeft * 20);
        setScore(prev => prev + 150 * level + timeBonus + Math.floor(newCombo / 3) * 100);
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        setCorrectCount(prev => prev + 1);
        if (newCombo % 4 === 0) sounds.combo();

        setTimeout(() => {
          if (round >= TOTAL_ROUNDS) {
            setGameState('result');
            sounds.levelUp();
          } else {
            if (correctCount + 1 >= 2 * level) setLevel(prev => Math.min(3, prev + 1));
            setRound(r => r + 1);
          }
        }, 1000);
        return;
      }
    }

    // Wrong selection
    setFeedback('wrong');
    sounds.wrong();
    vibrate(50);
    setCombo(0);
    setTimeout(() => {
      setFeedback(null);
      setSelectedCells([]);
    }, 500);
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="text-8xl mb-6 animate-float">👀</div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-game-purple to-game-pink bg-clip-text text-transparent">
            글자 숨바꼭질
          </h1>
          <p className="text-slate-400 mb-2">Letter Hide & Seek</p>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            글자판에서 숨어있는 한국어 단어를 찾아보세요!
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 max-w-xs mx-auto text-left">
            <p className="text-sm text-slate-400 mb-2">🎯 게임 방법</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 찾아야 할 단어가 표시됩니다</li>
              <li>• 글자판에서 드래그하여 선택하세요</li>
              <li>• 가로, 세로, 대각선으로 숨어있어요</li>
              <li>• {TOTAL_ROUNDS}라운드 / 라운드당 {TIME_PER_ROUND}초</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-game-purple to-game-pink font-bold text-lg shadow-lg shadow-game-purple/30"
          >
            게임 시작
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <GameResult
        score={score}
        maxCombo={maxCombo}
        correctCount={correctCount}
        totalCount={TOTAL_ROUNDS}
        onReplay={startGame}
        gameName="글자 숨바꼭질"
      />
    );
  }

  const timerPercent = (timeLeft / TIME_PER_ROUND) * 100;
  const selectedSet = new Set(selectedCells.map(([r, c]) => cellKey(r, c)));

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader
        title="글자 숨바꼭질"
        emoji="👀"
        score={score}
        combo={combo}
        level={level}
        round={{ current: round, total: TOTAL_ROUNDS }}
      />

      <div className="h-1.5 bg-slate-700">
        <motion.div
          className={`h-full ${timerPercent > 50 ? 'bg-game-green' : timerPercent > 25 ? 'bg-game-yellow' : 'bg-game-red'}`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {/* Target Word */}
        <motion.div
          key={round}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-slate-400 mb-1">찾아야 할 단어</p>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-3xl font-black text-game-purple">{targetWord?.word}</span>
            <span className="text-sm text-slate-400">({targetWord?.meaning})</span>
          </div>
        </motion.div>

        {/* Grid */}
        <div
          className="grid gap-1 select-none touch-none"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
          onMouseUp={handleCellUp}
          onTouchEnd={handleCellUp}
          onMouseLeave={() => { if (isDragging.current) handleCellUp(); }}
        >
          {grid.map((row, r) =>
            row.map((ch, c) => {
              const key = cellKey(r, c);
              const isSelected = selectedSet.has(key);
              const isFound = foundCells.has(key);
              let cellStyle = 'bg-slate-700/60 border-slate-600/30 text-slate-300';
              if (isFound && feedback === 'correct') {
                cellStyle = 'bg-game-green/30 border-game-green/50 text-game-green scale-110';
              } else if (isFound && feedback === 'wrong') {
                cellStyle = 'bg-game-red/20 border-game-red/30 text-game-red';
              } else if (isSelected) {
                cellStyle = 'bg-game-purple/30 border-game-purple/50 text-white scale-105';
              }

              return (
                <motion.div
                  key={key}
                  onMouseDown={() => handleCellDown(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  onTouchStart={(e) => { e.preventDefault(); handleCellDown(r, c); }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const el = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (el) {
                      const rc = el.getAttribute('data-rc');
                      if (rc) {
                        const [tr, tc] = rc.split('-').map(Number);
                        handleCellEnter(tr, tc);
                      }
                    }
                  }}
                  data-rc={`${r}-${c}`}
                  className={`w-[calc((100vw-3.5rem)/7)] h-[calc((100vw-3.5rem)/7)] max-w-12 max-h-12 flex items-center justify-center rounded-md sm:rounded-lg border-2 text-sm sm:text-lg font-bold cursor-pointer transition-all duration-150 ${cellStyle}`}
                  whileTap={{ scale: 0.9 }}
                >
                  {ch}
                </motion.div>
              );
            })
          )}
        </div>

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-game-green"
            >
              ✅ 찾았습니다!
            </motion.p>
          )}
          {feedback === 'wrong' && timeLeft <= 0 && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-game-red"
            >
              ⏰ 시간 초과!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
