import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface GameResultProps {
  score: number;
  maxCombo: number;
  correctCount: number;
  totalCount: number;
  onReplay: () => void;
  gameName: string;
}

export default function GameResult({ score, maxCombo, correctCount, totalCount, onReplay, gameName }: GameResultProps) {
  const navigate = useNavigate();
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const grade = accuracy >= 90 ? 'S' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'D';
  const gradeColor: Record<string, string> = {
    S: 'from-yellow-400 to-amber-500',
    A: 'from-green-400 to-emerald-500',
    B: 'from-blue-400 to-cyan-500',
    C: 'from-purple-400 to-violet-500',
    D: 'from-gray-400 to-slate-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-sm bg-slate-800 rounded-3xl p-4 sm:p-6 text-center border border-slate-700/50 shadow-2xl"
      >
        <h2 className="text-lg font-bold text-slate-300 mb-2">{gameName}</h2>
        <p className="text-sm text-slate-400 mb-4">게임 완료!</p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 10 }}
          className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${gradeColor[grade]} flex items-center justify-center mb-6 shadow-lg`}
        >
          <span className="text-5xl font-black text-white drop-shadow-lg">{grade}</span>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3">
            <p className="text-lg sm:text-2xl font-bold text-accent-400">{score.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">점수</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3">
            <p className="text-lg sm:text-2xl font-bold text-game-purple">x{maxCombo}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">최대 콤보</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-2 sm:p-3">
            <p className="text-lg sm:text-2xl font-bold text-game-green">{accuracy}%</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">정확도</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          {correctCount}/{totalCount} 정답
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-medium"
          >
            홈으로
          </button>
          <button
            onClick={onReplay}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg shadow-primary-500/20"
          >
            다시 하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
