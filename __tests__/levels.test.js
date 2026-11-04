import {
  LEVELS,
  TOTAL_LEVELS,
  getLevelConfig,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
import {
  getUnlockedLevel,
  saveUnlockedLevel,
  isLevelUnlocked,
  resetProgress,
} from '../src/games/rampracer/utils/levelStorage';
import { CAR_HALF_WIDTH } from '../src/games/rampracer/physics/physicsEngine';
describe('50 Unique Levels Validation', () => {
  beforeEach(() => {
    resetProgress();
  });
  it('has exactly 50 playable level configurations', () => {
    expect(TOTAL_LEVELS).toBe(50);
    expect(LEVELS.length).toBe(50);
  });
  it('contains sequential level numbers from 1 to 50 without gaps', () => {
    for (let i = 1; i <= 50; i++) {
      const config = getLevelConfig(i);
      expect(config.levelNumber).toBe(i);
      expect(config.name.length).toBeGreaterThan(0);
      expect(config.challengeType.length).toBeGreaterThan(0);
    }
  });
  it('ensures every single level has a genuinely unique obstacle/gap layout', () => {
    const layoutSignatures = new Set();
    LEVELS.forEach((level) => {
      // Create a geometric signature for each level based on its structural components
      const obsParts = level.obstacles.map((o) => {
        const mv = o.movement
          ? `_mv${o.movement.axis}_${o.movement.range}_${o.movement.speed}`
          : '';
        const yOff = o.yOffsetFromRoad ? `_y${o.yOffsetFromRoad}` : '';
        return `obs(${o.xFraction.toFixed(2)}x${o.width ?? 60}x${
          o.height
        }${yOff}${mv})`;
      });
      const gapParts = (level.roadGaps || []).map((g) => {
        return `gap(${g.xFraction.toFixed(2)}w${g.widthFraction.toFixed(2)})`;
      });
      const signature = `L_obs[${obsParts.join(';')}]_gaps[${gapParts.join(
        ';'
      )}]`;
      // Fail if duplicate layout signature is found
      expect(layoutSignatures.has(signature)).toBe(false);
      layoutSignatures.add(signature);
    });
    // All 50 signatures must be distinct
    expect(layoutSignatures.size).toBe(50);
  });
  it('verifies that all 50 levels have valid, reachable geometry on responsive screen sizes', () => {
    const testWidths = [360, 412, 600, 800];
    const roadY = 700;
    testWidths.forEach((areaWidth) => {
      LEVELS.forEach((level) => {
        const resolved = resolveLevelGeometry(level, areaWidth, roadY, 0);
        // 1. Car starting position must be within valid bounds
        expect(resolved.carStartX).toBeGreaterThanOrEqual(CAR_HALF_WIDTH);
        expect(resolved.carStartX).toBeLessThan(areaWidth * 0.25);
        // 2. Finish line must be near the right edge
        expect(resolved.finishX).toBeGreaterThan(areaWidth * 0.75);
        expect(resolved.finishX).toBeLessThan(areaWidth);
        // 3. Clear threshold must be between car and finish flag
        expect(resolved.clearThresholdX).toBeGreaterThan(resolved.carStartX);
        expect(resolved.clearThresholdX).toBeLessThanOrEqual(
          resolved.finishX + 10
        );
        // 4. Safe drawing zone exists between car and first obstacle
        if (resolved.obstacles.length > 0) {
          const firstObs = resolved.obstacles.reduce((min, o) =>
            o.x < min.x ? o : min
          );
          expect(firstObs.x).toBeGreaterThan(
            resolved.carStartX + CAR_HALF_WIDTH
          );
        }
        // 5. All obstacles are inside playable horizontal limits
        resolved.obstacles.forEach((obs) => {
          expect(obs.x).toBeGreaterThanOrEqual(0);
          expect(obs.x + obs.width).toBeLessThanOrEqual(areaWidth);
          expect(obs.height).toBeGreaterThan(0);
          expect(obs.y).toBeLessThan(roadY); // Must be above or on road
        });
        // 6. Road gaps are situated between car start and finish line
        resolved.roadGaps.forEach((gap) => {
          expect(gap.x).toBeGreaterThan(resolved.carStartX);
          expect(gap.x + gap.width).toBeLessThan(resolved.finishX);
          expect(gap.width).toBeGreaterThan(10);
        });
        // 7. Coin Placement Validation:
        // - Reachable and within playable limits
        // - Never inside obstacles or below ground
        // - Coin target matches the configured target (default: number of coins)
        expect(resolved.coins.length).toBeGreaterThanOrEqual(3);
        expect(resolved.coins.length).toBeLessThanOrEqual(5);
        expect(resolved.coinTarget).toBe(
          level.coinTarget ?? resolved.coins.length
        );
        resolved.coins.forEach((coin) => {
          expect(coin.x).toBeGreaterThan(resolved.carStartX);
          expect(coin.x).toBeLessThan(resolved.finishX);
          expect(coin.y).toBeGreaterThanOrEqual(35);
          expect(coin.y).toBeLessThanOrEqual(roadY - 26);
          // Must never be inside obstacle
          resolved.obstacles.forEach((obs) => {
            const insideX =
              coin.x > obs.x + 2 && coin.x < obs.x + obs.width - 2;
            const insideY =
              coin.y > obs.y + 2 && coin.y < obs.y + obs.height - 2;
            expect(insideX && insideY).toBe(false);
          });
        });
      });
    });
  });
  it('generates different coin positions across levels but perfectly stable on retries', () => {
    const areaWidth = 400;
    const roadY = 600;
    // Retry stability: Level 1 resolved twice produces identical coordinates
    const lvl1First = resolveLevelGeometry(
      getLevelConfig(1),
      areaWidth,
      roadY,
      0
    );
    const lvl1Second = resolveLevelGeometry(
      getLevelConfig(1),
      areaWidth,
      roadY,
      0
    );
    expect(lvl1First.coins).toEqual(lvl1Second.coins);
    // Variation across levels: different levels have different coin positions
    const coinSignatures = new Set();
    for (let i = 1; i <= 50; i++) {
      const geom = resolveLevelGeometry(getLevelConfig(i), areaWidth, roadY, 0);
      const sig = geom.coins
        .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
        .join('|');
      expect(coinSignatures.has(sig)).toBe(false);
      coinSignatures.add(sig);
    }
    expect(coinSignatures.size).toBe(50);
  });
  it('tests level progression and persistence helper', () => {
    expect(getUnlockedLevel()).toBe(1);
    expect(isLevelUnlocked(1)).toBe(true);
    expect(isLevelUnlocked(2)).toBe(false);
    // Complete Level 1 -> Unlocks Level 2
    saveUnlockedLevel(2);
    expect(getUnlockedLevel()).toBe(2);
    expect(isLevelUnlocked(2)).toBe(true);
    expect(isLevelUnlocked(3)).toBe(false);
    // Completing up to Level 50
    saveUnlockedLevel(50);
    expect(getUnlockedLevel()).toBe(50);
    expect(isLevelUnlocked(50)).toBe(true);
    // Clamps to max 50
    saveUnlockedLevel(55);
    expect(getUnlockedLevel()).toBe(50);
    // Resetting progress resets to 1
    resetProgress();
    expect(getUnlockedLevel()).toBe(1);
    expect(isLevelUnlocked(2)).toBe(false);
  });
});
