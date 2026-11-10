import React, { useState } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { GAME_CATALOG, GameLevelId, DifficultyLevel } from '../game/logic';
import { downloadStandaloneHtml } from './SingleFileExporter';
import {
  Play,
  Zap,
  Compass,
  Star,
  MousePointer,
  Sparkles,
  Download,
  CheckCircle2,
  ShieldCheck,
  Heart,
  ArrowRight,
  Trophy,
  MousePointer2,
  GraduationCap,
  Smile,
  Flame,
} from 'lucide-react';

interface LandingPageProps {
  onStartGame: (lvl: GameLevelId) => void;
  completedDifficultiesMap: Record<1 | 2 | 3 | 4 | 5, DifficultyLevel[]>;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  completedDifficultiesMap,
}) => {
  // Total stars earned
  const totalStars = Object.values(completedDifficultiesMap).reduce(
    (acc, diffs) => acc + diffs.length,
    0
  );

  // Mini-warmup interactive state
  const [warmupHovered, setWarmupHovered] = useState(false);
  const [warmupLeftClicked, setWarmupLeftClicked] = useState(false);
  const [warmupDoubleClicked, setWarmupDoubleClicked] = useState(false);
  const [warmupRightClicked, setWarmupRightClicked] = useState(false);
  const [lastDblTimestamp, setLastDblTimestamp] = useState(0);

  const handleWarmupDblClick = () => {
    const now = Date.now();
    if (now - lastDblTimestamp < 450) {
      setWarmupDoubleClicked(true);
      soundManager.playChestUnlock();
      confettiCannon.burst(window.innerWidth * 0.5, window.innerHeight * 0.6, 25);
    } else {
      setLastDblTimestamp(now);
      soundManager.playSingleTap();
    }
  };

  const handleWarmupRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setWarmupRightClicked(true);
    soundManager.playRightClickPop();
    confettiCannon.burst(window.innerWidth * 0.7, window.innerHeight * 0.6, 25);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-gradient-to-b from-amber-100 via-amber-50 to-orange-100 text-slate-800 select-none overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full pt-8 pb-12 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Floating Cartoon Badges */}
        <div className="absolute top-4 left-6 text-4xl animate-bounce pointer-events-none opacity-80 hidden sm:block">
          🦋
        </div>
        <div className="absolute top-10 right-8 text-4xl animate-bounce [animation-delay:400ms] pointer-events-none opacity-80 hidden sm:block">
          🍎
        </div>
        <div className="absolute bottom-6 left-12 text-3xl animate-pulse pointer-events-none opacity-70 hidden md:block">
          🐚
        </div>
        <div className="absolute bottom-10 right-14 text-3xl animate-spin [animation-duration:15s] pointer-events-none opacity-70 hidden md:block">
          ⭐
        </div>

        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-xs sm:text-sm shadow-md border border-amber-300 mb-4 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-950 fill-amber-300" />
          <span>Jeu Éducatif Interactif • 6 à 11 ans • École & Famille</span>
        </div>

        {/* Grand Adventure Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-amber-950 tracking-tight leading-tight max-w-4xl drop-shadow-sm mb-4">
          L'Odyssée <span className="text-orange-600 underline decoration-amber-400 decoration-wavy">des Petits Explorateurs</span>
        </h1>

        <p className="text-base sm:text-xl text-amber-900/90 font-semibold max-w-2xl leading-relaxed mb-8">
          L'aventure magique pour apprendre à manipuler la souris en toute autonomie :
          <span className="font-black text-orange-600"> survol</span>,
          <span className="font-black text-emerald-600"> clic gauche</span>,
          <span className="font-black text-purple-600"> double-clic</span>,
          <span className="font-black text-teal-600"> clic droit</span> et
          <span className="font-black text-indigo-600"> glisser-déposer</span> !
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-xl mb-6">
          <button
            onClick={() => {
              soundManager.playFruitPop();
              onStartGame(1);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border-3 border-white ring-4 ring-amber-300/60"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Commencer l'Aventure !</span>
          </button>

          <button
            onClick={() => {
              soundManager.playComboBonus(2);
              onStartGame('arcade');
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-3xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-amber-400/80"
          >
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>Défi Ultime Réflexe ⚡</span>
          </button>
        </div>

        {/* Stars status if already started */}
        {totalStars > 0 && (
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-2xl border-2 border-amber-300 shadow-sm text-xs sm:text-sm font-bold text-amber-900 mb-4 animate-fade-in">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Progression actuelle : <strong className="font-black text-orange-600">{totalStars} / 25 étoiles</strong> remportées !</span>
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full pt-4 text-xs font-bold text-amber-900">
          <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-200 flex items-center gap-2 shadow-xs justify-center">
            <span className="text-xl">🌟</span>
            <span>25 Niveaux Progressifs</span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-200 flex items-center gap-2 shadow-xs justify-center">
            <span className="text-xl">🎵</span>
            <span>Sons 100% Web Audio</span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-200 flex items-center gap-2 shadow-xs justify-center">
            <span className="text-xl">❤️</span>
            <span>Mode Arcade & Vies</span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-amber-200 flex items-center gap-2 shadow-xs justify-center">
            <span className="text-xl">📦</span>
            <span>100% Hors-Ligne Possible</span>
          </div>
        </div>
      </section>

      {/* Interactive Mouse Warm-up Playground */}
      <section className="w-full bg-white/80 py-10 px-4 sm:px-6 border-y-4 border-amber-300/40 shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full mb-1">
              <MousePointer className="w-3.5 h-3.5 text-orange-600" /> Échauffement Immédiat
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
              Teste ta souris ici avant de partir !
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Passe la souris, clique, double-clique ou fais un clic droit sur les 4 cibles :
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Warmup 1: Hover */}
            <div
              onMouseEnter={() => {
                setWarmupHovered(true);
                soundManager.playHoverChime(2);
              }}
              onMouseLeave={() => setWarmupHovered(false)}
              className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center justify-between min-h-[170px] transition-all duration-300 cursor-pointer ${
                warmupHovered
                  ? 'bg-sky-100 border-sky-400 scale-105 shadow-lg'
                  : 'bg-amber-50/80 border-amber-200 shadow-sm hover:border-sky-300'
              }`}
            >
              <span className="text-xs font-black uppercase text-sky-700 bg-sky-200/70 px-2 py-0.5 rounded-full">
                1. Survol
              </span>
              <div className="text-4xl my-2 transform transition-transform group-hover:scale-125">
                {warmupHovered ? '🌈' : '☁️'}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {warmupHovered ? 'Superbe arc-en-ciel !' : 'Survole-moi sans cliquer !'}
              </p>
            </div>

            {/* Warmup 2: Left Click */}
            <div
              onClick={() => {
                setWarmupLeftClicked(true);
                soundManager.playFruitPop();
                confettiCannon.burst(window.innerWidth * 0.35, window.innerHeight * 0.6, 20);
              }}
              className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center justify-between min-h-[170px] transition-all duration-200 cursor-pointer active:scale-95 ${
                warmupLeftClicked
                  ? 'bg-emerald-100 border-emerald-400 scale-105 shadow-lg'
                  : 'bg-amber-50/80 border-amber-200 shadow-sm hover:border-emerald-300'
              }`}
            >
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                2. Clic Gauche
              </span>
              <div className="text-4xl my-2">
                {warmupLeftClicked ? '🍎' : '🌳'}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {warmupLeftClicked ? 'Miam ! Fruit récolté !' : 'Clique avec le bouton gauche !'}
              </p>
            </div>

            {/* Warmup 3: Double Click */}
            <div
              onClick={handleWarmupDblClick}
              className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center justify-between min-h-[170px] transition-all duration-200 cursor-pointer active:scale-95 ${
                warmupDoubleClicked
                  ? 'bg-purple-100 border-purple-400 scale-105 shadow-lg'
                  : 'bg-amber-50/80 border-amber-200 shadow-sm hover:border-purple-300'
              }`}
            >
              <span className="text-xs font-black uppercase text-purple-700 bg-purple-200/70 px-2 py-0.5 rounded-full">
                3. Double-Clic
              </span>
              <div className="text-4xl my-2">
                {warmupDoubleClicked ? '✨📦✨' : '📦'}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {warmupDoubleClicked ? 'Coffre ouvert ! Clic-clic !' : 'Deux clics très rapides !'}
              </p>
            </div>

            {/* Warmup 4: Right Click */}
            <div
              onContextMenu={handleWarmupRightClick}
              className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center justify-between min-h-[170px] transition-all duration-200 cursor-context-menu active:scale-95 ${
                warmupRightClicked
                  ? 'bg-teal-100 border-teal-400 scale-105 shadow-lg'
                  : 'bg-amber-50/80 border-amber-200 shadow-sm hover:border-teal-300'
              }`}
            >
              <span className="text-xs font-black uppercase text-teal-700 bg-teal-200/70 px-2 py-0.5 rounded-full">
                4. Clic Droit
              </span>
              <div className="text-4xl my-2">
                {warmupRightClicked ? '🐚✨' : '🫧'}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {warmupRightClicked ? 'Perle trouvée au Clic Droit !' : 'Bouton droit de ta souris !'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Training Worlds Explorer Map */}
      <section className="w-full py-12 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-3 py-1 rounded-full mb-1">
            <Compass className="w-3.5 h-3.5 text-amber-700" /> Les 5 Épreuves de l'Odyssée
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-amber-950">
            Choisis ton épreuve d'entraînement
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl mx-auto">
            Chaque épreuve propose 5 niveaux de difficulté progressive, du niveau débutant au niveau expert.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {([1, 2, 3, 4, 5] as const).map((lvl) => {
            const config = GAME_CATALOG[lvl];
            const completedCount = completedDifficultiesMap[lvl]?.length || 0;

            const bgGradients = [
              'from-sky-50 to-blue-100 border-sky-300 text-sky-950',
              'from-emerald-50 to-green-100 border-emerald-300 text-emerald-950',
              'from-purple-50 to-indigo-100 border-purple-300 text-purple-950',
              'from-teal-50 to-cyan-100 border-teal-300 text-teal-950',
              'from-indigo-50 to-violet-100 border-indigo-300 text-indigo-950',
            ];

            return (
              <div
                key={lvl}
                className={`rounded-3xl p-5 border-3 bg-gradient-to-br shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-4 ${bgGradients[lvl - 1]}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl border border-white">
                      {config.badgeIcon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 shadow-xs">
                      {config.mouseSkill}
                    </span>
                  </div>

                  <h3 className="text-xl font-black mb-1">
                    {lvl}. {config.title}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {config.instruction}
                  </p>
                </div>

                <div className="border-t border-slate-300/40 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold mb-3">
                    <span>5 Difficultés :</span>
                    <span className="font-black text-amber-700">
                      {completedCount} / 5 ⭐
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playFruitPop();
                      onStartGame(lvl);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98 border border-slate-200"
                  >
                    <span>Jouer à ce monde</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Ultimate Arcade Challenge */}
          <div className="rounded-3xl p-5 border-4 border-amber-400 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 shadow-md flex items-center justify-center text-3xl border-2 border-white animate-bounce">
                  ⚡
                </div>
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-xs">
                  Mode Réflexe
                </span>
              </div>

              <h3 className="text-xl font-black text-amber-300 mb-1">
                Le Défi Ultime des Clics
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Utilise le bon clic (Gauche 🟡, Droit 🟣 ou Double 🟢) sous la pression du chronomètre !
                5 vies, score et record mondial.
              </p>
            </div>

            <div className="border-t border-white/20 pt-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200 mb-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> 5 Vies
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Score & Record
                </span>
              </div>

              <button
                onClick={() => {
                  soundManager.playComboBonus(3);
                  onStartGame('arcade');
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98 border-2 border-white"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Relever le Défi Ultime !</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Guide & Teachers / Parents Note */}
      <section className="w-full bg-amber-200/50 py-10 px-4 sm:px-6 border-t-2 border-amber-300/60">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-300 px-3 py-0.5 rounded-full mb-2">
              <GraduationCap className="w-4 h-4 text-amber-900" /> Conçu pour l'École et la Maison
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mb-3">
              Une méthode bienveillante et progressive
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed mb-4">
              La manipulation de la souris est le premier palier d'apprentissage numérique pour un enfant.
              Ce jeu élimine la frustration grâce à des cibles larges, des retours sonores pentatoniques doux
              et une difficulté étalée sur 5 paliers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zéro publicité, zéro collecte de données</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sons 100% Web Audio sans fichiers distants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Conforme aux recommandations cycle 2 & 3</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Téléchargeable en 1 fichier HTML autonome</span>
              </div>
            </div>
          </div>

          {/* Standalone Download Box */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-amber-400 max-w-sm w-full text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
              💾
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Version Hors-Ligne (1 Fichier HTML)
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Télécharge l'application complète pour l'installer sur les ordinateurs de la classe ou la maison sans connexion internet.
            </p>
            <button
              onClick={() => downloadStandaloneHtml()}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-500"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier HTML</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
