import React from 'react';
import { Volume2, VolumeX, RotateCcw, Star, Zap } from 'lucide-react';
import { GameLevelId, GAME_CATALOG, DifficultyLevel } from '../game/logic';

interface HeaderProps {
  currentLevel: GameLevelId;
  completedDifficultiesMap: Record<1 | 2 | 3 | 4 | 5, DifficultyLevel[]>;
  onSelectLevel: (lvl: GameLevelId) => void;
  onResetAll: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  completedDifficultiesMap,
  onSelectLevel,
  onResetAll,
  isMuted,
  onToggleMute,
}) => {
  // Total stars count across all 5 games (up to 25)
  const totalStars = Object.values(completedDifficultiesMap).reduce(
    (acc, diffs) => acc + diffs.length,
    0
  );

  return (
    <header className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 shadow-lg border-b-4 border-amber-600/30 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectLevel('home')}
            className="flex items-center gap-2 group text-left cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="Retour à l'accueil"
          >
            <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl border-2 border-amber-300 transform group-hover:rotate-6 transition-transform">
              🧭
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-1.5">
                L'Odyssée <span className="text-amber-100 hidden sm:inline">des Petits Explorateurs</span>
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-amber-950/80">
                5 épreuves d'adresse + Défi Ultime Réflexe (25 étoiles)
              </p>
            </div>
          </button>
        </div>

        {/* Level steps / Progress navigator */}
        <nav aria-label="Progression des épreuves" className="flex items-center gap-1 sm:gap-1.5 bg-amber-600/20 p-1 rounded-full border border-white/20 shadow-inner">
          {/* Home Button */}
          <button
            onClick={() => onSelectLevel('home')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1 transition-all shadow-xs cursor-pointer ${
              currentLevel === 'home'
                ? 'bg-white text-orange-600 shadow-md scale-105 ring-2 ring-orange-500 ring-offset-1'
                : 'bg-amber-100/80 text-amber-950 hover:bg-white'
            }`}
            title="Page d'accueil et présentation"
          >
            <span>🏠</span>
            <span className="hidden sm:inline">Accueil</span>
          </button>
          {([1, 2, 3, 4, 5] as const).map((lvl) => {
            const completedCount = completedDifficultiesMap[lvl]?.length || 0;
            const isAllDone = completedCount === 5;
            const isCurrent = currentLevel === lvl;
            const config = GAME_CATALOG[lvl];

            return (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`relative px-2 sm:px-2.5 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1 transition-all shadow-xs cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-orange-600 shadow-md scale-105 ring-2 ring-orange-500 ring-offset-1'
                    : isAllDone
                    ? 'bg-emerald-100 text-emerald-900 hover:bg-white'
                    : 'bg-amber-100/80 text-amber-950 hover:bg-white'
                }`}
                title={`${config.title} : ${completedCount}/5 difficultés réussies`}
              >
                <span className="text-sm sm:text-base">{config.badgeIcon}</span>
                <span className="hidden xl:inline">{config.mouseSkill}</span>
                <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.2 rounded-full bg-amber-200/90 text-amber-900">
                  {completedCount}/5
                </span>
              </button>
            );
          })}

          {/* Arcade Challenge step button */}
          <button
            onClick={() => onSelectLevel('arcade')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1 transition-all cursor-pointer ${
              currentLevel === 'arcade'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md scale-105 ring-2 ring-yellow-400'
                : 'bg-slate-900 text-amber-300 hover:bg-slate-800 shadow-xs'
            }`}
            title="Le Défi Ultime (Mode Arcade avec score et vies)"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>Défi Ultime</span>
          </button>
        </nav>

        {/* Action icons & Total Star Counter */}
        <div className="flex items-center gap-2">
          {/* Total Stars Counter */}
          <div className="flex items-center gap-1 bg-white/95 px-3 py-1 rounded-full text-xs font-black text-amber-900 shadow-xs border border-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{totalStars} / 25 ⭐</span>
          </div>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className="w-9 h-9 rounded-full bg-white hover:bg-amber-100 text-amber-900 shadow flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-amber-300"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            onClick={onResetAll}
            aria-label="Recommencer depuis le début"
            className="w-9 h-9 rounded-full bg-white hover:bg-amber-100 text-amber-900 shadow flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-amber-300"
            title="Réinitialiser tous les niveaux"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
