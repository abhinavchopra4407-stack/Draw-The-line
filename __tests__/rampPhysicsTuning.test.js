import {
  buildRampSegments,
  stepCarPhysics,
  MAX_VX,
  RAMP_THICKNESS,
} from '../src/games/rampracer/physics/physicsEngine';
describe('Ramp Physics & Car Movement Tuning', () => {
  const roadY = 450;
  const finishX = 400;
  const obstacle = {
    x: 200,
    y: 350,
    width: 80,
    height: 100,
  };
  it('maximum car speed is boosted by approximately 15-20% for responsive driving', () => {
    // 440 * 1.15 = 506, 440 * 1.20 = 528
    expect(MAX_VX).toBeGreaterThanOrEqual(506);
    expect(MAX_VX).toBeLessThanOrEqual(528);
    expect(MAX_VX).toBe(515); // +17.05% speed increase
  });
  it('accelerates gradually and smoothly on open flat road up to new top speed', () => {
    let state = {
      x: 30,
      y: roadY - 20,
      vx: 0,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    let prevVx = 0;
    // Step for 120 frames on open road (no obstacle)
    for (let i = 0; i < 120; i++) {
      const res = stepCarPhysics({
        state,
        segments: [],
        obstacles: [],
        roadY,
        finishX: 9999,
        dt: 0.016,
      });
      state = res.state;
      // Acceleration must be continuous and positive until top speed
      expect(state.vx).toBeGreaterThanOrEqual(prevVx - 0.01);
      // Speed must never exceed new MAX_VX
      expect(state.vx).toBeLessThanOrEqual(MAX_VX);
      // Flat road Y must remain stable with 0 bounce
      expect(state.y).toBe(roadY - 20);
      expect(state.angle).toBe(0);
      prevVx = state.vx;
    }
    expect(state.vx).toBeGreaterThan(380); // Reaches top speed smoothly
  });
  it('drives smoothly on an upward ramp with zero vertical bouncing', () => {
    const rampPoints = [
      { x: 30, y: 430 },
      { x: 100, y: 390 },
      { x: 180, y: 340 },
      { x: 260, y: 290 },
      { x: 340, y: 240 },
    ];
    const segments = buildRampSegments(rampPoints, roadY);
    let state = {
      x: 35,
      y: 410,
      vx: 120,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    let prevY = state.y;
    let bounceCount = 0;
    for (let i = 0; i < 45; i++) {
      const res = stepCarPhysics({
        state,
        segments,
        obstacles: [],
        roadY,
        finishX: 9999,
        dt: 0.016,
      });
      state = res.state;
      // On an upward ramp, Y should steadily decrease (move up in screen space)
      if (state.vy > 10 && prevY < state.y) {
        bounceCount++;
      }
      // After settling on ramp, angle stays aligned to slope (~ -30 deg) without wild flipping
      if (i > 2) {
        expect(state.angle).toBeLessThanOrEqual(0);
        expect(state.angle).toBeGreaterThanOrEqual(-45);
      }
      prevY = state.y;
    }
    // Zero violent bounces while climbing the ramp
    expect(bounceCount).toBe(0);
    // Successfully climbed upward
    expect(state.y).toBeLessThan(350);
  });
  it('drives smoothly on a curved ramp over obstacle with stable pitch angle', () => {
    const rampPoints = [
      { x: 40, y: 430 },
      { x: 120, y: 360 },
      { x: 200, y: 310 },
      { x: 240, y: 310 },
      { x: 300, y: 360 },
      { x: 360, y: 430 },
    ];
    const segments = buildRampSegments(rampPoints, roadY);
    let state = {
      x: 45,
      y: 415,
      vx: 150,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    let previousAngle = 0;
    let maxAngleChangePerFrame = 0;
    for (let i = 0; i < 130; i++) {
      const res = stepCarPhysics({
        state,
        segments,
        obstacles: [obstacle],
        roadY,
        finishX: 450,
        dt: 0.016,
      });
      state = res.state;
      const angleDelta = Math.abs(state.angle - previousAngle);
      if (angleDelta > maxAngleChangePerFrame) {
        maxAngleChangePerFrame = angleDelta;
      }
      previousAngle = state.angle;
    }
    // Angle change per frame must be smooth and damped (no sudden rotation spikes > 8 deg/frame)
    expect(maxAngleChangePerFrame).toBeLessThan(8.0);
    // Successfully cleared obstacle
    expect(state.hasClearedObstacle).toBe(true);
  });
  it('transitions seamlessly from ramp back to flat road', () => {
    // Ramp ends at x = 200, car rolls onto flat road at roadY - 20
    const rampPoints = [
      { x: 50, y: 360 },
      { x: 120, y: 390 },
      { x: 200, y: 430 },
    ];
    const segments = buildRampSegments(rampPoints, roadY);
    let state = {
      x: 180,
      y: 410,
      vx: 200,
      vy: 50,
      angle: 20,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    // Run until car has driven well onto flat ground (x > 280)
    for (let i = 0; i < 40; i++) {
      const res = stepCarPhysics({
        state,
        segments,
        obstacles: [],
        roadY,
        finishX: 9999,
        dt: 0.016,
      });
      state = res.state;
    }
    expect(state.x).toBeGreaterThan(280);
    expect(state.y).toBe(roadY - 20);
    expect(Math.abs(state.angle)).toBeLessThan(1.0); // Pitch settles smoothly to 0
    expect(state.isGrounded).toBe(true);
  });
  describe('Dual-Wheel Ground Contact (No Floating Wheels)', () => {
    // Helper to compute exact visual bottom contact coordinates for both wheels
    const getWheelBottomPositions = (state) => {
      const rad = (state.angle * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);
      const pivotX = state.x + 1;
      const pivotY = state.y + 4;
      return {
        rearBottom: {
          x: pivotX - 20 * cosA - 24 * sinA,
          y: pivotY - 20 * sinA + 24 * cosA,
        },
        frontBottom: {
          x: pivotX + 21 * cosA - 24 * sinA,
          y: pivotY + 21 * sinA + 24 * cosA,
        },
      };
    };
    const getRampSurfaceAtX = (x, segs) => {
      for (const seg of segs) {
        const minX = Math.min(seg.p1.x, seg.p2.x);
        const maxX = Math.max(seg.p1.x, seg.p2.x);
        if (x >= minX - 2 && x <= maxX + 2) {
          const dx = seg.p2.x - seg.p1.x;
          const dy = seg.p2.y - seg.p1.y;
          if (Math.abs(dx) < 0.001) continue;
          const t = Math.max(0, Math.min(1, (x - seg.p1.x) / dx));
          const lineY = seg.p1.y + t * dy;
          return lineY + seg.normal.y * (RAMP_THICKNESS / 2);
        }
      }
      return null;
    };
    it('both front and rear wheels maintain contact on an upward ramp slope', () => {
      const rampPoints = [
        { x: 30, y: 430 },
        { x: 120, y: 380 },
        { x: 220, y: 320 },
        { x: 320, y: 260 },
      ];
      const segments = buildRampSegments(rampPoints);
      let state = {
        x: 60,
        y: 395,
        vx: 140,
        vy: 0,
        angle: -30,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      for (let i = 0; i < 30; i++) {
        const res = stepCarPhysics({
          state,
          segments,
          obstacles: [],
          roadY,
          finishX: 9999,
          dt: 0.016,
        });
        state = res.state;
        if (state.x > 80 && state.x < 280) {
          const { rearBottom, frontBottom } = getWheelBottomPositions(state);
          const rearSurfaceY = getRampSurfaceAtX(rearBottom.x, segments);
          const frontSurfaceY = getRampSurfaceAtX(frontBottom.x, segments);
          if (rearSurfaceY !== null && frontSurfaceY !== null) {
            // Neither wheel floats: distance to surface <= 2.5px
            expect(Math.abs(rearBottom.y - rearSurfaceY)).toBeLessThanOrEqual(
              2.5
            );
            expect(Math.abs(frontBottom.y - frontSurfaceY)).toBeLessThanOrEqual(
              2.5
            );
          }
        }
      }
    });
    it('both front and rear wheels maintain contact on a downward ramp slope', () => {
      const rampPoints = [
        { x: 40, y: 260 },
        { x: 140, y: 320 },
        { x: 240, y: 380 },
        { x: 340, y: 440 },
      ];
      const segments = buildRampSegments(rampPoints);
      let state = {
        x: 70,
        y: 265,
        vx: 150,
        vy: 0,
        angle: 30,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      for (let i = 0; i < 30; i++) {
        const res = stepCarPhysics({
          state,
          segments,
          obstacles: [],
          roadY,
          finishX: 9999,
          dt: 0.016,
        });
        state = res.state;
        if (state.x > 90 && state.x < 300) {
          const { rearBottom, frontBottom } = getWheelBottomPositions(state);
          const rearSurfaceY = getRampSurfaceAtX(rearBottom.x, segments);
          const frontSurfaceY = getRampSurfaceAtX(frontBottom.x, segments);
          if (rearSurfaceY !== null && frontSurfaceY !== null) {
            expect(Math.abs(rearBottom.y - rearSurfaceY)).toBeLessThanOrEqual(
              2.0
            );
            expect(Math.abs(frontBottom.y - frontSurfaceY)).toBeLessThanOrEqual(
              2.0
            );
          }
        }
      }
    });
    it('both wheels remain grounded across curved ramps and the crest of the ramp', () => {
      const rampPoints = [
        { x: 40, y: 430 },
        { x: 120, y: 350 },
        { x: 200, y: 310 },
        { x: 240, y: 310 },
        { x: 320, y: 350 },
        { x: 400, y: 430 },
      ];
      const segments = buildRampSegments(rampPoints, roadY);
      let state = {
        x: 50,
        y: 410,
        vx: 160,
        vy: 0,
        angle: -30,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      for (let i = 0; i < 40; i++) {
        const res = stepCarPhysics({
          state,
          segments,
          obstacles: [obstacle],
          roadY,
          finishX: 500,
          dt: 0.016,
        });
        state = res.state;
        if (state.x > 80 && state.x < 300) {
          expect(state.isGrounded).toBe(true);
          if (state.x > 210 && state.x < 240) {
            expect(Math.abs(state.angle)).toBeLessThan(18);
          }
        }
      }
    });
    it('car does not sink into or pass through the ramp surface', () => {
      const rampPoints = [
        { x: 50, y: 380 },
        { x: 500, y: 380 },
      ];
      // Surface-contact test only: this line floats 70px above the road, which is not a drawable
      // ramp (start must be <= RAMP_START_MAX_ABOVE_ROAD), so build it without the road-start check.
      const segments = buildRampSegments(rampPoints);
      let state = {
        x: 100,
        y: 300,
        vx: 80,
        vy: 200,
        angle: 0,
        wheelRotation: 0,
        isGrounded: false,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      for (let i = 0; i < 20; i++) {
        const res = stepCarPhysics({
          state,
          segments,
          obstacles: [],
          roadY,
          finishX: 9999,
          dt: 0.016,
        });
        state = res.state;
      }
      expect(state.isGrounded).toBe(true);
      expect(state.y).toBeLessThanOrEqual(350);
      expect(state.y).toBeGreaterThanOrEqual(344);
    });
  });
});
