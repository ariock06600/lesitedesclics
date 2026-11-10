import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { DifficultyLevel, GAME_CATALOG, evaluateDoubleClick, getNextStep, shuffleArray } from '../game/logic';
import { DifficultySelector } from './DifficultySelector';
import { ArrowRight, RotateCcw, Sparkles, Target } from 'lucide-react';

interface Level3DoubleClickProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  completedDifficulties: DifficultyLevel[];
  onDifficultyComplete: (d: DifficultyLevel) => void;
  onGoToNextGame: () => void;
}

interface ChestData {
  id: number;
  name: string;
  colorName: string;
  badgeColor: string;
  lidColor: string;
  woodColor: string;
}

const ALL_CHESTS: ChestData[] = [
  { id: 1, name: 'Coffre d\'Or Jaune', colorName: 'Jaune Doré', badgeColor: 'bg-yellow-400 text-yellow-950', lidColor: '#b45309', woodColor: '#78350f' },
  { id: 2, name: 'Coffre Pourpre Violet', colorName: 'Violet Pourpre', badgeColor: 'bg-purple-500 text-white', lidColor: '#7e22ce', woodColor: '#581c87' },
  { id: 3, name: 'Coffre Saphir Bleu', colorName: 'Bleu Saphir', badgeColor: 'bg-sky-500 text-white', lidColor: '#0284c7', woodColor: '#0369a1' },
  { id: 4, name: 'Coffre Émeraude Vert', colorName: 'Vert Émeraude', badgeColor: 'bg-emerald-500 text-white', lidColor: '#16a34a', woodColor: '#14532d' },
  { id: 5, name: 'Coffre Rubis Rouge', colorName: 'Rouge Rubis', badgeColor: 'bg-red-500 text-white', lidColor: '#dc2626', woodColor: '#991b1b' },
  { id: 6, name: 'Coffre Diamant Cyan', colorName: 'Cyan Céleste', badgeColor: 'bg-cyan-400 text-cyan-950', lidColor: '#06b6d4', woodColor: '#0e7490' },
  { id: 7, name: 'Coffre Ambre Orange', colorName: 'Orange Solaire', badgeColor: 'bg-orange-500 text-white', lidColor: '#d97706', woodColor: '#92400e' },
];

