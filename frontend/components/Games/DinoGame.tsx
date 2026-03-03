
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, RotateCcw, Egg, Ghost, Zap, Shield, Sword, ChevronLeft } from 'lucide-react';

interface DinoGameProps {
  level: number;
  onComplete: (xp: number) => void;
  onBack: () => void;
}

const DinoGame: React.FC<DinoGameProps> = ({ level, onComplete, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerY, setPlayerY] = useState(0);
  const [obstacles, setObstacles] = useState<{ x: number; id: number }[]>([]);
  
  const requestRef = useRef<number>(null);
  const velocityRef = useRef(0);
  const gravity = -0.75; 
  const jumpStrength = 14;
  const groundY = 0;

  const getPlayerIcon = () => {
    const base = <Ghost className="w-full h-full" />;
    if (level < 2) return <Egg className="w-full h-full text-amber-200 p-1" />;
    if (level < 4) return <div className="text-cyan-300 w-full h-full p-1">{base}</div>;
    if (level < 6) return (
      <div className="relative w-full h-full text-purple-300 p-1">
        {base}
        <Zap className="absolute -top-1 -right-1 w-1/2 h-1/2 text-yellow-400" />
      </div>
    );
    if (level < 8) return (
      <div className="relative w-full h-full text-emerald-300 p-1">
        {base}
        <Shield className="absolute -right-0.5 top-1/4 w-1/2 h-1/2 text-emerald-500" />
      </div>
    );
    return (
      <div className="relative w-full h-full text-rose-300 p-1">
        {base}
        <Sword className="absolute -right-0.5 top-0 w-1/2 h-1/2 text-rose-500 rotate-45" />
      </div>
    );
  };

  const jump = useCallback(() => {
    if (playerY === groundY && isPlaying && !gameOver) {
      velocityRef.current = jumpStrength;
    }
  }, [playerY, isPlaying, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const update = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setScore(s => s + 1);

    velocityRef.current += gravity;
    setPlayerY(y => {
      const nextY = y + velocityRef.current;
      if (nextY <= groundY) {
        velocityRef.current = 0;
        return groundY;
      }
      return nextY;
    });

    setObstacles(prev => {
      const speed = 6.5 + Math.floor(score / 400);
      const next = prev.map(o => ({ ...o, x: o.x - speed })).filter(o => o.x > -50);
      
      if (next.length === 0 || (next[next.length - 1].x < 300 && Math.random() < 0.03)) {
        next.push({ x: 600, id: Date.now() });
      }
      
      const collision = next.some(o => o.x < 80 && o.x > 30 && playerY < 35);
      if (collision) {
        setGameOver(true);
        setIsPlaying(false);
        if (score > 100) onComplete(Math.floor(score / 20));
      }
      
      return next;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [isPlaying, gameOver, playerY, score, onComplete]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, update]);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setObstacles([{ x: 600, id: Date.now() }]);
    setPlayerY(0);
    velocityRef.current = 0;
  };

  return (
    <div className="glass rounded-3xl p-6 text-center space-y-4 overflow-hidden animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-white font-bold">
          <Trophy className="w-4 h-4 text-amber-400" />
          {score}
        </div>
      </div>

      <div 
        onClick={jump}
        className="relative w-full h-56 bg-slate-900/50 rounded-2xl border-b-4 border-slate-700 overflow-hidden cursor-pointer touch-none"
      >
        <div 
          className="absolute left-10 w-10 h-10"
          style={{ bottom: `${playerY}px` }}
        >
          {getPlayerIcon()}
        </div>
        
        {obstacles.map(o => (
          <div 
            key={o.id}
            className="absolute bottom-0 w-6 h-10 bg-rose-500 rounded-t-lg shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            style={{ left: `${o.x}px` }}
          />
        ))}

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="bg-cyan-500 text-slate-950 font-black px-8 py-3 rounded-full hover:scale-110 transition-transform shadow-xl"
            >
              START GAME
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/40 backdrop-blur-sm z-10">
            <p className="text-white font-black text-2xl mb-4">GAME OVER</p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="bg-white text-slate-950 font-black px-6 py-2 rounded-full flex items-center gap-2 hover:scale-110 transition-transform"
            >
              <RotateCcw className="w-4 h-4" /> TRY AGAIN
            </button>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tap or Space to Jump</p>
    </div>
  );
};

export default DinoGame;
