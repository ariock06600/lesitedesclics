import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../game/audio';
import { confettiCannon } from '../game/confetti';
import { DifficultyLevel, GAME_CATALOG, isWithinSnapDistance, getNextStep, shuffleShapesScrambled } from '../game/logic';
import { DifficultySelector } from './DifficultySelector';
import { ArrowRight, RotateCcw, Move, Shuffle } from 'lucide-react';

interface Level5DragDropProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  completedDifficulties: DifficultyLevel[];
  onDifficultyComplete: (d: DifficultyLevel) => void;
  onGoToNextGame: () => void;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'pentagon';

interface ShapeDef {
  type: ShapeType;
  name: string;
  fillColor: string;
  strokeColor: string;
}

const ALL_SHAPES: ShapeDef[] = [
  { type: 'circle', name: 'Cercle Rubis', fillColor: '#ef4444', strokeColor: '#b91c1c' },
  { type: 'square', name: 'Carré Saphir', fillColor: '#3b82f6', strokeColor: '#1d4ed8' },
  { type: 'triangle', name: 'Triangle Émeraude', fillColor: '#10b981', strokeColor: '#047857' },
  { type: 'star', name: 'Étoile Dorée', fillColor: '#fbbf24', strokeColor: '#d97706' },
  { type: 'heart', name: 'Cœur Amour', fillColor: '#ec4899', strokeColor: '#be185d' },
  { type: 'diamond', name: 'Losange Lilas', fillColor: '#8b5cf6', strokeColor: '#6d28d9' },
  { type: 'pentagon', name: 'Pentagone Ambre', fillColor: '#f97316', strokeColor: '#c2410c' },
];

