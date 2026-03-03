
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CheckCircle2, RefreshCw, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { judgePose } from '../../services/geminiService';

interface MovementQuestProps {
  onComplete: () => void;
  onCrisis: () => void;
}

const POSES = [
  { name: 'Arms Up High', instruction: 'Reach both arms straight up towards the sky.' },
  { name: 'Side Stretch', instruction: 'Lean your body to one side with one arm over your head.' },
  { name: 'Touch Toes', instruction: 'Bend forward and try to reach for your toes.' }
];

const MovementQuest: React.FC<MovementQuestProps> = ({ onComplete, onCrisis }) => {
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPose = POSES[currentPoseIndex];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const captureAndCheck = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setFeedback(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      
      const result = await judgePose(base64Image, currentPose.name);
      
      if (result.isCrisis) {
        onCrisis();
        return;
      }

      if (result.isCorrect) {
        setFeedback(result.feedback || "Perfect! Let's do the next one.");
        setTimeout(() => {
          if (currentPoseIndex < POSES.length - 1) {
            setCurrentPoseIndex(prev => prev + 1);
            setFeedback(null);
          } else {
            onComplete();
          }
        }, 2000);
      } else {
        setFeedback(result.feedback || "Almost there! Try to adjust your pose.");
      }
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="glass rounded-3xl p-6 space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-outfit text-emerald-400">Movement Quest</h3>
        <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Pose {currentPoseIndex + 1} of {POSES.length}
        </div>
      </div>

      <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800">
        {!isCameraReady && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-400 text-sm">Waking up the camera...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <p className="text-slate-300 font-medium">{error}</p>
            <button 
              onClick={startCamera}
              className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase"
            >
              Try Again
            </button>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transform -scale-x-100 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {isCameraReady && (
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-950/80 to-transparent">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <p className="text-white font-bold text-sm">{currentPose.name}</p>
              <p className="text-slate-300 text-xs">{currentPose.instruction}</p>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-center animate-in zoom-in ${feedback.toLowerCase().includes('perfect') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
          <p className="text-sm font-bold">{feedback}</p>
        </div>
      )}

      <button
        onClick={captureAndCheck}
        disabled={!isCameraReady || isAnalyzing}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Aura is checking...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Check My Pose
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest">
        Make sure you are well-lit and visible in the frame.
      </p>
    </div>
  );
};

export default MovementQuest;
