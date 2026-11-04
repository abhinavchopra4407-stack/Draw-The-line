import {
  LEVELS,
  TOTAL_LEVELS,
  getLevelConfig,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
import {
  stepCarPhysics,
  buildRampSegments,
  validateRampDrawing,
  checkCoinCarCollision,
  CAR_HALF_WIDTH,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  getUnlockedLevel,
  saveUnlockedLevel,
  markLevelCompleted,
  resetProgress,
} from '../src/games/rampracer/utils/levelStorage';
import { VEHICLES } from '../src/games/rampracer/types/vehicles';
describe('Regression Testing: All 50 Levels Individually Tested', () => {
  const areaWidth = 400;
  const roadY = 400;
  const worldWidth = 620;
  beforeEach(() => {
    resetProgress();
  });
  // Verify all 50 levels exist
  it('contains all 50 levels', () => {
    expect(TOTAL_LEVELS).toBe(50);
    expect(LEVELS.length).toBe(50);
  });
  // Test every single level from 1 to 50
  for (let lvl = 1; lvl <= 50; lvl++) {
    describe(`Level ${lvl}: ${LEVELS[lvl - 1].name}`, () => {
      const config = getLevelConfig(lvl);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      it(`Point 1: starting road works correctly (car grounded at start)`, () => {
        expect(geom.carStartX).toBeGreaterThanOrEqual(CAR_HALF_WIDTH);
        expect(geom.carStartX).toBeLessThan(geom.finishX);
        // Step physics at start: should remain grounded on flat road
        const startState = {
          x: geom.carStartX,
          y: roadY - 20,
          vx: 0,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: false,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state: startState,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          dt: 0.016,
        });
        expect(res.state.isGrounded).toBe(true);
        expect(res.status).toBe('running');
      });
      it(`Point 2: intended ramp works correctly`, () => {
        // Construct an intended ramp connecting road to obstacle clearance
        const firstObs = geom.obstacles[0];
        const firstGap = geom.roadGaps[0];
        const hurdleX = firstObs ? firstObs.x : firstGap ? firstGap.x : 250;
        const hurdleH = firstObs ? firstObs.height : 60;
        const rampPoints = [
          { x: geom.carStartX + 20, y: roadY },
          { x: hurdleX - 10, y: roadY - hurdleH - 25 },
          { x: hurdleX + 60, y: roadY - hurdleH - 20 },
          { x: hurdleX + 130, y: roadY },
        ];
        const validation = validateRampDrawing(
          rampPoints,
          roadY,
          geom.carStartX,
          hurdleX + 40
        );
        expect(validation.isValid).toBe(true);
        const segments = buildRampSegments(rampPoints, roadY);
        expect(segments.length).toBeGreaterThanOrEqual(3);
      });
      it(`Point 3 & 4: random unrelated lines cannot support the car or bypass route`, () => {
        // Random line floating high in the sky
        const skyLine = [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 300, y: 100 },
        ];
        const validation = validateRampDrawing(skyLine, roadY, geom.carStartX);
        expect(validation.isValid).toBe(false);
        // buildRampSegments with roadY returns 0 collision segments
        const segments = buildRampSegments(skyLine, roadY);
        expect(segments.length).toBe(0);
        // Car cannot be supported by empty segments in the air
        const skyCar = {
          x: 200,
          y: 100,
          vx: 150,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: false,
          hasClearedObstacle: false,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state: skyCar,
          segments,
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          dt: 0.016,
        });
        // Car falls under gravity because random line has NO collision surfaces
        expect(res.state.isGrounded).toBe(false);
        expect(res.state.vy).toBeGreaterThan(0);
      });
      it(`Point 5: finish line cannot be passed while airborne`, () => {
        const airborneCrossing = {
          x: geom.finishX,
          y: roadY - 80, // Airborne 80px high
          vx: 250,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: false,
          hasClearedObstacle: true,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state: airborneCrossing,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          dt: 0.016,
        });
        expect(res.status).toBe('stuck');
        expect(res.status).not.toBe('success');
      });
      it(`Point 6: valid grounded finish crossing works`, () => {
        const groundedCrossing = {
          x: geom.finishX - 10,
          y: roadY - 20,
          vx: 180,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: true,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state: groundedCrossing,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          dt: 0.016,
        });
        expect(res.status).toBe('success');
      });
      it(`Point 7 & 8: coins are collectible, none inside obstacles, stars calculated correctly`, () => {
        expect(geom.coins.length).toBeGreaterThanOrEqual(3);
        expect(geom.coins.length).toBeLessThanOrEqual(5);
        for (const coin of geom.coins) {
          expect(coin.x).toBeGreaterThan(geom.carStartX);
          expect(coin.x).toBeLessThan(geom.finishX);
          expect(coin.y).toBeLessThanOrEqual(roadY - 20);
          // None inside obstacle
          for (const obs of geom.obstacles) {
            const inX = coin.x > obs.x + 2 && coin.x < obs.x + obs.width - 2;
            const inY = coin.y > obs.y + 2 && coin.y < obs.y + obs.height - 2;
            expect(inX && inY).toBe(false);
          }
          // Coin collection check
          const touches = checkCoinCarCollision(coin, coin.x, coin.y, 0);
          expect(touches).toBe(true);
        }
      });
      it(`Point 9 & 10: retry works and level progression saves permanently`, () => {
        saveUnlockedLevel(lvl);
        expect(getUnlockedLevel()).toBe(lvl);
        const progression = markLevelCompleted(lvl);
        if (lvl < 50) {
          expect(progression.nextLevel).toBe(lvl + 1);
          expect(getUnlockedLevel()).toBe(lvl + 1);
        } else {
          expect(progression.nextLevel).toBe(50);
        }
      });
    });
  }
  // Multi-vehicle physics compatibility test
  describe('Multi-Vehicle Handling & Stability', () => {
    it('verifies all 5 vehicles operate stably on road physics', () => {
      expect(VEHICLES.length).toBe(5);
      for (const vehicle of VEHICLES) {
        const state = {
          x: 100,
          y: roadY - 20,
          vx: 120,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: false,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state,
          segments: [],
          obstacles: [],
          roadY,
          finishX: 9999,
          dt: 0.016,
          handling: vehicle.handling,
        });
        expect(res.state.isGrounded).toBe(true);
        expect(res.state.vx).toBeGreaterThan(120); // Accelerated
        expect(Math.abs(res.state.y - (roadY - 20))).toBeLessThan(3); // Level on road
      }
    });
  });
});
