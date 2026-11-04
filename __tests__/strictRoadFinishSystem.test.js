import {
  buildRampSegments,
  stepCarPhysics,
} from '../src/games/rampracer/physics/physicsEngine';
describe('Strict Road-Based Level Completion & Failure System', () => {
  const roadY = 400;
  const finishX = 500;
  const obstacle = {
    x: 200,
    y: 320,
    width: 60,
    height: 80,
  };
  // -------------------------------------------------------------
  // Scenario 1: Normal driving on road across finish flag -> PASSED
  // -------------------------------------------------------------
  it('Scenario 1: allows completion when driving normally on the road across finish flag', () => {
    // Car driving on road surface (resting y = roadY - 20) with cleared obstacle
    const state = {
      x: finishX - 10,
      y: roadY - 20,
      vx: 200,
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
    expect(res.state.isGrounded).toBe(true);
    // Speed damped upon crossing finish line
    expect(res.state.vx).toBeLessThan(200);
  });
  // -------------------------------------------------------------
  // Scenario 2: Jump over finish flag while airborne -> LEVEL FAILED
  // -------------------------------------------------------------
  it('Scenario 2: immediately fails level when jumping over finish flag while airborne', () => {
    // Car launched in mid-air (y = roadY - 80), crossing finish line
    const state = {
      x: finishX - 5,
      y: roadY - 80,
      vx: 240,
      vy: -50,
      angle: -15,
      wheelRotation: 0,
      isGrounded: false,
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
    expect(res.status).toBe('stuck');
    expect(res.state.isGrounded).toBe(false);
  });
  // -------------------------------------------------------------
  // Scenario 3: Fly above road and cross finish boundary -> LEVEL FAILED
  // -------------------------------------------------------------
  it('Scenario 3: fails level when flying high above road past finish boundary', () => {
    const state = {
      x: finishX + 15,
      y: roadY - 120, // High above road
      vx: 300,
      vy: 20,
      angle: 5,
      wheelRotation: 0,
      isGrounded: false,
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
    expect(res.status).toBe('stuck');
    expect(res.state.isGrounded).toBe(false);
  });
  // -------------------------------------------------------------
  // Scenario 4: Land safely on road before flag, then drive across -> PASSED
  // -------------------------------------------------------------
  it('Scenario 4: succeeds when airborne car lands on road before flag and drives across', () => {
    // Start airborne 80px before finish boundary: x = 410, y = roadY - 35, falling towards road
    let state = {
      x: finishX - 90,
      y: roadY - 35,
      vx: 180,
      vy: 120, // Falling towards ground
      angle: -5,
      wheelRotation: 0,
      isGrounded: false,
      hasClearedObstacle: true,
      stuckTimer: 0,
    };
    let reachedStatus = 'running';
    // Simulate multi-frame physics: vehicle touches down on road, stabilizes, drives across
    for (let frame = 0; frame < 60; frame++) {
      const res = stepCarPhysics({
        state,
        segments: [],
        obstacles: [obstacle],
        roadY,
        finishX,
        dt: 0.016,
      });
      state = res.state;
      if (res.status !== 'running') {
        reachedStatus = res.status;
        break;
      }
    }
    expect(reachedStatus).toBe('success');
    expect(state.x).toBeGreaterThanOrEqual(finishX - 10);
    expect(state.isGrounded).toBe(true);
    // Settled center y on road surface (roadY - 20)
    expect(Math.abs(state.y - (roadY - 20))).toBeLessThan(3);
  });
  // -------------------------------------------------------------
  // Scenario 5: Fall off road and cannot recover -> LEVEL FAILED
  // -------------------------------------------------------------
  it('Scenario 5: fails level when vehicle falls off road into gap or pit', () => {
    const state = {
      x: 350,
      y: roadY + 50, // Fallen below road
      vx: 100,
      vy: 200,
      angle: 25,
      wheelRotation: 0,
      isGrounded: false,
      hasClearedObstacle: true,
      stuckTimer: 0,
    };
    const res = stepCarPhysics({
      state,
      segments: [],
      obstacles: [obstacle],
      roadGaps: [{ x: 300, width: 100 }],
      roadY,
      finishX,
      dt: 0.016,
    });
    expect(res.status).toBe('stuck');
  });
  // -------------------------------------------------------------
  // Scenario 6: Cross finish line on curved ramp with valid wheel contact -> PASSED
  // -------------------------------------------------------------
  it('Scenario 6: completes level when crossing finish line on a drawn ramp with valid wheel contact', () => {
    // Ramp spanning through finish line: elevated at y = 350 (roadY is 400)
    const rampPoints = [
      { x: 420, y: 390 },
      { x: 460, y: 360 },
      { x: 500, y: 350 }, // finishX is 500
      { x: 540, y: 350 },
    ];
    const segments = buildRampSegments(rampPoints, roadY);
    // Car on the ramp at finish boundary x = 490, y = 330 (car resting on y=350 surface)
    const state = {
      x: finishX - 10,
      y: 330,
      vx: 160,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: true,
      stuckTimer: 0,
    };
    const res = stepCarPhysics({
      state,
      segments,
      obstacles: [obstacle],
      roadY,
      finishX,
      dt: 0.016,
    });
    expect(res.status).toBe('success');
    expect(res.state.isGrounded).toBe(true);
  });
  // -------------------------------------------------------------
  // Scenario 7: Temporarily one wheel in contact on steep slope -> Not incorrectly failed
  // -------------------------------------------------------------
  it('Scenario 7: does not fail when car is physically supported on steep ramp even with single-wheel contact', () => {
    // Steep crest / slope where front wheel is on slope while rear wheel transitions
    const rampPoints = [
      { x: 450, y: 390 },
      { x: 495, y: 350 },
      { x: 530, y: 320 },
    ];
    const segments = buildRampSegments(rampPoints, roadY);
    const state = {
      x: finishX - 10,
      y: 330,
      vx: 150,
      vy: -20,
      angle: -25,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: true,
      stuckTimer: 0,
    };
    const res = stepCarPhysics({
      state,
      segments,
      obstacles: [obstacle],
      roadY,
      finishX,
      dt: 0.016,
    });
    // Should succeed because car is physically supported on the ramp surface
    expect(res.status).toBe('success');
    expect(res.state.isGrounded).toBe(true);
  });
  // -------------------------------------------------------------
  // Scenario 8: Car touches flag body/bumper but does not properly cross -> Stays running
  // -------------------------------------------------------------
  it('Scenario 8: stays running when car front bumper touches flag boundary but car has not crossed', () => {
    // Car center is at finishX - 35. Front bumper is at (finishX - 35) + CAR_HALF_WIDTH (41) = finishX + 6.
    // The bumper reaches the flag, but vehicle center has not crossed finishBoundary (finishX - 10).
    const state = {
      x: finishX - 35,
      y: roadY - 20,
      vx: 150,
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
    expect(res.status).toBe('running');
  });
  // -------------------------------------------------------------
  // Completion & Reward Protection Check
  // -------------------------------------------------------------
  it('ensures airborne crossing never returns success status preventing unauthorized rewards', () => {
    const airborneCases = [
      { x: finishX - 10, y: roadY - 60, desc: 'Jump at finish line' },
      { x: finishX, y: roadY - 90, desc: 'Fly centered over flag' },
      { x: finishX + 15, y: roadY - 75, desc: 'Fly past flag' },
      { x: finishX + 30, y: roadY - 50, desc: 'Overshoot flag airborne' },
    ];
    for (const testCase of airborneCases) {
      const res = stepCarPhysics({
        state: {
          x: testCase.x,
          y: testCase.y,
          vx: 250,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: false,
          hasClearedObstacle: true,
          stuckTimer: 0,
        },
        segments: [],
        obstacles: [obstacle],
        roadY,
        finishX,
        dt: 0.016,
      });
      expect(res.status).toBe('stuck');
      expect(res.status).not.toBe('success');
    }
  });
});
