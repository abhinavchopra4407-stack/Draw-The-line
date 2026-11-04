import {
  prepareRampPoints,
  buildRampSegments,
  validateRampDrawing,
  stepCarPhysics,
} from '../src/games/rampracer/physics/physicsEngine';
describe('Random Line Driving Bug Fix & Strict Ramp Validation', () => {
  const roadY = 400;
  const carStartX = 50;
  const finishX = 500;
  const obstacle = {
    x: 220,
    y: 320,
    width: 60,
    height: 80,
  };
  // -------------------------------------------------------------
  // Test 1: Random lines in the sky are rejected and generate NO collision segments
  // -------------------------------------------------------------
  it('rejects random lines drawn floating high in the sky and creates zero collision segments', () => {
    // Player drew a horizontal line floating high in the sky above obstacle (y = 150)
    const skyPoints = [
      { x: 100, y: 150 },
      { x: 200, y: 150 },
      { x: 300, y: 150 },
    ];
    const validation = validateRampDrawing(
      skyPoints,
      roadY,
      carStartX,
      obstacle.x + 30
    );
    expect(validation.isValid).toBe(false);
    expect(validation.reason).toContain('Ramp must start from the road');
    // buildRampSegments with roadY must return empty segments
    const segments = buildRampSegments(skyPoints, roadY);
    expect(segments.length).toBe(0);
  });
  // -------------------------------------------------------------
  // Test 2: Disconnected lines far from launch zone are rejected
  // -------------------------------------------------------------
  it('rejects disconnected lines drawn far ahead near the finish line', () => {
    // Line drawn far ahead at x = 450..500 near finish line
    const disconnectedPoints = [
      { x: 450, y: roadY },
      { x: 480, y: roadY - 30 },
      { x: 520, y: roadY - 10 },
    ];
    const validation = validateRampDrawing(
      disconnectedPoints,
      roadY,
      carStartX,
      obstacle.x + 30
    );
    expect(validation.isValid).toBe(false);
    expect(validation.reason).toContain(
      'Ramp must connect to the car launch zone'
    );
  });
  // -------------------------------------------------------------
  // Test 3: Backward strokes are rejected
  // -------------------------------------------------------------
  it('rejects lines drawn in reverse towards the left', () => {
    const reversePoints = [
      { x: 200, y: roadY },
      { x: 150, y: roadY - 40 },
      { x: 100, y: roadY - 20 },
    ];
    const validation = validateRampDrawing(
      reversePoints,
      roadY,
      carStartX,
      obstacle.x + 30
    );
    expect(validation.isValid).toBe(false);
    expect(validation.reason).toContain('Ramp must go forward');
  });
  // -------------------------------------------------------------
  // Test 4: Valid ramps starting near road are approved and seamless
  // -------------------------------------------------------------
  it('approves valid forward ramps starting near the road and creates matching collision segments', () => {
    const validPoints = [
      { x: 45, y: roadY },
      { x: 120, y: 350 },
      { x: 200, y: 310 },
      { x: 280, y: 350 },
      { x: 340, y: roadY },
    ];
    const validation = validateRampDrawing(
      validPoints,
      roadY,
      carStartX,
      obstacle.x + 30
    );
    expect(validation.isValid).toBe(true);
    expect(validation.sanitizedPoints.length).toBeGreaterThanOrEqual(3);
    const segments = buildRampSegments(validPoints, roadY);
    expect(segments.length).toBeGreaterThan(0);
    // Collision segments match the visible points
    for (const seg of segments) {
      expect(seg.length).toBeGreaterThan(0);
      expect(seg.normal.y).toBeLessThanOrEqual(0); // Upward pointing normal
    }
  });
  // -------------------------------------------------------------
  // Test 5: No fake invisible roads created for lines in the sky
  // -------------------------------------------------------------
  it('does not create fake invisible roads to the origin for floating lines', () => {
    const floatingLine = [
      { x: 150, y: 100 },
      { x: 250, y: 100 },
    ];
    const prepared = prepareRampPoints(floatingLine, roadY);
    // Should NOT inject fake unshifted point at x=0
    expect(prepared[0].x).toBe(150);
    expect(prepared[0].y).toBe(100);
  });
  // -------------------------------------------------------------
  // Test 6: Finish line cannot be completed on an elevated random sky line
  // -------------------------------------------------------------
  it('fails level when vehicle attempts to cross finish line on an elevated line in the sky', () => {
    // Car at finish zone (x = finishX), but elevated at y = roadY - 80 on a sky line
    const state = {
      x: finishX,
      y: roadY - 80,
      vx: 180,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: true,
      stuckTimer: 0,
    };
    const res = stepCarPhysics({
      state,
      segments: [],
      obstacles: [obstacle],
      roadY,
      finishX,
      dt: 0.016,
    });
    // Elevated finish is strictly FAILED
    expect(res.status).toBe('stuck');
    expect(res.status).not.toBe('success');
  });
  // -------------------------------------------------------------
  // Test 7: Grounded finish on valid road surface passes
  // -------------------------------------------------------------
  it('successfully completes level when vehicle drives on valid road across finish line', () => {
    const state = {
      x: finishX - 10,
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
      state,
      segments: [],
      obstacles: [obstacle],
      roadY,
      finishX,
      dt: 0.016,
    });
    expect(res.status).toBe('success');
  });
  // -------------------------------------------------------------
  // Test 8: Circular / curved drawings starting from road are ALLOWED
  // -------------------------------------------------------------
  it('allows creative circular and curved paths that start from the road and progress forward', () => {
    // Generate a circular / spiral path starting at road (y = roadY) and progressing forward
    const circlePoints = [];
    const startPt = { x: carStartX + 20, y: roadY };
    circlePoints.push(startPt);
    const centerX = carStartX + 80;
    const centerY = roadY - 50;
    const radius = 50;
    for (let a = 90; a <= 450; a += 30) {
      const rad = (a * Math.PI) / 180;
      circlePoints.push({
        x: Math.round(centerX - radius * Math.cos(rad) + (a - 90) * 0.4),
        y: Math.round(centerY + radius * Math.sin(rad)),
      });
    }
    const validation = validateRampDrawing(circlePoints, roadY, carStartX);
    expect(validation.isValid).toBe(true);
    const segments = buildRampSegments(circlePoints, roadY);
    expect(segments.length).toBeGreaterThan(0);
  });
  // -------------------------------------------------------------
  // Test 9: Loop-de-loop ramps with self-intersections are ALLOWED
  // -------------------------------------------------------------
  it('allows creative loop-de-loop ramps and generates continuous physical collision segments', () => {
    // A roller-coaster loop-the-loop shape: goes up, loops over itself, and exits forward to road
    const loopPoints = [
      { x: 50, y: roadY },
      { x: 100, y: 320 },
      { x: 150, y: 240 },
      { x: 180, y: 220 },
      { x: 200, y: 250 },
      { x: 170, y: 290 }, // Loops backward
      { x: 130, y: 270 }, // Crosses path between (100, 320) and (150, 240)
      { x: 190, y: 350 },
      { x: 260, y: roadY },
    ];
    const validation = validateRampDrawing(loopPoints, roadY, carStartX);
    expect(validation.isValid).toBe(true);
    const segments = buildRampSegments(loopPoints, roadY);
    expect(segments.length).toBeGreaterThan(0);
  });
});
