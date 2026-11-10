import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GAME_CATALOG,
  getNextStep,
  evaluateDoubleClick,
  isWithinSnapDistance,
  evaluateExplorerRankFromStars,
  isLevelComplete,
  getNextTargetItem,
  shuffleShapesScrambled,
  evaluateArcadeClick,
  shuffleArray,
} from './logic';

test('GAME_CATALOG contains all 5 games, each with 5 difficulty levels', () => {
  for (let g = 1; g <= 5; g++) {
    const game = GAME_CATALOG[g as 1 | 2 | 3 | 4 | 5];
    assert.ok(game, `Game ${g} exists`);
    assert.ok(game.title, `Game ${g} has a title`);
    for (let d = 1; d <= 5; d++) {
      const diff = game.difficulties[d as 1 | 2 | 3 | 4 | 5];
      assert.ok(diff, `Game ${g} has difficulty ${d}`);
      assert.ok(diff.targetCount > 0, `Game ${g} difficulty ${d} has positive targetCount`);
    }
  }
});

test('getNextStep advances across difficulties and then moves to the next game', () => {
  // Advance within game 1
  const step1 = getNextStep(1, 1);
  assert.equal(step1.nextGame, 1);
  assert.equal(step1.nextDifficulty, 2);

  // Finishing difficulty 5 of game 1 advances to game 2, difficulty 1
  const step5 = getNextStep(1, 5);
  assert.equal(step5.nextGame, 2);
  assert.equal(step5.nextDifficulty, 1);

  // Finishing difficulty 5 of game 3 advances to game 4 (Clic Droit)
  const step3 = getNextStep(3, 5);
  assert.equal(step3.nextGame, 4);
  assert.equal(step3.nextDifficulty, 1);

  // Finishing difficulty 5 of game 4 advances to game 5 (Glisser-Déposer)
  const step4 = getNextStep(4, 5);
  assert.equal(step4.nextGame, 5);
  assert.equal(step4.nextDifficulty, 1);

  // Finishing game 5, difficulty 5 triggers victory/arcade
  const finalStep = getNextStep(5, 5);
  assert.equal(finalStep.nextGame, 'arcade');
  assert.equal(finalStep.isVictory, true);
});

test('evaluateDoubleClick recognizes intervals based on specific difficulty thresholds', () => {
  // Generous threshold 700ms (Difficulty 1)
  const resultDiff1 = evaluateDoubleClick(1000, 1600, 700);
  assert.equal(resultDiff1.isDoubleClick, true);

  // Strict threshold 350ms (Difficulty 5)
  const resultDiff5Fail = evaluateDoubleClick(1000, 1400, 350);
  assert.equal(resultDiff5Fail.isDoubleClick, false);

  const resultDiff5Pass = evaluateDoubleClick(1000, 1250, 350);
  assert.equal(resultDiff5Pass.isDoubleClick, true);
});

test('isWithinSnapDistance correctly detects distance with variable thresholds', () => {
  const target = { x: 200, y: 200 };
  const itemPos = { x: 200, y: 300 };
  assert.equal(isWithinSnapDistance(itemPos, target, 110), true);
  assert.equal(isWithinSnapDistance(itemPos, target, 55), false);
});

test('evaluateExplorerRankFromStars calculates titles up to 25 stars', () => {
  const rank25 = evaluateExplorerRankFromStars(25);
  assert.equal(rank25.stars, 25);
  assert.equal(rank25.maxStars, 25);
  assert.equal(rank25.rankTitle, 'Légende Suprême de la Souris');

  const rank18 = evaluateExplorerRankFromStars(18);
  assert.equal(rank18.rankTitle, 'Grand Capitaine Explorateur');

  const rank12 = evaluateExplorerRankFromStars(12);
  assert.equal(rank12.rankTitle, 'Navigateur Intrépide');
});

test('evaluateArcadeClick evaluates left, right, and double clicks correctly', () => {
  const correctLeft = evaluateArcadeClick('left', 'left');
  assert.equal(correctLeft.isCorrect, true);

  const wrongLeft = evaluateArcadeClick('left', 'right');
  assert.equal(wrongLeft.isCorrect, false);
  assert.match(wrongLeft.feedbackMessage, /Clic Droit/);

  const correctRight = evaluateArcadeClick('right', 'right');
  assert.equal(correctRight.isCorrect, true);

  const wrongDouble = evaluateArcadeClick('double', 'left');
  assert.equal(wrongDouble.isCorrect, false);
});

test('shuffleArray correctly randomizes order of items without losing items', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];
  const shuffled = shuffleArray(items);
  assert.equal(shuffled.length, 7);
  assert.deepEqual([...shuffled].sort(), [1, 2, 3, 4, 5, 6, 7]);
});
