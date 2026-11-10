import React from 'react';
import { DifficultyLevel, GAME_CATALOG } from '../game/logic';
import { Star, Check } from 'lucide-react';

interface DifficultySelectorProps {
  gameId: 1 | 2 | 3 | 4 | 5;
  currentDifficulty: DifficultyLevel;
  completedDifficulties: DifficultyLevel[];
  onSelectDifficulty: (d: DifficultyLevel) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  gameId,
  currentDifficulty,
  completedDifficulties,
  onSelectDifficulty,
}) => {
  const game = GAME_CATALOG[gameId];

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-sm border-2 border-amber-300">
      <span className="text-xs font-black uppercase tracking-wider text-amber-900 hidden sm:inline mr-1">
        Difficulté :
      </span>

      {([1, 2, 3, 4, 5] as const).map((diff) => {
        const isCurrent = currentDifficulty === diff;
        const isDone = completedDifficulties.includes(diff);
        const config = game.difficulties[diff];

        return (
          <button
            key={diff}
            onClick={() => onSelectDifficulty(diff)}
            className={`group relative px-2.5 sm:px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1 transition-all cursor-pointer ${
              isCurrent
                ? 'bg-amber-500 text-white shadow-md scale-105 ring-2 ring-amber-400'
                : isDone
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200'
            }`}
            title={`Niveau ${diff} : ${config.difficultyName} (${config.description})`}
            aria-label={`Choisir le niveau ${diff} ${config.difficultyName}`}
          >
            <span>Niv. {diff}</span>
            <div className="flex items-center">
              {Array.from({ length: diff }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    isCurrent
                      ? 'fill-yellow-200 text-yellow-100'
                      : isDone
                      ? 'fill-emerald-500 text-emerald-600'
                      : 'fill-amber-400 text-amber-500'
                  }`}
                />
              ))}
            </div>
            {isDone && !isCurrent && (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] -mr-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
