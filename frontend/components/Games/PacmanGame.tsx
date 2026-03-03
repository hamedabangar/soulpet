
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, Egg, Ghost, Zap, Shield, Sword, CloudRain, Sparkles, ChevronLeft } from 'lucide-react';

interface PacmanGameProps {
  level: number;
  onComplete: (xp: number) => void;
  onBack: () => void;
}

const GRID_SIZE = 10;
const CELL_SIZE = 24; 

const PacmanGame: React.FC<PacmanGameProps> = ({ level, onComplete, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [enemies, setEnemies] = useState<{ x: number; y: number }[]>([]);
  
  const playerPosRef = useRef(playerPos);
  const enemiesRef = useRef(enemies);
  const dotsRef = useRef(dots);
  const scoreRef = useRef(score);
  const gameLoopRef = useRef<number>(null);
  const lastAiUpdateRef = useRef<number>(0);

  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { dotsRef.current = dots; }, [dots]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const getPlayerIcon = () => {
    const base = <Ghost className="w-full h-full" />;
    if (level < 2) return <Egg className="w-full h-full text-amber-200 p-0.5" />;
    if (level < 4) return <div className="text-cyan-300 w-full h-full p-0.5">{base}</div>;
    if (level < 6) return (
      <div className="relative w-full h-full text-purple-300 p-0.5">
        {base}
        <Zap className="absolute -top-1 -right-1 w-1/2 h-1/2 text-yellow-400 animate-pulse" />
      </div>
    );
    if (level < 8) return (
      <div className="relative w-full h-full text-emerald-300 p-0.5">
        {base}
        <Shield className="absolute -right-1 top-1/4 w-1/2 h-1/2 text-emerald-500 drop-shadow-sm" />
      </div>
    );
    return (
      <div className="relative w-full h-full text-rose-300 p-0.5">
        {base}
        <Sword className="absolute -right-1 top-0 w-1/2 h-1/2 text-rose-500 rotate-45 drop-shadow-sm" />
      </div>
    );
  };

  const initGame = useCallback(() => {
    const newDots = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (Math.random() > 0.6 && (i !== 1 || j !== 1) && (i !== 8 || j !== 8)) {
          newDots.push({ x: i, y: j });
        }
      }
    }
    setDots(newDots);
    const initialEnemies = [{ x: 8, y: 8 }, { x: 8, y: 1 }, { x: 1, y: 8 }];
    setEnemies(initialEnemies);
    setPlayerPos({ x: 1, y: 1 });
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    lastAiUpdateRef.current = performance.now();
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isPlaying || gameOver) return;
    setPlayerPos(prev => {
      const nextX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx));
      const nextY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy));
      
      setDots(d => {
        const filtered = d.filter(dot => dot.x !== nextX || dot.y !== nextY);
        if (filtered.length < d.length) setScore(s => s + 10);
        return filtered;
      });

      return { x: nextX, y: nextY };
    });
  }, [isPlaying, gameOver]);

  const update = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    // AI Update every 400ms
    if (time - lastAiUpdateRef.current > 400) {
      setEnemies(prev => prev.map(enemy => {
        const pPos = playerPosRef.current;
        const moveTowards = Math.random() < 0.9; 
        
        if (moveTowards) {
          const dx = pPos.x > enemy.x ? 1 : pPos.x < enemy.x ? -1 : 0;
          const dy = pPos.y > enemy.y ? 1 : pPos.y < enemy.y ? -1 : 0;
          if (Math.abs(pPos.x - enemy.x) > Math.abs(pPos.y - enemy.y)) {
            return { x: enemy.x + dx, y: enemy.y };
          } else {
            return { x: enemy.x, y: enemy.y + dy };
          }
        } else {
          const dirs = [{x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0}];
          const d = dirs[Math.floor(Math.random() * 4)];
          return { 
            x: Math.max(0, Math.min(GRID_SIZE-1, enemy.x + d.x)), 
            y: Math.max(0, Math.min(GRID_SIZE-1, enemy.y + d.y)) 
          };
        }
      }));
      lastAiUpdateRef.current = time;
    }

    // Collision Check
    if (enemiesRef.current.some(e => e.x === playerPosRef.current.x && e.y === playerPosRef.current.y)) {
      setGameOver(true);
      setIsPlaying(false);
      if (scoreRef.current > 50) onComplete(Math.floor(scoreRef.current / 5));
    }

    if (dotsRef.current.length === 0 && isPlaying) {
      setGameOver(true);
      setIsPlaying(false);
      onComplete(scoreRef.current / 2);
    }

    gameLoopRef.current = requestAnimationFrame(update);
  }, [isPlaying, gameOver, onComplete]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, movePlayer]);

  return (
    <div className="glass rounded-3xl p-4 sm:p-6 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center animate-in fade-in">
      <div className="flex justify-between items-center w-full mb-2">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-white font-bold">
          <Trophy className="w-4 h-4 text-amber-400" />
          {score}
        </div>
      </div>

      <div className="relative bg-slate-900/80 rounded-xl border-2 border-slate-800 overflow-hidden shadow-inner shrink-0" 
           style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
        
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }} />

        {dots.map((dot, i) => (
          <div key={i} className="absolute flex items-center justify-center" 
               style={{ left: dot.x * CELL_SIZE, top: dot.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
            <Sparkles className="w-2.5 h-2.5 text-amber-400/60 animate-pulse" />
          </div>
        ))}

        {enemies.map((enemy, i) => (
          <div key={i} className="absolute transition-all duration-300 flex items-center justify-center z-10" 
               style={{ left: enemy.x * CELL_SIZE, top: enemy.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
            <CloudRain className="w-5 h-5 text-slate-400 drop-shadow-[0_0_5px_rgba(148,163,184,0.5)]" />
          </div>
        ))}

        <div className="absolute transition-all duration-200 z-20" 
             style={{ left: playerPos.x * CELL_SIZE, top: playerPos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
          {getPlayerIcon()}
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30 p-4">
            {gameOver && (
              <div className="mb-4">
                <p className="text-white font-black text-xl">{dots.length === 0 ? 'CLEARED!' : 'CAUGHT!'}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Score: {score}</p>
              </div>
            )}
            <button 
              onClick={initGame}
              className="bg-purple-500 text-white font-black px-6 py-2 rounded-full hover:scale-110 transition-transform shadow-lg shadow-purple-900/40 text-sm"
            >
              {gameOver ? 'TRY AGAIN' : 'START GAME'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 max-w-[140px] mx-auto mt-4">
        <div />
        <button onClick={() => movePlayer(0, -1)} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:scale-90 transition-all shadow-lg">↑</button>
        <div />
        <button onClick={() => movePlayer(-1, 0)} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:scale-90 transition-all shadow-lg">←</button>
        <button onClick={() => movePlayer(0, 1)} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:scale-90 transition-all shadow-lg">↓</button>
        <button onClick={() => movePlayer(1, 0)} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:scale-90 transition-all shadow-lg">→</button>
      </div>
    </div>
  );
};

export default PacmanGame;
