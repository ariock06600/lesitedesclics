/**
 * Pure logic and game rules for "L'Odyssée des Petits Explorateurs"
 * Decoupled from React DOM for testability and verification.
 * Supports 4 mini-games with 5 progressive difficulty levels each (20 stages total).
 */

export type GameLevelId = 'home' | 1 | 2 | 3 | 4 | 5 | 'arcade' | 'victory';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface DifficultyConfig {
  difficulty: DifficultyLevel;
  difficultyName: string;
  targetCount: number;
  description: string;
  badge: string;
  // Specific modifiers
  speedModifier?: number;
  clickIntervalMs?: number;
  snapThresholdPx?: number;
  isMoving?: boolean;
}

export interface GameInfo {
  id: GameLevelId;
  title: string;
  subtitle: string;
  instruction: string;
  mouseSkill: 'survol' | 'clic' | 'double-clic' | 'clic-droit' | 'drag-drop' | 'master';
  badgeTitle: string;
  badgeIcon: string;
  difficulties: Record<DifficultyLevel, DifficultyConfig>;
}

export const GAME_CATALOG: Record<1 | 2 | 3 | 4 | 5, GameInfo> = {
  1: {
    id: 1,
    title: 'La Forêt des Papillons',
    subtitle: 'Épreuve 1 : Le Survol du Curseur',
    instruction: 'Survole le papillon demandé avec ta souris sans cliquer pour le faire s\'envoler !',
    mouseSkill: 'survol',
    badgeTitle: 'Maître du Survol',
    badgeIcon: '🦋',
    difficulties: {
      1: { difficulty: 1, difficultyName: 'Débutant', targetCount: 4, description: '4 grands papillons calmes', badge: '⭐' },
      2: { difficulty: 2, difficultyName: 'Facile', targetCount: 6, description: '6 papillons colorés', badge: '⭐⭐' },
      3: { difficulty: 3, difficultyName: 'Moyen', targetCount: 8, description: '8 papillons qui oscillent doucement', badge: '⭐⭐⭐', isMoving: true },
      4: { difficulty: 4, difficultyName: 'Difficile', targetCount: 10, description: '10 papillons vifs et plus petits', badge: '⭐⭐⭐⭐', isMoving: true, speedModifier: 1.3 },
      5: { difficulty: 5, difficultyName: 'Expert', targetCount: 12, description: '12 papillons et lucioles magiques rapides', badge: '⭐⭐⭐⭐⭐', isMoving: true, speedModifier: 1.7 },
    },
  },
  2: {
    id: 2,
    title: 'Le Verger Gourmand',
    subtitle: 'Épreuve 2 : Le Clic Gauche',
    instruction: 'Clique avec le bouton gauche sur le fruit demandé pour le faire tomber dans le panier !',
    mouseSkill: 'clic',
    badgeTitle: 'Expert de la Récolte',
    badgeIcon: '🍎',
    difficulties: {
      1: { difficulty: 1, difficultyName: 'Débutant', targetCount: 4, description: '4 gros fruits à portée de main', badge: '⭐' },
      2: { difficulty: 2, difficultyName: 'Facile', targetCount: 6, description: '6 fruits variés sur les branches', badge: '⭐⭐' },
      3: { difficulty: 3, difficultyName: 'Moyen', targetCount: 8, description: '8 fruits qui se balancent au vent', badge: '⭐⭐⭐', isMoving: true },
      4: { difficulty: 4, difficultyName: 'Difficile', targetCount: 10, description: '10 fruits sur les hautes branches avec panier mobile', badge: '⭐⭐⭐⭐', isMoving: true, speedModifier: 1.3 },
      5: { difficulty: 5, difficultyName: 'Expert', targetCount: 12, description: '12 fruits express et baies étincelantes', badge: '⭐⭐⭐⭐⭐', isMoving: true, speedModifier: 1.6 },
    },
  },
  3: {
    id: 3,
    title: 'La Grotte aux Coffres',
    subtitle: 'Épreuve 3 : Le Double-Clic Rapide',
    instruction: 'Fais un double-clic rapide (clic-clic !) sur le coffre de la couleur demandée !',
    mouseSkill: 'double-clic',
    badgeTitle: 'Explorateur Étoilé',
    badgeIcon: '📦',
    difficulties: {
      1: { difficulty: 1, difficultyName: 'Débutant', targetCount: 3, description: '3 coffres avec rythme très indulgent (700ms)', badge: '⭐', clickIntervalMs: 700 },
      2: { difficulty: 2, difficultyName: 'Facile', targetCount: 4, description: '4 coffres classiques (550ms)', badge: '⭐⭐', clickIntervalMs: 550 },
      3: { difficulty: 3, difficultyName: 'Moyen', targetCount: 5, description: '5 coffres mystérieux (450ms)', badge: '⭐⭐⭐', clickIntervalMs: 450 },
      4: { difficulty: 4, difficultyName: 'Difficile', targetCount: 6, description: '6 coffres en lévitation oscillante (400ms)', badge: '⭐⭐⭐⭐', clickIntervalMs: 400, isMoving: true },
      5: { difficulty: 5, difficultyName: 'Expert', targetCount: 7, description: '7 coffres secrets au timing vif (350ms)', badge: '⭐⭐⭐⭐⭐', clickIntervalMs: 350, isMoving: true },
    },
  },
  4: {
    id: 4,
    title: 'L\'Île aux Coquillages',
    subtitle: 'Épreuve 4 : Le Clic Droit Précis',
    instruction: 'Fais un clic droit (avec le bouton de droite de ta souris) sur le coquillage demandé !',
    mouseSkill: 'clic-droit',
    badgeTitle: 'Perle des Océans',
    badgeIcon: '🐚',
    difficulties: {
      1: { difficulty: 1, difficultyName: 'Débutant', targetCount: 3, description: '3 grands coquillages posés sur le sable', badge: '⭐' },
      2: { difficulty: 2, difficultyName: 'Facile', targetCount: 4, description: '4 coquillages étincelants', badge: '⭐⭐' },
      3: { difficulty: 3, difficultyName: 'Moyen', targetCount: 5, description: '5 coquillages bercés par les vagues', badge: '⭐⭐⭐', isMoving: true },
      4: { difficulty: 4, difficultyName: 'Difficile', targetCount: 6, description: '6 coquillages multicolores qui nagent doucement', badge: '⭐⭐⭐⭐', isMoving: true, speedModifier: 1.2 },
      5: { difficulty: 5, difficultyName: 'Expert', targetCount: 7, description: '7 coquillages rares aux perles lumineuses', badge: '⭐⭐⭐⭐⭐', isMoving: true, speedModifier: 1.5 },
    },
  },
  5: {
    id: 5,
    title: 'Le Temple des Formes',
    subtitle: 'Épreuve 5 : Le Glisser-Déposer',
    instruction: 'Maintiens le bouton appuyé pour glisser chaque forme dans son ombre correspondante !',
    mouseSkill: 'drag-drop',
    badgeTitle: 'Architecte Magique',
    badgeIcon: '⭐',
    difficulties: {
      1: { difficulty: 1, difficultyName: 'Débutant', targetCount: 3, description: '3 formes géantes avec fort magnétisme (110px)', badge: '⭐', snapThresholdPx: 110 },
      2: { difficulty: 2, difficultyName: 'Facile', targetCount: 4, description: '4 formes colorées classiques (90px)', badge: '⭐⭐', snapThresholdPx: 90 },
      3: { difficulty: 3, difficultyName: 'Moyen', targetCount: 5, description: '5 formes dont Cœur et Étoile (75px)', badge: '⭐⭐⭐', snapThresholdPx: 75 },
      4: { difficulty: 4, difficultyName: 'Difficile', targetCount: 6, description: '6 formes variées aux silhouettes espacées (65px)', badge: '⭐⭐⭐⭐', snapThresholdPx: 65 },
      5: { difficulty: 5, difficultyName: 'Expert', targetCount: 7, description: '7 formes et géométries précises (55px)', badge: '⭐⭐⭐⭐⭐', snapThresholdPx: 55 },
    },
  },
};

