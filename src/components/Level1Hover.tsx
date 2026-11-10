import React, { useState, useEffect } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { DifficultyLevel, GAME_CATALOG, getNextStep, getNextTargetItem } from '../game/logic';
import { DifficultySelector } from './DifficultySelector';
import { ArrowRight, RotateCcw, Target } from 'lucide-react';

interface Level1HoverProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  completedDifficulties: DifficultyLevel[];
  onDifficultyComplete: (d: DifficultyLevel) => void;
  onGoToNextGame: () => void;
}

interface ButterflyData {
  id: number;
  name: string;
  top: string;
  left: string;
  wingColorA: string;
  wingColorB: string;
  bodyColor: string;
  isFirefly?: boolean;
}

const ALL_BUTTERFLIES: ButterflyData[] = [
  { id: 1, name: 'Azur', top: '22%', left: '16%', wingColorA: '#38bdf8', wingColorB: '#0284c7', bodyColor: '#0369a1' },
  { id: 2, name: 'Émeraude', top: '50%', left: '26%', wingColorA: '#4ade80', wingColorB: '#16a34a', bodyColor: '#15803d' },
  { id: 3, name: 'Soleil', top: '20%', left: '50%', wingColorA: '#facc15', wingColorB: '#ca8a04', bodyColor: '#a16207' },
  { id: 4, name: 'Rubis', top: '52%', left: '74%', wingColorA: '#f87171', wingColorB: '#dc2626', bodyColor: '#b91c1c' },
  { id: 5, name: 'Améthyste', top: '28%', left: '80%', wingColorA: '#c084fc', wingColorB: '#9333ea', bodyColor: '#7e22ce' },
  { id: 6, name: 'Bonbon', top: '65%', left: '48%', wingColorA: '#f472b6', wingColorB: '#db2777', bodyColor: '#be185d' },
  { id: 7, name: 'Menthe', top: '35%', left: '35%', wingColorA: '#2dd4bf', wingColorB: '#0f766e', bodyColor: '#115e59' },
  { id: 8, name: 'Mandarine', top: '68%', left: '20%', wingColorA: '#fb923c', wingColorB: '#ea580c', bodyColor: '#c2410c' },
  { id: 9, name: 'Lilas', top: '38%', left: '64%', wingColorA: '#e879f9', wingColorB: '#c026d3', bodyColor: '#a21caf' },
  { id: 10, name: 'Saphir Royal', top: '15%', left: '32%', wingColorA: '#60a5fa', wingColorB: '#2563eb', bodyColor: '#1d4ed8' },
  { id: 11, name: 'Luciole Dorée', top: '72%', left: '78%', wingColorA: '#fde047', wingColorB: '#eab308', bodyColor: '#854d0e', isFirefly: true },
  { id: 12, name: 'Luciole Stellaire', top: '15%', left: '68%', wingColorA: '#67e8f9', wingColorB: '#06b6d4', bodyColor: '#0e7490', isFirefly: true },
];

