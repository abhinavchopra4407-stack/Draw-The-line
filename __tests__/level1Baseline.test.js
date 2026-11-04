import {
  validateRampDrawing,
  buildRampSegments,
  stepCarPhysics,
  FIXED_DT,
} from '../src/games/rampracer/physics/physicsEngine';
import {
  resolveLevelGeometry,
  LEVELS,
} from '../src/games/rampracer/data/levels';
describe('Level 1 Baseline Audit & Permissive Ramp Validation', () => {
  const level1 = LEVELS[0];
  const areaWidth = 360;
  const roadY = 400;
  const geom = resolveLevelGeometry(level1, areaWidth, roadY, 0, 800);
  const obstacle = geom.obstacles[0]; // Brick hurdle at x=180, width=70, height=80
  const carStartX = geom.carStartX; // 43.2
  const finishX = geom.finishX; // 316.8
  function createInitialState(startX, startY) {
    return {
      x: startX,
      y: startY,
      vx: 60,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
  }
  function simulatePhysics(initialState, rampPoints, maxSteps = 300) {
    const segments = buildRampSegments(rampPoints, roadY);
    let state = { ...initialState };
    let status = 'running';
    let steps = 0;
    for (let i = 0; i < maxSteps; i++) {
      steps++;
      const result = stepCarPhysics({
        state,
        segments,
        obstacles: geom.obstacles,
        roadGaps: geom.roadGaps,
        roadY,
        finishX,
        dt: FIXED_DT,
      });
      state = result.state;
      status = result.status;
      if (status !== 'running') {
        break;
      }
    }
    return { finalState: state, status, steps };
  }
  // -------------------------------------------------------------
  // Test 1: Baseline Verification - Obstacle Blocks Path Without Ramp
  // -------------------------------------------------------------
  it('blocks car when driving on flat road without drawing a ramp', () => {
    const initialState = createInitialState(carStartX, roadY - 20);
    const result = simulatePhysics(initialState, []);
    // Without a ramp, car collides with obstacle left wall and stops
    expect(result.status).toBe('stuck');
    expect(result.finalState.hasClearedObstacle).toBe(false);
    expect(result.finalState.x).toBeLessThan(obstacle.x);
  });
  // -------------------------------------------------------------
  // Test 2: Simple Ramp Over Obstacle
  // -------------------------------------------------------------
  it('allows completion of Level 1 using a simple straight ramp', () => {
    // Ramp starts at road, launches up over hurdle, lands back on road
    const simpleRamp = [
      { x: carStartX + 10, y: roadY },
      { x: obstacle.x - 30, y: obstacle.y - 15 },
      { x: obstacle.x + obstacle.width + 30, y: obstacle.y - 15 },
      { x: finishX - 30, y: roadY },
    ];
    const validation = validateRampDrawing(
      simpleRamp,
      roadY,
      carStartX,
      obstacle.x + 60
    );
    expect(validation.isValid).toBe(true);
    const result = simulatePhysics(
      createInitialState(carStartX, roadY - 20),
      simpleRamp
    );
    expect(result.status).toBe('success');
    expect(result.finalState.hasClearedObstacle).toBe(true);
    expect(result.finalState.x).toBeGreaterThanOrEqual(finishX - 10);
  });
  // -------------------------------------------------------------
  // Test 3: Smooth Curved Ramp
  // -------------------------------------------------------------
  it('allows completion of Level 1 using a smooth curved ramp', () => {
    const curvedRamp = [];
    // Arc over the obstacle from x=60 to x=290
    for (let t = 0; t <= 1; t += 0.1) {
      const x = 60 + (290 - 60) * t;
      // Parabolic arc peaking at y = 290 (obstacle top is at 320)
      const h = 4 * 105 * t * (1 - t);
      const y = roadY - h;
      curvedRamp.push({ x: Math.round(x), y: Math.round(y) });
    }
    const validation = validateRampDrawing(
      curvedRamp,
      roadY,
      carStartX,
      obstacle.x + 60
    );
    expect(validation.isValid).toBe(true);
    const result = simulatePhysics(
      createInitialState(carStartX, roadY - 20),
      curvedRamp
    );
    expect(result.status).toBe('success');
    expect(result.finalState.hasClearedObstacle).toBe(true);
  });
  // -------------------------------------------------------------
  // Test 4: Creative Loop Ramp (Loop-de-Loop)
  // -------------------------------------------------------------
  it('allows completion of Level 1 using a creative loop ramp', () => {
    // Creative roller-coaster loop that loops and clears the hurdle, landing safely on road
    const loopRamp = [
      { x: 45, y: roadY },
      { x: 80, y: 330 },
      { x: 110, y: 260 },
      { x: 135, y: 210 },
      { x: 155, y: 235 },
      { x: 140, y: 265 }, // Loops backward
      { x: 115, y: 250 }, // Crosses path (self-intersection)
      { x: 160, y: 220 }, // Exits forward over hurdle
      { x: 215, y: 230 }, // Clears hurdle top (hurdle top is at 320)
      { x: 260, y: 330 }, // Descends past hurdle
      { x: 280, y: roadY }, // Lands safely on road before finish line (finishX = 316.8)
    ];
    const validation = validateRampDrawing(
      loopRamp,
      roadY,
      carStartX,
      obstacle.x + 60
    );
    expect(validation.isValid).toBe(true);
    const segments = buildRampSegments(loopRamp, roadY);
    expect(segments.length).toBeGreaterThan(0);
    const result = simulatePhysics(
      createInitialState(carStartX, roadY - 20),
      loopRamp
    );
    expect(result.status).toBe('success');
    expect(result.finalState.hasClearedObstacle).toBe(true);
  });
  // -------------------------------------------------------------
  // Test 5: Jump & Safe Landing on Road
  // -------------------------------------------------------------
  it('allows completion when ramp launches the car into a jump that lands safely on road before finish', () => {
    // Launch ramp that ends at the crest of the obstacle, launching car into the air
    const jumpRamp = [
      { x: 50, y: roadY },
      { x: 100, y: 350 },
      { x: 150, y: 300 },
    ];
    const validation = validateRampDrawing(
      jumpRamp,
      roadY,
      carStartX,
      obstacle.x + 60
    );
    expect(validation.isValid).toBe(true);
    // Car launches, flies over hurdle, lands on road before finish line, then drives across
    const result = simulatePhysics(
      createInitialState(carStartX, roadY - 20),
      jumpRamp,
      350
    );
    expect(result.status).toBe('success');
    expect(result.finalState.hasClearedObstacle).toBe(true);
    expect(result.finalState.isGrounded).toBe(true);
  });
  // -------------------------------------------------------------
  // Test 6: Airborne Finish Crossing FAILS
  // -------------------------------------------------------------
  it('strictly FAILS the level if the vehicle crosses the finish line while airborne', () => {
    // Car at finish line x = finishX, but elevated in the air (y = roadY - 70)
    const airborneState = {
      x: finishX,
      y: roadY - 70,
      vx: 300,
      vy: -50,
      angle: 0,
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
      finishX,
      dt: FIXED_DT,
    });
    // Flying over finish line must NOT pass
    expect(res.status).toBe('stuck');
    expect(res.status).not.toBe('success');
  });
  // -------------------------------------------------------------
  // Test 7: Grounded Finish Crossing SUCCEEDS
  // -------------------------------------------------------------
  it('successfully completes the level when car crosses finish line grounded on the road', () => {
    const groundedState = {
      x: finishX - 10,
      y: roadY - 20,
      vx: 240,
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
      finishX,
      dt: FIXED_DT,
    });
    expect(res.status).toBe('success');
  });
});
