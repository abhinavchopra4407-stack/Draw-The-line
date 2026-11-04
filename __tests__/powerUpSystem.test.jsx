import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { POWER_UP_CONFIGS } from '../src/games/rampracer/types/powerups';
import {
  getLevelConfig,
  resolveLevelGeometry,
  TOTAL_LEVELS,
} from '../src/games/rampracer/data/levels';
import {
  checkPowerUpCarCollision,
  stepCarPhysics,
  FIXED_DT,
} from '../src/games/rampracer/physics/physicsEngine';
import { PowerUpItem } from '../src/games/rampracer/components/PowerUpItem';
import { PowerUpIndicator } from '../src/games/rampracer/components/PowerUpIndicator';
import { Car } from '../src/games/rampracer/components/Car';
describe('Power-Up System', () => {
  describe('1. Power-Up Configurations', () => {
    it('defines all three required power-up types with valid parameters', () => {
      const types = ['magnet', 'shield', 'boost'];
      types.forEach((t) => {
        const config = POWER_UP_CONFIGS[t];
        expect(config).toBeDefined();
        expect(config.type).toBe(t);
        expect(config.duration).toBeGreaterThan(0);
        expect(config.name.length).toBeGreaterThan(0);
        expect(config.symbol.length).toBeGreaterThan(0);
        expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
    it('has balanced durations for each power-up', () => {
      expect(POWER_UP_CONFIGS.magnet.duration).toBe(6.0);
      expect(POWER_UP_CONFIGS.shield.duration).toBe(12.0);
      expect(POWER_UP_CONFIGS.boost.duration).toBe(3.5);
    });
    it('has appropriate symbols and titles', () => {
      expect(POWER_UP_CONFIGS.magnet.name).toBe('MAGNET');
      expect(POWER_UP_CONFIGS.magnet.symbol).toBe('🧲');
      expect(POWER_UP_CONFIGS.shield.name).toBe('SHIELD');
      expect(POWER_UP_CONFIGS.shield.symbol).toBe('🛡️');
      expect(POWER_UP_CONFIGS.boost.name).toBe('SPEED BOOST');
      expect(POWER_UP_CONFIGS.boost.symbol).toBe('⚡');
    });
  });
  describe('2. Level Placements Across Worlds', () => {
    it('places power-ups across levels in all 5 worlds', () => {
      let totalPowerUpsPlaced = 0;
      const foundTypes = new Set();
      for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
        const cfg = getLevelConfig(lvl);
        const geom = resolveLevelGeometry(cfg, 400, 300, 0);
        if (geom.powerUps && geom.powerUps.length > 0) {
          totalPowerUpsPlaced += geom.powerUps.length;
          geom.powerUps.forEach((pu) => {
            foundTypes.add(pu.type);
            expect(pu.x).toBeGreaterThan(50);
            expect(pu.x).toBeLessThan(geom.finishX);
            expect(pu.y).toBeLessThan(300);
            expect(pu.collected).toBe(false);
          });
        }
      }
      expect(totalPowerUpsPlaced).toBeGreaterThan(15);
      expect(foundTypes.has('magnet')).toBe(true);
      expect(foundTypes.has('shield')).toBe(true);
      expect(foundTypes.has('boost')).toBe(true);
    });
    it('verifies early levels have appropriate power-ups for learning', () => {
      const geom2 = resolveLevelGeometry(getLevelConfig(2), 400, 300, 0);
      expect(geom2.powerUps.some((p) => p.type === 'shield')).toBe(true);
      const geom4 = resolveLevelGeometry(getLevelConfig(4), 400, 300, 0);
      expect(geom4.powerUps.some((p) => p.type === 'boost')).toBe(true);
      const geom5 = resolveLevelGeometry(getLevelConfig(5), 400, 300, 0);
      expect(geom5.powerUps.some((p) => p.type === 'magnet')).toBe(true);
    });
  });
  describe('3. Power-Up Collision Detection', () => {
    const powerUp = {
      id: 'test_pu_1',
      type: 'shield',
      x: 150,
      y: 200,
      collected: false,
    };
    it('detects collision when car touches power-up', () => {
      // Car center right on power-up
      expect(checkPowerUpCarCollision(powerUp, 150, 200, 0)).toBe(true);
      // Car front touching power-up
      expect(checkPowerUpCarCollision(powerUp, 125, 200, 0)).toBe(true);
      // Car rear touching power-up
      expect(checkPowerUpCarCollision(powerUp, 175, 200, 0)).toBe(true);
    });
    it('rejects collision when car is far from power-up', () => {
      expect(checkPowerUpCarCollision(powerUp, 50, 200, 0)).toBe(false);
      expect(checkPowerUpCarCollision(powerUp, 150, 100, 0)).toBe(false);
      expect(checkPowerUpCarCollision(powerUp, 300, 200, 0)).toBe(false);
    });
  });
  describe('4. Speed Boost Physics', () => {
    const initialState = {
      x: 50,
      y: 250,
      vx: 200,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    it('gives higher velocity and acceleration when speed boost is active', () => {
      // Run 10 ticks without boost
      let stateNormal = { ...initialState };
      for (let i = 0; i < 10; i++) {
        const res = stepCarPhysics({
          state: stateNormal,
          segments: [],
          obstacles: [],
          roadGaps: [],
          roadY: 270,
          finishX: 500,
          clearThresholdX: 450,
          dt: FIXED_DT,
          isSpeedBoostActive: false,
        });
        stateNormal = res.state;
      }
      // Run 10 ticks with boost
      let stateBoost = { ...initialState };
      for (let i = 0; i < 10; i++) {
        const res = stepCarPhysics({
          state: stateBoost,
          segments: [],
          obstacles: [],
          roadGaps: [],
          roadY: 270,
          finishX: 500,
          clearThresholdX: 450,
          dt: FIXED_DT,
          isSpeedBoostActive: true,
        });
        stateBoost = res.state;
      }
      // Boosted car must be significantly faster and further ahead
      expect(stateBoost.vx).toBeGreaterThan(stateNormal.vx);
      expect(stateBoost.x).toBeGreaterThan(stateNormal.x);
    });
    it('keeps boosted car stable and does not cause uncontrolled flips', () => {
      let stateBoost = { ...initialState };
      for (let i = 0; i < 60; i++) {
        const res = stepCarPhysics({
          state: stateBoost,
          segments: [],
          obstacles: [],
          roadGaps: [],
          roadY: 270,
          finishX: 500,
          clearThresholdX: 450,
          dt: FIXED_DT,
          isSpeedBoostActive: true,
        });
        stateBoost = res.state;
      }
      // Angle should remain stable on flat road (close to 0 deg)
      expect(Math.abs(stateBoost.angle)).toBeLessThan(5);
      expect(stateBoost.isGrounded).toBe(true);
    });
  });
  describe('5. Shield Collision Protection', () => {
    const obstacle = {
      id: 'obs_test',
      x: 100,
      y: 230,
      width: 30,
      height: 40,
    };
    it('absorbs obstacle collision and sets shieldAbsorbed flag without stopping dead', () => {
      const collidingState = {
        x: 95,
        y: 250,
        vx: 250,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const resWithShield = stepCarPhysics({
        state: collidingState,
        segments: [],
        obstacles: [obstacle],
        roadGaps: [],
        roadY: 270,
        finishX: 500,
        clearThresholdX: 450,
        dt: FIXED_DT,
        hasShield: true,
      });
      expect(resWithShield.shieldAbsorbed).toBe(true);
      expect(resWithShield.status).toBe('running');
      expect(resWithShield.state.vx).toBeGreaterThan(150); // Continues forward momentum
    });
    it('does not absorb collision if shield is not active', () => {
      const collidingState = {
        x: 95,
        y: 250,
        vx: 250,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const resWithoutShield = stepCarPhysics({
        state: collidingState,
        segments: [],
        obstacles: [obstacle],
        roadGaps: [],
        roadY: 270,
        finishX: 500,
        clearThresholdX: 450,
        dt: FIXED_DT,
        hasShield: false,
      });
      expect(resWithoutShield.shieldAbsorbed).toBeFalsy();
      expect(resWithoutShield.state.vx).toBe(0); // Blocked by obstacle
    });
  });
  describe('6. Magnet Coin Attraction Math', () => {
    it('pulls coins within attraction radius closer to the car', () => {
      const carPos = { x: 200, y: 240 };
      const coin = { id: 1, x: 280, y: 220, collected: false };
      const initialDist = Math.hypot(carPos.x - coin.x, carPos.y - coin.y);
      const MAGNET_RADIUS = 200;
      const MAGNET_SPEED = 340;
      const dt = FIXED_DT;
      const dx = carPos.x - coin.x;
      const dy = carPos.y - 10 - coin.y;
      const dist = Math.hypot(dx, dy);
      expect(dist).toBeLessThan(MAGNET_RADIUS);
      const stepDist = Math.min(dist, MAGNET_SPEED * dt);
      coin.x += (dx / dist) * stepDist;
      coin.y += (dy / dist) * stepDist;
      const newDist = Math.hypot(carPos.x - coin.x, carPos.y - coin.y);
      expect(newDist).toBeLessThan(initialDist);
    });
  });
  describe('7. Power-Up UI Components', () => {
    it('renders PowerUpItem capsule with symbol', () => {
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PowerUpItem type="magnet" x={100} y={150} collected={false} />
        );
      });
      const tree = renderer.toJSON();
      expect(tree).toBeDefined();
      const textNodes = renderer.root.findAllByType('Text');
      const hasSymbol = textNodes.some((n) => n.props.children === '🧲');
      expect(hasSymbol).toBe(true);
    });
    it('renders PowerUpIndicator when active and hides when null', () => {
      const activeState = {
        type: 'boost',
        remainingSeconds: 2.5,
        totalDuration: 3.5,
      };
      let rendererActive;
      act(() => {
        rendererActive = ReactTestRenderer.create(
          <PowerUpIndicator activePowerUp={activeState} />
        );
      });
      expect(rendererActive.toJSON()).not.toBeNull();
      let rendererNull;
      act(() => {
        rendererNull = ReactTestRenderer.create(
          <PowerUpIndicator activePowerUp={null} />
        );
      });
      expect(rendererNull.toJSON()).toBeNull();
    });
    it('renders Car with shield, magnet, and speed boost visual props', () => {
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <Car
            vehicleId="sports_car"
            wheelRotation={45}
            hasShield={true}
            hasMagnet={true}
            hasSpeedBoost={true}
          />
        );
      });
      expect(renderer.toJSON()).toBeDefined();
    });
  });
});
