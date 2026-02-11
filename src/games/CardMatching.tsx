import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameResult from '../components/GameResult';
import { sounds, vibrate } from '../utils/sound';
import { shuffle } from '../utils/shuffle';

interface CardData {
  id: number;
  korean: string;
  english: string;
  type: 'korean' | 'english';
  pairId: number;
}

const WORD_PAIRS = [
  { korean: '사랑', english: 'Love' },
  { korean: '행복', english: 'Happiness' },
  { korean: '꿈', english: 'Dream' },
  { korean: '희망', english: 'Hope' },
  { korean: '별', english: 'Star' },
  { korean: '바람', english: 'Wind' },
  { korean: '하늘', english: 'Sky' },
  { korean: '노래', english: 'Song' },
  { korean: '마음', english: 'Heart' },
  { korean: '미래', english: 'Future' },
  { korean: '평화', english: 'Peace' },
  { korean: '자유', english: 'Freedom' },
  { korean: '용기', english: 'Courage' },
  { korean: '지혜', english: 'Wisdom' },
  { korean: '감사', english: 'Thanks' },
  { korean: '우정', english: 'Friendship' },
];


export default function CardMatching() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [level, setLevel] = useState(1);
  const [totalMatched, setTotalMatched] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const lockRef = useRef(false);

  const pairsPerLevel = [4, 5, 6];

  const generateCards = (lvl: number) => {
    const numPairs = pairsPerLevel[Math.min(lvl - 1, 2)];
    const selected = shuffle(WORD_PAIRS).slice(0, numPairs);
    const cardList: CardData[] = [];
    let id = 0;

    selected.forEach((pair, pairIdx) => {
      cardList.push({ id: id++, korean: pair.korean, english: pair.english, type: 'korean', pairId: pairIdx });
      cardList.push({ id: id++, korean: pair.korean, english: pair.english, type: 'english', pairId: pairIdx });
    });

    return shuffle(cardList);
  };

  const startGame = () => {
    const lvl = 1;
    setLevel(lvl);
    setCards(generateCards(lvl));
    setFlippedIds([]);
    setMatchedPairs(new Set());
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMoves(0);
    setTimeLeft(90);
    setTotalMatched(0);
    setTotalAttempts(0);
    setGameState('playing');
    lockRef.current = false;
  };

  const nextLevel = () => {
    const newLevel = Math.min(3, level + 1);
    setLevel(newLevel);
    setCards(generateCards(newLevel));
    setFlippedIds([]);
    setMatchedPairs(new Set());
    lockRef.current = false;
    sounds.levelUp();
  };

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

  // Check for level completion
  useEffect(() => {
    if (gameState !== 'playing') return;
    const numPairs = pairsPerLevel[Math.min(level - 1, 2)];
    if (matchedPairs.size === numPairs && matchedPairs.size > 0) {
      if (level < 3) {
        setTimeout(() => nextLevel(), 800);
      } else {
        setTimeout(() => {
          setGameState('result');
          sounds.levelUp();
        }, 800);
      }
    }
  }, [matchedPairs, level, gameState]);

  const handleCardClick = (card: CardData) => {
    if (lockRef.current) return;
    if (flippedIds.includes(card.id)) return;
    if (matchedPairs.has(card.pairId)) return;

    sounds.flip();
    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      setTotalAttempts(t => t + 1);

      const [firstId, secondId] = newFlipped;
      const first = cards.find(c => c.id === firstId)!;
      const second = cards.find(c => c.id === secondId)!;

      if (first.pairId === second.pairId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          sounds.match();
          vibrate(30);
          setMatchedPairs(prev => new Set(prev).add(first.pairId));
          setFlippedIds([]);
          const newCombo = combo + 1;
          setCombo(newCombo);
          setMaxCombo(prev => Math.max(prev, newCombo));
          setTotalMatched(t => t + 1);
          const baseScore = 200 * level;
          const comboBonus = Math.floor(newCombo / 2) * 100;
          setScore(s => s + baseScore + comboBonus);
          lockRef.current = false;
          if (newCombo > 0 && newCombo % 4 === 0) sounds.combo();
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          sounds.wrong();
          vibrate(50);
          setFlippedIds([]);
          setCombo(0);
          lockRef.current = false;
        }, 700);
      }
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="text-8xl mb-6 animate-float">🃏</div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-game-yellow to-accent-500 bg-clip-text text-transparent">
            같은 단어 맞추기
          </h1>
          <p className="text-slate-400 mb-2">Card Matching</p>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            한국어와 영어 뜻이 같은 카드 쌍을 찾아보세요!
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 max-w-xs mx-auto text-left">
            <p className="text-sm text-slate-400 mb-2">🎯 게임 방법</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 카드를 터치해서 뒤집으세요</li>
              <li>• 한국어-영어 같은 뜻 쌍을 찾으세요</li>
              <li>• 연속 매칭 시 콤보 보너스!</li>
              <li>• 레벨이 오르면 카드 수 증가!</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-game-yellow to-accent-500 font-bold text-lg shadow-lg shadow-game-yellow/30 text-slate-900"
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
        correctCount={totalMatched}
        totalCount={totalAttempts}
        onReplay={startGame}
        gameName="같은 단어 맞추기"
      />
    );
  }

  const numPairs = pairsPerLevel[Math.min(level - 1, 2)];
  const gridCols = numPairs <= 4 ? 4 : numPairs <= 5 ? 5 : 4;

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader
        title="같은 단어 맞추기"
        emoji="🃏"
        score={score}
        combo={combo}
        timeLeft={timeLeft}
        level={level}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-xs text-slate-400 mb-3">
          매칭: {matchedPairs.size}/{numPairs} | 시도: {moves}회
        </p>

        <div
          className="grid gap-2 w-full max-w-md"
          style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        >
          {cards.map((card) => {
            const isFlipped = flippedIds.includes(card.id);
            const isMatched = matchedPairs.has(card.pairId);

            return (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card)}
                whileTap={!isFlipped && !isMatched ? { scale: 0.95 } : {}}
                className="relative aspect-[3/4] rounded-xl perspective-500"
                style={{ perspective: '600px' }}
              >
                <motion.div
                  animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Back (hidden) */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 border-2 border-primary-400/30 flex items-center justify-center backface-hidden shadow-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-2xl font-black text-white/30">?</span>
                  </div>

                  {/* Front (content) */}
                  <div
                    className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center p-1 border-2 shadow-lg ${
                      isMatched
                        ? 'bg-game-green/20 border-game-green/50'
                        : card.type === 'korean'
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-game-pink/30'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 border-game-cyan/30'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className={`font-bold ${card.type === 'korean' ? 'text-lg text-game-pink' : 'text-sm text-game-cyan'}`}>
                      {card.type === 'korean' ? card.korean : card.english}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${card.type === 'korean' ? 'text-game-pink/50' : 'text-game-cyan/50'}`}>
                      {card.type === 'korean' ? '한국어' : 'English'}
                    </span>
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
