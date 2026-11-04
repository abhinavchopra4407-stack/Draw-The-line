/**
 * Simulation regression gate: every level must be completable by a valid drawing at real
 * landscape sizes, and the configured coin target (2-star requirement) must be reachable
 * in a single valid run. Uses the real drawing pipeline and stepCarPhysics.
 */
import {
  LEVELS,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
import {
  makeLevelContext,
  resample,
  runStroke,
  solveLevel,
} from '../test-utils/levelSolver';
jest.setTimeout(120000);
// Default run: one representative landscape size. Set FULL_LEVEL_SIM=1 for all sizes (~3x slower).
const SIZES = globalThis.process?.env?.FULL_LEVEL_SIM
  ? [
      [640, 280],
      [800, 280],
      [915, 332],
    ]
  : [[800, 280]];
describe('coinTarget configuration', () => {
  it('a configured coinTarget never changes coin count or positions', () => {
    for (const cfg of LEVELS) {
      const configured = resolveLevelGeometry(cfg, 800, 210, 0, 1240);
      const unconfigured = resolveLevelGeometry(
        { ...cfg, coinTarget: undefined },
        800,
        210,
        0,
        1240
      );
      expect(configured.coins).toEqual(unconfigured.coins);
      expect(configured.coinTarget).toBeGreaterThanOrEqual(1);
      expect(configured.coinTarget).toBeLessThanOrEqual(
        configured.coins.length
      );
    }
  });
});
// Shortcut gate (cheap, always all sizes): driving along the road with a token stroke must never win.
describe.each([
  [640, 280],
  [800, 280],
  [915, 332],
])('no road shortcut at %ix%i', (W, H) => {
  it.each(LEVELS.map((l) => l.levelNumber))(
    'level %i cannot be completed by a tiny flat stroke',
    (levelNumber) => {
      const ctx = makeLevelContext(levelNumber, W, H);
      const tiny = resample([
        { x: ctx.startX + 15, y: ctx.roadY - 4 },
        { x: ctx.startX + 80, y: ctx.roadY - 4 },
      ]);
      // Moving obstacles: 26 start phases spanning 1.25s (>= one full cycle for every mover)
      const phases = ctx.moving
        ? Array.from({ length: 26 }, (_, i) => i * 0.05)
        : [0];
      for (const t0 of phases) {
        const r = runStroke(ctx, tiny, t0);
        expect(r.valid).toBe(true);
        expect(r.status).not.toBe('success');
      }
    }
  );
});
describe.each(SIZES)('all 50 levels at %ix%i', (W, H) => {
  it.each(LEVELS.map((l) => l.levelNumber))(
    'level %i: a valid drawing completes it with the coin target collected',
    (levelNumber) => {
      const ctx = makeLevelContext(levelNumber, W, H);
      const result = solveLevel(ctx, {
        grid: 'full',
        stopAtCoins: ctx.geom0.coinTarget,
      });
      expect(result.timeouts).toBe(0); // no run left running without a stuck/finish result
      expect(result.successes).toBeGreaterThan(0);
      expect(result.maxCoins).toBeGreaterThanOrEqual(ctx.geom0.coinTarget);
    }
  );
});
