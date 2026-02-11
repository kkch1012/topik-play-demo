import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameResult from '../components/GameResult';
import { sounds, vibrate } from '../utils/sound';
import { shuffle } from '../utils/shuffle';

const CHOSUNG_TABLE = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getChosung(word: string): string {
  return word.split('').map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    return CHOSUNG_TABLE[Math.floor(code / 588)];
  }).join('');
}

interface WordData {
  word: string;
  meaning: string;
  level: number;
}

// Words grouped so that many share the same chosung pattern
const WORDS: WordData[] = [
  // ㅅㄱ group
  { word: '사과', meaning: 'apple', level: 1 },
  { word: '시간', meaning: 'time', level: 1 },
  { word: '사고', meaning: 'accident', level: 2 },
  { word: '성격', meaning: 'personality', level: 2 },
  { word: '생각', meaning: 'thought', level: 2 },
  { word: '소금', meaning: 'salt', level: 1 },
  // ㅎㄱ group
  { word: '학교', meaning: 'school', level: 1 },
  { word: '한국', meaning: 'Korea', level: 1 },
  { word: '한글', meaning: 'Hangul', level: 1 },
  { word: '혈관', meaning: 'blood vessel', level: 3 },
  // ㄱㅂ group
  { word: '가방', meaning: 'bag', level: 1 },
  { word: '간병', meaning: 'nursing', level: 3 },
  { word: '건빵', meaning: 'hardtack', level: 2 },
  { word: '공부', meaning: 'study', level: 1 },
  // ㅇㅈ group
  { word: '의자', meaning: 'chair', level: 1 },
  { word: '인재', meaning: 'talent', level: 2 },
  { word: '운전', meaning: 'driving', level: 2 },
  { word: '의지', meaning: 'willpower', level: 2 },
  { word: '여자', meaning: 'woman', level: 1 },
  { word: '음절', meaning: 'syllable', level: 3 },
  // ㄴㄹ group
  { word: '나라', meaning: 'country', level: 1 },
  { word: '노래', meaning: 'song', level: 1 },
  { word: '누리', meaning: 'world', level: 2 },
  { word: '나리', meaning: 'lily flower', level: 2 },
  // ㅂㄷ group
  { word: '바다', meaning: 'sea', level: 1 },
  { word: '보도', meaning: 'news report', level: 2 },
  { word: '비둘기', meaning: 'pigeon', level: 2 },
  { word: '부대', meaning: 'military unit', level: 2 },
  // ㅇㅅ group
  { word: '음식', meaning: 'food', level: 1 },
  { word: '역사', meaning: 'history', level: 2 },
  { word: '약속', meaning: 'promise', level: 2 },
  { word: '연습', meaning: 'practice', level: 2 },
  { word: '여성', meaning: 'female', level: 2 },
  // ㅊㄱ group
  { word: '친구', meaning: 'friend', level: 1 },
  { word: '출구', meaning: 'exit', level: 1 },
  { word: '축구', meaning: 'soccer', level: 1 },
  { word: '참기', meaning: 'endurance', level: 2 },
  // ㅇㅊ group
  { word: '아침', meaning: 'morning', level: 1 },
  { word: '야채', meaning: 'vegetable', level: 1 },
  { word: '약초', meaning: 'herbs', level: 2 },
  { word: '엽총', meaning: 'shotgun', level: 3 },
  // ㅈㄴ group
  { word: '저녁', meaning: 'evening', level: 1 },
  { word: '지능', meaning: 'intelligence', level: 2 },
  { word: '자녀', meaning: 'children', level: 2 },
  { word: '전년', meaning: 'previous year', level: 3 },
  // ㄴㅆ group
  { word: '날씨', meaning: 'weather', level: 1 },
  { word: '낙서', meaning: 'graffiti', level: 2 },
  { word: '남산', meaning: 'Namsan', level: 1 },
  { word: '농사', meaning: 'farming', level: 2 },
  // ㄱㅈ group
  { word: '가족', meaning: 'family', level: 1 },
  { word: '감자', meaning: 'potato', level: 1 },
  { word: '가지', meaning: 'eggplant', level: 1 },
  { word: '경제', meaning: 'economy', level: 2 },
  { word: '공장', meaning: 'factory', level: 2 },
  // ㅅㅅ group
  { word: '선생', meaning: 'teacher', level: 1 },
  { word: '사실', meaning: 'truth', level: 2 },
  { word: '신선', meaning: 'fresh', level: 2 },
  { word: '소설', meaning: 'novel', level: 2 },
  // ㅂㅇ group
  { word: '병원', meaning: 'hospital', level: 1 },
  { word: '방어', meaning: 'defense', level: 2 },
  { word: '반응', meaning: 'reaction', level: 2 },
  { word: '비용', meaning: 'cost', level: 2 },
  // ㅇㅎ group
  { word: '여행', meaning: 'travel', level: 1 },
  { word: '은행', meaning: 'bank', level: 1 },
  { word: '영화', meaning: 'movie', level: 1 },
  { word: '응원', meaning: 'cheering', level: 2 },
  // ㅇㄷ group
  { word: '운동', meaning: 'exercise', level: 1 },
  { word: '이동', meaning: 'movement', level: 2 },
  { word: '인도', meaning: 'India / sidewalk', level: 2 },
  { word: '의도', meaning: 'intention', level: 2 },
  // ㄱㅇㅇ group (3-char)
  { word: '고양이', meaning: 'cat', level: 1 },
  { word: '거울이', meaning: 'mirror (subj.)', level: 2 },
  // ㄱㅎ group
  { word: '문화', meaning: 'culture', level: 2 },
  { word: '결혼', meaning: 'marriage', level: 2 },
  // ㅅㅎ group
  { word: '사회', meaning: 'society', level: 2 },
  { word: '시험', meaning: 'exam', level: 1 },
  { word: '생활', meaning: 'daily life', level: 2 },
  { word: '실험', meaning: 'experiment', level: 2 },
  // ㄱㅇ group
  { word: '교육', meaning: 'education', level: 2 },
  { word: '기억', meaning: 'memory', level: 2 },
  { word: '기업', meaning: 'company', level: 2 },
  { word: '경영', meaning: 'management', level: 3 },
  // ㅎㄱ group
  { word: '환경', meaning: 'environment', level: 2 },
  { word: '한계', meaning: 'limitation', level: 3 },
  // ㄱㅅ group
  { word: '기술', meaning: 'technology', level: 2 },
  { word: '결석', meaning: 'absence', level: 2 },
  { word: '공식', meaning: 'formula', level: 2 },
  { word: '감상', meaning: 'appreciation', level: 2 },
  // ㄱㄱ group
  { word: '건강', meaning: 'health', level: 2 },
  { word: '경기', meaning: 'game / match', level: 2 },
  { word: '관계', meaning: 'relationship', level: 2 },
  { word: '개구리', meaning: 'frog', level: 1 },
  // ㅇㅅ group
  { word: '인생', meaning: 'life', level: 2 },
  { word: '의사', meaning: 'doctor', level: 1 },
  { word: '연설', meaning: 'speech', level: 3 },
  // ㅈㅇ group
  { word: '자연', meaning: 'nature', level: 2 },
  { word: '직업', meaning: 'occupation', level: 2 },
  { word: '주인', meaning: 'owner', level: 2 },
  { word: '정원', meaning: 'garden', level: 2 },
  // ㄱㅈ group
  { word: '감정', meaning: 'emotion', level: 2 },
  { word: '과정', meaning: 'process', level: 2 },
  // ㅈㅊ group
  { word: '정치', meaning: 'politics', level: 2 },
  { word: '전차', meaning: 'tank / tram', level: 3 },
  // ㄱㅎ group
  { word: '과학', meaning: 'science', level: 2 },
  { word: '국회', meaning: 'national assembly', level: 3 },
  // ㅁㅍ group
  { word: '목표', meaning: 'goal', level: 2 },
  { word: '미풍', meaning: 'breeze', level: 3 },
  // ㄱㄱ group
  { word: '결과', meaning: 'result', level: 2 },
  { word: '가격', meaning: 'price', level: 2 },
  // Level 3 - long words
  { word: '담당자', meaning: 'person in charge', level: 3 },
  { word: '소비자', meaning: 'consumer', level: 3 },
  { word: '자원봉사', meaning: 'volunteering', level: 3 },
  { word: '인공지능', meaning: 'artificial intelligence', level: 3 },
  { word: '전통문화', meaning: 'traditional culture', level: 3 },
  { word: '도서관', meaning: 'library', level: 2 },
  { word: '동물원', meaning: 'zoo', level: 1 },
  { word: '대학교', meaning: 'university', level: 1 },
  { word: '냉장고', meaning: 'refrigerator', level: 1 },
  { word: '비행기', meaning: 'airplane', level: 1 },
  { word: '컴퓨터', meaning: 'computer', level: 1 },
  { word: '텔레비전', meaning: 'television', level: 1 },
  { word: '지하철', meaning: 'subway', level: 1 },
  { word: '자동차', meaning: 'car', level: 1 },
  { word: '교과서', meaning: 'textbook', level: 2 },
  { word: '운동장', meaning: 'playground', level: 1 },
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
  const [levelCorrect, setLevelCorrect] = useState(0);
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

    const target = levelWords[Math.floor(Math.random() * levelWords.length)];
    const targetChosung = getChosung(target.word);

    // Same chosung words (confusing distractors)
    const sameChosung = shuffle(WORDS.filter(
      w => w.word !== target.word && getChosung(w.word) === targetChosung
    ));

    // Different chosung words (same length, easier to eliminate)
    const diffChosung = shuffle(WORDS.filter(
      w => w.word !== target.word &&
           getChosung(w.word) !== targetChosung &&
           w.word.length === target.word.length
    ));

    // Pick 1~2 same-chosung + 1~2 different-chosung = 3 wrong options
    const sameCount = Math.min(sameChosung.length, Math.random() < 0.5 ? 1 : 2);
    const wrongOptions: string[] = [];
    wrongOptions.push(...sameChosung.slice(0, sameCount).map(w => w.word));
    wrongOptions.push(...diffChosung.slice(0, 3 - sameCount).map(w => w.word));

    // If we don't have enough, pad with any remaining words
    if (wrongOptions.length < 3) {
      const remaining = WORDS.filter(
        w => w.word !== target.word && !wrongOptions.includes(w.word)
      );
      wrongOptions.push(...shuffle(remaining).slice(0, 3 - wrongOptions.length).map(w => w.word));
    }

    setCurrentWord(target);
    setChosung(targetChosung);
    setOptions(shuffle([target.word, ...wrongOptions.slice(0, 3)]));
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
    setLevelCorrect(0);
    setRound(1);
    setTimeLeft(TIME_LIMIT);
    setLevel(1);
    setUsedWords(new Set());
  };

  useEffect(() => {
    if (gameState === 'playing' && round > 0) {
      generateRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const newLevelCorrect = levelCorrect + 1;
          if (newLevelCorrect >= 3 && level < 3) {
            setLevel(prev => Math.min(3, prev + 1));
            setLevelCorrect(0);
          } else {
            setLevelCorrect(newLevelCorrect);
          }
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
              <li>• 같은 초성의 단어 4개 중 정답을 고르세요</li>
              <li>• 영어 힌트가 핵심 단서!</li>
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
              className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500/20 to-game-cyan/20 border-2 border-primary-400/30 rounded-xl sm:rounded-2xl flex items-center justify-center"
            >
              <span className="text-2xl sm:text-4xl font-black text-primary-300">{ch}</span>
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
