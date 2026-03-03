
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, RotateCcw, Egg, Ghost, Zap, Shield, Sword, ChevronLeft } from 'lucide-react';

interface BreakoutGameProps {
  level: number;
  onComplete: (xp: number) => void;
  onBack: () => void;
}

const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const BRICK_ROWS = 4;
const BRICK_COLS = 5;
const BRICK_HEIGHT = 18;
const CANVAS_WIDTH = 280; 
const CANVAS_HEIGHT = 380;

const BreakoutGame: React.FC<BreakoutGameProps> = ({ level, onComplete, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  const paddleX = useRef((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const ballX = useRef(CANVAS_WIDTH / 2);
  const ballY = useRef(CANVAS_HEIGHT - 40);
  const dx = useRef(3);
  const dy = useRef(-3);
  const bricks = useRef<{ x: number; y: number; status: number }[]>([]);

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

  const initBricks = () => {
    const newBricks = [];
    const padding = 8;
    const offsetTop = 40;
    const offsetLeft = 10;
    const brickWidth = (CANVAS_WIDTH - (offsetLeft * 2) - (padding * (BRICK_COLS - 1))) / BRICK_COLS;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        newBricks.push({
          x: c * (brickWidth + padding) + offsetLeft,
          y: r * (BRICK_HEIGHT + padding) + offsetTop,
          status: 1
        });
      }
    }
    bricks.current = newBricks;
  };

  const startGame = () => {
    initBricks();
    ballX.current = CANVAS_WIDTH / 2;
    ballY.current = CANVAS_HEIGHT - 50;
    dx.current = 2.5 * (Math.random() > 0.5 ? 1 : -1);
    dy.current = -2.5;
    paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setIsPlaying(true);
  };

  const movePaddle = useCallback((dir: number) => {
    paddleX.current = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleX.current + dir * 25));
  }, []);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        movePaddle(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        movePaddle(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, movePaddle]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Bricks
    const padding = 8;
    const offsetLeft = 10;
    const brickWidth = (CANVAS_WIDTH - (offsetLeft * 2) - (padding * (BRICK_COLS - 1))) / BRICK_COLS;

    bricks.current.forEach(b => {
      if (b.status === 1) {
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, brickWidth, BRICK_HEIGHT, 4);
        ctx.fillStyle = "#334155";
        ctx.fill();
        ctx.strokeStyle = "#475569";
        ctx.stroke();
        ctx.closePath();
      }
    });

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#22d3ee";
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#22d3ee";
    ctx.closePath();
    ctx.shadowBlur = 0;

    // Draw Paddle Base
    ctx.beginPath();
    ctx.roundRect(paddleX.current, CANVAS_HEIGHT - PADDLE_HEIGHT - 5, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
    ctx.closePath();

    // Ball Movement & Wall Collision
    if (ballX.current + dx.current > CANVAS_WIDTH - BALL_RADIUS || ballX.current + dx.current < BALL_RADIUS) {
      dx.current = -dx.current;
    }
    if (ballY.current + dy.current < BALL_RADIUS) {
      dy.current = -dy.current;
    } else if (ballY.current + dy.current > CANVAS_HEIGHT - BALL_RADIUS - 10) {
      if (ballX.current > paddleX.current && ballX.current < paddleX.current + PADDLE_WIDTH) {
        dy.current = -dy.current;
        const hitPos = (ballX.current - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        dx.current = hitPos * 4;
      } else {
        setIsPlaying(false);
        setGameOver(true);
        if (score > 50) onComplete(Math.floor(score / 10));
        return;
      }
    }

    // Brick Collision
    bricks.current.forEach(b => {
      if (b.status === 1) {
        if (ballX.current > b.x && ballX.current < b.x + brickWidth && ballY.current > b.y && ballY.current < b.y + BRICK_HEIGHT) {
          dy.current = -dy.current;
          b.status = 0;
          setScore(s => s + 10);
        }
      }
    });

    if (bricks.current.every(b => b.status === 0)) {
      setIsPlaying(false);
      setGameWon(true);
      onComplete(100);
      return;
    }

    ballX.current += dx.current;
    ballY.current += dy.current;

    requestRef.current = requestAnimationFrame(draw);
  }, [score, onComplete]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, draw]);

  return (
    <div className="glass rounded-3xl p-6 text-center space-y-6 animate-in fade-in flex flex-col items-center">
      <div className="flex justify-between items-center w-full">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-white font-bold">
          <Trophy className="w-4 h-4 text-amber-400" />
          {score}
        </div>
      </div>

      <div className="relative bg-slate-900/90 rounded-xl border-2 border-slate-800 overflow-hidden shadow-2xl" 
           style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="block"
        />

        {/* Paddle Icon Overlay */}
        <div 
          className="absolute pointer-events-none transition-all duration-100"
          style={{ 
            left: paddleX.current, 
            bottom: 5, 
            width: PADDLE_WIDTH, 
            height: PADDLE_HEIGHT + 25,
            display: isPlaying || gameOver || gameWon ? 'block' : 'none'
          }}
        >
          <div className="w-10 h-10 mx-auto -mt-8">
            {getPlayerIcon()}
          </div>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30 p-4">
            {gameOver && <p className="text-white font-black text-xl mb-2">GAME OVER</p>}
            {gameWon && <p className="text-emerald-400 font-black text-xl mb-2">VICTORY!</p>}
            <button 
              onClick={startGame}
              className="bg-emerald-500 text-slate-950 font-black px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {gameOver || gameWon ? 'TRY AGAIN' : 'START GAME'}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-[220px]">
        <button 
          onClick={() => movePaddle(-1)}
          className="flex-1 p-5 bg-slate-800 rounded-2xl active:bg-slate-700 shadow-lg text-2xl transition-all"
        >
          ←
        </button>
        <button 
          onClick={() => movePaddle(1)}
          className="flex-1 p-5 bg-slate-800 rounded-2xl active:bg-slate-700 shadow-lg text-2xl transition-all"
        >
          →
        </button>
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Bounce the ball to clear the bricks!</p>
    </div>
  );
};

export default BreakoutGame;
