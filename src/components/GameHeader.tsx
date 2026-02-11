import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameHeaderProps {
  title: string;
  emoji: string;
  score: number;
  combo?: number;
  timeLeft?: number;
  lives?: number;
  level?: number;
  round?: { current: number; total: number };
}

export default function GameHeader({ title, emoji, score, combo = 0, timeLeft, lives, level, round }: GameHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50">
      <button
        onClick={() => navigate('/')}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-lg"
      >
        ←
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="font-bold text-sm">{title}</span>
        {level && (
          <span className="px-2 py-0.5 bg-primary-600/30 text-primary-300 text-xs rounded-full font-medium">
            Lv.{level}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {round && (
          <span className="text-xs text-slate-400">{round.current}/{round.total}</span>
        )}
        {lives !== undefined && (
          <span className="text-sm">{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, 3 - lives))}</span>
        )}
        {timeLeft !== undefined && (
          <div className={`px-2 py-0.5 rounded-lg text-sm font-mono font-bold ${timeLeft <= 10 ? 'bg-game-red/20 text-game-red' : 'bg-slate-700/50 text-slate-300'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        <motion.div
          key={score}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.2 }}
          className="px-3 py-0.5 rounded-lg bg-accent-500/20 text-accent-400 font-bold text-sm"
        >
          {score.toLocaleString()}
        </motion.div>
        {combo > 1 && (
          <motion.div
            key={combo}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-2 py-0.5 rounded-full bg-game-purple/20 text-game-purple text-xs font-bold"
          >
            x{combo}
          </motion.div>
        )}
      </div>
    </div>
  );
}
