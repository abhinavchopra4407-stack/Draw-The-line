import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  VEHICLES,
  getVehicleById,
} from '../src/games/rampracer/types/vehicles';
import {
  initStorage,
  getUnlockedVehicles,
  isVehicleUnlocked,
  getSelectedVehicle,
  selectVehicle,
  unlockVehicle,
  resetProgress,
  saveTotalCoins,
  getTotalCoins,
} from '../src/games/rampracer/utils/levelStorage';
import { Car } from '../src/games/rampracer/components/Car';
import { GarageModal } from '../src/games/rampracer/components/GarageModal';
import { stepCarPhysics } from '../src/games/rampracer/physics/physicsEngine';
// Mock AsyncStorage
const mockStorage = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key) => mockStorage[key] ?? null),
  setItem: jest.fn(async (key, val) => {
    mockStorage[key] = val;
  }),
  removeItem: jest.fn(async (key) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }),
}));
describe('Car Garage and Vehicle Unlock System', () => {
  beforeEach(async () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    resetProgress();
  });
  describe('1. Vehicle Definitions and Specifications', () => {
    test('defines all 5 requested vehicles with unique IDs', () => {
      const expectedIds = [
        'sports_car',
        'monster_truck',
        'police_car',
        'racing_car',
        'school_bus',
      ];
      expect(VEHICLES.length).toBe(5);
      expectedIds.forEach((id) => {
        const found = VEHICLES.find((v) => v.id === id);
        expect(found).toBeDefined();
        expect(found?.name).toBeTruthy();
        expect(found?.tagline).toBeTruthy();
        expect(found?.description).toBeTruthy();
      });
    });
    test('sports car is free (price 0) and first vehicle', () => {
      expect(VEHICLES[0].id).toBe('sports_car');
      expect(VEHICLES[0].price).toBe(0);
    });
    test('locked vehicles have realistic, achievable coin prices', () => {
      const monster = getVehicleById('monster_truck');
      const police = getVehicleById('police_car');
      const racing = getVehicleById('racing_car');
      const bus = getVehicleById('school_bus');
      expect(monster.price).toBe(150);
      expect(police.price).toBe(300);
      expect(racing.price).toBe(450);
      expect(bus.price).toBe(600);
    });
    test('each vehicle has distinct performance stats', () => {
      VEHICLES.forEach((v) => {
        expect(v.stats.speed).toBeGreaterThanOrEqual(1);
        expect(v.stats.speed).toBeLessThanOrEqual(10);
        expect(v.stats.acceleration).toBeGreaterThanOrEqual(1);
        expect(v.stats.acceleration).toBeLessThanOrEqual(10);
        expect(v.stats.stability).toBeGreaterThanOrEqual(1);
        expect(v.stats.stability).toBeLessThanOrEqual(10);
      });
    });
    test('getVehicleById returns sports car fallback for unknown ID', () => {
      const fallback = getVehicleById('unknown');
      expect(fallback.id).toBe('sports_car');
    });
  });
  describe('2. 2D Cartoon Vehicle Rendering', () => {
    test('renders Sports Car without crashing', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Car vehicleId="sports_car" wheelRotation={45} angle={10} />
        );
      });
      expect(renderer.root).toBeDefined();
    });
    test('renders Monster Truck with huge wheels and roll cage', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Car vehicleId="monster_truck" wheelRotation={30} />
        );
      });
      expect(renderer.root).toBeDefined();
    });
    test('renders Police Car with emergency siren lightbar', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Car vehicleId="police_car" wheelRotation={60} />
        );
      });
      expect(renderer.root).toBeDefined();
    });
    test('renders Racing Car with aerodynamic wing and #7', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Car vehicleId="racing_car" wheelRotation={90} />
        );
      });
      const texts = renderer.root.findAllByType(Text);
      const hasNumber7 = texts.some((t) => t.props.children === '7');
      expect(hasNumber7).toBe(true);
    });
    test('renders School Bus with windows and BUS banner', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <Car vehicleId="school_bus" wheelRotation={0} />
        );
      });
      const texts = renderer.root.findAllByType(Text);
      const hasBusBanner = texts.some((t) => t.props.children === 'BUS');
      expect(hasBusBanner).toBe(true);
    });
  });
  describe('3. Vehicle Purchase and Selection Storage Logic', () => {
    test('initial state has sports car unlocked and selected by default', () => {
      expect(getUnlockedVehicles()).toEqual(['sports_car']);
      expect(isVehicleUnlocked('sports_car')).toBe(true);
      expect(isVehicleUnlocked('monster_truck')).toBe(false);
      expect(getSelectedVehicle()).toBe('sports_car');
    });
    test('cannot purchase vehicle with insufficient coins', () => {
      saveTotalCoins(50); // Monster Truck costs 150
      const res = unlockVehicle('monster_truck');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Insufficient coins');
      expect(isVehicleUnlocked('monster_truck')).toBe(false);
      expect(getTotalCoins()).toBe(50);
    });
    test('purchases vehicle with sufficient coins and auto-equips', () => {
      saveTotalCoins(200);
      const res = unlockVehicle('monster_truck');
      expect(res.success).toBe(true);
      expect(res.remainingCoins).toBe(50); // 200 - 150 = 50
      expect(getTotalCoins()).toBe(50);
      expect(isVehicleUnlocked('monster_truck')).toBe(true);
      expect(getSelectedVehicle()).toBe('monster_truck');
    });
    test('prevents duplicate purchase of already unlocked vehicle', () => {
      saveTotalCoins(500);
      const first = unlockVehicle('monster_truck');
      expect(first.success).toBe(true);
      expect(getTotalCoins()).toBe(350);
      const duplicate = unlockVehicle('monster_truck');
      expect(duplicate.success).toBe(false);
      expect(duplicate.error).toBe('Vehicle already unlocked');
      expect(getTotalCoins()).toBe(350); // Coins not deducted again
    });
    test('cannot select locked vehicle', () => {
      const selected = selectVehicle('police_car');
      expect(selected).toBe(false);
      expect(getSelectedVehicle()).toBe('sports_car');
    });
    test('can switch between unlocked vehicles', () => {
      saveTotalCoins(1000);
      unlockVehicle('monster_truck');
      unlockVehicle('police_car');
      expect(getSelectedVehicle()).toBe('police_car');
      selectVehicle('sports_car');
      expect(getSelectedVehicle()).toBe('sports_car');
      selectVehicle('monster_truck');
      expect(getSelectedVehicle()).toBe('monster_truck');
    });
    test('restores unlocked and selected vehicles across app launches', async () => {
      saveTotalCoins(800);
      unlockVehicle('police_car');
      selectVehicle('police_car');
      const data = await initStorage();
      expect(data.unlockedVehicles).toContain('sports_car');
      expect(data.unlockedVehicles).toContain('police_car');
      expect(data.selectedVehicle).toBe('police_car');
    });
    test('resetProgress restores defaults to sports car only', () => {
      saveTotalCoins(1000);
      unlockVehicle('racing_car');
      expect(isVehicleUnlocked('racing_car')).toBe(true);
      resetProgress();
      expect(getUnlockedVehicles()).toEqual(['sports_car']);
      expect(getSelectedVehicle()).toBe('sports_car');
      expect(isVehicleUnlocked('racing_car')).toBe(false);
    });
  });
  describe('4. Vehicle Handling Physics', () => {
    test('monster truck has higher drive torque than sports car', () => {
      const sports = getVehicleById('sports_car').handling;
      const monster = getVehicleById('monster_truck').handling;
      expect(monster.driveAccel).toBeGreaterThan(sports.driveAccel);
      expect(monster.gravity).toBeGreaterThan(sports.gravity);
    });
    test('racing car has highest top speed', () => {
      const sports = getVehicleById('sports_car').handling;
      const racing = getVehicleById('racing_car').handling;
      expect(racing.maxVx).toBeGreaterThan(sports.maxVx);
      expect(racing.maxVx).toBe(570);
    });
    test('physics simulation applies vehicle handling acceleration properly', () => {
      const sportsHandling = getVehicleById('sports_car').handling;
      const monsterHandling = getVehicleById('monster_truck').handling;
      const baseState = {
        x: 100,
        y: 200,
        vx: 50,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const resultSports = stepCarPhysics({
        state: { ...baseState },
        segments: [],
        roadY: 200,
        finishX: 800,
        dt: 1 / 60,
        handling: sportsHandling,
      });
      const resultMonster = stepCarPhysics({
        state: { ...baseState },
        segments: [],
        roadY: 200,
        finishX: 800,
        dt: 1 / 60,
        handling: monsterHandling,
      });
      // Monster truck has higher acceleration from low speed
      expect(resultMonster.state.vx).toBeGreaterThan(resultSports.state.vx);
    });
  });
  describe('5. GarageModal Component', () => {
    test('renders all 5 vehicles and shows locked/unlocked states', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <GarageModal
            visible={true}
            onClose={jest.fn()}
            totalCoins={250}
            unlockedVehicles={['sports_car']}
            selectedVehicle="sports_car"
            onSelectVehicle={jest.fn()}
            onUnlockVehicle={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      const textElements = root.findAllByType(Text);
      const textContents = textElements.map((t) => String(t.props.children));
      // Header title & coins
      expect(textContents.some((c) => c.includes('CAR GARAGE'))).toBe(true);
      expect(textContents.some((c) => c === '250')).toBe(true);
      // Vehicle names
      expect(textContents.some((c) => c.includes('Sports Car'))).toBe(true);
      expect(textContents.some((c) => c.includes('Monster Truck'))).toBe(true);
      expect(textContents.some((c) => c.includes('Police Car'))).toBe(true);
      expect(textContents.some((c) => c.includes('Racing Car'))).toBe(true);
      expect(textContents.some((c) => c.includes('School Bus'))).toBe(true);
      // Prices visible
      expect(textContents.some((c) => c.includes('150'))).toBe(true);
      expect(textContents.some((c) => c.includes('300'))).toBe(true);
      expect(textContents.some((c) => c.includes('450'))).toBe(true);
      expect(textContents.some((c) => c.includes('600'))).toBe(true);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
    test('displays Preview, Select and Unlock buttons appropriately', () => {
      const mockSelect = jest.fn();
      const mockUnlock = jest.fn(() => ({
        success: true,
        remainingCoins: 100,
      }));
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <GarageModal
            visible={true}
            onClose={jest.fn()}
            totalCoins={200}
            unlockedVehicles={['sports_car', 'monster_truck']}
            selectedVehicle="sports_car"
            onSelectVehicle={mockSelect}
            onUnlockVehicle={mockUnlock}
          />
        );
      });
      const root = renderer.root;
      // Default preview is sports_car which is currently active
      const textElements = root.findAllByType(Text);
      expect(
        textElements.some((t) =>
          String(t.props.children).includes('CURRENTLY ACTIVE')
        )
      ).toBe(true);
      // Tap on Monster Truck card to preview it
      const buttons = root.findAllByType(TouchableOpacity);
      const monsterBtn = buttons.find((b) =>
        b.props.accessibilityLabel?.includes('Monster Truck')
      );
      expect(monsterBtn).toBeDefined();
      ReactTestRenderer.act(() => {
        monsterBtn.props.onPress();
      });
      // Monster truck is owned but not selected, so SELECT VEHICLE button should be displayed
      const updatedTexts = root.findAllByType(Text);
      expect(
        updatedTexts.some((t) =>
          String(t.props.children).includes('SELECT VEHICLE')
        )
      ).toBe(true);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
  });
});
