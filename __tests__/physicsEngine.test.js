import {
  buildRampSegments,
  stepCarPhysics,
  smoothRampPoints,
  CAR_HALF_WIDTH,
} from '../src/games/rampracer/physics/physicsEngine';
describe('physicsEngine', () => {
  const obstacle = {
    x: 200,
    y: 350,
    width: 80,
    height: 100,
  };
  const roadY = 450;
  const finishX = 400;
  it('smoothRampPoints filters noise while preserving start and end coordinates', () => {
    const raw = [
      { x: 10, y: 100 },
      { x: 20, y: 108 },
      { x: 30, y: 95 },
      { x: 40, y: 90 },
    ];
    const smoothed = smoothRampPoints(raw);
    expect(smoothed.length).toBe(raw.length);
    expect(smoothed[0]).toEqual(raw[0]);
    expect(smoothed[smoothed.length - 1]).toEqual(raw[raw.length - 1]);
    // Intermediate point is smoothed between neighbors
    expect(smoothed[1].y).toBe(0.25 * 100 + 0.5 * 108 + 0.25 * 95);
  });
  it('buildRampSegments converts points into continuous segments with upward normals', () => {
    const points = [
      { x: 50, y: 430 },
      { x: 150, y: 380 },
      { x: 250, y: 320 },
    ];
    const segments = buildRampSegments(points);
    expect(segments.length).toBe(2);
    expect(segments[0].length).toBeGreaterThan(0);
    expect(segments[0].normal.y).toBeLessThanOrEqual(0);
    expect(segments[1].normal.y).toBeLessThanOrEqual(0);
  });
  it('car moves forward on flat ground with natural acceleration and speed', () => {
    const initialState = {
      x: 50,
      y: roadY - 20,
      vx: 0,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      stuckTimer: 0,
    };
    let state = initialState;
    for (let i = 0; i < 15; i++) {
      const res = stepCarPhysics({
        state,
        segments: [],
        obstacle,
        roadY,
        finishX,
        dt: 0.016,
      });
      state = res.state;
    }
    expect(state.vx).toBeGreaterThan(50); // Responsive acceleration
    expect(state.x).toBeGreaterThan(initialState.x);
    expect(state.wheelRotation).toBeGreaterThan(0);
    expect(state.y).toBe(roadY - 20);
  });
  it('car climbs an ascending drawn ramp smoothly', () => {
    const points = [
      { x: 40, y: 430 },
      { x: 120, y: 370 },
      { x: 200, y: 310 },
      { x: 280, y: 310 },
    ];
    const segments = buildRampSegments(points);
    let state = {
      x: 50,
      y: 404, // Bottom of car rests on top surface of ramp plank
      vx: 150,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      stuckTimer: 0,
    };
    for (let i = 0; i < 20; i++) {
      const res = stepCarPhysics({
        state,
        segments,
        obstacle,
        roadY,
        finishX,
        dt: 0.02,
      });
      state = res.state;
    }
    // Car moved forward and climbed up (y decreased)
    expect(state.x).toBeGreaterThan(50);
    expect(state.y).toBeLessThan(430);
  });
  it('car stops at obstacle left face if no ramp exists', () => {
    let state = {
      x: obstacle.x - CAR_HALF_WIDTH - 5,
      y: roadY - 20,
      vx: 200,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      stuckTimer: 0,
    };
    const res = stepCarPhysics({
      state,
      segments: [],
      obstacle,
      roadY,
      finishX,
      dt: 0.05,
    });
    expect(res.state.x).toBeLessThanOrEqual(obstacle.x - CAR_HALF_WIDTH);
    expect(res.state.vx).toBe(0);
  });
  it('detects arrival at the finish line', () => {
    const state = {
      x: finishX - 10,
      y: roadY - 20,
      vx: 150,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      stuckTimer: 0,
    };
    const res = stepCarPhysics({
      state,
      segments: [],
      obstacle,
      roadY,
      finishX,
      dt: 0.016,
    });
    expect(res.status).toBe('success');
  });
  it('detects stuck state when stopped against obstacle for too long', () => {
    const state = {
      x: obstacle.x - CAR_HALF_WIDTH,
      y: roadY - 20,
      vx: 0,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      stuckTimer: 1.18, // Threshold is 1.2s
    };
    const res = stepCarPhysics({
      state,
      segments: [],
      obstacle,
      roadY,
      finishX,
      dt: 0.05,
    });
    expect(res.status).toBe('stuck');
  });
});