export const Level3DoubleClick: React.FC<Level3DoubleClickProps> = ({
  difficulty,
  onSelectDifficulty,
  completedDifficulties,
  onDifficultyComplete,
  onGoToNextGame,
}) => {
  const config = GAME_CATALOG[3].difficulties[difficulty];
  const maxIntervalMs = config.clickIntervalMs || 500;
  const activeChests = ALL_CHESTS.slice(0, config.targetCount);

  const [openedChestIds, setOpenedChestIds] = useState<number[]>([]);
  const [pendingChestId, setPendingChestId] = useState<number | null>(null);
  const [targetOrder, setTargetOrder] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean }>({
    text: 'Double-clique sur le coffre de la couleur demandée !',
  });

  const lastClickRef = useRef<{ id: number; time: number }>({ id: 0, time: 0 });
  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate scrambled/random order of chest colors so they are NEVER requested sequentially
  const generateShuffledTargetOrder = () => {
    const ids = activeChests.map((c) => c.id);
    let shuffled = shuffleArray(ids);
    if (shuffled.length > 1 && shuffled.every((id, idx) => id === ids[idx])) {
      shuffled = [...shuffled.slice(1), shuffled[0]];
    }
    return shuffled;
  };

  useEffect(() => {
    setOpenedChestIds([]);
    setPendingChestId(null);
    lastClickRef.current = { id: 0, time: 0 };
    setTargetOrder(generateShuffledTargetOrder());
    setFeedback({ text: 'Double-clique sur le coffre de la couleur demandée !' });
  }, [difficulty, config.targetCount]);

  // Target chest to open from the scrambled sequence
  const currentTargetId = targetOrder.find((id) => !openedChestIds.includes(id));
  const currentTarget = activeChests.find((c) => c.id === currentTargetId) || null;

  const handleChestInteract = (chest: ChestData) => {
    if (openedChestIds.includes(chest.id)) return;

    if (!currentTarget) return;

    // Check if clicked chest matches target
    if (chest.id !== currentTarget.id) {
      soundManager.playSingleTap();
      setFeedback({
        text: `Attention ! C'est le ${chest.name}. Trouve et ouvre le ${currentTarget.name} !`,
        isError: true,
      });
      return;
    }

    const now = Date.now();
    const isSameChest = lastClickRef.current.id === chest.id;
    const { isDoubleClick } = evaluateDoubleClick(
      isSameChest ? lastClickRef.current.time : 0,
      now,
      maxIntervalMs
    );

    if (isDoubleClick) {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      setPendingChestId(null);
      lastClickRef.current = { id: 0, time: 0 };

      const newOpened = [...openedChestIds, chest.id];
      setOpenedChestIds(newOpened);
      soundManager.playChestUnlock();

      if (newOpened.length === activeChests.length) {
        setFeedback({ text: `Gagné ! Tous les coffres ont été ouverts avec succès !` });
        onDifficultyComplete(difficulty);
        soundManager.playLevelSuccess();
        confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.45, 65);
      } else {
        const nextTargetId = targetOrder.find((id) => !newOpened.includes(id));
        const nextTarget = activeChests.find((c) => c.id === nextTargetId) || null;
        setFeedback({ text: `Superbe ! Le ${chest.name} s'est ouvert ! Maintenant, trouve le ${nextTarget?.name} !` });
      }
    } else {
      lastClickRef.current = { id: chest.id, time: now };
      setPendingChestId(chest.id);
      setFeedback({ text: '1er clic ! Re-clique très vite sur ce coffre ! Clic-clic !' });
      soundManager.playSingleTap();

      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = setTimeout(() => {
        setPendingChestId(null);
        setFeedback({ text: 'Trop lent ! Pense au rythme vif : un-deux très rapide !' });
      }, maxIntervalMs);
    }
  };

  const resetChests = () => {
    setOpenedChestIds([]);
    setPendingChestId(null);
    lastClickRef.current = { id: 0, time: 0 };
    setTargetOrder(generateShuffledTargetOrder());
    setFeedback({ text: 'Double-clique sur le coffre de la couleur demandée !' });
  };

  const isComplete = openedChestIds.length === activeChests.length;

  const handleNextAction = () => {
    const step = getNextStep(3, difficulty);
    if (step.nextGame === 3) {
      onSelectDifficulty(step.nextDifficulty);
    } else {
      onGoToNextGame();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden select-none text-white">
      <div className="absolute top-6 left-12 text-2xl animate-pulse pointer-events-none opacity-70">✨</div>
      <div className="absolute top-16 right-20 text-3xl animate-ping pointer-events-none opacity-40">⭐</div>
      <div className="absolute bottom-16 left-24 text-2xl pointer-events-none opacity-60">💎</div>

      {/* Header Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-3 bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-purple-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/30 flex items-center justify-center text-3xl shadow-inner border border-purple-400">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500 text-white shadow-sm">
                  Jeu 3 : Le Double-Clic Guidé
                </span>
                <span className="text-xs font-bold text-purple-200">Rythme : Clic-Clic !</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300">
                Ouvre le coffre de la couleur demandée
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 font-medium">
                {config.difficultyName} : {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-purple-950/80 px-4 py-2 rounded-2xl border-2 border-purple-400 shadow-sm">
              <span className="text-xs font-bold text-purple-300">Ouverts</span>
              <span className="text-2xl font-black text-amber-400">
                {openedChestIds.length} <span className="text-base text-purple-300 font-bold">/ {activeChests.length}</span>
              </span>
            </div>

            <button
              onClick={resetChests}
              className="p-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-purple-100 cursor-pointer transition-colors shadow-sm"
              title="Recommencer ce niveau"
              aria-label="Recommencer ce niveau"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Level Difficulty Selector */}
        <DifficultySelector
          gameId={3}
          currentDifficulty={difficulty}
          completedDifficulties={completedDifficulties}
          onSelectDifficulty={onSelectDifficulty}
        />

        {/* Active Target Banner: Which chest color to double-click right now */}
        {currentTarget && !isComplete && (
          <div className="w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white px-5 py-2.5 rounded-2xl shadow-md border border-purple-400/50 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-300 animate-spin [animation-duration:10s]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
                Coffre à ouvrir :
              </span>
              <span className={`text-base sm:text-lg font-black px-3 py-0.5 rounded-xl shadow-sm ${currentTarget.badgeColor}`}>
                {currentTarget.name} ({currentTarget.colorName})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
              <span className="hidden sm:inline">Double-clique vite dessus !</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Chests Stage */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-2 p-4 sm:p-6 rounded-3xl border-4 border-dashed border-purple-400/40 bg-purple-950/40 backdrop-blur-sm flex flex-col justify-center items-center">
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 w-full max-w-4xl">
          {activeChests.map((chest) => {
            const isOpened = openedChestIds.includes(chest.id);
            const isPending = pendingChestId === chest.id;
            const isTarget = currentTarget?.id === chest.id;
            const isMoving = config.isMoving;

            const sizeClass = difficulty <= 2
              ? 'w-32 h-28 sm:w-36 sm:h-32'
              : 'w-28 h-26 sm:w-30 sm:h-28';

            return (
              <div
                key={chest.id}
                onClick={() => handleChestInteract(chest)}
                onDoubleClick={() => handleChestInteract(chest)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl transition-all duration-300 cursor-pointer select-none ${
                  isMoving && !isOpened ? 'animate-bounce [animation-duration:3s]' : ''
                } ${
                  isOpened
                    ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg scale-100'
                    : isPending
                    ? 'bg-yellow-400/30 border-3 border-yellow-300 scale-105 animate-pulse shadow-yellow-500/50 shadow-xl'
                    : isTarget
                    ? 'bg-purple-800/60 border-3 border-yellow-300 ring-2 ring-yellow-400/50 scale-105 shadow-xl'
                    : 'bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:scale-105 active:scale-95 shadow-md'
                }`}
                title={`Coffre ${chest.name}`}
                role="button"
                tabIndex={0}
                aria-label={`Coffre ${chest.name}`}
              >
                {/* Floating stars eruption when opened */}
                {isOpened && (
                  <div className="absolute -top-7 inset-x-0 flex justify-center items-center gap-1 animate-bounce">
                    <span className="text-xl filter drop-shadow">⭐</span>
                    <span className="text-2xl filter drop-shadow">🌟</span>
                    <span className="text-xl filter drop-shadow">⭐</span>
                  </div>
                )}

                <div className={`relative ${sizeClass} flex items-center justify-center`}>
                  <svg viewBox="0 0 120 100" className="w-full h-full filter drop-shadow-lg">
                    {isOpened ? (
                      <>
                        <polygon points="60,25 20,0 100,0" fill="#fef08a" opacity="0.4" className="animate-pulse" />
                        <path d="M 15 25 L 105 25 L 95 6 Q 60 0 25 6 Z" fill={chest.lidColor} stroke="#fbbf24" strokeWidth="2.5" />
                        <ellipse cx="60" cy="38" rx="42" ry="14" fill="#f59e0b" />
                        <circle cx="50" cy="36" r="5" fill="#ef4444" />
                        <circle cx="65" cy="34" r="6" fill="#3b82f6" />
                        <circle cx="78" cy="37" r="4.5" fill="#10b981" />
                      </>
                    ) : (
                      <>
                        <path d="M 15 45 Q 60 16 105 45 L 105 35 Q 60 6 15 35 Z" fill={chest.lidColor} stroke="#fbbf24" strokeWidth="2.5" />
                        <rect x="52" y="38" width="16" height="18" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <circle cx="60" cy="45" r="2.5" fill="#78350f" />
                      </>
                    )}
                    <path d="M 18 42 L 102 42 L 96 90 L 24 90 Z" fill={chest.woodColor} stroke="#d97706" strokeWidth="2.5" />
                    <line x1="34" y1="42" x2="38" y2="90" stroke="#fbbf24" strokeWidth="4" />
                    <line x1="86" y1="42" x2="82" y2="90" stroke="#fbbf24" strokeWidth="4" />
                  </svg>

                  {isPending && (
                    <div className="absolute -top-3 bg-yellow-400 text-slate-900 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-yellow-200 animate-bounce">
                      Vite, 2ᵉ clic !
                    </div>
                  )}
                </div>

                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 text-amber-200">
                  {chest.name}
                </span>

                <div className="mt-0.5">
                  {isOpened ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/40">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Ouvert !
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-purple-200 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
                      {chest.colorName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Instructional Banner */}
        <div className={`mt-4 px-5 py-2.5 rounded-full shadow-lg border-2 flex items-center gap-2 max-w-[90%] transition-colors ${
          feedback.isError
            ? 'bg-orange-100 border-orange-400 text-orange-950'
            : 'bg-white/95 border-yellow-400 text-slate-800'
        }`}>
          <span className="text-xl animate-spin [animation-duration:12s]">{feedback.isError ? '👀' : '✨'}</span>
          <p className="text-xs sm:text-sm font-bold text-center truncate">
            {feedback.text}
          </p>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="relative z-20 max-w-xl mx-auto w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-4 border-white animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/40 flex items-center justify-center text-2xl">
              🌟
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                {config.difficultyName} ({config.badge}) Validé !
              </h3>
              <p className="text-xs text-slate-900 font-semibold">
                {difficulty < 5
                  ? `Prêt pour le défi ${difficulty + 1} des coffres ?`
                  : 'Tous les niveaux du double-clic sont terminés !'}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextAction}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-amber-300 font-black text-sm sm:text-base shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{difficulty < 5 ? `Passer au Niveau ${difficulty + 1}` : 'Passer au Clic Droit 🐚'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
