export const CAR_WIDTH = 76;
export const CAR_HEIGHT = 44;
export const WHEEL_RADIUS = 11;
export const CAR_HALF_WIDTH = 34;
export const RAMP_THICKNESS = 5;
// Refined, responsive physics tuning:
// Speed boosted by ~17% (from 440 to 515 px/s) with snappy acceleration and solid stability.
export const GRAVITY = 620; // px/s^2 downwards (+Y in screen coords)
export const DRIVE_ACCEL = 885; // px/s^2 responsive, smooth motor drive
export const AIR_DRIVE_ACCEL = 165; // px/s^2 air momentum
export const MAX_VX = 515; // px/s fast, responsive top speed (+17% boost)
export const MAX_FALL_SPEED = 720; // px/s
export const FIXED_DT = 1 / 60; // 60Hz fixed physics step
export const STUCK_TIMEOUT = 1.0; // seconds stationary (> 1.0s) before triggering retry
// Max height (px above roadY) a stroke may start at and still physically connect to the road.
// Shared by validation and segment building so accepted drawings always match physics.
export const RAMP_START_MAX_ABOVE_ROAD = 20;
// Only the first 30px of a stroke (the road connection) may pick a wheel up from slightly below.
const RAMP_CONNECTION_ZONE_X = 30;
// Max speed the car body may be lifted by a supporting surface (px/s; 20px per 60Hz step).
// Steep drawn lines stay climbable (narrow portrait layouts rely on them), but the car now climbs
// them smoothly instead of jumping up to ~60px in a single frame on loops and steep segments.
const MAX_SURFACE_RISE_SPEED = 1200;
/**
 * 2D segment intersection check.
 */
function onSegment(p, q, r) {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}
function orientation(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 0.0001) return 0;
  return val > 0 ? 1 : 2;
}
export function segmentsIntersect(p1, q1, p2, q2) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}
/**
 * Checks if a polyline self-intersects between any non-adjacent segments.
 */
export function hasSelfIntersections(points) {
  const n = points.length;
  if (n < 4) return false;
  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const q1 = points[i + 1];
    for (let j = i + 2; j < n - 1; j++) {
      if (i === 0 && j === n - 2) continue;
      const p2 = points[j];
      const q2 = points[j + 1];
      if (segmentsIntersect(p1, q1, p2, q2)) {
        return true;
      }
    }
  }
  return false;
}
/**
 * Checks if a drawn line exhibits excessive looping, circularity, or severe backward travel.
 */
export function hasExcessiveLoopingOrCircularity(points) {
  if (points.length < 3) return false;
  // 1. Check self-intersection (figure-8, loop-de-loop, pretzel)
  if (hasSelfIntersections(points)) {
    return true;
  }
  // 2. Check total backward displacement (car only drives forward +X)
  let totalBackwardX = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    if (dx < -2) {
      totalBackwardX += Math.abs(dx);
    }
  }
  if (totalBackwardX > 22) {
    return true;
  }
  // 3. Check closed circle / loop where endpoints meet
  const first = points[0];
  const last = points[points.length - 1];
  let totalPathLen = 0;
  for (let i = 1; i < points.length; i++) {
    totalPathLen += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
  }
  const endToEndDist = Math.hypot(last.x - first.x, last.y - first.y);
  if (totalPathLen > 80 && endToEndDist < 45) {
    return true;
  }
  // 4. Check total angular change (cumulative direction change)
  let totalTurnAngle = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const dx1 = points[i].x - points[i - 1].x;
    const dy1 = points[i].y - points[i - 1].y;
    const dx2 = points[i + 1].x - points[i].x;
    const dy2 = points[i + 1].y - points[i].y;
    const angle1 = Math.atan2(dy1, dx1);
    const angle2 = Math.atan2(dy2, dx2);
    let diff = Math.abs(angle2 - angle1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    totalTurnAngle += diff;
  }
  if (totalTurnAngle > (200 * Math.PI) / 180) {
    return true;
  }
  return false;
}
/**
 * Smooths raw touch points, removing redundant points and hand jitter
 * while faithfully preserving curves, loops, arcs, and endpoints.
 */
