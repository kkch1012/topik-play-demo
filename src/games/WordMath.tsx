import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameResult from '../components/GameResult';
import { sounds, vibrate } from '../utils/sound';
import { shuffle, pickRandom } from '../utils/shuffle';

interface MathProblem {
  equation: string;
  answer: string;
  answerMeaning: string;
  level: number;
}

const PROBLEMS: MathProblem[] = [
  // Level 1 - Simple compound words
  { equation: '눈 + 물 = ?', answer: '눈물', answerMeaning: 'tears', level: 1 },
  { equation: '손 + 가락 = ?', answer: '손가락', answerMeaning: 'finger', level: 1 },
  { equation: '발 + 가락 = ?', answer: '발가락', answerMeaning: 'toe', level: 1 },
  { equation: '해 + 바라기 = ?', answer: '해바라기', answerMeaning: 'sunflower', level: 1 },
  { equation: '물 + 고기 = ?', answer: '물고기', answerMeaning: 'fish', level: 1 },
  { equation: '비 + 빔밥 = ?', answer: '비빔밥', answerMeaning: 'bibimbap', level: 1 },
  { equation: '김 + 치 = ?', answer: '김치', answerMeaning: 'kimchi', level: 1 },
  { equation: '나 + 비 = ?', answer: '나비', answerMeaning: 'butterfly', level: 1 },
  { equation: '별 + 빛 = ?', answer: '별빛', answerMeaning: 'starlight', level: 1 },
  { equation: '꽃 + 잎 = ?', answer: '꽃잎', answerMeaning: 'petal', level: 1 },
  { equation: '구 + 름 = ?', answer: '구름', answerMeaning: 'cloud', level: 1 },
  { equation: '바 + 람 = ?', answer: '바람', answerMeaning: 'wind', level: 1 },
  // Level 2 - Three-part combinations
  { equation: '도 + 서 + 관 = ?', answer: '도서관', answerMeaning: 'library', level: 2 },
  { equation: '운 + 동 + 장 = ?', answer: '운동장', answerMeaning: 'playground', level: 2 },
  { equation: '미 + 용 + 실 = ?', answer: '미용실', answerMeaning: 'hair salon', level: 2 },
  { equation: '우 + 체 + 국 = ?', answer: '우체국', answerMeaning: 'post office', level: 2 },
  { equation: '백 + 화 + 점 = ?', answer: '백화점', answerMeaning: 'department store', level: 2 },
  { equation: '미 + 술 + 관 = ?', answer: '미술관', answerMeaning: 'art museum', level: 2 },
  { equation: '음 + 악 + 회 = ?', answer: '음악회', answerMeaning: 'concert', level: 2 },
  { equation: '기 + 차 + 역 = ?', answer: '기차역', answerMeaning: 'train station', level: 2 },
  // Level 3 - Subtraction (remove syllable)
  { equation: '가족 - 가 = ?', answer: '족', answerMeaning: 'clan/tribe', level: 3 },
  { equation: '학교 - 학 = ?', answer: '교', answerMeaning: 'teaching', level: 3 },
  { equation: '사과 - 사 = ?', answer: '과', answerMeaning: 'fruit/subject', level: 3 },
  { equation: '시간 - 시 = ?', answer: '간', answerMeaning: 'gap/space', level: 3 },
  { equation: '음식 - 음 = ?', answer: '식', answerMeaning: 'food/eating', level: 3 },
  { equation: '자연 - 연 = ?', answer: '자', answerMeaning: 'self/person', level: 3 },
  { equation: '건강 - 건 = ?', answer: '강', answerMeaning: 'strong/river', level: 3 },
  { equation: '문화 - 문 = ?', answer: '화', answerMeaning: 'change/flower', level: 3 },
];

const TOTAL_ROUNDS = 10;
const TIME_PER_ROUND = 12;

