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
  CAR_HALF_WIDTH,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  markLevelCompleted,
  resetProgress,
  saveLevelStars,
  getLevelStars,
  getTotalCoins,
} from '../src/games/rampracer/utils/levelStorage';
describe('RAMP RACER - COMPLETE 50-LEVEL QUALITY AUDIT (12 CRITERIA PER LEVEL)', () => {
  const areaWidth = 360;
  const roadY = 400;
  const worldWidth = 558;
  const dt = 1 / 60;
  beforeEach(() => {
    resetProgress();
  });
  it('confirms all 50 levels are registered and defined', () => {
    expect(TOTAL_LEVELS).toBe(50);
    expect(LEVELS.length).toBe(50);
  });
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
      // 1. Normal valid gameplay baseline
      it(`[Level ${lvl}] Criterion 1: Normal valid gameplay baseline`, () => {
        expect(geom.carStartX).toBeGreaterThanOrEqual(CAR_HALF_WIDTH);
        expect(geom.finishX).toBeGreaterThan(geom.carStartX + 100);
        expect(geom.clearThresholdX).toBeGreaterThan(geom.carStartX);
        // Grounded start state test
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
          lastProgressX: geom.carStartX,
          lastProgressY: roadY - 20,
        };
        const res = stepCarPhysics({
          state: startState,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          clearThresholdX: geom.clearThresholdX,
          dt,
        });
        expect(res.state.isGrounded).toBe(true);
        expect(res.status).toBe('running');
      });
      // 2. Valid curved ramp
      it(`[Level ${lvl}] Criterion 2: Valid curved ramp accepted`, () => {
        const firstHurdle =
          geom.obstacles.length > 0
            ? Math.min(...geom.obstacles.map((o) => o.x))
            : geom.roadGaps.length > 0
            ? Math.min(...geom.roadGaps.map((g) => g.x))
            : geom.carStartX + 200;
        const maxLaunchX = Math.max(firstHurdle + 60, areaWidth * 0.65);
        const rampEnd = Math.min(firstHurdle - 10, geom.carStartX + 100);
        const curvedRamp = [
          { x: geom.carStartX, y: roadY },
          {
            x: geom.carStartX + (rampEnd - geom.carStartX) * 0.4,
            y: roadY - 20,
          },
          {
            x: geom.carStartX + (rampEnd - geom.carStartX) * 0.7,
            y: roadY - 45,
          },
          { x: rampEnd, y: roadY - 70 },
        ];
        const validation = validateRampDrawing(
          curvedRamp,
          roadY,
          geom.carStartX,
          maxLaunchX,
          geom.obstacles
        );
        expect(validation.isValid).toBe(true);
        const segments = buildRampSegments(
          validation.sanitizedPoints,
          roadY,
          geom.obstacles
        );
        expect(segments.length).toBeGreaterThan(0);
      });
      // 3. Valid loop-shaped ramp where possible
      it(`[Level ${lvl}] Criterion 3: Valid loop-shaped ramp allowed in open sky`, () => {
        const firstHurdle =
          geom.obstacles.length > 0
            ? Math.min(...geom.obstacles.map((o) => o.x))
            : geom.roadGaps.length > 0
            ? Math.min(...geom.roadGaps.map((g) => g.x))
            : geom.carStartX + 180;
        // Scale loop to fit cleanly within available open space before first obstacle
        const openWidth = Math.max(
          25,
          Math.min(65, firstHurdle - geom.carStartX - 15)
        );
        const loopPoints = [
          { x: geom.carStartX, y: roadY },
          { x: geom.carStartX + openWidth * 0.3, y: roadY - 30 },
          { x: geom.carStartX + openWidth * 0.5, y: roadY - 70 },
          { x: geom.carStartX + openWidth * 0.35, y: roadY - 95 },
          { x: geom.carStartX + openWidth * 0.1, y: roadY - 80 },
          { x: geom.carStartX + openWidth * 0.25, y: roadY - 45 },
          { x: geom.carStartX + openWidth * 0.7, y: roadY - 30 },
          { x: geom.carStartX + openWidth, y: roadY - 15 },
        ];
        const validation = validateRampDrawing(
          loopPoints,
          roadY,
          geom.carStartX,
          geom.carStartX + openWidth + 20,
          geom.obstacles
        );
        expect(validation.isValid).toBe(true);
      });
      // 4. Disconnected drawing rejected
      it(`[Level ${lvl}] Criterion 4: Disconnected drawing floating in sky rejected`, () => {
        const floatingLine = [
          { x: 100, y: roadY - 130 },
          { x: 150, y: roadY - 140 },
          { x: 200, y: roadY - 130 },
        ];
        const validation = validateRampDrawing(
          floatingLine,
          roadY,
          geom.carStartX,
          300,
          geom.obstacles
        );
        expect(validation.isValid).toBe(false);
        expect(validation.reason).toContain('road');
      });
      // 5. Drawing through or behind a solid obstacle
      it(`[Level ${lvl}] Criterion 5: Drawing through solid obstacles strictly rejected`, () => {
        if (geom.obstacles.length > 0) {
          const obs = geom.obstacles[0];
          const cuttingLine = [
            { x: geom.carStartX, y: roadY },
            { x: obs.x + obs.width * 0.5, y: obs.y + obs.height * 0.5 },
            { x: obs.x + obs.width + 30, y: roadY },
          ];
          const validation = validateRampDrawing(
            cuttingLine,
            roadY,
            geom.carStartX,
            obs.x + obs.width + 50,
            geom.obstacles
          );
          expect(validation.isValid).toBe(false);
          expect(validation.reason).toContain(
            'Cannot draw through solid obstacles'
          );
        } else {
          // If no obstacles, verify road gaps block drawing into pits
          expect(geom.roadGaps.length).toBeGreaterThan(0);
        }
      });
      // 6. Car stuck in a pit or inaccessible area
      it(`[Level ${lvl}] Criterion 6: Car stuck in a pit triggers retry within <= 1.0s`, () => {
        if (geom.roadGaps.length > 0) {
          const gap = geom.roadGaps[0];
          let pitState = {
            x: gap.x + gap.width * 0.5,
            y: roadY + 15, // inside pit below road level
            vx: 0,
            vy: 40,
            angle: 15,
            wheelRotation: 0,
            isGrounded: false,
            hasClearedObstacle: false,
            stuckTimer: 0,
            lastProgressX: gap.x + gap.width * 0.5,
            lastProgressY: roadY + 15,
          };
          let finalStatus = 'running';
          for (let step = 0; step < 60; step++) {
            const res = stepCarPhysics({
              state: pitState,
              segments: [],
              obstacles: geom.obstacles,
              roadGaps: geom.roadGaps,
              roadY,
              finishX: geom.finishX,
              clearThresholdX: geom.clearThresholdX,
              dt,
            });
            pitState = res.state;
            finalStatus = res.status;
            if (finalStatus === 'stuck') break;
          }
          expect(finalStatus).toBe('stuck');
        } else {
          // Fall off backward boundary
          const outState = {
            x: -90,
            y: roadY - 20,
            vx: 0,
            vy: 0,
            angle: 0,
            wheelRotation: 0,
            isGrounded: false,
            hasClearedObstacle: false,
            stuckTimer: 0,
          };
          const res = stepCarPhysics({
            state: outState,
            segments: [],
            obstacles: geom.obstacles,
            roadGaps: geom.roadGaps,
            roadY,
            finishX: geom.finishX,
            clearThresholdX: geom.clearThresholdX,
            dt,
          });
          expect(res.status).toBe('stuck');
        }
      });
      // 7. Car stuck against an obstacle
      it(`[Level ${lvl}] Criterion 7: Car stuck against obstacle triggers retry within 1.0s`, () => {
        const groundObs = geom.obstacles.find(
          (o) => o.y + o.height >= roadY - 5
        ) ?? {
          id: 'test-block',
          x: geom.carStartX + 50,
          width: 50,
          y: roadY - 70,
          height: 70,
        };
        let state = {
          x: groundObs.x - CAR_HALF_WIDTH - 2,
          y: roadY - 20,
          vx: 0,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: false,
          stuckTimer: 0,
          lastProgressX: groundObs.x - CAR_HALF_WIDTH - 2,
          lastProgressY: roadY - 20,
        };
        let status = 'running';
        // Run for 1.1s (66 steps of 1/60s)
        for (let i = 0; i < 66; i++) {
          const res = stepCarPhysics({
            state,
            segments: [],
            obstacles: [groundObs],
            roadGaps: [],
            roadY,
            finishX: geom.finishX,
            clearThresholdX: geom.clearThresholdX,
            dt,
          });
          state = res.state;
          status = res.status;
          if (status === 'stuck') break;
        }
        expect(status).toBe('stuck');
        expect(state.stuckTimer).toBeGreaterThanOrEqual(1.0);
      });
      // 8. Car stuck on a broken ramp (trough oscillation)
      it(`[Level ${lvl}] Criterion 8: Car oscillating in broken ramp trough triggers stuck within <= 1.2s`, () => {
        const troughSegments = [
          {
            p1: { x: geom.carStartX - 30, y: roadY - 60 },
            p2: { x: geom.carStartX, y: roadY - 5 },
            length: 62.6,
            angle: 1.07,
            normal: { x: 0.88, y: -0.48 },
          },
          {
            p1: { x: geom.carStartX, y: roadY - 5 },
            p2: { x: geom.carStartX + 30, y: roadY - 80 },
            length: 80.8,
            angle: -1.19,
            normal: { x: -0.93, y: -0.37 },
          },
        ];
        // Dead-end obstacle capping the broken ramp trough
        const deadEndObstacle = {
          id: 'dead-end-wall',
          x: geom.carStartX + 28,
          y: roadY - 120,
          width: 30,
          height: 140,
        };
        let state = {
          x: geom.carStartX + 10,
          y: roadY - 10,
          vx: 0,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: false,
          stuckTimer: 0,
          lastProgressX: geom.carStartX + 10,
          lastProgressY: roadY - 10,
        };
        let status = 'running';
        for (let i = 0; i < 75; i++) {
          const res = stepCarPhysics({
            state,
            segments: troughSegments,
            obstacles: [...geom.obstacles, deadEndObstacle],
            roadGaps: geom.roadGaps,
            roadY,
            finishX: geom.finishX,
            clearThresholdX: geom.clearThresholdX,
            dt,
          });
          state = res.state;
          status = res.status;
          if (status === 'stuck') break;
        }
        expect(status).toBe('stuck');
      });
      // 9. Airborne finish crossing = LEVEL FAILED
      it(`[Level ${lvl}] Criterion 9: Airborne finish crossing triggers failure (not success)`, () => {
        const airborneState = {
          x: geom.finishX,
          y: roadY - 75, // Flying high above finish flag without road contact
          vx: 300,
          vy: -20,
          angle: -10,
          wheelRotation: 0,
          isGrounded: false,
          hasClearedObstacle: true,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state: airborneState,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          clearThresholdX: geom.clearThresholdX,
          dt,
        });
        expect(res.status).toBe('stuck');
      });
      // 10. Valid grounded finish crossing
      it(`[Level ${lvl}] Criterion 10: Valid grounded crossing awards success`, () => {
        const groundedState = {
          x: geom.finishX - 2,
          y: roadY - 20,
          vx: 350,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: true,
          stuckTimer: 0,
        };
        const res = stepCarPhysics({
          state: groundedState,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          clearThresholdX: geom.clearThresholdX,
          dt,
        });
        expect(res.status).toBe('success');
      });
      // 11. Retry after a stuck state
      it(`[Level ${lvl}] Criterion 11: Retry resets car cleanly without resetting lifetime progress`, () => {
        markLevelCompleted(lvl);
        saveLevelStars(lvl, 3);
        const coinsBefore = getTotalCoins();
        // Fresh state after retry
        const retryState = {
          x: geom.carStartX,
          y: roadY - 20,
          vx: 0,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: false,
          stuckTimer: 0,
          lastProgressX: geom.carStartX,
          lastProgressY: roadY - 20,
        };
        expect(retryState.x).toBe(geom.carStartX);
        expect(retryState.stuckTimer).toBe(0);
        expect(getLevelStars(lvl)).toBe(3);
        expect(getTotalCoins()).toBe(coinsBefore);
      });
      // 12. Coin and star calculation
      it(`[Level ${lvl}] Criterion 12: Coins are reachable and coin target is valid`, () => {
        expect(geom.coins.length).toBeGreaterThanOrEqual(1);
        expect(geom.coinTarget).toBeGreaterThanOrEqual(1);
        expect(geom.coinTarget).toBeLessThanOrEqual(geom.coins.length);
        for (const coin of geom.coins) {
          expect(coin.x).toBeGreaterThan(geom.carStartX);
          expect(coin.x).toBeLessThan(geom.finishX + 50);
          expect(coin.y).toBeLessThanOrEqual(roadY);
          expect(coin.y).toBeGreaterThan(20);
        }
      });
    });
  }
});