export function smoothRampPoints(rawPoints) {
  if (rawPoints.length < 2) {
    return rawPoints;
  }
  // 1. Filter out redundant dense points while preserving loops and curves
  const filtered = [rawPoints[0]];
  for (let i = 1; i < rawPoints.length; i++) {
    const pt = rawPoints[i];
    const prev = filtered[filtered.length - 1];
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Prevent zero-length / duplicate jitter points
    if (dist < 4) continue;
    filtered.push(pt);
  }
  if (filtered.length < 3) {
    return filtered;
  }
  // 2. Gaussian-weighted moving average smoothing
  const smoothed = [filtered[0]];
  for (let i = 1; i < filtered.length - 1; i++) {
    const prev = filtered[i - 1];
    const curr = filtered[i];
    const next = filtered[i + 1];
    smoothed.push({
      x: 0.25 * prev.x + 0.5 * curr.x + 0.25 * next.x,
      y: 0.25 * prev.y + 0.5 * curr.y + 0.25 * next.y,
    });
  }
  smoothed.push(filtered[filtered.length - 1]);
  return smoothed;
}
/**
 * Ensures ramp points are valid without generating unintended invisible roads or platforms.
 * Single source of truth used identically by both rendering and collision physics.
 */
export function prepareRampPoints(points, _roadY) {
  return points;
}
/**
 * Detects whether a drawn line segment enters, penetrates, or cuts through
 * the solid interior collision boundary of an obstacle.
 * Uses exact Liang-Barsky parametric clipping with a 2px inner margin.
 */
export function doesSegmentIntersectObstacle(p1, p2, obs) {
  const xMin = obs.x + 2;
  const xMax = obs.x + obs.width - 2;
  const yMin = obs.y + 2;
  const yMax = obs.y + obs.height - 2;
  if (xMax <= xMin || yMax <= yMin) return false;
  // 1. Either endpoint is strictly inside the obstacle's solid interior
  if (
    (p1.x >= xMin && p1.x <= xMax && p1.y >= yMin && p1.y <= yMax) ||
    (p2.x >= xMin && p2.x <= xMax && p2.y >= yMin && p2.y <= yMax)
  ) {
    return true;
  }
  // 2. Segment bounding box overlaps obstacle box
  const segMinX = Math.min(p1.x, p2.x);
  const segMaxX = Math.max(p1.x, p2.x);
  const segMinY = Math.min(p1.y, p2.y);
  const segMaxY = Math.max(p1.y, p2.y);
  if (segMaxX < xMin || segMinX > xMax || segMaxY < yMin || segMinY > yMax) {
    return false;
  }
  // 3. Liang-Barsky parametric line clipping
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let u1 = 0;
  let u2 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [p1.x - xMin, xMax - p1.x, p1.y - yMin, yMax - p1.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > u2) return false;
        if (t > u1) u1 = t;
      } else {
        if (t < u1) return false;
        if (t < u2) u2 = t;
      }
    }
  }
  return u1 <= u2 && u2 > 0 && u1 < 1;
}
/**
 * Validates player-drawn ramp strokes to guarantee only valid, connected ramps
 * create physical collision surfaces. Rejects floating lines far in the sky,
 * purely backward strokes, or disconnected lines far from the launch zone.
 * Rejects drawings that penetrate or cut through solid obstacles.
 * Allows creative curves, loops, circular paths, and unusual ramp shapes.
 */
