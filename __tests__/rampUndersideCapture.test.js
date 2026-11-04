/**
 * P0-1 regression: drawn lines must connect to the road and may only support the car from above.
 */
import {
  RAMP_START_MAX_ABOVE_ROAD,
  FIXED_DT,
  buildRampSegments,
  stepCarPhysics,
  validateRampDrawing,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  DEFAULT_VEHICLE_ID,
  getVehicleById,
} from '../src/games/rampracer/types/vehicles';
const roadY = 210;
const handling = getVehicleById(DEFAULT_VEHICLE_ID).handling;
const START_MSG = 'Ramp must start from the road! ✏️';
const flatStroke = (heightAboveRoad) =>
  Array.from({ length: 15 }, (_, i) => ({
    x: 140 + (280 * i) / 14,
    y: roadY - heightAboveRoad,
  }));
const car = (x, y, extra = {}) => ({
  x,
  y,
  vx: 0,
  vy: 0,
  angle: 0,
  wheelRotation: 0,
  isGrounded: true,
  hasClearedObstacle: false,
  stuckTimer: 0,
  lastProgressX: x,
  lastProgressY: y,
  ...extra,
});
const step = (state, segments) =>
  stepCarPhysics({
    state,
    segments,
    obstacles: [],
    roadGaps: [],
    roadY,
    finishX: 5000,
    dt: FIXED_DT,
    handling,
  }).state;