export const Level1Hover: React.FC<Level1HoverProps> = ({
  difficulty,
  onSelectDifficulty,
  completedDifficulties,
  onDifficultyComplete,
  onGoToNextGame,
}) => {
  const config = GAME_CATALOG[1].difficulties[difficulty];
  const activeButterflies = ALL_BUTTERFLIES.slice(0, config.targetCount);

  const [flownIds, setFlownIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean }>({
    text: 'Passe ta souris sur le papillon demandé !',
  });

  // Calculate current target butterfly that the child must locate and hover
  const currentTarget = getNextTargetItem(activeButterflies, flownIds);

  useEffect(() => {
    setFlownIds([]);
    setFeedback({ text: 'Passe ta souris sur le papillon demandé !' });
  }, [difficulty]);

  const handleHover = (b: ButterflyData) => {
    if (flownIds.includes(b.id)) return;

    if (!currentTarget) return;

    // Check if child hovered the requested butterfly
    if (b.id === currentTarget.id) {
      const newFlown = [...flownIds, b.id];
      setFlownIds(newFlown);
      soundManager.playHoverChime(newFlown.length - 1);

      if (newFlown.length === activeButterflies.length) {
        setFeedback({ text: `Génial ! Tous les papillons se sont envolés !` });
        onDifficultyComplete(difficulty);
        soundManager.playLevelSuccess();
        confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.4, 60);
      } else {
        const next = getNextTargetItem(activeButterflies, newFlown);
        setFeedback({ text: `Bravo ! ${b.name} s'envole ! Maintenant, trouve ${next?.name} !` });
      }
    } else {
      // Hovered the wrong butterfly: gentle didactic prompt
      soundManager.playSingleTap();
      setFeedback({
        text: `Oups, c'est le papillon ${b.name} ! Vole vers le papillon ${currentTarget.name} !`,
        isError: true,
      });
    }
  };

  const resetLevel = () => {
    setFlownIds([]);
    setFeedback({ text: 'Passe ta souris sur le papillon demandé !' });
  };

  const isFinished = flownIds.length === activeButterflies.length;

  const handleNextAction = () => {
    const step = getNextStep(1, difficulty);
    if (step.nextGame === 1) {
      onSelectDifficulty(step.nextDifficulty);
    } else {
      onGoToNextGame();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 relative overflow-hidden select-none">
      <div className="absolute top-4 left-10 text-white/70 text-6xl animate-pulse pointer-events-none">☁️</div>
      <div className="absolute top-12 right-24 text-white/60 text-5xl pointer-events-none">☁️</div>
      <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-emerald-400 via-emerald-300 to-transparent rounded-t-[100px] pointer-events-none" />

      {/* Level Header / Objective Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-md border-2 border-amber-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-3xl shadow-inner border border-sky-300">
              🦋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500 text-white shadow-sm">
                  Jeu 1 : Le Survol Guidé
                </span>
                <span className="text-xs font-bold text-sky-800">Pas besoin de cliquer !</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-800">
                Survole le bon papillon demandé
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {config.difficultyName} : {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-amber-50 px-4 py-2 rounded-2xl border-2 border-amber-300 shadow-sm">
              <span className="text-xs font-bold text-amber-800">Trouvés</span>
              <span className="text-2xl font-black text-amber-600">
                {flownIds.length} <span className="text-base text-amber-400 font-bold">/ {activeButterflies.length}</span>
              </span>
            </div>

            <button
              onClick={resetLevel}
              className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer transition-colors shadow-sm"
              title="Recommencer ce niveau"
              aria-label="Recommencer ce niveau"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Level Difficulty Selector */}
        <DifficultySelector
          gameId={1}
          currentDifficulty={difficulty}
          completedDifficulties={completedDifficulties}
          onSelectDifficulty={onSelectDifficulty}
        />

        {/* Active Target Banner: Which butterfly to hover right now */}
        {currentTarget && !isFinished && (
          <div className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 text-white px-5 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-300 animate-spin [animation-duration:10s]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-100">
                Papillon à survoler :
              </span>
              <span className="text-base sm:text-xl font-black text-yellow-200 bg-white/20 px-3 py-0.5 rounded-xl border border-white/30">
                {currentTarget.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-100">
              <span
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm inline-block"
                style={{ backgroundColor: currentTarget.wingColorA }}
              />
              <span className="hidden sm:inline">Survole-le sans cliquer !</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Play Area with Butterflies */}
      <div className="relative z-10 w-full max-w-5xl mx-auto h-[460px] sm:h-[490px] my-2 rounded-3xl border-4 border-dashed border-sky-300/60 bg-sky-50/40 relative overflow-hidden backdrop-blur-[2px]">
        {/* Grass decorations */}
        <div className="absolute bottom-2 left-6 text-3xl opacity-80 pointer-events-none">🌸</div>
        <div className="absolute bottom-4 left-1/4 text-4xl opacity-80 pointer-events-none">🌷</div>
        <div className="absolute bottom-2 left-1/2 text-3xl opacity-80 pointer-events-none">🌼</div>
        <div className="absolute bottom-3 right-1/4 text-4xl opacity-80 pointer-events-none">🌻</div>
        <div className="absolute bottom-2 right-8 text-3xl opacity-80 pointer-events-none">🌺</div>

        {activeButterflies.map((b) => {
          const isFlown = flownIds.includes(b.id);
          const isTarget = currentTarget?.id === b.id;
          const isMoving = config.isMoving;

          const sizeClass = difficulty === 1
            ? 'w-28 h-28 sm:w-32 sm:h-32'
            : difficulty <= 3
            ? 'w-24 h-24 sm:w-28 sm:h-28'
            : 'w-20 h-20 sm:w-24 sm:h-24';

          return (
            <div
              key={b.id}
              onMouseEnter={() => handleHover(b)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out cursor-pointer group ${
                isMoving && !isFlown ? 'animate-bounce [animation-duration:3s]' : ''
              }`}
              style={{
                top: isFlown ? '-10%' : b.top,
                left: isFlown ? `calc(${b.left} + 15%)` : b.left,
                opacity: isFlown ? 0 : 1,
                pointerEvents: isFlown ? 'none' : 'auto',
                transform: isFlown ? 'scale(1.3) rotate(25deg)' : 'scale(1)',
              }}
              title={`Papillon ${b.name}`}
            >
              {!isFlown && (
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xl filter drop-shadow-sm pointer-events-none">
                  {b.isFirefly ? '✨' : '🌿'}
                </div>
              )}

              <div className={`relative ${sizeClass} flex items-center justify-center filter drop-shadow-md group-hover:scale-125 transition-transform duration-300`}>
                <svg viewBox="0 0 100 100" className="w-full h-full transform transition-all duration-300">
                  {b.isFirefly ? (
                    <>
                      <circle cx="50" cy="50" r="30" fill={b.wingColorA} opacity="0.4" className="animate-ping" />
                      <circle cx="50" cy="50" r="18" fill={b.wingColorA} />
                      <circle cx="50" cy="50" r="10" fill="#ffffff" />
                      <ellipse cx="38" cy="40" rx="10" ry="5" fill="#ffffff" opacity="0.8" transform="rotate(-30 38 40)" />
                      <ellipse cx="62" cy="40" rx="10" ry="5" fill="#ffffff" opacity="0.8" transform="rotate(30 62 40)" />
                    </>
                  ) : (
                    <>
                      <path d="M 50 48 C 30 15, 10 20, 15 45 C 18 55, 35 55, 50 50 Z" fill={b.wingColorA} />
                      <path d="M 50 52 C 25 55, 20 80, 35 85 C 45 88, 48 70, 50 54 Z" fill={b.wingColorB} />
                      <path d="M 50 48 C 70 15, 90 20, 85 45 C 82 55, 65 55, 50 50 Z" fill={b.wingColorA} />
                      <path d="M 50 52 C 75 55, 80 80, 65 85 C 55 88, 52 70, 50 54 Z" fill={b.wingColorB} />
                      <circle cx="32" cy="36" r="4" fill="#ffffff" opacity="0.85" />
                      <circle cx="68" cy="36" r="4" fill="#ffffff" opacity="0.85" />
                      <circle cx="36" cy="68" r="3" fill="#ffffff" opacity="0.75" />
                      <circle cx="64" cy="68" r="3" fill="#ffffff" opacity="0.75" />
                      <ellipse cx="50" cy="52" rx="4" ry="18" fill={b.bodyColor} />
                      <circle cx="50" cy="32" r="5" fill={b.bodyColor} />
                      <path d="M 48 30 Q 42 16 38 18 M 52 30 Q 58 16 62 18" stroke={b.bodyColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                    </>
                  )}
                </svg>

                {/* Gentle pulse ring if this is the target butterfly */}
                {isTarget && !isFlown && (
                  <div className="absolute inset-0 rounded-full border-3 border-sky-400 animate-ping opacity-60 pointer-events-none" />
                )}
              </div>

              {/* Butterfly name label */}
              <div className={`text-center font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm mt-0.5 transition-all ${
                isTarget
                  ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 scale-105'
                  : 'bg-white/90 text-sky-900 border border-sky-200'
              }`}>
                {b.name}
              </div>
            </div>
          );
        })}

        {/* Dynamic educational feedback bubble */}
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-5 py-2.5 rounded-full shadow-lg border-2 flex items-center gap-2 max-w-[90%] transition-colors ${
          feedback.isError
            ? 'bg-orange-50 border-orange-400 text-orange-950'
            : 'bg-white/95 border-sky-400 text-slate-700'
        }`}>
          <span className="text-xl animate-bounce">{feedback.isError ? '👀' : '💡'}</span>
          <span className="text-xs sm:text-sm font-bold truncate">
            {feedback.text}
          </span>
        </div>
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="relative z-20 max-w-xl mx-auto w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-4 border-white animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🎉
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                {config.difficultyName} ({config.badge}) Réussi !
              </h3>
              <p className="text-xs text-emerald-100 font-semibold">
                {difficulty < 5
                  ? `Prêt pour la difficulté ${difficulty + 1} ?`
                  : 'Tu as terminé tous les niveaux du Survol !'}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextAction}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-black text-sm sm:text-base shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{difficulty < 5 ? `Passer au Niveau ${difficulty + 1}` : 'Passer au Clic Gauche'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