export function validateRampDrawing(
  rawPoints,
  roadY,
  carStartX,
  maxLaunchX,
  obstacles
) {
  if (rawPoints.length < 3) {
    return {
      isValid: false,
      reason: 'Draw a longer ramp to launch! ✏️',
      sanitizedPoints: [],
    };
  }
  let totalDist = 0;
  for (let i = 1; i < rawPoints.length; i++) {
    const dx = rawPoints[i].x - rawPoints[i - 1].x;
    const dy = rawPoints[i].y - rawPoints[i - 1].y;
    totalDist += Math.hypot(dx, dy);
  }
  if (totalDist < 35) {
    return {
      isValid: false,
      reason: 'Draw a longer ramp to launch! ✏️',
      sanitizedPoints: [],
    };
  }
  const first = rawPoints[0];
  const maxX = Math.max(...rawPoints.map((p) => p.x));
  // 1. Forward Reach Check: Ramp must extend forward towards the obstacle/finish
  if (maxX < first.x + 25) {
    return {
      isValid: false,
      reason: 'Ramp must go forward towards the finish! ✏️',
      sanitizedPoints: [],
    };
  }
  // 2. Connection Check: Ramp must start near the road surface
  // Must start on the road or at most RAMP_START_MAX_ABOVE_ROAD above it (touches on the road
  // band are clamped to roadY - 4); higher starts cannot physically connect to the car's path.
  if (first.y < roadY - RAMP_START_MAX_ABOVE_ROAD || first.y > roadY + 45) {
    return {
      isValid: false,
      reason: 'Ramp must start from the road! ✏️',
      sanitizedPoints: [],
    };
  }
  // 3. Launch Corridor Check: Ramp must start in the drivable entry zone
  const maxStart = maxLaunchX ?? carStartX + 260;
  if (first.x > maxStart) {
    return {
      isValid: false,
      reason: 'Ramp must connect to the car launch zone! ✏️',
      sanitizedPoints: [],
    };
  }
  // 4. Solid Obstacle Collision Boundary Check:
  // Reject drawing through or inside solid obstacles
  if (obstacles && obstacles.length > 0) {
    for (const obs of obstacles) {
      const xMin = obs.x + 2;
      const xMax = obs.x + obs.width - 2;
      const yMin = obs.y + 2;
      const yMax = obs.y + obs.height - 2;
      for (let i = 0; i < rawPoints.length; i++) {
        const pt = rawPoints[i];
        if (pt.x >= xMin && pt.x <= xMax && pt.y >= yMin && pt.y <= yMax) {
          return {
            isValid: false,
            reason: 'Cannot draw through solid obstacles! ✏️',
            sanitizedPoints: [],
          };
        }
      }
      for (let i = 0; i < rawPoints.length - 1; i++) {
        if (doesSegmentIntersectObstacle(rawPoints[i], rawPoints[i + 1], obs)) {
          return {
            isValid: false,
            reason: 'Cannot draw through solid obstacles! ✏️',
            sanitizedPoints: [],
          };
        }
      }
    }
  }
  const smoothed = smoothRampPoints(rawPoints);
  // Re-verify smoothed segments do not clip through solid obstacles
  if (obstacles && obstacles.length > 0) {
    for (const obs of obstacles) {
      for (let i = 0; i < smoothed.length - 1; i++) {
        if (doesSegmentIntersectObstacle(smoothed[i], smoothed[i + 1], obs)) {
          return {
            isValid: false,
            reason: 'Cannot draw through solid obstacles! ✏️',
            sanitizedPoints: [],
          };
        }
      }
    }
  }
  return {
    isValid: true,
    sanitizedPoints: smoothed,
  };
}
/**
 * Converts user-drawn points into connected RampSegments for rendering and collision.
 * Rejects disconnected lines floating high in the sky when roadY is supplied.
 * Excludes any segments that penetrate solid obstacle collision boundaries.
 * Preserves full continuous collision segments for curves, arcs, and loops.
 */
export function buildRampSegments(points, roadY, obstacles) {
  if (points.length < 2) {
    return [];
  }
  // Reject disconnected lines that do not start on the road (same rule as validateRampDrawing)
  if (
    roadY !== undefined &&
    (roadY - points[0].y > RAMP_START_MAX_ABOVE_ROAD ||
      points[0].y > roadY + 45)
  ) {
    return [];
  }
  const prepared = prepareRampPoints(points, roadY);
  if (prepared.length < 2) {
    return [];
  }
  const segments = [];
  for (let i = 0; i < prepared.length - 1; i++) {
    const p1 = prepared[i];
    const p2 = prepared[i + 1];
    // Filter out any segment that penetrates a solid obstacle boundary
    if (obstacles && obstacles.length > 0) {
      const penetrates = obstacles.some((obs) =>
        doesSegmentIntersectObstacle(p1, p2, obs)
      );
      if (penetrates) {
        continue;
      }
    }
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 1) continue;
    const angle = Math.atan2(dy, dx);
    // Compute upward-pointing normal (in screen coords where -Y is UP)
    let nx = -dy / length;
    let ny = dx / length;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    segments.push({
      p1,
      p2,
      length,
      angle,
      normal: { x: nx, y: ny },
    });
  }
  return segments;
}
/**
 * Executes a single stable physics step for the car using 2-wheel contact resolution.
 * Completely eliminates bouncing, vibration, and sudden angular jolts on drawn ramps.
 */
