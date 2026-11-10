/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameLevelId, DifficultyLevel } from './game/logic';
import { soundManager } from './game/audio';
import { confettiCannon } from './game/confetti';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Level1Hover } from './components/Level1Hover';
import { Level2Click } from './components/Level2Click';
import { Level3DoubleClick } from './components/Level3DoubleClick';
import { Level4RightClick } from './components/Level4RightClick';
import { Level5DragDrop } from './components/Level5DragDrop';
import { ArcadeChallenge } from './components/ArcadeChallenge';
import { VictoryScreen } from './components/VictoryScreen';
import { downloadStandaloneHtml } from './components/SingleFileExporter';
import { Compass, Download, Sparkles } from 'lucide-react';

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<GameLevelId>('home');
  const [currentDifficultyMap, setCurrentDifficultyMap] = useState<Record<1 | 2 | 3 | 4 | 5, DifficultyLevel>>({
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
  });
  const [completedDifficultiesMap, setCompletedDifficultiesMap] = useState<Record<1 | 2 | 3 | 4 | 5, DifficultyLevel[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas confetti & hash/query parsing
  useEffect(() => {
    if (canvasRef.current) {
      confettiCannon.init(canvasRef.current);
    }

    const handleResize = () => {
      confettiCannon.resize();
    };
    window.addEventListener('resize', handleResize);

    const params = new URLSearchParams(window.location.search);
    const levelParam = params.get('level');
    const diffParam = params.get('diff');

    if (levelParam) {
      if (levelParam === 'home' || levelParam === 'accueil') {
        setCurrentLevel('home');
      } else if (levelParam === 'arcade' || levelParam === 'defi') {
        setCurrentLevel('arcade');
      } else if (levelParam === 'victory' || levelParam === 'victoire') {
        setCurrentLevel('victory');
        setCompletedDifficultiesMap({
          1: [1, 2, 3, 4, 5],
          2: [1, 2, 3, 4, 5],
          3: [1, 2, 3, 4, 5],
          4: [1, 2, 3, 4, 5],
          5: [1, 2, 3, 4, 5],
        });
      } else {
        const parsedLvl = parseInt(levelParam, 10);
        if (parsedLvl >= 1 && parsedLvl <= 5) {
          setCurrentLevel(parsedLvl as 1 | 2 | 3 | 4 | 5);
          if (diffParam) {
            const parsedDiff = parseInt(diffParam, 10);
            if (parsedDiff >= 1 && parsedDiff <= 5) {
              setCurrentDifficultyMap((prev) => ({
                ...prev,
                [parsedLvl]: parsedDiff as DifficultyLevel,
              }));
            }
          }
        }
      }
    } else if (window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('niveau-1')) setCurrentLevel(1);
      else if (hash.includes('niveau-2')) setCurrentLevel(2);
      else if (hash.includes('niveau-3')) setCurrentLevel(3);
      else if (hash.includes('niveau-4')) setCurrentLevel(4);
      else if (hash.includes('niveau-5')) setCurrentLevel(5);
      else if (hash.includes('arcade') || hash.includes('defi')) setCurrentLevel('arcade');
      else if (hash.includes('victoire')) {
        setCurrentLevel('victory');
        setCompletedDifficultiesMap({
          1: [1, 2, 3, 4, 5],
          2: [1, 2, 3, 4, 5],
          3: [1, 2, 3, 4, 5],
          4: [1, 2, 3, 4, 5],
          5: [1, 2, 3, 4, 5],
        });
      } else {
        setCurrentLevel('home');
      }
    } else {
      setCurrentLevel('home');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelectLevel = (level: GameLevelId) => {
    setCurrentLevel(level);
    if (level === 'home') {
      window.location.hash = '#/accueil';
    } else if (level === 'victory') {
      window.location.hash = '#/victoire';
    } else if (level === 'arcade') {
      window.location.hash = '#/defi-ultime';
    } else {
      window.location.hash = `#/niveau-${level}`;
    }
  };

  const handleSelectDifficulty = (gameId: 1 | 2 | 3 | 4 | 5, diff: DifficultyLevel) => {
    setCurrentDifficultyMap((prev) => ({
      ...prev,
      [gameId]: diff,
    }));
  };

  const handleDifficultyComplete = (gameId: 1 | 2 | 3 | 4 | 5, diff: DifficultyLevel) => {
    setCompletedDifficultiesMap((prev) => {
      const existing = prev[gameId] || [];
      if (!existing.includes(diff)) {
        return {
          ...prev,
          [gameId]: [...existing, diff],
        };
      }
      return prev;
    });
  };

  const handleGoToNextGame = (gameId: 1 | 2 | 3 | 4 | 5) => {
    if (gameId === 1) handleSelectLevel(2);
    else if (gameId === 2) handleSelectLevel(3);
    else if (gameId === 3) handleSelectLevel(4);
    else if (gameId === 4) handleSelectLevel(5);
    else handleSelectLevel('victory');
  };

  const handleRestart = () => {
    setCompletedDifficultiesMap({
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    });
    setCurrentDifficultyMap({
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
    });
    handleSelectLevel('home');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50 text-slate-800 relative selection:bg-amber-200">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Main Header with total stars progress */}
      <Header
        currentLevel={currentLevel}
        completedDifficultiesMap={completedDifficultiesMap}
        onSelectLevel={handleSelectLevel}
        onResetAll={handleRestart}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Active Stage View */}
      <main className="flex-1 flex flex-col w-full relative">
        {currentLevel === 'home' && (
          <LandingPage
            onStartGame={handleSelectLevel}
            completedDifficultiesMap={completedDifficultiesMap}
          />
        )}
        {currentLevel === 1 && (
          <Level1Hover
            difficulty={currentDifficultyMap[1]}
            onSelectDifficulty={(d) => handleSelectDifficulty(1, d)}
            completedDifficulties={completedDifficultiesMap[1]}
            onDifficultyComplete={(d) => handleDifficultyComplete(1, d)}
            onGoToNextGame={() => handleGoToNextGame(1)}
          />
        )}
        {currentLevel === 2 && (
          <Level2Click
            difficulty={currentDifficultyMap[2]}
            onSelectDifficulty={(d) => handleSelectDifficulty(2, d)}
            completedDifficulties={completedDifficultiesMap[2]}
            onDifficultyComplete={(d) => handleDifficultyComplete(2, d)}
            onGoToNextGame={() => handleGoToNextGame(2)}
          />
        )}
        {currentLevel === 3 && (
          <Level3DoubleClick
            difficulty={currentDifficultyMap[3]}
            onSelectDifficulty={(d) => handleSelectDifficulty(3, d)}
            completedDifficulties={completedDifficultiesMap[3]}
            onDifficultyComplete={(d) => handleDifficultyComplete(3, d)}
            onGoToNextGame={() => handleGoToNextGame(3)}
          />
        )}
        {currentLevel === 4 && (
          <Level4RightClick
            difficulty={currentDifficultyMap[4]}
            onSelectDifficulty={(d) => handleSelectDifficulty(4, d)}
            completedDifficulties={completedDifficultiesMap[4]}
            onDifficultyComplete={(d) => handleDifficultyComplete(4, d)}
            onGoToNextGame={() => handleGoToNextGame(4)}
          />
        )}
        {currentLevel === 5 && (
          <Level5DragDrop
            difficulty={currentDifficultyMap[5]}
            onSelectDifficulty={(d) => handleSelectDifficulty(5, d)}
            completedDifficulties={completedDifficultiesMap[5]}
            onDifficultyComplete={(d) => handleDifficultyComplete(5, d)}
            onGoToNextGame={() => handleGoToNextGame(5)}
          />
        )}
        {currentLevel === 'arcade' && (
          <ArcadeChallenge
            onBackToTraining={() => handleSelectLevel('home')}
          />
        )}
        {currentLevel === 'victory' && (
          <VictoryScreen
            completedDifficultiesMap={completedDifficultiesMap}
            onRestart={handleRestart}
            onSelectLevel={handleSelectLevel}
            onStartArcade={() => handleSelectLevel('arcade')}
          />
        )}
      </main>

      {/* Playful Footer */}
      <footer className="no-print w-full bg-amber-900 text-amber-100 py-2.5 px-4 border-t-2 border-amber-800 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <button
              onClick={() => handleSelectLevel('home')}
              className="font-bold hover:underline cursor-pointer"
            >
              L'Odyssée des Petits Explorateurs
            </button>
            <span className="text-amber-400 font-semibold hidden md:inline">
              — 5 épreuves d'entraînement (25 étoiles) + Défi Ultime Réflexe
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadStandaloneHtml()}
              className="text-amber-200 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Télécharger l'application en un seul fichier HTML pour la classe ou la maison sans internet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Version autonome (1 fichier HTML)</span>
            </button>
            <span className="text-amber-500">•</span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Sons 100% Web Audio
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
