import React, { useEffect } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { GAME_CATALOG, GameLevelId, DifficultyLevel, evaluateExplorerRankFromStars } from '../game/logic';
import { downloadStandaloneHtml } from './SingleFileExporter';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Download,
  CheckCircle2,
  Star,
  Play,
  Zap,
} from 'lucide-react';

interface VictoryScreenProps {
  completedDifficultiesMap: Record<1 | 2 | 3 | 4 | 5, DifficultyLevel[]>;
  onRestart: () => void;
  onSelectLevel: (lvl: GameLevelId) => void;
  onStartArcade: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  completedDifficultiesMap,
  onRestart,
  onSelectLevel,
  onStartArcade,
}) => {
  const totalStars = Object.values(completedDifficultiesMap).reduce(
    (acc, diffs) => acc + diffs.length,
    0
  );

  const rank = evaluateExplorerRankFromStars(totalStars);

  useEffect(() => {
    soundManager.playVictoryFanfare();
    confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.35, 100);

    const timer1 = setTimeout(() => {
      confettiCannon.burst(window.innerWidth * 0.25, window.innerHeight * 0.4, 60);
    }, 600);

    const timer2 = setTimeout(() => {
      confettiCannon.burst(window.innerWidth * 0.75, window.innerHeight * 0.4, 60);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleBurstMoreConfetti = () => {
    soundManager.playLevelSuccess();
    confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.35, 80);
  };

  const handleDownloadOfflineHtml = () => {
    downloadStandaloneHtml('Super Explorateur');
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-amber-200 via-yellow-100 to-orange-100 relative overflow-y-auto select-none">
      {/* Background decorations */}
      <div className="absolute top-8 left-8 text-5xl animate-bounce pointer-events-none">🎈</div>
      <div className="absolute top-12 right-12 text-5xl animate-bounce [animation-delay:300ms] pointer-events-none">🎉</div>
      <div className="absolute bottom-12 left-12 text-5xl pointer-events-none opacity-80">🌟</div>
      <div className="absolute bottom-16 right-16 text-5xl pointer-events-none opacity-80">👑</div>

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center gap-4 py-2">
        {/* Top Trophy Banner */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-400 text-amber-950 shadow-lg ring-6 ring-amber-300/60 mb-2 transform hover:scale-105 transition-transform">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-amber-950 fill-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-amber-950 drop-shadow-sm">
            GRANDE VICTOIRE DES EXPLORATEURS !
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-sm sm:text-base font-bold text-amber-900 bg-white/80 px-4 py-1 rounded-full shadow-xs">
              Score total : <span className="font-black text-orange-600">{totalStars} / 25 Étoiles ⭐</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-xs">
              {rank.rankTitle}
            </span>
          </div>
        </div>

        {/* Big Arcade Launcher Banner */}
        <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg border-2 border-white shrink-0 animate-bounce">
              ⚡
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-xs mb-1 border border-amber-400/40">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> NOUVEAU : MODE ARCADE RÉFLEXE
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                Le Défi Ultime des Clics !
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Teste tes réflexes avec des vies et un compteur de points : Clic Gauche, Clic Droit et Double-Clic en direct !
              </p>
            </div>
          </div>

          <button
            onClick={onStartArcade}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-white shrink-0"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Jouer au Défi Ultime !</span>
          </button>
        </div>

        {/* 5 Mouse Skills Badges Grid */}
        <div className="w-full bg-white/95 rounded-3xl p-5 shadow-xl border-3 border-amber-300">
          <h4 className="text-xs sm:text-sm font-black text-amber-900 uppercase tracking-wider text-center mb-3">
            Tes 5 Compétences de Maître de la Souris
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full">
            {([1, 2, 3, 4, 5] as const).map((lvl) => {
              const cfg = GAME_CATALOG[lvl];
              const completedCount = completedDifficultiesMap[lvl]?.length || 0;

              return (
                <div
                  key={lvl}
                  onClick={() => onSelectLevel(lvl)}
                  className="bg-amber-50 hover:bg-amber-100 rounded-2xl p-3 border border-amber-200 shadow-xs flex flex-col items-center cursor-pointer transition-transform hover:scale-105 text-center"
                  title={`Rejouer ${cfg.title}`}
                >
                  <span className="text-3xl filter drop-shadow mb-1">{cfg.badgeIcon}</span>
                  <span className="text-xs font-black text-amber-950 leading-tight">
                    {cfg.badgeTitle}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold mb-1">
                    {cfg.mouseSkill}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 my-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < completedCount
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-slate-200 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> {completedCount}/5 réussis
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap justify-center items-center gap-3 w-full mt-2">
          <button
            onClick={handleBurstMoreConfetti}
            className="px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-2 border-amber-500"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>Encore des confettis !</span>
          </button>

          <button
            onClick={handleDownloadOfflineHtml}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs sm:text-sm shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-2 border-indigo-700"
            title="Télécharge l'application en 1 seul fichier HTML autonome pour jouer sans connexion"
          >
            <Download className="w-4 h-4 text-indigo-200" />
            <span>Télécharger la version 1 fichier HTML</span>
          </button>

          <button
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs sm:text-sm shadow-md hover:from-emerald-600 hover:to-green-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-2 border-emerald-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejouer depuis le début</span>
          </button>
        </div>
      </div>
    </div>
  );
};