export function stepCarPhysics({
  state,
  segments,
  obstacles,
  obstacle,
  roadGaps = [],
  roadY,
  finishX,
  clearThresholdX,
  dt,
  handling,
  isSpeedBoostActive = false,
  hasShield = false,
}) {
  const delta = Math.min(Math.max(dt, 0.001), 0.05);
  const allObstacles = obstacles ?? (obstacle ? [obstacle] : []);
  let shieldAbsorbed = false;
  const baseDriveAccel = handling?.driveAccel ?? DRIVE_ACCEL;
  const baseMaxVx = handling?.maxVx ?? MAX_VX;
  const driveAccel = isSpeedBoostActive
    ? baseDriveAccel * 1.36
    : baseDriveAccel;
  const maxVx = isSpeedBoostActive ? baseMaxVx * 1.34 : baseMaxVx;
  const airDriveAccel = isSpeedBoostActive
    ? (handling?.airDriveAccel ?? AIR_DRIVE_ACCEL) * 1.25
    : handling?.airDriveAccel ?? AIR_DRIVE_ACCEL;
  const gravity = handling?.gravity ?? GRAVITY;
  const pitchFactor = handling?.pitchResponsiveness ?? 24;
  let {
    x,
    y,
    vx,
    vy,
    angle,
    wheelRotation,
    isGrounded,
    hasClearedObstacle = false,
    stuckTimer,
  } = state;
  // Apply gravity
  vy += gravity * delta;
  if (vy > MAX_FALL_SPEED) vy = MAX_FALL_SPEED;
  let groundedOnSurface = false;
  let targetAngle = 0;
  let tangentX = 1;
  let tangentY = 0;
  // 1. Precise 2-Wheel Geometry matching Car sprite (width 82, height 48, center (41, 24))
  // Container rendered at left: x - 40, top: y - 20
  // Screen pivot is at (x + 1, y + 4)
  // Rear axle center relative to pivot: dx = -20, dy = +13; wheel bottom: dy = +24
  // Front axle center relative to pivot: dx = +21, dy = +13; wheel bottom: dy = +24
  // Wheelbase = 41px, Wheel radius = 11px
  const rad = (angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const pivotX = x + 1;
  const pivotY = y + 4;
  const rearAxle = {
    x: pivotX - 20 * cosA - 13 * sinA,
    y: pivotY - 20 * sinA + 13 * cosA,
  };
  const frontAxle = {
    x: pivotX + 21 * cosA - 13 * sinA,
    y: pivotY + 21 * sinA + 13 * cosA,
  };
  const centerAxle = {
    x: pivotX + 0.5 * cosA - 13 * sinA,
    y: pivotY + 0.5 * sinA + 13 * cosA,
  };
  const rearBottomX = pivotX - 20 * cosA - 24 * sinA;
  const frontBottomX = pivotX + 21 * cosA - 24 * sinA;
  // Helper to query the highest supporting surface for any wheel axle
  // Handles:
  // 1. Drawn black line ramp segments (thickness 5, R=11 wheel contact target distance = 13.5)
  // 2. Obstacles top platforms (obs.y)
  // 3. Flat road (roadY + 8 for wheel bottom, roadY - 3 for axle)
  const getSurfaceContactForAxle = (axle, bottomX) => {
    let bestPenetration = -100;
    let bestContact = null;
    // A. Check drawn ramp segments
    const rampStartX = segments.length > 0 ? segments[0].p1.x : 0;
    for (const seg of segments) {
      // Lines may only support a wheel from above. The road connection zone at the very start
      // of the stroke is the single exception, so the car can climb onto the ramp from the road.
      const isConnectionSegment =
        seg.p1.x - rampStartX <= RAMP_CONNECTION_ZONE_X;
      const minBelowLine = isConnectionSegment ? -28 : -8;
      const minX = Math.min(seg.p1.x, seg.p2.x);
      const maxX = Math.max(seg.p1.x, seg.p2.x);
      const targetX = bottomX ?? axle.x;
      // Segment only supports the wheel if horizontally within segment bounds (including joint cap)
      if (targetX < minX - 2 || targetX > maxX + 2) {
        continue;
      }
      const dx = seg.p2.x - seg.p1.x;
      const dy = seg.p2.y - seg.p1.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq < 0.5) continue;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((axle.x - seg.p1.x) * dx + (axle.y - seg.p1.y) * dy) / lenSq
        )
      );
      const closeX = seg.p1.x + t * dx;
      const closeY = seg.p1.y + t * dy;
      const toAxleX = axle.x - closeX;
      const toAxleY = axle.y - closeY;
      // Normal points UPWARDS in screen coordinates (ny < 0)
      const distNormal = toAxleX * seg.normal.x + toAxleY * seg.normal.y;
      const distTotal = Math.sqrt(toAxleX * toAxleX + toAxleY * toAxleY);
      // Contact threshold: wheel radius (11) + half ramp thickness (2.5) = 13.5
      // Detect surface within generous reach (up to 25px above ramp) to prevent loss of contact on curves
      const TARGET_DIST = WHEEL_RADIUS + RAMP_THICKNESS / 2;
      const penetration = TARGET_DIST - distNormal;
      if (distNormal > minBelowLine && penetration > -22 && distTotal < 45) {
        if (penetration > bestPenetration) {
          bestPenetration = penetration;
          const segLen = Math.sqrt(lenSq);
          let tx = dx / segLen;
          let ty = dy / segLen;
          if (tx < 0) {
            tx = -tx;
            ty = -ty;
          }
          // Evaluate exact surface height at the wheel horizontal coordinate
          let surfX = closeX + seg.normal.x * (RAMP_THICKNESS / 2);
          let surfY = closeY + seg.normal.y * (RAMP_THICKNESS / 2);
          if (
            Math.abs(dx) > 0.001 &&
            targetX >= minX - 4 &&
            targetX <= maxX + 4
          ) {
            const fracX = Math.max(0, Math.min(1, (targetX - seg.p1.x) / dx));
            surfX = targetX;
            surfY = seg.p1.y + fracX * dy + seg.normal.y * (RAMP_THICKNESS / 2);
          }
          bestContact = {
            penetration,
            closeX: surfX,
            closeY: surfY,
            normalX: seg.normal.x,
            normalY: seg.normal.y,
            tangentX: tx,
            tangentY: ty,
          };
        }
      }
    }
    // B. Check Obstacles top platforms
    for (const obs of allObstacles) {
      // Wheel must be within horizontal span of obstacle (no empty-air overhang)
      if (axle.x >= obs.x && axle.x <= obs.x + obs.width) {
        // Obstacle top is at obs.y. Axle rests at obs.y - 11.
        // Penetration is only valid when wheel is on or landing upon top platform from above
        const penetration = axle.y - (obs.y - 11);
        if (penetration > -18 && penetration <= 8) {
          bestPenetration = penetration;
          bestContact = {
            penetration,
            closeX: axle.x,
            closeY: obs.y,
            normalX: 0,
            normalY: -1,
            tangentX: 1,
            tangentY: 0,
          };
        }
      }
    }
    // C. Check Flat Road (unless in road gap or inside solid ground obstacle)
    const inRoadGap = roadGaps.some(
      (gap) => axle.x >= gap.x && axle.x <= gap.x + gap.width
    );
    const inSolidObstacle = allObstacles.some(
      (obs) =>
        axle.x >= obs.x + 2 &&
        axle.x <= obs.x + obs.width - 2 &&
        obs.y + obs.height >= roadY - 5
    );
    if (!inRoadGap && !inSolidObstacle) {
      // Road surface for wheel bottom is at roadY + 8 (carFloorY = roadY - 20)
      // Wheel axle rests at roadY - 3
      const roadPenetration = axle.y - (roadY - 3);
      if (roadPenetration > bestPenetration && roadPenetration > -22) {
        bestPenetration = roadPenetration;
        bestContact = {
          penetration: roadPenetration,
          closeX: axle.x,
          closeY: roadY + 8,
          normalX: 0,
          normalY: -1,
          tangentX: 1,
          tangentY: 0,
        };
      }
    }
    return bestContact;
  };
  const rearContact = getSurfaceContactForAxle(rearAxle, rearBottomX);
  const frontContact = getSurfaceContactForAxle(frontAxle, frontBottomX);
  const centerContact = getSurfaceContactForAxle(centerAxle);
  // 2. Dual-Wheel Contact & Natural Pitch Angle Alignment
  const hasRear = rearContact !== null && rearContact.penetration > -18;
  const hasFront = frontContact !== null && frontContact.penetration > -18;
  if (
    hasRear &&
    hasFront &&
    Math.abs(frontContact.closeX - rearContact.closeX) > 12
  ) {
    // Both wheels supported: car body naturally spans between rear and front wheel contact points
    targetAngle =
      (Math.atan2(
        frontContact.closeY - rearContact.closeY,
        frontContact.closeX - rearContact.closeX
      ) *
        180) /
      Math.PI;
    let avgTx = rearContact.tangentX + frontContact.tangentX;
    let avgTy = rearContact.tangentY + frontContact.tangentY;
    const tLen = Math.sqrt(avgTx * avgTx + avgTy * avgTy) || 1;
    tangentX = avgTx / tLen;
    tangentY = avgTy / tLen;
  } else if (hasRear) {
    // When front wheel has lost support over a pit, car naturally tilts downward into the gap
    const isFrontOverPit = roadGaps.some(
      (gap) => frontAxle.x >= gap.x && frontAxle.x <= gap.x + gap.width
    );
    if (isFrontOverPit) {
      targetAngle = 26; // Natural downward pitch into the pit
      tangentX = Math.cos((26 * Math.PI) / 180);
      tangentY = Math.sin((26 * Math.PI) / 180);
    } else {
      targetAngle =
        (Math.atan2(rearContact.tangentY, rearContact.tangentX) * 180) /
        Math.PI;
      tangentX = rearContact.tangentX;
      tangentY = rearContact.tangentY;
    }
  } else if (hasFront) {
    targetAngle =
      (Math.atan2(frontContact.tangentY, frontContact.tangentX) * 180) /
      Math.PI;
    tangentX = frontContact.tangentX;
    tangentY = frontContact.tangentY;
  } else {
    // Airborne free flight pitch
    targetAngle = Math.max(
      -35,
      Math.min(35, (Math.atan2(vy, Math.max(vx, 30)) * 180) / Math.PI)
    );
    tangentX = 1;
    tangentY = 0;
  }
  targetAngle = Math.max(-48, Math.min(48, targetAngle));
  // 3. Body Pitch Angle Alignment (Updated before height calculation so both wheels sit on surface)
  const isGroundedCandidate =
    (hasRear || hasFront) && (rearContact !== null || frontContact !== null);
  if (isGroundedCandidate) {
    const angleDiff = targetAngle - angle;
    // Damped per-frame step (< 8 deg/frame) so car rotates naturally without sudden jerking
    const maxStep = (pitchFactor / 24) * 7.0;
    const step = Math.max(-maxStep, Math.min(maxStep, angleDiff));
    angle += step;
    if (Math.abs(angle - targetAngle) < 0.2) {
      angle = targetAngle;
    }
  } else {
    const flightAngle = Math.max(
      -35,
      Math.min(35, (Math.atan2(vy, Math.max(vx, 30)) * 180) / Math.PI)
    );
    angle += (flightAngle - angle) * Math.min(1, (pitchFactor / 3) * delta);
  }
  // 4. Multi-Surface Ground Support & Height Calculation
  // Uses the CURRENT car body angle so that both front & rear wheel contact points touch the surface
  const currentRad = (angle * Math.PI) / 180;
  const curCos = Math.cos(currentRad);
  const curSin = Math.sin(currentRad);
  let yReq = null;
  if (hasRear && rearContact && hasFront && frontContact) {
    // Both wheels resting on surface: calculate resting height ensuring both wheels maintain realistic contact
    const yFromRear = rearContact.closeY - (4 - 20 * curSin + 24 * curCos);
    const yFromFront = frontContact.closeY - (4 + 21 * curSin + 24 * curCos);
    yReq = (yFromRear + yFromFront) / 2;
  } else if (hasRear && rearContact) {
    yReq = rearContact.closeY - (4 - 20 * curSin + 24 * curCos);
  } else if (hasFront && frontContact) {
    yReq = frontContact.closeY - (4 + 21 * curSin + 24 * curCos);
  }
  if (centerContact && centerContact.penetration > -4) {
    // Underbelly crest support
    const yFromCenter = centerContact.closeY - (4 + 0.5 * curSin + 24 * curCos);
    yReq = yReq === null ? yFromCenter : Math.min(yReq, yFromCenter);
  }
  if (yReq !== null && y >= yReq - 20.0) {
    groundedOnSurface = true;
    // Over an open road gap, the flat road cannot hold up the car without a drawn ramp bridge
    const isCenterOverGap = roadGaps.some(
      (gap) => x >= gap.x && x <= gap.x + gap.width
    );
    const hasDrawnRamp = segments.some(
      (seg) =>
        x >= Math.min(seg.p1.x, seg.p2.x) - 10 &&
        x <= Math.max(seg.p1.x, seg.p2.x) + 10
    );
    if (isCenterOverGap && !hasDrawnRamp) {
      groundedOnSurface = false;
    }
    if (groundedOnSurface) {
      // Direct velocity along surface tangent respecting direction of motion
      const vTangent = vx * tangentX + vy * tangentY;
      vx = vTangent * tangentX;
      vy = vTangent * tangentY;
    }
  }
  isGrounded = groundedOnSurface;
  // 5. Smooth, Gradual Motor Drive & Traction
  if (isGrounded) {
    const speedRatio = Math.max(0, Math.min(1, Math.abs(vx) / maxVx));
    const smoothDriveAccel =
      tangentY < -0.05 ? driveAccel : driveAccel * (1 - 0.3 * speedRatio);
    vx += tangentX * smoothDriveAccel * delta;
    vy += tangentY * smoothDriveAccel * delta;
    vx *= Math.pow(0.994, delta * 60);
  } else {
    vx += airDriveAccel * delta;
    vx *= Math.pow(0.998, delta * 60);
  }
  if (vx > maxVx) vx = maxVx;
  if (vx < -50) vx = -50;
  // 6. Position Integration & Ground Surface Attachment
  x += vx * delta;
  if (groundedOnSurface && yReq !== null) {
    // Precise surface attachment at the integrated car position x
    const slope = Math.abs(tangentX) > 0.001 ? tangentY / tangentX : 0;
    y = Math.max(
      yReq + vx * delta * slope,
      state.y - MAX_SURFACE_RISE_SPEED * delta
    );
  } else {
    y += vy * delta;
  }
  // 7. Obstacle Wall & Pit Collisions
  let status = 'running';
  const carFrontX = x + CAR_HALF_WIDTH;
  const carRearX = x - CAR_HALF_WIDTH;
  const carBottomY = y + 20;
  const carTopY = y - 20;
  for (const obs of allObstacles) {
    const obsLeft = obs.x;
    const obsRight = obs.x + obs.width;
    const obsTop = obs.y;
    const obsBottom = obs.y + obs.height;
    // Solid obstacle bounds: car overlaps if horizontally within [obsLeft, obsRight]
    // and vertically within [obsTop, obsBottom].
    // If car is underground inside a pit (y > roadY + 5) and obstacle is up on the road,
    // the obstacle does not overlap with the car in the pit trench.
    const overlapsX = carFrontX >= obsLeft && carRearX <= obsRight;
    const isUndergroundInPit = y > roadY + 5 && obsBottom <= roadY + 2;
    const overlapsY =
      carBottomY > obsTop + 3 && carTopY < obsBottom - 2 && !isUndergroundInPit;
    if (overlapsX && overlapsY) {
      if (hasShield && !shieldAbsorbed) {
        shieldAbsorbed = true;
        // Shield absorbs impact: car pops over obstacle cleanly with forward drive
        x = obsLeft + 6;
        y = Math.min(y, obsTop - 16);
        vx = Math.max(vx, 220);
        vy = -120;
      } else {
        // Car collides with solid obstacle: stop horizontal travel and block penetration.
        // Vertical velocity is kept so an airborne car slides down the wall instead of
        // hovering against it (zeroing vy every frame cancelled gravity).
        if (vx >= 0 || carRearX < obsLeft) {
          x = Math.min(x, obsLeft - CAR_HALF_WIDTH);
          if (vx > 0) vx = 0;
        } else {
          x = Math.max(x, obsRight + CAR_HALF_WIDTH);
          if (vx < 0) vx = 0;
        }
      }
    }
  }
  // 7b. Road Gap Pit Wall Collisions (Vertical ledge at the end of gaps)
  for (const gap of roadGaps) {
    const gapRight = gap.x + gap.width;
    // A car inside the gap dropping below road surface cannot pass through the far ledge
    if (
      carFrontX >= gapRight &&
      carRearX < gapRight &&
      carBottomY > roadY + 2
    ) {
      x = gapRight - CAR_HALF_WIDTH;
      if (vx > 0) vx = 0;
      status = 'stuck';
    }
  }
  // 8. Track Obstacle Clearance
  let maxObstacleRight = 0;
  for (const obs of allObstacles) {
    if (obs.x + obs.width > maxObstacleRight) {
      maxObstacleRight = obs.x + obs.width;
    }
  }
  const threshold =
    clearThresholdX ?? (maxObstacleRight > 0 ? maxObstacleRight + 5 : 200);
  if (x > threshold) {
    hasClearedObstacle = true;
  }
  // 9. Dynamic Wheel Rotation
  const wheelCircumference = 2 * Math.PI * WHEEL_RADIUS;
  const rotationDelta = ((vx * delta) / wheelCircumference) * 360;
  wheelRotation = (wheelRotation + rotationDelta) % 360;
  // 10. Body pitch angle already smoothly resolved in Step 3 for precise wheel-to-surface alignment.
  // 11. Success & Failure State Determination (Strict Road-Based Completion)
  if (status === 'running') {
    // Strict Road / Ramp Contact & Grounded State Validation:
    // - Must be physically supported by road or approved ramp (isGrounded)
    // - Must have valid wheel contact (hasRear || hasFront, allowing temporary single-wheel on slopes)
    // - Center altitude must be within physics tolerance of the supporting road/ramp surface
    // - Body pitch must be stable (not flipping / tumbling)
    // - Must not be hovering over an open road gap
    const isOverRoadGap = roadGaps.some(
      (gap) => x >= gap.x && x <= gap.x + gap.width
    );
    const hasWheelContact = hasRear || hasFront;
    const isSurfaceContactValid =
      (yReq !== null && Math.abs(y - yReq) <= 22) ||
      (!isOverRoadGap && y >= roadY - 32 && y <= roadY + 22);
    const isPitchStable = Math.abs(angle) <= 60;
    const isStrictlyGrounded =
      isGrounded && hasWheelContact && isSurfaceContactValid && isPitchStable;
    // The actual finish line boundary starts when vehicle center reaches finishX - 10
    // (body/bumper-only touches before this, e.g. at finishX - 35, do not trigger completion)
    const isFinishZone = x >= finishX - 10;
    if (isFinishZone) {
      if (hasClearedObstacle && isStrictlyGrounded) {
        // Valid road or approved ramp completion: vehicle driven across finish line with valid surface contact
        status = 'success';
        vx *= 0.8;
      } else if (!isStrictlyGrounded || x >= finishX + 25) {
        // Airborne Finish or falling = LEVEL FAILED: vehicle jumped, flew, or fell across finish line
        status = 'stuck';
      }
    }
  }
  // --- 12. ROBUST GLOBAL STUCK & PIT DETECTION ---
  // Tracks position displacement, obstacle collisions, pit traps, broken ramp troughs, and vehicle overturns.
  let curLastProgressX = state.lastProgressX ?? x;
  let curLastProgressY = state.lastProgressY ?? y;
  // A. Pit / Road Gap Trapping:
  // When inside an unbridged road gap dropping below road surface, car cannot escape vertical ledges.
  const isInsideRoadGap = roadGaps.some(
    (gap) => x >= gap.x - 4 && x <= gap.x + gap.width + 4
  );
  const hasDrawnRampBridge = segments.some(
    (seg) =>
      x >= Math.min(seg.p1.x, seg.p2.x) - 10 &&
      x <= Math.max(seg.p1.x, seg.p2.x) + 10
  );
  if (isInsideRoadGap && !hasDrawnRampBridge && y > roadY + 6) {
    stuckTimer += delta * 2.5;
  }
  // B. Fall off limits (deep in pit or past left boundary):
  if (y > roadY + 45 || x < -80) {
    status = 'stuck';
  }
  // C. Meaningful Forward Progress vs Stuck Timer:
  // Forward progress means the vehicle advances past its previous forward progress watermark.
  // Vehicles moving forward (> 12 px/s) and advancing >= 12px beyond the anchor clear stuckTimer.
  // When a car is oscillating in a trough, blocked by an obstacle, trapped in a pit,
  // sliding backward, or spinning in place, x cannot advance >= 12px forward, so stuckTimer accumulates.
  if (x > curLastProgressX + 12 && vx > 12) {
    curLastProgressX = x;
    curLastProgressY = y;
    stuckTimer = Math.max(0, stuckTimer - delta * 2.5);
  } else {
    // Not advancing forward: car is either stationary, blocked, reversing, or oscillating
    stuckTimer += delta;
  }
  // D. Vehicle Overturned (Flipped onto roof or side on surface):
  if (Math.abs(angle) > 85) {
    stuckTimer += delta * 1.5;
  }
  // E. Trigger Stuck Status when timer exceeds STUCK_TIMEOUT (1.0s):
  if (stuckTimer >= STUCK_TIMEOUT && status === 'running') {
    status = 'stuck';
  }
  return {
    state: {
      x,
      y,
      vx,
      vy,
      angle,
      wheelRotation,
      isGrounded,
      hasClearedObstacle,
      stuckTimer,
      lastProgressX: curLastProgressX,
      lastProgressY: curLastProgressY,
    },
    status,
    shieldAbsorbed,
  };
}
/**
 * Oriented Bounding Box vs Circle collision detection.
 * Checks whether any part of the car touches the coin with a generous 26px contact reach.
 */
export function checkCoinCarCollision(coin, carX, carY, carAngle = 0) {
  // Car pivot in gameplayArea coordinates (center of 82x48 car at left: x - 40, top: y - 20)
  const pivotX = carX + 1;
  const pivotY = carY + 4;
  // Unrotate coin relative to car heading
  const rad = (-carAngle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const dx = coin.x - pivotX;
  const dy = coin.y - pivotY;
  const localX = dx * cosA - dy * sinA;
  const localY = dx * sinA + dy * cosA;
  // Car bounding box half-extents
  const halfW = 41;
  const halfH = 24;
  const clampX = Math.max(-halfW, Math.min(halfW, localX));
  const clampY = Math.max(-halfH, Math.min(halfH, localY));
  const dist = Math.hypot(localX - clampX, localY - clampY);
  return dist <= 26;
}
/**
 * Checks whether any part of the car touches a collectible power-up.
 */
export function checkPowerUpCarCollision(powerUp, carX, carY, carAngle = 0) {
  if (powerUp.collected) return false;
  return checkCoinCarCollision(powerUp, carX, carY, carAngle);
}