export default function WordMath() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [level, setLevel] = useState(1);
  const [usedProblems, setUsedProblems] = useState<Set<string>>(new Set());

  const generateRound = useCallback(() => {
    const available = PROBLEMS.filter(p => p.level <= level && !usedProblems.has(p.equation));
    if (available.length === 0) {
      setUsedProblems(new Set());
      return;
    }

    const prob = pickRandom(available, 1)[0];
    const allAnswers = PROBLEMS.map(p => p.answer).filter(a => a !== prob.answer && a.length === prob.answer.length);
    const wrong = pickRandom(allAnswers.length >= 3 ? allAnswers : PROBLEMS.map(p => p.answer).filter(a => a !== prob.answer), 3);

    setProblem(prob);
    setOptions(shuffle([prob.answer, ...wrong.slice(0, 3)]));
    setFeedback(null);
    setTimeLeft(TIME_PER_ROUND);
    setUsedProblems(prev => new Set(prev).add(prob.equation));
  }, [level, usedProblems]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setRound(1);
    setLevel(1);
    setUsedProblems(new Set());
  };

  useEffect(() => {
    if (gameState === 'playing' && round > 0) generateRound();
  }, [round, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || feedback) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFeedback('timeout');
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
  }, [gameState, feedback, round]);

  const handleAnswer = (answer: string) => {
    if (feedback || !problem) return;
    const isCorrect = answer === problem.answer;

    if (isCorrect) {
      setFeedback('correct');
      sounds.correct();
      vibrate(30);
      const newCombo = combo + 1;
      const timeBonus = Math.floor(timeLeft * 15);
      setScore(prev => prev + 100 * level + timeBonus + Math.floor(newCombo / 3) * 50);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setCorrectCount(prev => prev + 1);
      if (newCombo % 5 === 0) sounds.combo();
    } else {
      setFeedback('wrong');
      sounds.wrong();
      vibrate(100);
      setCombo(0);
    }

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setGameState('result');
        isCorrect ? sounds.levelUp() : sounds.gameOver();
      } else {
        if (isCorrect && correctCount + 1 >= 3 * level) {
          setLevel(prev => Math.min(3, prev + 1));
        }
        setRound(r => r + 1);
      }
    }, 800);
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="text-8xl mb-6 animate-float">🧮</div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-game-green to-game-cyan bg-clip-text text-transparent">
            단어 수학
          </h1>
          <p className="text-slate-400 mb-2">Word Math</p>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            음절을 더하거나 빼서 한국어 단어를 완성하세요!
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 max-w-xs mx-auto text-left">
            <p className="text-sm text-slate-400 mb-2">🎯 게임 방법</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 음절 연산 문제가 표시됩니다</li>
              <li>• 더하기: 음절을 합쳐 단어를 만드세요</li>
              <li>• 빼기: 음절을 제거한 결과를 찾으세요</li>
              <li>• {TOTAL_ROUNDS}라운드 / 라운드당 {TIME_PER_ROUND}초</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-game-green to-game-cyan font-bold text-lg shadow-lg shadow-game-green/30 text-slate-900"
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
        gameName="단어 수학"
      />
    );
  }

  const timerPercent = (timeLeft / TIME_PER_ROUND) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader
        title="단어 수학"
        emoji="🧮"
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Problem */}
        <motion.div
          key={round}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="px-8 py-6 bg-gradient-to-br from-game-green/10 to-game-cyan/10 border-2 border-game-green/20 rounded-3xl mb-3">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-wider">
              {problem?.equation}
            </p>
          </div>
          <p className="text-sm text-slate-400">
            💡 정답의 뜻: <span className="text-game-cyan">{problem?.answerMeaning}</span>
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((opt, i) => {
            let btnClass = 'bg-slate-700/50 border-slate-600/50 hover:border-game-green/50';
            if (feedback) {
              if (opt === problem?.answer) btnClass = 'bg-game-green/20 border-game-green/50 text-game-green';
              else btnClass = 'bg-slate-700/30 border-slate-600/30 text-slate-500';
            }

            return (
              <motion.button
                key={`${round}-${opt}`}
                initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                whileHover={!feedback ? { scale: 1.03 } : {}}
                whileTap={!feedback ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(opt)}
                disabled={feedback !== null}
                className={`py-4 rounded-2xl text-xl font-bold border-2 transition-all ${btnClass}`}
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
              className={`text-lg font-bold ${feedback === 'correct' ? 'text-game-green' : 'text-game-red'}`}
            >
              {feedback === 'correct' ? '✅ 정답!' :
               feedback === 'timeout' ? `⏰ 시간 초과! 정답: ${problem?.answer}` :
               `❌ 오답! 정답: ${problem?.answer}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
