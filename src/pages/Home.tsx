import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const games = [
  {
    id: 'chosung-detective',
    name: '초성 탐정',
    nameEn: 'Chosung Detective',
    emoji: '🔍',
    desc: '초성 힌트를 보고 한국어 단어를 맞춰보세요',
    gradient: 'from-primary-500 to-game-cyan',
    category: 'Speed',
    difficulty: '⭐⭐',
  },
  {
    id: 'antonym-finder',
    name: '반대말 찾기',
    nameEn: 'Antonym Finder',
    emoji: '🔄',
    desc: '주어진 단어의 반대말을 빠르게 찾아보세요',
    gradient: 'from-game-pink to-game-purple',
    category: 'Logic',
    difficulty: '⭐⭐',
  },
  {
    id: 'card-matching',
    name: '같은 단어 맞추기',
    nameEn: 'Card Matching',
    emoji: '🃏',
    desc: '한국어-영어 같은 뜻 카드 쌍을 찾으세요',
    gradient: 'from-game-yellow to-accent-500',
    category: 'Memory',
    difficulty: '⭐',
  },
  {
    id: 'word-math',
    name: '단어 수학',
    nameEn: 'Word Math',
    emoji: '🧮',
    desc: '음절을 더하고 빼서 단어를 완성하세요',
    gradient: 'from-game-green to-game-cyan',
    category: 'Logic',
    difficulty: '⭐⭐⭐',
  },
  {
    id: 'letter-hide-seek',
    name: '글자 숨바꼭질',
    nameEn: 'Letter Hide & Seek',
    emoji: '👀',
    desc: '글자판에서 숨어있는 단어를 찾아보세요',
    gradient: 'from-game-purple to-game-pink',
    category: 'Visual',
    difficulty: '⭐⭐',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen pb-8">
      {/* Hero */}
      <div className="text-center pt-12 pb-8 px-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4 animate-float">🎮</div>
          <h1 className="text-4xl font-black mb-2">
            <span className="bg-gradient-to-r from-primary-400 via-game-purple to-game-pink bg-clip-text text-transparent">
              TOPIK PLAY
            </span>
          </h1>
          <p className="text-slate-400 text-sm mb-1">한국어 학습 미니게임</p>
          <p className="text-slate-500 text-xs">Korean Learning Mini Games</p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center gap-6 mt-6"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-400">5</p>
            <p className="text-xs text-slate-500">미니게임</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-game-green">3</p>
            <p className="text-xs text-slate-500">난이도 레벨</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-game-purple">TOPIK</p>
            <p className="text-xs text-slate-500">I ~ II</p>
          </div>
        </motion.div>
      </div>

      {/* Daily Loop Banner */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-600/20 to-game-purple/20 border border-primary-500/20"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-bold text-primary-300">3분 데일리 루프</p>
            <p className="text-xs text-slate-400">워밍업 → 트레이닝 → 쿨다운으로 매일 학습!</p>
          </div>
        </div>
      </motion.div>

      {/* Game Cards */}
      <div className="px-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-400 px-1 mb-2">게임 선택</h2>
        {games.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * i + 0.5 }}
          >
            <Link to={`/game/${game.id}`}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                  {game.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white group-hover:text-primary-300 transition-colors">{game.name}</h3>
                    <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400">{game.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{game.nameEn}</p>
                  <p className="text-xs text-slate-400">{game.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs">{game.difficulty}</span>
                  <span className="text-slate-500 group-hover:text-primary-400 transition-colors text-lg">→</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center mt-10 px-4"
      >
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30">
          <p className="text-xs text-slate-500 mb-1">적응형 학습 시스템</p>
          <p className="text-[11px] text-slate-600">정답률에 따라 난이도가 자동으로 조절됩니다</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-game-green" /> 콤보 시스템
            </span>
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-game-purple" /> 타임 보너스
            </span>
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-500" /> 등급 평가
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-4">TOPIK PLAY Demo v1.0 | Powered by BATL</p>
      </motion.div>
    </div>
  );
}