/**
 * Checks if target count is achieved
 */
export function isLevelComplete(completedCount: number, targetCount: number): boolean {
  return completedCount >= targetCount;
}

/**
 * Calculates progress percentage between 0 and 100
 */
export function calculateProgressPercent(completedCount: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, completedCount / targetCount));
  return Math.round(ratio * 100);
}

/**
 * Returns next difficulty or next game
 */
export function getNextStep(
  currentGame: 1 | 2 | 3 | 4 | 5,
  currentDifficulty: DifficultyLevel
): { nextGame: GameLevelId; nextDifficulty: DifficultyLevel; isVictory: boolean } {
  if (currentDifficulty < 5) {
    return {
      nextGame: currentGame,
      nextDifficulty: (currentDifficulty + 1) as DifficultyLevel,
      isVictory: false,
    };
  }
  // If difficulty 5 of current game is reached, move to next game at difficulty 1
  if (currentGame === 1) return { nextGame: 2, nextDifficulty: 1, isVictory: false };
  if (currentGame === 2) return { nextGame: 3, nextDifficulty: 1, isVictory: false };
  if (currentGame === 3) return { nextGame: 4, nextDifficulty: 1, isVictory: false };
  if (currentGame === 4) return { nextGame: 5, nextDifficulty: 1, isVictory: false };
  return { nextGame: 'arcade', nextDifficulty: 1, isVictory: true };
}

