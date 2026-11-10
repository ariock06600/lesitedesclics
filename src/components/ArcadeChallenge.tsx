import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import {
  ArcadeClickType,
  ArcadeTarget,
  evaluateArcadeClick,
  getStoredHighScore,
  saveStoredHighScore,
} from '../game/logic';
import {
  Heart,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  MousePointer2,
  AlertTriangle,
  Play,
  Flame,
  ArrowLeft,
} from 'lucide-react';

interface ArcadeChallengeProps {
  onBackToTraining?: () => void;
}

const TARGET_TYPES: Array<{
  type: ArcadeClickType;
  label: string;
  hint: string;
  icon: string;
  colorClass: string;
  badgeBg: string;
}> = [
  {
    type: 'left',
    label: 'CLIC GAUCHE',
    hint: 'Clique 1 fois avec le bouton GAUCHE',
    icon: '🟡',
    colorClass: 'from-amber-400 to-yellow-500 border-yellow-300 text-yellow-950',
    badgeBg: 'bg-amber-400 text-amber-950',
  },
  {
    type: 'right',
    label: 'CLIC DROIT',
    hint: 'Clique avec le bouton DROIT (doigt du milieu)',
    icon: '🟣',
    colorClass: 'from-fuchsia-500 to-purple-600 border-purple-300 text-white',
    badgeBg: 'bg-purple-500 text-white',
  },
  {
    type: 'double',
    label: 'DOUBLE-CLIC',
    hint: 'Deux clics gauches très rapides ! (Clic-Clic !)',
    icon: '🟢',
    colorClass: 'from-emerald-400 to-teal-500 border-emerald-300 text-slate-900',
    badgeBg: 'bg-emerald-500 text-white',
  },
];

