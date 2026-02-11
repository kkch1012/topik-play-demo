import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameResult from '../components/GameResult';
import { sounds, vibrate } from '../utils/sound';
import { shuffle, pickRandom } from '../utils/shuffle';

const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getChosung(word: string): string {
  return word.split('').map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    return CHOSUNG[Math.floor(code / 588)];
  }).join('');
}

interface WordData {
  word: string;
  meaning: string;
  level: number;
}

const WORDS: WordData[] = [
  // Level 1 - TOPIK I
  { word: '사과', meaning: 'apple', level: 1 },
  { word: '학교', meaning: 'school', level: 1 },
  { word: '가방', meaning: 'bag', level: 1 },
  { word: '의자', meaning: 'chair', level: 1 },
  { word: '나라', meaning: 'country', level: 1 },
  { word: '바다', meaning: 'sea', level: 1 },
  { word: '음식', meaning: 'food', level: 1 },
  { word: '친구', meaning: 'friend', level: 1 },
  { word: '공부', meaning: 'study', level: 1 },
  { word: '시간', meaning: 'time', level: 1 },
  { word: '아침', meaning: 'morning', level: 1 },
  { word: '저녁', meaning: 'evening', level: 1 },
  { word: '날씨', meaning: 'weather', level: 1 },
  { word: '가족', meaning: 'family', level: 1 },
  { word: '선생', meaning: 'teacher', level: 1 },
  { word: '병원', meaning: 'hospital', level: 1 },
  { word: '노래', meaning: 'song', level: 1 },
  { word: '여행', meaning: 'travel', level: 1 },
  { word: '운동', meaning: 'exercise', level: 1 },
  { word: '고양이', meaning: 'cat', level: 1 },
  // Level 2 - TOPIK II
  { word: '경험', meaning: 'experience', level: 2 },
  { word: '문화', meaning: 'culture', level: 2 },
  { word: '사회', meaning: 'society', level: 2 },
  { word: '교육', meaning: 'education', level: 2 },
  { word: '환경', meaning: 'environment', level: 2 },
  { word: '기술', meaning: 'technology', level: 2 },
  { word: '건강', meaning: 'health', level: 2 },
  { word: '인생', meaning: 'life', level: 2 },
  { word: '자연', meaning: 'nature', level: 2 },
  { word: '역사', meaning: 'history', level: 2 },
  { word: '생각', meaning: 'thought', level: 2 },
  { word: '감정', meaning: 'emotion', level: 2 },
  { word: '경제', meaning: 'economy', level: 2 },
  { word: '정치', meaning: 'politics', level: 2 },
  { word: '과학', meaning: 'science', level: 2 },
  { word: '약속', meaning: 'promise', level: 2 },
  { word: '관계', meaning: 'relationship', level: 2 },
  { word: '목표', meaning: 'goal', level: 2 },
  { word: '결과', meaning: 'result', level: 2 },
  { word: '조건', meaning: 'condition', level: 2 },
  // Level 3
  { word: '담당자', meaning: 'person in charge', level: 3 },
  { word: '시민단체', meaning: 'civic group', level: 3 },
  { word: '자원봉사', meaning: 'volunteering', level: 3 },
  { word: '소비자', meaning: 'consumer', level: 3 },
  { word: '생태계', meaning: 'ecosystem', level: 3 },
  { word: '지속가능', meaning: 'sustainable', level: 3 },
  { word: '전통문화', meaning: 'traditional culture', level: 3 },
  { word: '인공지능', meaning: 'AI', level: 3 },
  { word: '세계화', meaning: 'globalization', level: 3 },
  { word: '다양성', meaning: 'diversity', level: 3 },
];

const TOTAL_ROUNDS = 10;
const TIME_LIMIT = 60;

