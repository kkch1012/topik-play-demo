import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameResult from '../components/GameResult';
import { sounds, vibrate } from '../utils/sound';
import { shuffle, pickRandom } from '../utils/shuffle';

interface AntonymPair {
  word: string;
  antonym: string;
  wordEn: string;
  antonymEn: string;
  level: number;
}

const PAIRS: AntonymPair[] = [
  { word: '크다', antonym: '작다', wordEn: 'big', antonymEn: 'small', level: 1 },
  { word: '높다', antonym: '낮다', wordEn: 'high', antonymEn: 'low', level: 1 },
  { word: '길다', antonym: '짧다', wordEn: 'long', antonymEn: 'short', level: 1 },
  { word: '빠르다', antonym: '느리다', wordEn: 'fast', antonymEn: 'slow', level: 1 },
  { word: '덥다', antonym: '춥다', wordEn: 'hot', antonymEn: 'cold', level: 1 },
  { word: '밝다', antonym: '어둡다', wordEn: 'bright', antonymEn: 'dark', level: 1 },
  { word: '무겁다', antonym: '가볍다', wordEn: 'heavy', antonymEn: 'light', level: 1 },
  { word: '많다', antonym: '적다', wordEn: 'many', antonymEn: 'few', level: 1 },
  { word: '좋다', antonym: '나쁘다', wordEn: 'good', antonymEn: 'bad', level: 1 },
  { word: '새롭다', antonym: '오래되다', wordEn: 'new', antonymEn: 'old', level: 1 },
  { word: '넓다', antonym: '좁다', wordEn: 'wide', antonymEn: 'narrow', level: 2 },
  { word: '깊다', antonym: '얕다', wordEn: 'deep', antonymEn: 'shallow', level: 2 },
  { word: '비싸다', antonym: '싸다', wordEn: 'expensive', antonymEn: 'cheap', level: 2 },
  { word: '쉽다', antonym: '어렵다', wordEn: 'easy', antonymEn: 'difficult', level: 2 },
  { word: '기쁘다', antonym: '슬프다', wordEn: 'happy', antonymEn: 'sad', level: 2 },
  { word: '강하다', antonym: '약하다', wordEn: 'strong', antonymEn: 'weak', level: 2 },
  { word: '부드럽다', antonym: '딱딱하다', wordEn: 'soft', antonymEn: 'hard', level: 2 },
  { word: '안전하다', antonym: '위험하다', wordEn: 'safe', antonymEn: 'dangerous', level: 2 },
  { word: '복잡하다', antonym: '단순하다', wordEn: 'complex', antonymEn: 'simple', level: 3 },
  { word: '긍정적', antonym: '부정적', wordEn: 'positive', antonymEn: 'negative', level: 3 },
  { word: '적극적', antonym: '소극적', wordEn: 'active', antonymEn: 'passive', level: 3 },
  { word: '구체적', antonym: '추상적', wordEn: 'concrete', antonymEn: 'abstract', level: 3 },
];

const TOTAL_ROUNDS = 10;
const TIME_PER_ROUND = 8;

