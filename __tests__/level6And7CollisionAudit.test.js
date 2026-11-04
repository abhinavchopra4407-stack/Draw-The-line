import {
  stepCarPhysics,
  buildRampSegments,
  validateRampDrawing,
  CAR_HALF_WIDTH,
  FIXED_DT,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  getLevelConfig,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
describe('Level 6 & Level 7 Collision Audit & Shared Collision Verification', () => {
  const areaWidth = 400;
  const roadY = 400;
  const worldWidth = 620;
  function simulateLevel(levelNumber, rampPoints, maxSteps = 350) {
    const config = getLevelConfig(levelNumber);
    const geom = resolveLevelGeometry(config, areaWidth, roadY, 0, worldWidth);
    const segments = buildRampSegments(rampPoints, roadY);
    let state = {
      x: geom.carStartX,
      y: roadY - 20,
      vx: 60,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    let status = 'running';
    let steps = 0;
    for (let i = 0; i < maxSteps; i++) {
      steps++;
      const res = stepCarPhysics({
        state,
        segments,
        obstacles: geom.obstacles,
        roadGaps: geom.roadGaps,
        roadY,
        finishX: geom.finishX,
        clearThresholdX: geom.clearThresholdX,
        dt: FIXED_DT,
      });
      state = res.state;
      status = res.status;
      if (status !== 'running') {
        break;
      }
    }
    return { status, steps, finalState: state };
  }
  // =============================================================
  // LEVEL 6 VERIFICATIONS
  // =============================================================
  describe('Level 6 – Road Gap & Solid Collision Checks', () => {
    it('strictly FAILS Level 6 when driving on flat road without drawing a ramp', () => {
      // Car drives towards the wide chasm without a ramp
      const result = simulateLevel(6, []);
      // Without a ramp, car must fall into the gap / hit pit wall
      expect(result.status).toBe('stuck');
      expect(result.finalState.hasClearedObstacle).toBe(false);
      expect(result.finalState.y).toBeGreaterThan(roadY);
    });
    it('SUCCEEDS Level 6 when drawing a valid ramp over the chasm', () => {
      const config = getLevelConfig(6);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const gap = geom.roadGaps[0]; // Chasm from x=152 to x=252
      // Draw a parabolic ramp spanning over the chasm and landing on the road
      const validRamp = [
        { x: geom.carStartX + 10, y: roadY },
        { x: gap.x - 20, y: roadY - 35 },
        { x: gap.x + gap.width * 0.5, y: roadY - 55 },
        { x: gap.x + gap.width + 25, y: roadY - 20 },
        { x: gap.x + gap.width + 65, y: roadY },
      ];
      const validation = validateRampDrawing(
        validRamp,
        roadY,
        geom.carStartX,
        gap.x + 40
      );
      expect(validation.isValid).toBe(true);
      const result = simulateLevel(6, validRamp);
      expect(result.status).toBe('success');
      expect(result.finalState.hasClearedObstacle).toBe(true);
      expect(result.finalState.isGrounded).toBe(true);
      expect(result.finalState.x).toBeGreaterThanOrEqual(geom.finishX - 10);
    });
    it('prevents car from clipping through pit wall when falling into the chasm', () => {
      const config = getLevelConfig(6);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const gap = geom.roadGaps[0];
      // Place car dropped inside the pit, attempting to push forward through the far pit wall
      const insidePitState = {
        x: gap.x + gap.width - 15,
        y: roadY + 15, // Below road surface
        vx: 300,
        vy: 50,
        angle: 15,
        wheelRotation: 0,
        isGrounded: false,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const res = stepCarPhysics({
        state: insidePitState,
        segments: [],
        obstacles: geom.obstacles,
        roadGaps: geom.roadGaps,
        roadY,
        finishX: geom.finishX,
        dt: FIXED_DT,
      });
      // Pit wall collision stops forward movement and fails attempt
      expect(res.status).toBe('stuck');
      expect(res.state.x).toBeLessThanOrEqual(gap.x + gap.width);
      expect(res.state.vx).toBe(0);
    });
  });
  // =============================================================
  // LEVEL 7 VERIFICATIONS
  // =============================================================
  describe('Level 7 – Invisible Road & Platform Collision Checks', () => {
    it('does NOT create hidden or invisible road segments when drawing in empty air', () => {
      // Line drawn in mid-air near the floating platform
      const floatingLine = [
        { x: 120, y: 330 },
        { x: 190, y: 330 },
        { x: 260, y: 330 },
      ];
      const segments = buildRampSegments(floatingLine, roadY);
      // All segments must strictly match the visible points, no fake unshifted ground segment!
      for (const seg of segments) {
        expect(seg.p1.y).toBeLessThan(roadY);
        expect(seg.p2.y).toBeLessThan(roadY);
        // None of the segments can start at roadY (400)
        expect(seg.p1.x).toBeGreaterThanOrEqual(120);
      }
    });
    it('rejects floating lines drawn in empty space without connection to the ground', () => {
      const config = getLevelConfig(7);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      // Line floating in empty air at y = 330 (70px above roadY=400)
      const floatingLine = [
        { x: 120, y: 330 },
        { x: 190, y: 330 },
        { x: 260, y: 330 },
      ];
      const validation = validateRampDrawing(
        floatingLine,
        roadY,
        geom.carStartX,
        220
      );
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Ramp must start from the road');
    });
    it('Level 7 platform now blocks the drive-under shortcut (underside 30px above road)', () => {
      const geom = resolveLevelGeometry(
        getLevelConfig(7),
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const platform = geom.obstacles[0];
      expect(roadY - (platform.y + platform.height)).toBe(30);
      let state = {
        x: platform.x - 80,
        y: roadY - 20,
        vx: 250,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      for (let i = 0; i < 60; i++) {
        state = stepCarPhysics({
          state,
          segments: [],
          obstacles: geom.obstacles,
          roadGaps: geom.roadGaps,
          roadY,
          finishX: geom.finishX,
          dt: FIXED_DT,
        }).state;
      }
      expect(state.x + 34).toBeLessThanOrEqual(platform.x + 0.01); // stopped at the platform face
    });
    it('allows car to drive under a floating platform without hitting an invisible wall', () => {
      // Generic floating platform with 85px clearance (Level 7's original layout)
      const geom = resolveLevelGeometry(
        {
          ...getLevelConfig(7),
          obstacles: [
            {
              id: 'float',
              xFraction: 0.5,
              width: 90,
              height: 22,
              yOffsetFromRoad: 85,
            },
          ],
        },
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const platform = geom.obstacles[0];
      // Car driving on flat road directly underneath the platform
      const carUnderPlatform = {
        x: platform.x + platform.width / 2,
        y: roadY - 20, // Grounded on road
        vx: 200,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const res = stepCarPhysics({
        state: carUnderPlatform,
        segments: [],
        obstacles: geom.obstacles,
        roadGaps: geom.roadGaps,
        roadY,
        finishX: geom.finishX,
        dt: FIXED_DT,
      });
      // Car is NOT blocked by an invisible wall under the platform
      expect(res.state.vx).toBeGreaterThan(0);
      expect(res.status).toBe('running');
    });
    it('SUCCEEDS Level 7 when drawing a valid ramp connecting road to high platform', () => {
      const config = getLevelConfig(7);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const platform = geom.obstacles[0];
      // Valid takeoff ramp starting at road and leading onto/over the high platform
      const rampToPlatform = [
        { x: geom.carStartX + 10, y: roadY },
        { x: platform.x - 20, y: platform.y - 10 },
        { x: platform.x + platform.width + 30, y: platform.y - 10 },
        { x: geom.finishX - 30, y: roadY },
      ];
      const validation = validateRampDrawing(
        rampToPlatform,
        roadY,
        geom.carStartX,
        platform.x + 40
      );
      expect(validation.isValid).toBe(true);
      const result = simulateLevel(7, rampToPlatform);
      expect(result.status).toBe('success');
      expect(result.finalState.hasClearedObstacle).toBe(true);
    });
  });
  // =============================================================
  // SHARED SOLID OBSTACLE COLLISION CHECKS
  // =============================================================
  describe('Shared Obstacle Collision System', () => {
    it('strictly STOPS car from passing through a solid block obstacle (Level 2 Brick Wall)', () => {
      const result = simulateLevel(2, []);
      // Without a ramp, the tall wall must completely stop the car
      expect(result.status).toBe('stuck');
      expect(result.finalState.hasClearedObstacle).toBe(false);
      const config = getLevelConfig(2);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const wall = geom.obstacles[0];
      // Car front must be stopped at the wall's left edge
      expect(result.finalState.x + CAR_HALF_WIDTH).toBeLessThanOrEqual(
        wall.x + 2
      );
    });
    it('does not allow car to jump onto top of an obstacle from the ground without a ramp', () => {
      const config = getLevelConfig(1);
      const geom = resolveLevelGeometry(
        config,
        areaWidth,
        roadY,
        0,
        worldWidth
      );
      const block = geom.obstacles[0];
      // Car placed touching the obstacle wall
      const touchingWallState = {
        x: block.x - CAR_HALF_WIDTH,
        y: roadY - 20,
        vx: 300,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const res = stepCarPhysics({
        state: touchingWallState,
        segments: [],
        obstacles: geom.obstacles,
        roadGaps: geom.roadGaps,
        roadY,
        finishX: geom.finishX,
        dt: FIXED_DT,
      });
      // Front axle must not be sucked onto the roof: car stays at road level and vx is zeroed
      expect(res.state.y).toBeGreaterThanOrEqual(roadY - 25);
      expect(res.state.vx).toBe(0);
      expect(res.state.x + CAR_HALF_WIDTH).toBeLessThanOrEqual(block.x + 1);
    });
  });
});