export default function ChosungDetective() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [chosung, setChosung] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hint, setHint] = useState('');
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const generateRound = useCallback(() => {
    const levelWords = WORDS.filter(w => w.level <= level && !usedWords.has(w.word));
    if (levelWords.length === 0) return;

    const target = pickRandom(levelWords, 1)[0];
    const ch = getChosung(target.word);

    const distractors = WORDS
      .filter(w => w.word !== target.word && w.word.length === target.word.length)
      .map(w => w.word);
    const wrongOptions = pickRandom(distractors, 3);

    setCurrentWord(target);
    setChosung(ch);
    setOptions(shuffle([target.word, ...wrongOptions]));
    setHint(target.meaning);
    setFeedback(null);
    setUsedWords(prev => new Set(prev).add(target.word));
  }, [level, usedWords]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setRound(1);
    setTimeLeft(TIME_LIMIT);
    setLevel(1);
    setUsedWords(new Set());
  };

  useEffect(() => {
    if (gameState === 'playing' && round > 0) {
      generateRound();
    }
  }, [round, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('result');
          sounds.gameOver();
          return 0;
        }
        if (prev <= 11) sounds.tick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleAnswer = (answer: string) => {
    if (feedback || !currentWord) return;

    if (answer === currentWord.word) {
      setFeedback('correct');
      sounds.correct();
      vibrate(30);
      const newCombo = combo + 1;
      const comboBonus = Math.floor(newCombo / 3) * 50;
      const baseScore = 100 * level;
      setScore(prev => prev + baseScore + comboBonus);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setCorrectCount(prev => prev + 1);

      if (newCombo > 0 && newCombo % 5 === 0) {
        sounds.combo();
      }

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setGameState('result');
          sounds.levelUp();
        } else {
          const newLevel = correctCount + 1 >= 5 ? Math.min(3, level + 1) : level;
          setLevel(newLevel);
          setRound(prev => prev + 1);
        }
      }, 600);
    } else {
      setFeedback('wrong');
      sounds.wrong();
      vibrate(100);
      setCombo(0);
      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setGameState('result');
          sounds.gameOver();
        } else {
          setRound(prev => prev + 1);
        }
      }, 800);
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-6 animate-float">🔍</div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary-400 to-game-cyan bg-clip-text text-transparent">
            초성 탐정
          </h1>
          <p className="text-slate-400 mb-2">Chosung Detective</p>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            초성 힌트를 보고 올바른 한국어 단어를 찾아보세요!
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 max-w-xs mx-auto text-left">
            <p className="text-sm text-slate-400 mb-2">🎯 게임 방법</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 초성과 영어 뜻 힌트가 표시됩니다</li>
              <li>• 4개 보기 중 올바른 단어를 선택하세요</li>
              <li>• 연속 정답 시 콤보 보너스!</li>
              <li>• 제한시간: {TIME_LIMIT}초 / {TOTAL_ROUNDS}라운드</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-game-cyan font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-shadow"
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
        gameName="초성 탐정"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader
        title="초성 탐정"
        emoji="🔍"
        score={score}
        combo={combo}
        timeLeft={timeLeft}
        level={level}
        round={{ current: round, total: TOTAL_ROUNDS }}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Chosung Display */}
        <motion.div
          key={round}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex gap-3"
        >
          {chosung.split('').map((ch, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500/20 to-game-cyan/20 border-2 border-primary-400/30 rounded-2xl flex items-center justify-center"
            >
              <span className="text-3xl sm:text-4xl font-black text-primary-300">{ch}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Hint */}
        <motion.div
          key={`hint-${round}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-4 py-2 bg-slate-700/30 rounded-full"
        >
          <span className="text-sm text-slate-400">💡 Hint: </span>
          <span className="text-sm text-slate-300 font-medium">{hint}</span>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <AnimatePresence mode="popLayout">
            {options.map((word, i) => (
              <motion.button
                key={`${round}-${word}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(word)}
                disabled={feedback !== null}
                className={`py-4 px-3 rounded-2xl text-lg font-bold transition-all duration-300 border-2 ${
                  feedback === null
                    ? 'bg-slate-700/50 border-slate-600/50 hover:border-primary-400/50 hover:bg-slate-700/80 active:bg-slate-600/80'
                    : word === currentWord?.word
                    ? 'bg-game-green/20 border-game-green/50 text-game-green'
                    : feedback === 'wrong'
                    ? 'bg-slate-700/30 border-slate-600/30 text-slate-500'
                    : 'bg-slate-700/30 border-slate-600/30'
                }`}
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-lg font-bold ${feedback === 'correct' ? 'text-game-green' : 'text-game-red'}`}
            >
              {feedback === 'correct' ? '✅ 정답!' : `❌ 오답! 정답: ${currentWord?.word}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