export default function AntonymFinder() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [currentPair, setCurrentPair] = useState<AntonymPair | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'timeout'; answer?: string } | null>(null);
  const [level, setLevel] = useState(1);
  const [usedPairs, setUsedPairs] = useState<Set<string>>(new Set());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const generateRound = useCallback(() => {
    const available = PAIRS.filter(p => p.level <= level && !usedPairs.has(p.word));
    if (available.length === 0) {
      setUsedPairs(new Set());
      return;
    }

    const pair = pickRandom(available, 1)[0];
    const wrongAnswers = PAIRS
      .filter(p => p.antonym !== pair.antonym && p.word !== pair.word)
      .map(p => p.antonym);
    const wrong = pickRandom(wrongAnswers, 3);

    setCurrentPair(pair);
    setOptions(shuffle([pair.antonym, ...wrong]));
    setFeedback(null);
    setSelectedIdx(null);
    setTimeLeft(TIME_PER_ROUND);
    setUsedPairs(prev => new Set(prev).add(pair.word));
  }, [level, usedPairs]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setRound(1);
    setLevel(1);
    setUsedPairs(new Set());
  };

  useEffect(() => {
    if (gameState === 'playing' && round > 0) generateRound();
  }, [round, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || feedback) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFeedback({ type: 'timeout', answer: currentPair?.antonym });
          sounds.wrong();
          setCombo(0);
          setTimeout(() => {
            if (round >= TOTAL_ROUNDS) {
              setGameState('result');
              sounds.gameOver();
            } else {
              setRound(r => r + 1);
            }
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, feedback, round, currentPair]);

  const handleAnswer = (answer: string, idx: number) => {
    if (feedback || !currentPair) return;
    setSelectedIdx(idx);

    if (answer === currentPair.antonym) {
      setFeedback({ type: 'correct' });
      sounds.correct();
      vibrate(30);
      const newCombo = combo + 1;
      const timeBonus = Math.floor(timeLeft * 10);
      const baseScore = 100 * level;
      const comboBonus = Math.floor(newCombo / 3) * 50;
      setScore(prev => prev + baseScore + timeBonus + comboBonus);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setCorrectCount(prev => prev + 1);

      if (newCombo > 0 && newCombo % 5 === 0) sounds.combo();
    } else {
      setFeedback({ type: 'wrong', answer: currentPair.antonym });
      sounds.wrong();
      vibrate(100);
      setCombo(0);
    }

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setGameState('result');
        if (answer === currentPair.antonym) sounds.levelUp();
        else sounds.gameOver();
      } else {
        const newLevel = correctCount + (answer === currentPair.antonym ? 1 : 0) >= 4 ? Math.min(3, level + 1) : level;
        setLevel(newLevel);
        setRound(r => r + 1);
      }
    }, 800);
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="text-8xl mb-6 animate-float">🔄</div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-game-pink to-game-purple bg-clip-text text-transparent">
            반대말 찾기
          </h1>
          <p className="text-slate-400 mb-2">Antonym Finder</p>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            주어진 단어의 반대말을 빠르게 찾아보세요!
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 max-w-xs mx-auto text-left">
            <p className="text-sm text-slate-400 mb-2">🎯 게임 방법</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 한국어 단어가 표시됩니다</li>
              <li>• 4개 보기 중 반대말을 선택하세요</li>
              <li>• 빠를수록 타임 보너스!</li>
              <li>• {TOTAL_ROUNDS}라운드 / 라운드당 {TIME_PER_ROUND}초</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-game-pink to-game-purple font-bold text-lg shadow-lg shadow-game-pink/30"
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
        gameName="반대말 찾기"
      />
    );
  }

  const timerPercent = (timeLeft / TIME_PER_ROUND) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader
        title="반대말 찾기"
        emoji="🔄"
        score={score}
        combo={combo}
        level={level}
        round={{ current: round, total: TOTAL_ROUNDS }}
      />

      {/* Timer Bar */}
      <div className="h-1.5 bg-slate-700">
        <motion.div
          className={`h-full transition-colors ${timerPercent > 50 ? 'bg-game-green' : timerPercent > 25 ? 'bg-game-yellow' : 'bg-game-red'}`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Target Word */}
        <motion.div
          key={round}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-slate-400 mb-2">이 단어의 반대말은?</p>
          <div className="px-8 py-5 bg-gradient-to-br from-game-pink/20 to-game-purple/20 border-2 border-game-pink/30 rounded-3xl">
            <p className="text-4xl font-black text-white mb-1">{currentPair?.word}</p>
            <p className="text-sm text-slate-400">{currentPair?.wordEn}</p>
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((opt, i) => {
            const isCorrectAnswer = opt === currentPair?.antonym;
            const isSelected = selectedIdx === i;

            let btnStyle = 'bg-slate-700/50 border-slate-600/50 hover:border-game-pink/50';
            if (feedback) {
              if (isCorrectAnswer) btnStyle = 'bg-game-green/20 border-game-green/50 text-game-green';
              else if (isSelected && !isCorrectAnswer) btnStyle = 'bg-game-red/20 border-game-red/50 text-game-red';
              else btnStyle = 'bg-slate-700/30 border-slate-600/30 text-slate-500';
            }

            return (
              <motion.button
                key={`${round}-${opt}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                whileHover={!feedback ? { scale: 1.03 } : {}}
                whileTap={!feedback ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(opt, i)}
                disabled={feedback !== null}
                className={`py-4 px-3 rounded-2xl text-xl font-bold transition-all duration-200 border-2 ${btnStyle}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-lg font-bold ${feedback.type === 'correct' ? 'text-game-green' : 'text-game-red'}`}
            >
              {feedback.type === 'correct' ? '✅ 정답!' :
               feedback.type === 'timeout' ? `⏰ 시간 초과! 정답: ${feedback.answer}` :
               `❌ 오답! 정답: ${feedback.answer}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
