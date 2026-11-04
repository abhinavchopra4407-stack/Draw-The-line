import {
  validateRampDrawing,
  buildRampSegments,
  doesSegmentIntersectObstacle,
  stepCarPhysics,
  STUCK_TIMEOUT,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  consumePowerUp,
  isPowerUpConsumed,
  getConsumedPowerUps,
  resetConsumedPowerUpsForTesting,
} from '../src/games/rampracer/utils/levelStorage';
import {
  LEVELS,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
describe('Drawing Obstacle Intersection & Gameplay Audit', () => {
  beforeEach(() => {
    resetConsumedPowerUpsForTesting();
  });
  describe('1. Obstacle Intersection & Line Penetration Check', () => {
    const testObstacle = {
      id: 'test-block',
      x: 150,
      width: 60,
      y: 300,
      height: 80,
    };
    it('detects a line segment cutting straight horizontally through the obstacle', () => {
      const p1 = { x: 100, y: 340 };
      const p2 = { x: 250, y: 340 };
      expect(doesSegmentIntersectObstacle(p1, p2, testObstacle)).toBe(true);
    });
    it('detects a point drawn directly inside the obstacle interior', () => {
      const p1 = { x: 170, y: 330 }; // inside
      const p2 = { x: 190, y: 350 }; // inside
      expect(doesSegmentIntersectObstacle(p1, p2, testObstacle)).toBe(true);
    });
    it('does NOT flag a ramp drawn in the sky over the obstacle', () => {
      const p1 = { x: 100, y: 250 };
      const p2 = { x: 250, y: 220 };
      expect(doesSegmentIntersectObstacle(p1, p2, testObstacle)).toBe(false);
    });
    it('does NOT flag a ramp drawn before the obstacle', () => {
      const p1 = { x: 40, y: 380 };
      const p2 = { x: 120, y: 320 };
      expect(doesSegmentIntersectObstacle(p1, p2, testObstacle)).toBe(false);
    });
  });
  describe('2. Level 17 ("Camel Dunes") Drawing Audit', () => {
    const lvl17 = LEVELS.find((l) => l.levelNumber === 17);
    const roadY = 400;
    const geom = resolveLevelGeometry(lvl17, 360, roadY, 0, 558);
    it('has the two expected mound obstacles in Level 17', () => {
      expect(geom.obstacles.length).toBe(2);
      expect(geom.obstacles[0].id).toBe('l17-h1');
      expect(geom.obstacles[1].id).toBe('l17-h2');
    });
    it('rejects a drawing that cuts straight through the Level 17 mounds', () => {
      // Drawing straight through mound 1 (x ~ 122..182, y ~ 325..400)
      const straightThroughMounds = [
        { x: geom.carStartX, y: roadY },
        { x: 150, y: roadY - 10 },
        { x: 250, y: roadY - 10 },
        { x: 350, y: roadY },
      ];
      const validation = validateRampDrawing(
        straightThroughMounds,
        roadY,
        geom.carStartX,
        300,
        geom.obstacles
      );
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain(
        'Cannot draw through solid obstacles'
      );
    });
    it('rejects drawing inside or behind the second mound', () => {
      const insideSecondMound = [
        { x: geom.carStartX, y: roadY },
        { x: geom.obstacles[1].x + 10, y: geom.obstacles[1].y + 20 },
        { x: geom.obstacles[1].x + 30, y: geom.obstacles[1].y + 20 },
      ];
      const validation = validateRampDrawing(
        insideSecondMound,
        roadY,
        geom.carStartX,
        300,
        geom.obstacles
      );
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain(
        'Cannot draw through solid obstacles'
      );
    });
    it('accepts a valid launching ramp curving over the mounds in Level 17', () => {
      // Clean takeoff ramp that launches the car before reaching mound 1
      const validTakeoffRamp = [
        { x: geom.carStartX, y: roadY },
        { x: geom.carStartX + 25, y: roadY - 20 },
        { x: geom.carStartX + 50, y: roadY - 45 },
        { x: geom.obstacles[0].x - 10, y: roadY - 80 },
      ];
      const validation = validateRampDrawing(
        validTakeoffRamp,
        roadY,
        geom.carStartX,
        300,
        geom.obstacles
      );
      expect(validation.isValid).toBe(true);
      expect(validation.sanitizedPoints.length).toBeGreaterThan(0);
    });
    it('buildRampSegments filters out segments intersecting obstacles even if passed directly', () => {
      const pointsThroughObstacle = [
        { x: geom.carStartX, y: roadY },
        { x: geom.obstacles[0].x + 20, y: geom.obstacles[0].y + 20 },
        { x: 300, y: roadY },
      ];
      const segments = buildRampSegments(
        pointsThroughObstacle,
        roadY,
        geom.obstacles
      );
      // Any segment penetrating the mound is discarded
      for (const seg of segments) {
        expect(
          doesSegmentIntersectObstacle(seg.p1, seg.p2, geom.obstacles[0])
        ).toBe(false);
      }
    });
  });
  describe('3. Creative Ramps, Curves & Loops Remain Valid in Free Space', () => {
    it('accepts a smooth curved loop in clear sky', () => {
      const roadY = 400;
      const loopPoints = [
        { x: 50, y: roadY },
        { x: 80, y: roadY - 30 },
        { x: 100, y: roadY - 70 },
        { x: 90, y: roadY - 110 },
        { x: 60, y: roadY - 120 },
        { x: 40, y: roadY - 90 },
        { x: 60, y: roadY - 60 },
        { x: 110, y: roadY - 40 },
        { x: 150, y: roadY - 20 },
      ];
      const validation = validateRampDrawing(loopPoints, roadY, 40, 200, []);
      expect(validation.isValid).toBe(true);
    });
  });
  describe('4. Car Stuck Detection Timing', () => {
    it('has STUCK_TIMEOUT set to exactly 1.0 second', () => {
      expect(STUCK_TIMEOUT).toBe(1.0);
    });
    it('triggers stuck status after car is stationary against an obstacle for > 1.0s', () => {
      // Solid obstacle right in front of the car
      const blockingObstacle = {
        id: 'wall',
        x: 100,
        width: 50,
        y: 300,
        height: 100,
      };
      let state = {
        x: 75,
        y: 380,
        vx: 0,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const dt = 1 / 60;
      // Step for 0.8s: car contacts obstacle and stops; stuckTimer < 1.0 so still running
      for (let i = 0; i < 48; i++) {
        const res = stepCarPhysics({
          state,
          segments: [],
          obstacles: [blockingObstacle],
          roadGaps: [],
          roadY: 400,
          finishX: 500,
          clearThresholdX: 300,
          dt,
          handling: {
            driveAccel: 0,
            maxVx: 0,
            airDriveAccel: 0,
            gravity: 620,
            pitchResponsiveness: 24,
          },
        });
        state = res.state;
        expect(res.status).toBe('running');
      }
      // Step past 1.0s: triggers stuck status
      let finalStatus = 'running';
      for (let i = 0; i < 20; i++) {
        const res = stepCarPhysics({
          state,
          segments: [],
          obstacles: [blockingObstacle],
          roadGaps: [],
          roadY: 400,
          finishX: 500,
          clearThresholdX: 300,
          dt,
          handling: {
            driveAccel: 0,
            maxVx: 0,
            airDriveAccel: 0,
            gravity: 620,
            pitchResponsiveness: 24,
          },
        });
        state = res.state;
        finalStatus = res.status;
      }
      expect(finalStatus).toBe('stuck');
      expect(state.stuckTimer).toBeGreaterThanOrEqual(1.0);
    });
  });
  describe('5. Power-Up Consumption & No-Refund Guarantee', () => {
    it('tracks consumed power-up permanently and prevents refunds', () => {
      const level = 2;
      const powerUpId = 'lvl-2-powerup-shield';
      expect(isPowerUpConsumed(level, powerUpId)).toBe(false);
      // Power-up is collected/activated
      consumePowerUp(level, powerUpId);
      expect(isPowerUpConsumed(level, powerUpId)).toBe(true);
      expect(getConsumedPowerUps()).toContain(`${level}:${powerUpId}`);
      // Level retried or restarted: power-up remains consumed!
      const levelPowerUps = [
        { id: powerUpId, type: 'shield', x: 200, y: 350, collected: false },
      ];
      const remappedOnRetry = levelPowerUps.map((p) => ({
        ...p,
        collected: isPowerUpConsumed(level, p.id),
      }));
      expect(remappedOnRetry[0].collected).toBe(true);
    });
  });
  describe('6. 50-Level Geometric Integrity Audit', () => {
    it('verifies all 50 levels have valid geometry and obstacles', () => {
      expect(LEVELS.length).toBe(50);
      const roadY = 400;
      for (let i = 1; i <= 50; i++) {
        const config = LEVELS.find((l) => l.levelNumber === i);
        expect(config).toBeDefined();
        const geom = resolveLevelGeometry(config, 360, roadY, 0, 558);
        expect(geom.carStartX).toBeGreaterThan(0);
        expect(geom.finishX).toBeGreaterThan(geom.carStartX);
        expect(geom.clearThresholdX).toBeGreaterThan(geom.carStartX);
        // All obstacles must have positive dimensions and be on or above the road
        for (const obs of geom.obstacles) {
          expect(obs.width).toBeGreaterThan(0);
          expect(obs.height).toBeGreaterThan(0);
          expect(obs.y + obs.height).toBeLessThanOrEqual(roadY + 15);
        }
      }
    });
  });
});