export const ArcadeChallenge: React.FC<ArcadeChallengeProps> = ({ onBackToTraining }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(5);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => getStoredHighScore());
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<{ left: number; right: number; double: number }>({
    left: 0,
    right: 0,
    double: 0,
  });

  // Current active target
  const [currentTarget, setCurrentTarget] = useState<ArcadeTarget | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(4500);
  const [targetDuration, setTargetDuration] = useState<number>(4500);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    text: string;
    isError?: boolean;
    isSuccess?: boolean;
  }>({
    text: 'Prépare-toi ! Fais attention au type de clic demandé.',
  });

  // Double-click tracking
  const firstClickTimestampRef = useRef<number>(0);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen shake animation
  const [shake, setShake] = useState(false);

  // Generate next random target
  const spawnNextTarget = useCallback((currentScore: number) => {
    // Pick random target type
    const randomIndex = Math.floor(Math.random() * TARGET_TYPES.length);
    const template = TARGET_TYPES[randomIndex];

    // Difficulty scaling: speed increases slightly with score, capped between 2400ms and 4500ms
    const speedReduction = Math.min(2000, Math.floor(currentScore / 100) * 100);
    const duration = Math.max(2500, 4500 - speedReduction);

    const newTarget: ArcadeTarget = {
      id: `${Date.now()}-${Math.random()}`,
      expectedClick: template.type,
      label: template.label,
      shortHint: template.hint,
      icon: template.icon,
      colorClass: template.colorClass,
      badgeBg: template.badgeBg,
      durationMs: duration,
    };

    setCurrentTarget(newTarget);
    setTimeLeftMs(duration);
    setTargetDuration(duration);
    firstClickTimestampRef.current = 0;
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
      doubleClickTimeoutRef.current = null;
    }
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLoseLife = useCallback((reason: string) => {
    triggerShake();
    soundManager.playLifeLost();

    setCombo(0);
    setFeedback({
      text: reason,
      isError: true,
    });

    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        // Game Over!
        setIsGameOver(true);
        setIsPlaying(false);
        soundManager.playGameOver();

        setScore((finalScore) => {
          const isNew = saveStoredHighScore(finalScore);
          if (isNew) {
            setIsNewHighScore(true);
            setHighScore(finalScore);
            soundManager.playVictoryFanfare();
            confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.4, 80);
          }
          return finalScore;
        });

        return 0;
      }
      return nextLives;
    });

    // Spawn next target
    setScore((currScore) => {
      spawnNextTarget(currScore);
      return currScore;
    });
  }, [spawnNextTarget]);

  // Handle successful hit
  const handleSuccessHit = useCallback((type: ArcadeClickType) => {
    if (!currentTarget) return;

    const addedPoints = 100 + combo * 15;
    const nextScore = score + addedPoints;
    const nextCombo = combo + 1;

    setScore(nextScore);
    setCombo(nextCombo);

    if (type === 'right') {
      soundManager.playRightClickPop();
    } else {
      soundManager.playComboBonus(nextCombo);
    }

    if (nextCombo > 0 && nextCombo % 5 === 0) {
      confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.3, 35);
    }

    setStats((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));

    setFeedback({
      text: `Super ! +${addedPoints} pts ! Combo ×${nextCombo} 🔥`,
      isSuccess: true,
    });

    // Spawn next target immediately
    spawnNextTarget(nextScore);
  }, [currentTarget, combo, score, spawnNextTarget]);

  // Main interaction: Left Click
  const handleTargetLeftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPlaying || isGameOver || !currentTarget) return;

    const expected = currentTarget.expectedClick;

    // 1. If right click was required -> Error!
    if (expected === 'right') {
      handleLoseLife("Aïe ! Tu as fait un Clic Gauche au lieu d'un Clic Droit !");
      return;
    }

    // 2. If left click was required -> Win!
    if (expected === 'left') {
      handleSuccessHit('left');
      return;
    }

    // 3. If double click was required
    if (expected === 'double') {
      const now = Date.now();
      const interval = now - firstClickTimestampRef.current;

      if (firstClickTimestampRef.current > 0 && interval < 450) {
        // Second click fast enough -> Win!
        if (doubleClickTimeoutRef.current) clearTimeout(doubleClickTimeoutRef.current);
        doubleClickTimeoutRef.current = null;
        firstClickTimestampRef.current = 0;
        handleSuccessHit('double');
      } else {
        // First click! Set pending timer
        firstClickTimestampRef.current = now;
        soundManager.playSingleTap();
        setFeedback({
          text: '1er clic ! Re-clique tout de suite ! Clic-Clic !',
        });

        if (doubleClickTimeoutRef.current) clearTimeout(doubleClickTimeoutRef.current);
        doubleClickTimeoutRef.current = setTimeout(() => {
          if (isPlaying && currentTarget?.expectedClick === 'double') {
            handleLoseLife('Trop lent ! Le double-clic demande 2 clics très rapides.');
          }
        }, 450);
      }
    }
  };

  // Main interaction: Right Click
  const handleTargetRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isPlaying || isGameOver || !currentTarget) return;

    const expected = currentTarget.expectedClick;

    if (expected === 'right') {
      handleSuccessHit('right');
    } else if (expected === 'left') {
      handleLoseLife("Aïe ! Tu as fait un Clic Droit au lieu d'un Clic Gauche !");
    } else if (expected === 'double') {
      handleLoseLife("Aïe ! Tu as fait un Clic Droit au lieu d'un Double-Clic Gauche !");
    }
  };

  // Timer tick effect
  useEffect(() => {
    if (!isPlaying || isGameOver || !currentTarget) return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = prev - 80;
        if (next <= 0) {
          handleLoseLife('Temps écoulé ! Réagis plus vite au signal !');
          return 0;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, currentTarget, handleLoseLife]);

  // Start new game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setLives(5);
    setScore(0);
    setCombo(0);
    setIsNewHighScore(false);
    setStats({ left: 0, right: 0, double: 0 });
    setFeedback({ text: 'C\'est parti ! Regarde bien la consigne de chaque cible !' });
    spawnNextTarget(0);
  };

  const progressPct = targetDuration > 0 ? Math.max(0, (timeLeftMs / targetDuration) * 100) : 0;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className={`flex-1 w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden select-none text-white ${
        shake ? 'animate-bounce' : ''
      }`}
    >
      {/* Decorative stars / energy sparkles */}
      <div className="absolute top-8 left-8 text-3xl animate-pulse pointer-events-none opacity-40">⚡</div>
      <div className="absolute top-16 right-12 text-3xl animate-ping pointer-events-none opacity-30">✨</div>
      <div className="absolute bottom-12 left-16 text-3xl pointer-events-none opacity-40">🎮</div>
      <div className="absolute bottom-16 right-20 text-3xl pointer-events-none opacity-40">🏆</div>

      {/* Top Arcade HUD Header */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-3 bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-2xl border-2 border-indigo-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-3xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm">
                  Le Défi Ultime
                </span>
                <span className="text-xs font-bold text-indigo-200">Mode Arcade Réflexe</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300">
                Maître des Clics : Gauche, Droit & Double !
              </h2>
            </div>
          </div>

          {/* Lives (Vies) & High Score Display */}
          <div className="flex items-center gap-3">
            {/* Vies (Hearts) */}
            <div className="flex items-center gap-1 bg-slate-900/80 px-3.5 py-1.5 rounded-2xl border-2 border-rose-500/60 shadow-md">
              <span className="text-xs font-bold text-rose-300 mr-1">Vies :</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform ${
                    i < lives
                      ? 'fill-rose-500 text-rose-500 scale-100 animate-pulse'
                      : 'fill-slate-700 text-slate-600 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>

            {/* Score & Best Score */}
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-1.5 rounded-2xl border-2 border-amber-400/80 shadow-md">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-amber-200">Score</span>
                <span className="text-xl sm:text-2xl font-black text-yellow-300">{score}</span>
              </div>
              <div className="w-px h-8 bg-amber-500/40" />
              <div className="flex flex-col items-center" title="Meilleur score enregistré">
                <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Record
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">{highScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Combo & Progress Timer Bar */}
        {isPlaying && currentTarget && (
          <div className="w-full flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className="text-indigo-200 flex items-center gap-1">
                {combo > 1 && (
                  <span className="text-amber-300 font-black flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-400">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400 animate-bounce" /> Combo ×{combo} !
                  </span>
                )}
                <span>Temps restant</span>
              </span>
              <span className="text-amber-300 font-mono">
                {(timeLeftMs / 1000).toFixed(1)}s
              </span>
            </div>

            {/* Timer Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-indigo-400/50">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  progressPct > 50
                    ? 'bg-emerald-400'
                    : progressPct > 25
                    ? 'bg-amber-400'
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto p-6 sm:p-8 rounded-3xl border-4 border-dashed border-indigo-400/40 bg-slate-900/70 backdrop-blur-md flex flex-col justify-center items-center min-h-[380px]">
        {/* State 1: Start Screen */}
        {!isPlaying && !isGameOver && (
          <div className="flex flex-col items-center text-center max-w-md gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-4xl shadow-xl border-4 border-white animate-bounce">
              ⚡
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
              Le Grand Test Réflexe !
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Chaque cible t'indique quel clic utiliser :
              <br />
              🟡 <strong className="text-amber-300">Clic Gauche</strong> •
              🟣 <strong className="text-purple-300"> Clic Droit</strong> •
              🟢 <strong className="text-emerald-300"> Double-Clic</strong>.
              <br />
              <span className="text-rose-400 font-bold">Attention : 1 mauvais clic = 1 vie perdue !</span>
            </p>

            {highScore > 0 && (
              <div className="bg-amber-400/20 px-4 py-1.5 rounded-full border border-amber-400/60 text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Meilleur score à battre : <span className="font-black text-white">{highScore} pts</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-emerald-300"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Démarrer le Défi Ultime !</span>
            </button>
          </div>
        )}

        {/* State 2: Active Target In Play */}
        {isPlaying && currentTarget && (
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-lg">
            {/* Target Card Button */}
            <div
              onClick={handleTargetLeftClick}
              onContextMenu={handleTargetRightClick}
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-3xl p-6 flex flex-col items-center justify-between shadow-2xl border-4 transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-b ${currentTarget.colorClass} select-none`}
              title="Clique selon la consigne indiquée !"
              role="button"
              tabIndex={0}
            >
              {/* Top Hint Badge */}
              <div className="flex items-center gap-1 bg-black/40 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
                <MousePointer2 className="w-3.5 h-3.5" />
                <span>ACTION DEMANDÉE :</span>
              </div>

              {/* Center Main Icon & Label */}
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-6xl sm:text-7xl filter drop-shadow animate-pulse">
                  {currentTarget.icon}
                </span>
                <span className="text-2xl sm:text-3xl font-black tracking-wider text-center drop-shadow-md">
                  {currentTarget.label}
                </span>
              </div>

              {/* Bottom Instruction */}
              <div className="bg-black/30 text-white px-3 py-1.5 rounded-xl text-xs font-bold text-center leading-tight">
                {currentTarget.shortHint}
              </div>
            </div>

            {/* Visual Mouse Indicator */}
            <div className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-2xl border border-white/20 text-xs font-bold text-slate-200">
              <span>Aide visuelle :</span>
              {currentTarget.expectedClick === 'left' && (
                <span className="text-amber-300 font-black">👈 Bouton GAUCHE (1 seul clic)</span>
              )}
              {currentTarget.expectedClick === 'right' && (
                <span className="text-purple-300 font-black">👉 Bouton DROIT (doigt du milieu)</span>
              )}
              {currentTarget.expectedClick === 'double' && (
                <span className="text-emerald-300 font-black">⚡ Deux clics gauches rapides !</span>
              )}
            </div>
          </div>
        )}

        {/* State 3: Game Over Screen */}
        {isGameOver && (
          <div className="flex flex-col items-center text-center max-w-md gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center text-4xl shadow-xl">
              💔
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-400">
                Partie Terminée !
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Toutes tes vies ont été épuisées, mais tu as super bien joué !
              </p>
            </div>

            {/* New High Score Celebratory Banner */}
            {isNewHighScore && (
              <div className="bg-amber-400 text-slate-950 font-black text-sm px-5 py-2 rounded-2xl shadow-lg border-2 border-amber-300 animate-bounce flex items-center gap-2">
                <Trophy className="w-5 h-5 text-slate-950 fill-amber-300" />
                NOUVEAU RECORD ÉTABLI : {score} POINTS ! 🎉
              </div>
            )}

            {/* Score Summary Box */}
            <div className="w-full bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-sm font-bold border-b border-slate-700 pb-2">
                <span className="text-slate-400">Score final :</span>
                <span className="text-2xl font-black text-yellow-300">{score} pts</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-b border-slate-700 pb-2">
                <span className="text-slate-400">Meilleur score :</span>
                <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4" /> {highScore} pts
                </span>
              </div>
              <div className="flex justify-around text-xs font-semibold text-slate-300 pt-1">
                <span>🟡 Gauche: {stats.left}</span>
                <span>🟣 Droit: {stats.right}</span>
                <span>🟢 Double: {stats.double}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-white"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Rejouer le Défi Ultime !</span>
              </button>

              {onBackToTraining && (
                <button
                  onClick={onBackToTraining}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour aux Épreuves</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Instructional Banner */}
        <div className={`mt-6 px-5 py-2.5 rounded-full shadow-lg border-2 flex items-center gap-2 max-w-[90%] transition-colors ${
          feedback.isError
            ? 'bg-rose-100 border-rose-400 text-rose-950 animate-shake'
            : feedback.isSuccess
            ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
            : 'bg-white/95 border-indigo-400 text-slate-800'
        }`}>
          <span className="text-xl">
            {feedback.isError ? '💔' : feedback.isSuccess ? '✨' : '💡'}
          </span>
          <p className="text-xs sm:text-sm font-bold text-center truncate">
            {feedback.text}
          </p>
        </div>
      </div>
    </div>
  );
};
