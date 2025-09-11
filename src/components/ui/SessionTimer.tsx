import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { MotionWrapper, MotionPresence } from './MotionWrapper';

interface Step {
  name: string;
  duration: number; // en secondes
  color?: string;
  soundUrl?: string;
}

interface SessionTimerProps {
  steps: Step[];
  autoStart?: boolean;
  onComplete?: () => void;
}

export default function SessionTimer({ steps, autoStart = false, onComplete }: SessionTimerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0]?.duration || 0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedEndSound = useRef(false);

  useEffect(() => {
    setTimeLeft(steps[currentStep]?.duration || 0);
    setShowNotification(false);
    hasPlayedEndSound.current = false;
  }, [currentStep, steps]);

  useEffect(() => {
    // Utilise l'URL du son de l'étape courante, ou notification par défaut
    const url = steps[currentStep]?.soundUrl || '/notification.mp3';
    const isSupported = url && typeof url === 'string' && url.trim() !== '' &&
      (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg'));
    if (!isSupported) {
      audioRef.current = null;
      return;
    }
    audioRef.current = new Audio(url);
    audioRef.current.loop = false;
    audioRef.current.volume = 0.5;
  }, [currentStep, steps]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMuted) return;
    // À la fin de l'étape
    if (timeLeft === 0 && !hasPlayedEndSound.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        hasPlayedEndSound.current = true;
      } catch {}
    }
    // Toutes les 30s (mais pas à la fin)
    else if (timeLeft > 0 && timeLeft !== steps[currentStep]?.duration && timeLeft % 30 === 0) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    }
  }, [timeLeft, isMuted, currentStep, steps]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Gère la transition de fin d'étape
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowNotification(true);
      hasPlayedEndSound.current = false;
      if (currentStep < steps.length - 1) {
        setTimeout(() => {
          setCurrentStep((s) => s + 1);
          setTimeLeft(steps[currentStep + 1]?.duration || 0);
          setShowNotification(false);
          setIsRunning(true);
        }, 1500);
      } else {
        setTimeout(() => {
          setShowNotification(false);
          onComplete?.();
        }, 1500);
      }
    }
  }, [timeLeft, isRunning, currentStep, steps, onComplete]);

  useEffect(() => {
    setCurrentStep(0);
    setTimeLeft(steps[0]?.duration || 0);
    setIsRunning(autoStart);
    setShowNotification(false);
  }, [steps, autoStart]);

  useEffect(() => {
    if (showNotification) {
      const timeout = setTimeout(() => setShowNotification(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [showNotification]);

  const startTimer = () => {
    if (timeLeft === 0 && steps[currentStep]?.duration) {
      setTimeLeft(steps[currentStep].duration);
    }
    setIsRunning(true);
  };
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTimeLeft(steps[0]?.duration || 0);
    setShowNotification(false);
  };
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsRunning(false);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsRunning(false);
    }
  };
  const toggleMute = () => setIsMuted(!isMuted);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const progress = steps[currentStep]?.duration
    ? ((steps[currentStep].duration - timeLeft) / steps[currentStep].duration) * 100
    : 0;

  // Pour l'affichage, clamp currentStep à steps.length-1
  const displayStep = Math.min(currentStep + 1, steps.length);

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-orange-600 via-red-500 to-yellow-400 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden animate-timer-bg">
        {/* Progress bar améliorée */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-orange-600/60 rounded-t-2xl overflow-hidden z-10">
          <MotionWrapper
            className="h-full bg-yellow-300 shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 16px 2px #facc15' }}
          />
        </div>
        <div className="text-center mb-6 mt-2">
          <MotionWrapper
            key={timeLeft + '-' + currentStep}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-6xl font-extrabold drop-shadow-lg tracking-widest animate-timer-glow"
            style={{ textShadow: '0 0 16px #fff, 0 0 32px #facc15' }}
          >
            {formatTime(timeLeft)}
          </MotionWrapper>
          <MotionWrapper
            key={steps[currentStep]?.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-white/90 text-lg font-semibold mt-2 animate-timer-step"
          >
            {steps[currentStep]?.name || 'Étape'}
          </MotionWrapper>
          {steps.length > 0 && (
            <p className="text-white/80 text-xs mt-1">Étape {displayStep} / {steps.length}</p>
          )}
        </div>
        <div className="flex justify-center space-x-4">
          <MotionWrapper
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevStep}
            className="bg-gray-500 hover:bg-gray-600 p-3 rounded-full transition-colors"
            disabled={currentStep === 0}
          >
            <SkipBack className="h-5 w-5" />
          </MotionWrapper>
          {!isRunning ? (
            <MotionWrapper
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startTimer}
              className="bg-green-500 hover:bg-green-600 p-3 rounded-full transition-colors"
              disabled={timeLeft === 0}
            >
              <Play className="h-5 w-5" />
            </MotionWrapper>
          ) : (
            <MotionWrapper
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={pauseTimer}
              className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full transition-colors"
            >
              <Pause className="h-5 w-5" />
            </MotionWrapper>
          )}
          <MotionWrapper
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="bg-gray-500 hover:bg-gray-600 p-3 rounded-full transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </MotionWrapper>
          <MotionWrapper
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextStep}
            className="bg-gray-500 hover:bg-gray-600 p-3 rounded-full transition-colors"
            disabled={currentStep === steps.length - 1}
          >
            <SkipForward className="h-5 w-5" />
          </MotionWrapper>
          <MotionWrapper
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-500' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </MotionWrapper>
        </div>
      </div>
      <MotionPresence>
        {showNotification && (
          <MotionWrapper
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-white dark:border-gray-700 animate-timer-congrats"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-full animate-pulse" />
              <span className="font-semibold">{currentStep === steps.length - 1 ? "Session terminée ! IronBuddy valide 💪" : "Étape terminée !"}</span>
            </div>
          </MotionWrapper>
        )}
      </MotionPresence>
    </div>
  );
} 