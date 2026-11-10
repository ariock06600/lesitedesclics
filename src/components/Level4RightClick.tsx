import React, { useState, useEffect } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { DifficultyLevel, GAME_CATALOG, getNextStep, shuffleArray } from '../game/logic';
import { DifficultySelector } from './DifficultySelector';
import { ArrowRight, RotateCcw, Sparkles, Target, MousePointer2 } from 'lucide-react';

interface Level4RightClickProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  completedDifficulties: DifficultyLevel[];
  onDifficultyComplete: (d: DifficultyLevel) => void;
  onGoToNextGame: () => void;
}

interface ShellData {
  id: number;
  name: string;
  colorName: string;
  badgeColor: string;
  shellColor: string;
  shellInnerColor: string;
  pearlColor: string;
}

const ALL_SHELLS: ShellData[] = [
  { id: 1, name: 'Coquillage Azur Nacre', colorName: 'Bleu Azur', badgeColor: 'bg-sky-500 text-white', shellColor: '#0284c7', shellInnerColor: '#bae6fd', pearlColor: '#f0f9ff' },
  { id: 2, name: 'Coquillage Corail Rose', colorName: 'Rose Corail', badgeColor: 'bg-rose-500 text-white', shellColor: '#e11d48', shellInnerColor: '#fecdd3', pearlColor: '#fff1f2' },
  { id: 3, name: 'Coquillage Émeraude Menthe', colorName: 'Vert Menthe', badgeColor: 'bg-emerald-500 text-white', shellColor: '#059669', shellInnerColor: '#a7f3d0', pearlColor: '#ecfdf5' },
  { id: 4, name: 'Coquillage Ambre Solaire', colorName: 'Jaune Ambre', badgeColor: 'bg-amber-500 text-white', shellColor: '#d97706', shellInnerColor: '#fde68a', pearlColor: '#fffbeb' },
  { id: 5, name: 'Coquillage Violet Mauve', colorName: 'Violet Mauve', badgeColor: 'bg-purple-500 text-white', shellColor: '#7c3aed', shellInnerColor: '#ddd6fe', pearlColor: '#faf5ff' },
  { id: 6, name: 'Coquillage Perle Blanche', colorName: 'Blanc Nacré', badgeColor: 'bg-slate-300 text-slate-900', shellColor: '#64748b', shellInnerColor: '#e2e8f0', pearlColor: '#ffffff' },
  { id: 7, name: 'Coquillage Rubis Cerise', colorName: 'Rouge Rubis', badgeColor: 'bg-red-500 text-white', shellColor: '#b91c1c', shellInnerColor: '#fecaca', pearlColor: '#fff5f5' },
];

