import React, { useState, useEffect } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { DifficultyLevel, GAME_CATALOG, getNextStep, getNextTargetItem } from '../game/logic';
import { DifficultySelector } from './DifficultySelector';
import { ArrowRight, RotateCcw, MousePointerClick, Target } from 'lucide-react';

interface Level2ClickProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  completedDifficulties: DifficultyLevel[];
  onDifficultyComplete: (d: DifficultyLevel) => void;
  onGoToNextGame: () => void;
}

interface FruitItem {
  id: number;
  name: string;
  emoji: string;
  top: string;
  left: string;
}

const ALL_FRUITS: FruitItem[] = [
  { id: 1, name: 'Pomme Rouge', emoji: '🍎', top: '22%', left: '22%' },
  { id: 2, name: 'Poire Dorée', emoji: '🍐', top: '34%', left: '38%' },
  { id: 3, name: 'Orange Solaire', emoji: '🍊', top: '18%', left: '48%' },
  { id: 4, name: 'Banane Sucrée', emoji: '🍌', top: '32%', left: '62%' },
  { id: 5, name: 'Fraise Juteuse', emoji: '🍓', top: '44%', left: '28%' },
  { id: 6, name: 'Pêche Douce', emoji: '🍑', top: '42%', left: '74%' },
  { id: 7, name: 'Cerise Double', emoji: '🍒', top: '15%', left: '34%' },
  { id: 8, name: 'Raisin Violet', emoji: '🍇', top: '48%', left: '46%' },
  { id: 9, name: 'Pastèque Délicieuse', emoji: '🍉', top: '24%', left: '70%' },
  { id: 10, name: 'Citron Acidulé', emoji: '🍋', top: '14%', left: '56%' },
  { id: 11, name: 'Ananas Exotique', emoji: '🍍', top: '50%', left: '16%' },
  { id: 12, name: 'Étoile Fruitée', emoji: '🌟', top: '10%', left: '45%' },
];