export const Level5DragDrop: React.FC<Level5DragDropProps> = ({
  difficulty,
  onSelectDifficulty,
  completedDifficulties,
  onDifficultyComplete,
  onGoToNextGame,
}) => {
  const config = GAME_CATALOG[5].difficulties[difficulty];
  const snapThreshold = config.snapThresholdPx || 75;
  const activeShapes = ALL_SHAPES.slice(0, config.targetCount);

  // Scrambled order of shapes at the bottom so they are never directly aligned with silhouettes above!
  const [scrambledShapes, setScrambledShapes] = useState<ShapeDef[]>(() =>
    shuffleShapesScrambled(activeShapes)
  );

  const [placedShapes, setPlacedShapes] = useState<ShapeType[]>([]);
  const [activeDrag, setActiveDrag] = useState<ShapeType | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [feedbackMsg, setFeedbackMsg] = useState('Les formes sont mélangées ! Retrouve l\'ombre de chacune.');
  const [selectedForClickPlace, setSelectedForClickPlace] = useState<ShapeType | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetSlotsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // When difficulty changes, reset and re-scramble!
  useEffect(() => {
    setPlacedShapes([]);
    setActiveDrag(null);
    setSelectedForClickPlace(null);
    setScrambledShapes(shuffleShapesScrambled(activeShapes));
    setFeedbackMsg(`Niveau ${difficulty} : Formes mélangées ! Fais correspondre chaque silhouette.`);
  }, [difficulty]);

  const handlePointerDown = (type: ShapeType, e: React.PointerEvent) => {
    if (placedShapes.includes(type)) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveDrag(type);
    setSelectedForClickPlace(type);
    setDragPos({ x: e.clientX, y: e.clientY });
    soundManager.playSingleTap();
    setFeedbackMsg('Glisse la forme vers sa silhouette correspondante !');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag) return;

    const droppedType = activeDrag;
    setActiveDrag(null);

    const slotElem = targetSlotsRef.current[droppedType];
    if (slotElem) {
      const rect = slotElem.getBoundingClientRect();
      const slotCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const dropPos = { x: e.clientX, y: e.clientY };

      if (isWithinSnapDistance(dropPos, slotCenter, snapThreshold)) {
        placeShape(droppedType);
        return;
      }
    }

    setFeedbackMsg('Pas tout à fait ! Rapproche la forme plus près de son ombre.');
  };

  const handleSlotClick = (slotType: ShapeType) => {
    if (selectedForClickPlace === slotType && !placedShapes.includes(slotType)) {
      placeShape(slotType);
    }
  };

  const placeShape = (type: ShapeType) => {
    const newPlaced = [...placedShapes, type];
    setPlacedShapes(newPlaced);
    setSelectedForClickPlace(null);
    soundManager.playShapeSnap();

    if (newPlaced.length === activeShapes.length) {
      setFeedbackMsg(`Bravo ! Toutes les formes ont rejoint leur place sacrée !`);
      onDifficultyComplete(difficulty);
      soundManager.playLevelSuccess();
      confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.45, 65);
    } else {
      const shapeObj = ALL_SHAPES.find((s) => s.type === type);
      setFeedbackMsg(`Parfait ! Le ${shapeObj?.name || 'Forme'} est bien emboîté !`);
    }
  };

  const resetGame = () => {
    setPlacedShapes([]);
    setActiveDrag(null);
    setSelectedForClickPlace(null);
    setScrambledShapes(shuffleShapesScrambled(activeShapes));
    setFeedbackMsg('Formes réinitialisées et mélangées ! Prêt ?');
  };

  const handleReshuffleOnly = () => {
    setScrambledShapes(shuffleShapesScrambled(activeShapes));
    soundManager.playSingleTap();
    setFeedbackMsg('Les formes du bas ont été re-mélangées !');
  };

  const isComplete = placedShapes.length === activeShapes.length;

  const handleNextAction = () => {
    const step = getNextStep(5, difficulty);
    if (step.nextGame === 5) {
      onSelectDifficulty(step.nextDifficulty);
    } else {
      onGoToNextGame();
    }
  };

  const renderShapeSvg = (type: ShapeType, isSilhouette: boolean) => {
    const shapeDef = ALL_SHAPES.find((s) => s.type === type)!;
    const fill = isSilhouette ? '#312e81' : shapeDef.fillColor;
    const stroke = isSilhouette ? '#4338ca' : shapeDef.strokeColor;
    const strokeWidth = isSilhouette ? '4' : '3';
    const strokeDasharray = isSilhouette ? '6,6' : 'none';

    switch (type) {
      case 'circle':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="42" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
            {!isSilhouette && <circle cx="38" cy="38" r="8" fill="white" opacity="0.4" />}
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="12" y="12" width="76" height="76" rx="14" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />
            {!isSilhouette && <rect x="22" y="22" width="20" height="20" rx="4" fill="white" opacity="0.3" />}
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,12 88,86 12,86" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" />
            {!isSilhouette && <polygon points="50,26 62,50 38,50" fill="white" opacity="0.3" />}
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,8 62,36 94,36 68,56 78,86 50,68 22,86 32,56 6,36 38,36"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
            {!isSilhouette && <circle cx="50" cy="46" r="8" fill="white" opacity="0.4" />}
          </svg>
        );
      case 'heart':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 50,84 A 1,1 0 0,0 50,84 C 18,60 8,42 8,26 A 20,20 0 0,1 48,16 L 50,20 L 52,16 A 20,20 0 0,1 92,26 C 92,42 82,60 50,84 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {!isSilhouette && <circle cx="34" cy="28" r="5" fill="white" opacity="0.4" />}
          </svg>
        );
      case 'diamond':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 88,50 50,90 12,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" />
            {!isSilhouette && <polygon points="50,22 70,50 50,78 30,50" fill="white" opacity="0.25" />}
          </svg>
        );
      case 'pentagon':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 90,40 76,88 24,88 10,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" />
            {!isSilhouette && <polygon points="50,24 74,45 64,74 36,74 26,45" fill="white" opacity="0.25" />}
          </svg>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="flex-1 w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 relative overflow-hidden select-none text-white touch-none"
    >
      {/* Decorative stars */}
      <div className="absolute top-8 left-12 text-2xl animate-pulse pointer-events-none opacity-60">✨</div>
      <div className="absolute top-16 right-20 text-3xl animate-spin [animation-duration:20s] pointer-events-none opacity-40">⭐</div>
      <div className="absolute bottom-20 left-24 text-2xl pointer-events-none opacity-50">🔮</div>

      {/* Header Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-3 bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-indigo-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-3xl shadow-inner border border-indigo-400">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500 text-white shadow-sm">
                  Jeu 5 : Le Glisser-Déposer
                </span>
                <span className="text-xs font-bold text-indigo-200">Formes mélangées !</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300">
                Glisse chaque forme dans son ombre
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                {config.difficultyName} : {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-indigo-950/80 px-4 py-2 rounded-2xl border-2 border-indigo-400 shadow-sm">
              <span className="text-xs font-bold text-indigo-300">Formes</span>
              <span className="text-2xl font-black text-amber-400">
                {placedShapes.length} <span className="text-base text-indigo-300 font-bold">/ {activeShapes.length}</span>
              </span>
            </div>

            <button
              onClick={handleReshuffleOnly}
              className="p-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 cursor-pointer transition-colors shadow-sm"
              title="Re-mélanger les formes du bas"
              aria-label="Re-mélanger les formes du bas"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={resetGame}
              className="p-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 cursor-pointer transition-colors shadow-sm"
              title="Recommencer ce niveau"
              aria-label="Recommencer ce niveau"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Level Difficulty Selector */}
        <DifficultySelector
          gameId={5}
          currentDifficulty={difficulty}
          completedDifficulties={completedDifficulties}
          onSelectDifficulty={onSelectDifficulty}
        />
      </div>

      {/* Main Altar Area */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-2 p-4 sm:p-5 rounded-3xl border-4 border-dashed border-indigo-400/40 bg-indigo-950/40 backdrop-blur-sm flex flex-col justify-between items-center gap-4">
        {/* Top: Silhouettes / Target Slots */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
            <Move className="w-3.5 h-3.5" />
            <span>L'Autel des Silhouettes (Emplacements cibles)</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 max-w-4xl">
            {activeShapes.map((shape) => {
              const isPlaced = placedShapes.includes(shape.type);
              const isTargetSlot = selectedForClickPlace === shape.type;
              const sizeSlot = difficulty <= 2 ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20 sm:w-24 sm:h-24';

              return (
                <div
                  key={shape.type}
                  ref={(el) => {
                    targetSlotsRef.current[shape.type] = el;
                  }}
                  onClick={() => handleSlotClick(shape.type)}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 select-none ${
                    isPlaced
                      ? 'bg-amber-400/20 border-2 border-amber-400 shadow-md scale-100'
                      : isTargetSlot
                      ? 'bg-indigo-800/80 border-3 border-amber-300 ring-4 ring-amber-400/50 scale-105 animate-pulse'
                      : 'bg-indigo-950/80 border-2 border-dashed border-indigo-400/60'
                  }`}
                >
                  <div className={`${sizeSlot} flex items-center justify-center p-1`}>
                    {isPlaced ? renderShapeSvg(shape.type, false) : renderShapeSvg(shape.type, true)}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-300 mt-1 truncate max-w-[80px]">
                    {isPlaced ? 'Placé !' : shape.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Instructional Banner */}
        <div className="bg-white/95 px-5 py-2 rounded-full shadow-md border-2 border-indigo-400 flex items-center gap-2 max-w-[90%]">
          <span className="text-xl animate-bounce">🎯</span>
          <p className="text-xs sm:text-sm font-bold text-slate-800 text-center truncate">
            {feedbackMsg}
          </p>
        </div>

        {/* Bottom: Draggable Shapes SCRAMBLED (not aligned with top!) */}
        <div className="w-full flex flex-wrap justify-center items-center gap-2 sm:gap-4 max-w-4xl mx-auto py-1">
          {scrambledShapes.map((shape) => {
            const isPlaced = placedShapes.includes(shape.type);
            const isBeingDragged = activeDrag === shape.type;
            const isSelected = selectedForClickPlace === shape.type;
            const sizeShape = difficulty <= 2 ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20 sm:w-24 sm:h-24';

            return (
              <div key={shape.type} className="flex flex-col items-center">
                <div
                  onPointerDown={(e) => handlePointerDown(shape.type, e)}
                  onClick={() => {
                    if (!isPlaced) setSelectedForClickPlace(shape.type);
                  }}
                  className={`${sizeShape} rounded-2xl p-2 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
                    isPlaced
                      ? 'opacity-25 pointer-events-none scale-90'
                      : isBeingDragged
                      ? 'opacity-30 scale-95 border-2 border-indigo-400 border-dashed'
                      : isSelected
                      ? 'ring-4 ring-indigo-500 scale-110 shadow-xl bg-white'
                      : 'hover:scale-110 active:scale-95 shadow-md bg-white/90 border-2 border-indigo-200'
                  }`}
                  style={{ touchAction: 'none' }}
                  title={isPlaced ? `${shape.name} placée` : `Glisse ${shape.name}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Attraper ${shape.name}`}
                >
                  <div className="w-full h-full filter drop-shadow">
                    {renderShapeSvg(shape.type, false)}
                  </div>
                </div>
                <span className="text-[11px] font-black text-indigo-950 mt-0.5 truncate max-w-[90px]">
                  {shape.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Drag Avatar */}
      {activeDrag && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-125 filter drop-shadow-2xl"
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
          }}
        >
          <div className="w-20 h-20 animate-pulse">
            {renderShapeSvg(activeDrag, false)}
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isComplete && (
        <div className="relative z-20 max-w-xl mx-auto w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-4 border-white animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                {config.difficultyName} ({config.badge}) Accompli !
              </h3>
              <p className="text-xs text-purple-100 font-semibold">
                {difficulty < 5
                  ? `Prêt pour la difficulté ${difficulty + 1} du temple ?`
                  : 'Félicitations ! Tu as complété toutes les 5 épreuves de l\'Odyssée !'}
              </p>
            </div>
          </div>
          <button
            onClick={handleNextAction}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-amber-400 text-slate-900 font-black text-sm sm:text-base shadow-lg hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{difficulty < 5 ? `Passer au Niveau ${difficulty + 1}` : 'Lancer le Défi Ultime 🎮'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
