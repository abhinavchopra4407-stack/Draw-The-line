/**
 * Deterministic level solver used by regression tests.
 * Feeds realistic touch strokes through the same pipeline as RampRacerScreen
 * (touch clamp -> point filter/interpolation -> validateRampDrawing -> buildRampSegments)
 * and simulates stepCarPhysics until success/failure.
 */
import {
  getLevelConfig,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
import {
  CAR_HALF_WIDTH,
  FIXED_DT,
  buildRampSegments,
  checkCoinCarCollision,
  stepCarPhysics,
  validateRampDrawing,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  DEFAULT_VEHICLE_ID,
  getVehicleById,
} from '../src/games/rampracer/types/vehicles';
// Mirrors RampRacerScreen drawing constants
const MIN_POINT_DISTANCE = 8;
const MAX_DRAWING_POINTS = 75;
const MAX_DRAWING_LENGTH = 1400;
const LANDSCAPE_ROAD_HEIGHT = 70;
const PORTRAIT_ROAD_HEIGHT = 85;
const MAX_STEPS = 1500;
const HANDLING = getVehicleById(DEFAULT_VEHICLE_ID).handling;
export function makeLevelContext(
  levelNumber,
  areaW,
  areaH,
  roadHeight = areaW > areaH ? LANDSCAPE_ROAD_HEIGHT : PORTRAIT_ROAD_HEIGHT
) {
  const cfg = getLevelConfig(levelNumber);
  const roadY = areaH - roadHeight;
  const worldW = Math.max(Math.round(areaW * 1.55), 620);
  const geom0 = resolveLevelGeometry(cfg, areaW, roadY, 0, worldW);
  return {
    cfg,
    W: areaW,
    roadY,
    worldW,
    startX: Math.max(CAR_HALF_WIDTH + 15, geom0.carStartX),
    moving: cfg.obstacles.some((o) => !!o.movement),
    geom0,
  };
}
/** Same filtering as RampRacerScreen.onPanResponderMove (touch clamp, min distance, caps, interpolation). */
export function emulateStroke(samples, W, roadY) {
  const clamp = (p) => ({
    x: Math.max(10, Math.min(p.x, W - 10)),
    y: Math.max(15, Math.min(p.y, roadY - 4)),
  });
  const raw = [clamp(samples[0])];
  let total = 0;
  for (let i = 1; i < samples.length; i++) {
    const pt = clamp(samples[i]);
    const last = raw[raw.length - 1];
    const dx = pt.x - last.x;
    const dy = pt.y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < MIN_POINT_DISTANCE) continue;
    if (raw.length >= MAX_DRAWING_POINTS || total + dist > MAX_DRAWING_LENGTH)
      continue;
    if (dist > 21) {
      const steps = Math.min(6, Math.floor(dist / 14));
      for (let s = 1; s <= steps; s++) {
        raw.push({
          x: last.x + (dx * s) / (steps + 1),
          y: last.y + (dy * s) / (steps + 1),
        });
      }
    }
    total += dist;
    raw.push(pt);
  }
  return raw;
}
/** Resamples a polyline at a fixed arc-length spacing, like finger touch samples. */
export function resample(poly, spacing = 12) {
  const out = [poly[0]];
  let acc = 0;
  for (let i = 1; i < poly.length; i++) {
    let a = poly[i - 1];
    const b = poly[i];
    let seg = Math.hypot(b.x - a.x, b.y - a.y);
    while (seg > 0 && acc + seg >= spacing) {
      const t = (spacing - acc) / seg;
      a = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      out.push(a);
      seg = Math.hypot(b.x - a.x, b.y - a.y);
      acc = 0;
    }
    acc += seg;
  }
  out.push(poly[poly.length - 1]);
  return out;
}
/** Ski-jump stroke from (x0, y0) rising h px to xe; pw = 1 straight, 2 concave. */
export function skiJumpStroke(x0, y0, xe, h, pw) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push({ x: x0 + (xe - x0) * t, y: y0 - h * Math.pow(t, pw) });
  }
  return resample(pts);
}
/** Trapezoid stroke: up to height h at xb, flat to xc, back down to the road at xd. */
export function trapezoidStroke(x0, y0, xb, xc, xd, h) {
  return resample([
    { x: x0, y: y0 },
    { x: xb, y: y0 - h },
    { x: xc, y: y0 - h },
    { x: xd, y: y0 },
  ]);
}
/** Candidate strokes: ski-jumps (linear / quadratic) and trapezoid bridges. */
export function candidateStrokes(ctx, grid = 'full') {
  const y0 = ctx.roadY - 4;
  const x0 = ctx.startX + 15;
  const hStep = grid === 'full' ? 15 : 30;
  const xStep = grid === 'full' ? 35 : 70;
  const hs = [];
  for (let h = 30; h <= ctx.roadY - 25; h += hStep) hs.push(h);
  const xs = [];
  for (let x = x0 + 70; x <= ctx.W - 10; x += xStep) xs.push(x);
  const strokes = [];
  for (const h of hs) {
    for (const xe of xs) {
      for (const pw of [1, 2]) {
        strokes.push(skiJumpStroke(x0, y0, xe, h, pw));
      }
    }
  }
  for (const h of hs) {
    for (const xb of xs) {
      for (const xc of xs) {
        if (xc <= xb) continue;
        for (const dd of [60, 160]) {
          strokes.push(
            trapezoidStroke(x0, y0, xb, xc, Math.min(ctx.W - 10, xc + dd), h)
          );
        }
      }
    }
  }
  return strokes;
}
export function runStroke(ctx, samples, t0 = 0) {
  const { cfg, W, roadY, worldW, startX, moving } = ctx;
  const gT = moving
    ? resolveLevelGeometry(cfg, W, roadY, t0, worldW)
    : ctx.geom0;
  const raw = emulateStroke(samples, W, roadY);
  const firstHurdleX = gT.obstacles.length
    ? Math.min(...gT.obstacles.map((o) => o.x))
    : gT.roadGaps.length
    ? Math.min(...gT.roadGaps.map((g) => g.x))
    : startX + 260;
  const maxLaunchX = Math.max(firstHurdleX + 60, W * 0.65);
  const v = validateRampDrawing(raw, roadY, startX, maxLaunchX, gT.obstacles);
  if (!v.isValid) return { valid: false, coins: 0, timeout: false };
  const segments = buildRampSegments(v.sanitizedPoints, roadY, gT.obstacles);
  let state = {
    x: startX,
    y: roadY - 20,
    vx: 0,
    vy: 0,
    angle: 0,
    wheelRotation: 0,
    isGrounded: true,
    hasClearedObstacle: false,
    stuckTimer: 0,
    lastProgressX: startX,
    lastProgressY: roadY - 20,
  };
  const coins = ctx.geom0.coins.map((c) => ({ ...c }));
  let collected = 0;
  let status = 'running';
  for (let step = 0; step < MAX_STEPS; step++) {
    const g = moving
      ? resolveLevelGeometry(cfg, W, roadY, t0 + step * FIXED_DT, worldW)
      : ctx.geom0;
    const res = stepCarPhysics({
      state,
      segments,
      obstacles: g.obstacles,
      roadGaps: g.roadGaps,
      roadY,
      finishX: ctx.geom0.finishX,
      clearThresholdX: gT.clearThresholdX,
      dt: FIXED_DT,
      handling: HANDLING,
    });
    state = res.state;
    status = res.status;
    for (const c of coins) {
      if (
        !c.collected &&
        checkCoinCarCollision(c, state.x, state.y, state.angle)
      ) {
        c.collected = true;
        collected++;
      }
    }
    if (status !== 'running') break;
  }
  return {
    valid: true,
    status,
    coins: collected,
    timeout: status === 'running',
  };
}
/** Searches candidate strokes; stops early once a success with >= stopAtCoins coins is found. */
export function solveLevel(ctx, opts = {}) {
  const phases = ctx.moving ? [0, 0.2, 0.4] : [0];
  const summary = { successes: 0, maxCoins: 0, timeouts: 0 };
  for (const stroke of candidateStrokes(ctx, opts.grid ?? 'full')) {
    for (const t0 of phases) {
      const r = runStroke(ctx, stroke, t0);
      if (!r.valid) continue;
      if (r.timeout) summary.timeouts++;
      if (r.status === 'success') {
        summary.successes++;
        summary.maxCoins = Math.max(summary.maxCoins, r.coins);
        if (opts.stopAtCoins !== undefined && r.coins >= opts.stopAtCoins)
          return summary;
      }
    }
  }
  return summary;
}