/**
 * Double-click detection helper logic.
 */
export function evaluateDoubleClick(
  lastClickTimestamp: number,
  currentClickTimestamp: number,
  maxIntervalMs = 500
): { isDoubleClick: boolean; interval: number } {
  const interval = currentClickTimestamp - lastClickTimestamp;
  const isDoubleClick = lastClickTimestamp > 0 && interval > 40 && interval <= maxIntervalMs;
  return { isDoubleClick, interval };
}

/**
 * Proximity hit-test for Drag & Drop
 */
export interface Point2D {
  x: number;
  y: number;
}

export function isWithinSnapDistance(
  itemPos: Point2D,
  targetPos: Point2D,
  snapThreshold = 80
): boolean {
  const dx = itemPos.x - targetPos.x;
  const dy = itemPos.y - targetPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= snapThreshold;
}

/**
 * Evaluates ranking and stars (5 games × 5 difficulty levels = 25 stars maximum)
 */
export function evaluateExplorerRankFromStars(totalStars: number): {
  stars: number;
  maxStars: number;
  rankTitle: string;
  grade: string;
} {
  const maxStars = 25;
  if (totalStars >= 23) {
    return { stars: totalStars, maxStars, rankTitle: 'Légende Suprême de la Souris', grade: 'Maîtrise Exceptionnelle' };
  }
  if (totalStars >= 18) {
    return { stars: totalStars, maxStars, rankTitle: 'Grand Capitaine Explorateur', grade: 'Excellente Agilité' };
  }
  if (totalStars >= 12) {
    return { stars: totalStars, maxStars, rankTitle: 'Navigateur Intrépide', grade: 'Très Bien' };
  }
  if (totalStars >= 6) {
    return { stars: totalStars, maxStars, rankTitle: 'Aventurier Agile', grade: 'Bien' };
  }
  return { stars: totalStars, maxStars, rankTitle: 'Apprenti Moussaillon', grade: 'En apprentissage' };
}

/**
 * Array shuffle using Fisher-Yates algorithm
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles items and ensures that items are displaced
 * so that draggable shapes are not right across from their matching silhouettes!
 */
export function shuffleShapesScrambled<T extends { type: string }>(items: T[]): T[] {
  if (items.length <= 1) return [...items];
  let shuffled = shuffleArray(items);

  let attempts = 0;
  while (attempts < 5 && shuffled.some((item, idx) => item.type === items[idx].type)) {
    shuffled = [...shuffled.slice(1), shuffled[0]];
    attempts++;
  }
  return shuffled;
}

/**
 * Returns the next remaining target item to find/hover/click
 */
export function getNextTargetItem<T extends { id: number | string }>(
  allItems: T[],
  completedIds: (number | string)[]
): T | null {
  const remaining = allItems.filter((item) => !completedIds.includes(item.id));
  return remaining.length > 0 ? remaining[0] : null;
}

/**
 * Arcade Challenge Types & Rules
 */
export type ArcadeClickType = 'left' | 'right' | 'double';

export interface ArcadeTarget {
  id: string;
  expectedClick: ArcadeClickType;
  label: string;
  shortHint: string;
  icon: string;
  colorClass: string;
  badgeBg: string;
  durationMs: number;
}

export function evaluateArcadeClick(
  expected: ArcadeClickType,
  performed: ArcadeClickType
): { isCorrect: boolean; feedbackMessage: string } {
  if (expected === performed) {
    return { isCorrect: true, feedbackMessage: 'Bravo ! Clic parfait !' };
  }

  const names: Record<ArcadeClickType, string> = {
    left: 'Clic Gauche',
    right: 'Clic Droit',
    double: 'Double-Clic',
  };

  return {
    isCorrect: false,
    feedbackMessage: `Aïe ! Tu as fait un ${names[performed]} au lieu d'un ${names[expected]} !`,
  };
}

export function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem('odyssee_meilleur_score');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveStoredHighScore(score: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getStoredHighScore();
    if (score > current) {
      localStorage.setItem('odyssee_meilleur_score', score.toString());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}