export const Level4RightClick: React.FC<Level4RightClickProps> = ({
  difficulty,
  onSelectDifficulty,
  completedDifficulties,
  onDifficultyComplete,
  onGoToNextGame,
}) => {
  const config = GAME_CATALOG[4].difficulties[difficulty];
  const activeShells = ALL_SHELLS.slice(0, config.targetCount);

  const [openedShellIds, setOpenedShellIds] = useState<number[]>([]);
  const [targetOrder, setTargetOrder] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean }>({
    text: 'Fais un clic droit (bouton de droite de ta souris) sur le coquillage demandé !',
  });

  const generateShuffledOrder = () => {
    const ids = activeShells.map((s) => s.id);
    let shuffled = shuffleArray(ids);
    if (shuffled.length > 1 && shuffled.every((id, idx) => id === ids[idx])) {
      shuffled = [...shuffled.slice(1), shuffled[0]];
    }
    return shuffled;
  };

  useEffect(() => {
    setOpenedShellIds([]);
    setTargetOrder(generateShuffledOrder());
    setFeedback({
      text: 'Fais un clic droit (bouton de droite de ta souris) sur le coquillage demandé !',
    });
  }, [difficulty, config.targetCount]);

  const currentTargetId = targetOrder.find((id) => !openedShellIds.includes(id));
  const currentTarget = activeShells.find((s) => s.id === currentTargetId) || null;

  // Intercept left click: gentle educational reminder that right click is required
  const handleLeftClick = (shell: ShellData) => {
    if (openedShellIds.includes(shell.id)) return;
    soundManager.playSingleTap();
    setFeedback({
      text: `Oups ! Tu as fait un Clic Gauche. Utilise le bouton DROIT de ta souris pour ouvrir le ${currentTarget?.name || shell.name} !`,
      isError: true,
    });
  };

  // Right click handler
  const handleRightClick = (e: React.MouseEvent, shell: ShellData) => {
    e.preventDefault();
    e.stopPropagation();

    if (openedShellIds.includes(shell.id)) return;

    if (!currentTarget) return;

    if (shell.id !== currentTarget.id) {
      soundManager.playSingleTap();
      setFeedback({
        text: `Attention ! C'est le ${shell.name}. Fais un clic droit sur le ${currentTarget.name} !`,
        isError: true,
      });
      return;
    }

    // Success! Right click on matching shell
    const newOpened = [...openedShellIds, shell.id];
    setOpenedShellIds(newOpened);
    soundManager.playRightClickPop();

    if (newOpened.length === activeShells.length) {
      setFeedback({ text: `Gagné ! Toutes les perles ont été récoltées grâce au clic droit !` });
      onDifficultyComplete(difficulty);
      soundManager.playLevelSuccess();
      confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.45, 65);
    } else {
      const nextTargetId = targetOrder.find((id) => !newOpened.includes(id));
      const nextTarget = activeShells.find((s) => s.id === nextTargetId) || null;
      setFeedback({
        text: `Magnifique perle trouvée ! Maintenant, fais un clic droit sur le ${nextTarget?.name} !`,
      });
    }
  };

  const resetShells = () => {
    setOpenedShellIds([]);
    setTargetOrder(generateShuffledOrder());
    setFeedback({
      text: 'Fais un clic droit (bouton de droite de ta souris) sur le coquillage demandé !',
    });
  };

  const isComplete = openedShellIds.length === activeShells.length;

  const handleNextAction = () => {
    const step = getNextStep(4, difficulty);
    if (step.nextGame === 4) {
      onSelectDifficulty(step.nextDifficulty);
    } else {
      onGoToNextGame();
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="flex-1 w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-teal-900 via-cyan-950 to-slate-900 relative overflow-hidden select-none text-white"
    >
      <div className="absolute top-8 left-10 text-3xl animate-pulse pointer-events-none opacity-60">🫧</div>
      <div className="absolute top-20 right-16 text-3xl animate-bounce pointer-events-none opacity-50">🐠</div>
      <div className="absolute bottom-12 left-20 text-4xl pointer-events-none opacity-50">🌊</div>

      {/* Header Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-3 bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-teal-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/30 flex items-center justify-center text-3xl shadow-inner border border-teal-400">
              🐚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500 text-white shadow-sm">
                  Jeu 4 : Le Clic Droit
                </span>
                <span className="text-xs font-bold text-teal-200">Doigt du milieu / bouton droit !</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300">
                Ouvre le coquillage avec un Clic Droit
              </h2>
              <p className="text-xs sm:text-sm text-teal-200 font-medium">
                {config.difficultyName} : {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Visual Mouse Icon Guide */}
            <div className="hidden md:flex items-center gap-2 bg-teal-950/70 px-3 py-1.5 rounded-2xl border border-teal-400/50 text-xs">
              <svg viewBox="0 0 32 44" className="w-6 h-8 filter drop-shadow">
                {/* Mouse body */}
                <rect x="2" y="2" width="28" height="40" rx="14" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                {/* Left button */}
                <path d="M 3 16 L 3 14 A 13 13 0 0 1 15 2 L 15 16 Z" fill="#475569" stroke="#64748b" strokeWidth="1" />
                {/* Right button (Highlighted in vibrant pink/cyan with glow) */}
                <path d="M 17 2 A 13 13 0 0 1 29 14 L 29 16 L 17 16 Z" fill="#06b6d4" stroke="#67e8f9" strokeWidth="2" className="animate-pulse" />
                {/* Center wheel */}
                <rect x="14" y="8" width="4" height="8" rx="2" fill="#cbd5e1" />
              </svg>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-teal-300 font-bold">Bouton à utiliser :</span>
                <span className="font-black text-cyan-300">Clic Droit 👉</span>
              </div>
            </div>

            <div className="flex flex-col items-center bg-teal-950/80 px-4 py-2 rounded-2xl border-2 border-teal-400 shadow-sm">
              <span className="text-xs font-bold text-teal-300">Perles</span>
              <span className="text-2xl font-black text-amber-400">
                {openedShellIds.length} <span className="text-base text-teal-300 font-bold">/ {activeShells.length}</span>
              </span>
            </div>

            <button
              onClick={resetShells}
              className="p-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 cursor-pointer transition-colors shadow-sm"
              title="Recommencer ce niveau"
              aria-label="Recommencer ce niveau"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Level Difficulty Selector */}
        <DifficultySelector
          gameId={4}
          currentDifficulty={difficulty}
          completedDifficulties={completedDifficulties}
          onSelectDifficulty={onSelectDifficulty}
        />

        {/* Active Target Banner */}
        {currentTarget && !isComplete && (
          <div className="w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 text-white px-5 py-2.5 rounded-2xl shadow-md border border-teal-400/50 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-300 animate-spin [animation-duration:10s]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-200">
                Coquillage cible :
              </span>
              <span className={`text-base sm:text-lg font-black px-3 py-0.5 rounded-xl shadow-sm ${currentTarget.badgeColor}`}>
                {currentTarget.name} ({currentTarget.colorName})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-200">
              <MousePointer2 className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline">Clic droit dessus !</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Shells Stage */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-2 p-4 sm:p-6 rounded-3xl border-4 border-dashed border-teal-400/40 bg-teal-950/40 backdrop-blur-sm flex flex-col justify-center items-center">
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 w-full max-w-4xl">
          {activeShells.map((shell) => {
            const isOpened = openedShellIds.includes(shell.id);
            const isTarget = currentTarget?.id === shell.id;
            const isMoving = config.isMoving;

            const sizeClass = difficulty <= 2
              ? 'w-32 h-28 sm:w-36 sm:h-32'
              : 'w-28 h-26 sm:w-30 sm:h-28';

            return (
              <div
                key={shell.id}
                onClick={() => handleLeftClick(shell)}
                onContextMenu={(e) => handleRightClick(e, shell)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl transition-all duration-300 cursor-context-menu select-none ${
                  isMoving && !isOpened ? 'animate-bounce [animation-duration:3.2s]' : ''
                } ${
                  isOpened
                    ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg scale-100'
                    : isTarget
                    ? 'bg-teal-800/80 border-3 border-cyan-300 ring-2 ring-cyan-400/60 scale-105 shadow-xl shadow-cyan-900/50'
                    : 'bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:scale-105 active:scale-95 shadow-md'
                }`}
                title={`Fais un clic droit sur le ${shell.name}`}
                role="button"
                tabIndex={0}
                aria-label={shell.name}
              >
                {/* Pearl sparkle when opened */}
                {isOpened && (
                  <div className="absolute -top-7 inset-x-0 flex justify-center items-center gap-1 animate-bounce">
                    <span className="text-xl filter drop-shadow">🫧</span>
                    <span className="text-2xl filter drop-shadow">✨</span>
                    <span className="text-xl filter drop-shadow">🫧</span>
                  </div>
                )}

                <div className={`relative ${sizeClass} flex items-center justify-center`}>
                  <svg viewBox="0 0 120 100" className="w-full h-full filter drop-shadow-lg">
                    {isOpened ? (
                      <>
                        {/* Open Shell Top Half */}
                        <path d="M 20 50 Q 60 5 100 50 Q 60 20 20 50 Z" fill={shell.shellColor} stroke="#e2e8f0" strokeWidth="2" opacity="0.9" />
                        {/* Open Shell Bottom Base */}
                        <path d="M 15 50 Q 60 10 105 50 Q 60 90 15 50 Z" fill={shell.shellInnerColor} stroke={shell.shellColor} strokeWidth="3" />
                        {/* Ribs */}
                        <path d="M 60 85 Q 60 65 60 52" stroke={shell.shellColor} strokeWidth="2" strokeDasharray="2,2" />
                        <path d="M 35 75 Q 45 60 52 50" stroke={shell.shellColor} strokeWidth="2" strokeDasharray="2,2" />
                        <path d="M 85 75 Q 75 60 68 50" stroke={shell.shellColor} strokeWidth="2" strokeDasharray="2,2" />
                        {/* Glowing Golden Pearl in the center */}
                        <circle cx="60" cy="52" r="14" fill={shell.pearlColor} stroke="#fde047" strokeWidth="3" className="animate-pulse" />
                        <ellipse cx="56" cy="48" rx="4" ry="2" fill="#ffffff" opacity="0.8" />
                      </>
                    ) : (
                      <>
                        {/* Closed Clam Shell */}
                        <path d="M 15 65 Q 60 10 105 65 Q 60 85 15 65 Z" fill={shell.shellColor} stroke="#ffffff" strokeWidth="3" />
                        {/* Shell flutes / ridges */}
                        <path d="M 60 80 Q 60 45 60 14" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                        <path d="M 40 76 Q 42 45 35 25" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                        <path d="M 80 76 Q 78 45 85 25" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                        <path d="M 25 70 Q 30 50 20 38" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
                        <path d="M 95 70 Q 90 50 100 38" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
                      </>
                    )}
                  </svg>
                </div>

                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 text-teal-200">
                  {shell.name}
                </span>

                <div className="mt-0.5">
                  {isOpened ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/40">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Perle trouvée !
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/30">
                      {shell.colorName}
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
            ? 'bg-rose-100 border-rose-400 text-rose-950'
            : 'bg-white/95 border-teal-400 text-slate-800'
        }`}>
          <span className="text-xl">{feedback.isError ? '💡' : '🐚'}</span>
          <p className="text-xs sm:text-sm font-bold text-center truncate">
            {feedback.text}
          </p>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="relative z-20 max-w-xl mx-auto w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-4 border-white animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/40 flex items-center justify-center text-2xl">
              🌟
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                {config.difficultyName} ({config.badge}) Réussi !
              </h3>
              <p className="text-xs text-slate-900 font-semibold">
                {difficulty < 5
                  ? `Prêt pour le défi ${difficulty + 1} du clic droit ?`
                  : 'Tous les niveaux du clic droit sont validés !'}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextAction}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-cyan-300 font-black text-sm sm:text-base shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{difficulty < 5 ? `Passer au Niveau ${difficulty + 1}` : 'Passer au Glisser-Déposer 🧩'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