describe('P0-1: ramp start connection and underside capture', () => {
  it('uses one shared 20px start tolerance', () => {
    expect(RAMP_START_MAX_ABOVE_ROAD).toBe(20);
  });
  it.each([4, 10, 20])(
    'a stroke starting %ipx above the road is valid and the car rides it',
    (h) => {
      const v = validateRampDrawing(flatStroke(h), roadY, 96, 520, []);
      expect(v.isValid).toBe(true);
      const segments = buildRampSegments(v.sanitizedPoints, roadY, []);
      let st = car(96, roadY - 20);
      let rodeLine = false;
      for (let i = 0; i < 90; i++) {
        st = step(st, segments);
        if (st.x > 150 && st.x < 410 && st.y < roadY - 26) rodeLine = true;
      }
      expect(rodeLine).toBe(true);
    }
  );
  it.each([25, 32, 40, 55])(
    'a stroke starting %ipx above the road is rejected and builds no surface',
    (h) => {
      const v = validateRampDrawing(flatStroke(h), roadY, 96, 520, []);
      expect(v.isValid).toBe(false);
      expect(v.reason).toBe(START_MSG);
      expect(buildRampSegments(flatStroke(h), roadY, [])).toEqual([]);
    }
  );
  it('a line hanging above the road (outside the connection zone) cannot lift the car from below', () => {
    const segments = [
      ...buildRampSegments([
        { x: 40, y: roadY - 4 },
        { x: 55, y: roadY - 4 },
        { x: 70, y: roadY - 4 },
      ]),
      ...buildRampSegments([
        { x: 300, y: roadY - 25 },
        { x: 375, y: roadY - 25 },
        { x: 450, y: roadY - 25 },
      ]),
    ];
    let st = car(96, roadY - 20, { vx: 300 });
    let checkedSteps = 0;
    for (let i = 0; i < 120; i++) {
      const prevY = st.y;
      st = step(st, segments);
      if (st.x > 300 && st.x < 450) {
        checkedSteps++;
        expect(prevY - st.y).toBeLessThanOrEqual(3); // no upward snap
        expect(st.y).toBeGreaterThanOrEqual(roadY - 22); // still on the road
      }
    }
    expect(checkedSteps).toBeGreaterThan(5);
  });
  it('landing on a line from above still works', () => {
    const segments = buildRampSegments([
      { x: 250, y: roadY - 25 },
      { x: 375, y: roadY - 25 },
      { x: 500, y: roadY - 25 },
    ]);
    let st = car(320, roadY - 80, { vx: 250, vy: 300, isGrounded: false });
    let landed = false;
    for (let i = 0; i < 60; i++) {
      st = step(st, segments);
      if (st.isGrounded && st.x > 260 && st.x < 490 && st.y < roadY - 30)
        landed = true;
    }
    expect(landed).toBe(true);
  });
  it('loop strokes never make the grounded car jump more than 20px in one frame', () => {
    // Previously steep loop segments lifted the car up to ~58px in a single frame.
    let worstRise = 0;
    for (const r of [25, 35, 45]) {
      for (const apexH of [40, 70, 100]) {
        const pts = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          pts.push({ x: 111 + (280 - 111) * t, y: roadY - 4 - apexH * t * t });
        }
        const cy = roadY - 4 - apexH - r;
        for (let a = 90; a <= 450; a += 12) {
          const rad = (a * Math.PI) / 180;
          pts.push({
            x: 280 + r * Math.cos(rad - Math.PI),
            y: cy + r * Math.sin(rad),
          });
        }
        for (let i = 1; i <= 15; i++)
          pts.push({
            x: 280 + 260 * (i / 15),
            y: roadY - 4 - apexH + apexH * (i / 15),
          });
        const v = validateRampDrawing(pts, roadY, 96, 520, []);
        expect(v.isValid).toBe(true);
        const segments = buildRampSegments(v.sanitizedPoints, roadY, []);
        let st = car(96, roadY - 20);
        for (let i = 0; i < 400; i++) {
          const prevY = st.y;
          st = step(st, segments);
          if (st.isGrounded) worstRise = Math.max(worstRise, prevY - st.y);
        }
      }
    }
    expect(worstRise).toBeLessThanOrEqual(20.5);
  });
  it('a steep drawn segment is climbed smoothly, never in a single-frame jump', () => {
    const segments = buildRampSegments([
      { x: 300, y: roadY - 4 },
      { x: 315, y: roadY - 60 },
      { x: 330, y: roadY - 120 },
    ]);
    let st = car(200, roadY - 20, { vx: 300 });
    let maxRise = 0;
    for (let i = 0; i < 60; i++) {
      const prevY = st.y;
      st = step(st, segments);
      if (st.isGrounded) maxRise = Math.max(maxRise, prevY - st.y);
    }
    expect(maxRise).toBeLessThanOrEqual(20.5);
  });
  it('an airborne car that hits an obstacle side slides down the wall instead of hovering', () => {
    // Reproduces the device run on Level 7: the car hit the wall just below its top edge.
    const obstacles = [{ x: 412, y: roadY - 107, width: 90, height: 77 }];
    let st = car(370, roadY - 115, { vx: 300, vy: -40, isGrounded: false });
    let status = 'running';
    for (let i = 0; i < 150 && status === 'running'; i++) {
      const r = stepCarPhysics({
        state: st,
        segments: [],
        obstacles,
        roadGaps: [],
        roadY,
        finishX: 5000,
        dt: FIXED_DT,
        handling,
      });
      st = r.state;
      status = r.status;
    }
    expect(status).toBe('stuck'); // still a failed attempt -> Retry
    expect(st.x + 34).toBeLessThanOrEqual(412.01); // never passes into the wall
    expect(st.y).toBeGreaterThan(roadY - 25); // ended on the road, not suspended mid-air
  });
  it('a creative loop-shaped stroke that starts on the road is still accepted', () => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push({ x: 110 + 170 * t, y: roadY - 4 - 70 * t * t });
    }
    const cx = 280;
    const cy = roadY - 4 - 70 - 35;
    for (let a = 90; a <= 450; a += 12) {
      const rad = (a * Math.PI) / 180;
      pts.push({
        x: cx + 35 * Math.cos(rad - Math.PI),
        y: cy + 35 * Math.sin(rad),
      });
    }
    for (let i = 1; i <= 15; i++)
      pts.push({ x: 280 + 260 * (i / 15), y: roadY - 74 + 70 * (i / 15) });
    const v = validateRampDrawing(pts, roadY, 96, 520, []);
    expect(v.isValid).toBe(true);
    expect(
      buildRampSegments(v.sanitizedPoints, roadY, []).length
    ).toBeGreaterThan(10);
  });
});