export const Level2Click: React.FC<Level2ClickProps> = ({
  difficulty,
  onSelectDifficulty,
  completedDifficulties,
  onDifficultyComplete,
  onGoToNextGame,
}) => {
  const config = GAME_CATALOG[2].difficulties[difficulty];
  const activeFruits = ALL_FRUITS.slice(0, config.targetCount);

  const [harvestedIds, setHarvestedIds] = useState<number[]>([]);
  const [fallingId, setFallingId] = useState<number | null>(null);
  const [basketSquash, setBasketSquash] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean }>({
    text: 'Clique avec le bouton gauche sur le fruit demandé !',
  });

  // Target fruit that must be clicked
  const currentTarget = getNextTargetItem(activeFruits, harvestedIds);

  useEffect(() => {
    setHarvestedIds([]);
    setFallingId(null);
    setFeedback({ text: 'Clique avec le bouton gauche sur le fruit demandé !' });
  }, [difficulty]);

  const handleFruitClick = (fruit: FruitItem) => {
    if (harvestedIds.includes(fruit.id) || fallingId === fruit.id) return;

    if (!currentTarget) return;

    // Check if child clicked the requested fruit
    if (fruit.id === currentTarget.id) {
      setFallingId(fruit.id);
      soundManager.playFruitPop();

      setTimeout(() => {
        setHarvestedIds((prev) => {
          const next = [...prev, fruit.id];
          if (next.length === activeFruits.length) {
            setFeedback({ text: 'Récolte parfaite ! Tous les fruits demandés sont dans le panier !' });
            onDifficultyComplete(difficulty);
            soundManager.playLevelSuccess();
            confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.45, 60);
          } else {
            const nextFruit = getNextTargetItem(activeFruits, next);
            setFeedback({ text: `Miam ! ${fruit.name} récoltée ! Maintenant, clique sur ${nextFruit?.name} !` });
          }
          return next;
        });
        setFallingId(null);
        setBasketSquash(true);
        soundManager.playBasketCatch();
        setTimeout(() => setBasketSquash(false), 250);
      }, 450);
    } else {
      // Clicked wrong fruit
      soundManager.playSingleTap();
      setFeedback({
        text: `Oups, c'est ${fruit.name} ${fruit.emoji} ! Trouve et clique sur : ${currentTarget.name} ${currentTarget.emoji} !`,
        isError: true,
      });
    }
  };

  const resetHarvest = () => {
    setHarvestedIds([]);
    setFallingId(null);
    setFeedback({ text: 'Clique avec le bouton gauche sur le fruit demandé !' });
  };

  const isComplete = harvestedIds.length === activeFruits.length;

  const handleNextAction = () => {
    const step = getNextStep(2, difficulty);
    if (step.nextGame === 2) {
      onSelectDifficulty(step.nextDifficulty);
    } else {
      onGoToNextGame();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-amber-100 via-emerald-50 to-green-100 relative overflow-hidden select-none">
      <div className="absolute top-4 right-10 text-6xl animate-spin [animation-duration:30s] pointer-events-none opacity-80">
        ☀️
      </div>
      <div className="absolute top-16 left-12 text-white/50 text-5xl pointer-events-none">☁️</div>

      {/* Header Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-md border-2 border-emerald-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner border border-emerald-300">
              🌳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                  <MousePointerClick className="w-3.5 h-3.5" /> Jeu 2 : Le Clic Guidé
                </span>
                <span className="text-xs font-bold text-emerald-800">Un seul clic franc !</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-800">
                Récolte le bon fruit demandé
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {config.difficultyName} : {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-emerald-50 px-4 py-2 rounded-2xl border-2 border-emerald-300 shadow-sm">
              <span className="text-xs font-bold text-emerald-800">Récoltés</span>
              <span className="text-2xl font-black text-emerald-600">
                {harvestedIds.length} <span className="text-base text-emerald-400 font-bold">/ {activeFruits.length}</span>
              </span>
            </div>

            <button
              onClick={resetHarvest}
              className="p-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer transition-colors shadow-sm"
              title="Recommencer ce niveau"
              aria-label="Recommencer ce niveau"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Level Difficulty Selector */}
        <DifficultySelector
          gameId={2}
          currentDifficulty={difficulty}
          completedDifficulties={completedDifficulties}
          onSelectDifficulty={onSelectDifficulty}
        />

        {/* Active Target Banner: Which fruit to click right now */}
        {currentTarget && !isComplete && (
          <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-300 animate-spin [animation-duration:10s]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-100">
                Fruit à récolter :
              </span>
              <span className="text-base sm:text-xl font-black text-yellow-200 bg-white/20 px-3 py-0.5 rounded-xl border border-white/30 flex items-center gap-1.5">
                <span>{currentTarget.emoji}</span>
                <span>{currentTarget.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
              <span className="hidden sm:inline">Fais un clic gauche dessus !</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Tree & Basket Stage */}
      <div className="relative z-10 w-full max-w-5xl mx-auto h-[480px] sm:h-[510px] my-2 rounded-3xl border-4 border-dashed border-emerald-300/60 bg-gradient-to-b from-sky-50/50 to-emerald-100/60 overflow-hidden backdrop-blur-[2px] relative flex flex-col justify-end items-center">
        {/* Giant Tree */}
        <div className="absolute inset-x-0 bottom-0 top-6 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 800 600" className="w-full h-full max-h-[500px]">
            <path d="M 360 300 Q 340 450 310 580 L 490 580 Q 460 450 440 300 Z" fill="#8B5A2B" />
            <path d="M 310 570 Q 260 590 200 600 L 600 600 Q 540 590 490 570 Z" fill="#7A4B20" />
            <circle cx="400" cy="200" r="160" fill="#22c55e" opacity="0.95" />
            <circle cx="270" cy="240" r="130" fill="#16a34a" opacity="0.9" />
            <circle cx="530" cy="240" r="130" fill="#16a34a" opacity="0.9" />
            <circle cx="340" cy="140" r="110" fill="#4ade80" opacity="0.85" />
            <circle cx="460" cy="140" r="110" fill="#4ade80" opacity="0.85" />
            <circle cx="400" cy="110" r="90" fill="#86efac" opacity="0.8" />
          </svg>
        </div>

        {/* Tree Fruits */}
        {activeFruits.map((fruit) => {
          const isHarvested = harvestedIds.includes(fruit.id);
          const isFalling = fallingId === fruit.id;
          const isTarget = currentTarget?.id === fruit.id;
          const isMoving = config.isMoving;

          if (isHarvested) return null;

          const sizeClass = difficulty === 1
            ? 'w-18 h-18 sm:w-22 sm:h-22 text-5xl'
            : difficulty <= 3
            ? 'w-16 h-16 sm:w-20 sm:h-20 text-4xl sm:text-5xl'
            : 'w-14 h-14 sm:w-16 sm:h-16 text-3xl sm:text-4xl';

          return (
            <button
              key={fruit.id}
              onClick={() => handleFruitClick(fruit)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isFalling
                  ? 'duration-500 ease-in translate-y-[260px] scale-90 rotate-45'
                  : isMoving
                  ? 'animate-pulse [animation-duration:2.5s] hover:scale-125 active:scale-95'
                  : 'hover:scale-125 hover:rotate-6 active:scale-95'
              }`}
              style={{
                top: fruit.top,
                left: fruit.left,
                opacity: isFalling ? 0.3 : 1,
              }}
              title={`Fruit ${fruit.name}`}
              aria-label={`Récolter ${fruit.name}`}
            >
              <div className="relative group flex flex-col items-center">
                <div className="w-1.5 h-3 bg-amber-800 rounded-full -mb-1" />
                <div className={`${sizeClass} rounded-full bg-white/85 shadow-lg flex items-center justify-center border-3 ${
                  isTarget ? 'border-amber-400 ring-3 ring-amber-300 scale-105' : 'border-emerald-400'
                } group-hover:border-yellow-400 transition-all`}>
                  {fruit.emoji}
                </div>
                <div className={`text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm text-center mt-0.5 ${
                  isTarget ? 'bg-amber-500 text-white' : 'bg-slate-800/80 text-white'
                }`}>
                  {fruit.name}
                </div>
              </div>
            </button>
          );
        })}

        {/* Wicker Basket */}
        <div
          className={`relative z-10 mb-3 transition-transform duration-200 flex flex-col items-center ${
            difficulty >= 4 ? 'animate-[pulse_4s_infinite]' : ''
          } ${basketSquash ? 'scale-x-125 scale-y-90' : 'scale-100'}`}
        >
          <div className="flex flex-wrap justify-center items-center gap-1 max-w-[260px] -mb-3 z-10">
            {harvestedIds.map((id) => {
              const f = ALL_FRUITS.find((item) => item.id === id);
              if (!f) return null;
              return (
                <span
                  key={id}
                  className="text-2xl sm:text-3xl filter drop-shadow animate-bounce"
                  title={f.name}
                >
                  {f.emoji}
                </span>
              );
            })}
          </div>

          <div className="relative w-52 sm:w-64 h-24 filter drop-shadow-xl">
            <svg viewBox="0 0 200 90" className="w-full h-full">
              <path d="M 20 20 L 40 85 Q 100 92 160 85 L 180 20 Q 100 12 20 20 Z" fill="#b45309" />
              <path d="M 25 24 L 43 80 Q 100 86 157 80 L 175 24 Q 100 18 25 24 Z" fill="#d97706" />
              <line x1="30" y1="35" x2="170" y2="35" stroke="#92400e" strokeWidth="2.5" />
              <line x1="38" y1="52" x2="162" y2="52" stroke="#92400e" strokeWidth="2.5" />
              <line x1="48" y1="68" x2="152" y2="68" stroke="#92400e" strokeWidth="2.5" />
              <ellipse cx="100" cy="20" rx="80" ry="10" fill="#78350f" />
              <ellipse cx="100" cy="20" rx="76" ry="8" fill="#b45309" />
            </svg>
            <div className="absolute inset-x-0 bottom-2 text-center text-xs font-black text-amber-100 tracking-wide">
              PANIER ({harvestedIds.length}/{activeFruits.length})
            </div>
          </div>
        </div>

        {/* Guidance tip */}
        <div className={`absolute bottom-28 left-1/2 transform -translate-x-1/2 px-5 py-2 rounded-full shadow-md border-2 flex items-center gap-2 pointer-events-none max-w-[90%] transition-colors ${
          feedback.isError ? 'bg-orange-50 border-orange-400 text-orange-950' : 'bg-white/95 border-emerald-400 text-slate-700'
        }`}>
          <span className="text-xl">{feedback.isError ? '👀' : '🖱️'}</span>
          <span className="text-xs sm:text-sm font-bold truncate">
            {feedback.text}
          </span>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="relative z-20 max-w-xl mx-auto w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-4 border-white animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🧺
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                {config.difficultyName} ({config.badge}) Terminé !
              </h3>
              <p className="text-xs text-emerald-100 font-semibold">
                {difficulty < 5
                  ? `Prêt pour le défi ${difficulty + 1} du verger ?`
                  : 'Tous les niveaux du clic gauche sont validés !'}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextAction}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-black text-sm sm:text-base shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{difficulty < 5 ? `Passer au Niveau ${difficulty + 1}` : 'Passer au Double-Clic'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
