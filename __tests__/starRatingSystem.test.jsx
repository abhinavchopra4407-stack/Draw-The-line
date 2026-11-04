import React from 'react';
import { View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  saveLevelStars,
  getLevelStars,
  getAllLevelStars,
  getTotalStars,
  resetProgress,
  initStorage,
  saveUnlockedLevel,
} from '../src/games/rampracer/utils/levelStorage';
import { RewardModal } from '../src/games/rampracer/components/RewardModal';
import { LevelSelectModal } from '../src/games/rampracer/components/LevelSelectModal';
import { LevelHeader } from '../src/games/rampracer/components/LevelHeader';
import { RampCanvas } from '../src/games/rampracer/components/RampCanvas';
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
// Mock soundManager
jest.mock('../src/games/rampracer/audio/soundManager', () => ({
  soundManager: {
    init: jest.fn(),
    playSfx: jest.fn(),
    startMusic: jest.fn(),
    stopMusic: jest.fn(),
    setSfxEnabled: jest.fn(),
    setMusicEnabled: jest.fn(),
    cleanup: jest.fn(),
  },
}));
describe('Three-Star Rating System & Persistence', () => {
  beforeEach(async () => {
    resetProgress();
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });
  describe('Star Calculation & Storage Logic', () => {
    test('starts with 0 stars for all levels', () => {
      expect(getLevelStars(1)).toBe(0);
      expect(getLevelStars(2)).toBe(0);
      expect(getTotalStars()).toBe(0);
      expect(getAllLevelStars()).toEqual({});
    });
    test('awards 1 star for basic level completion', () => {
      const res = saveLevelStars(1, 1);
      expect(res.isNewRecord).toBe(true);
      expect(res.newStars).toBe(1);
      expect(getLevelStars(1)).toBe(1);
      expect(getTotalStars()).toBe(1);
    });
    test('awards 2 stars when coin target is met', () => {
      const res = saveLevelStars(2, 2);
      expect(res.isNewRecord).toBe(true);
      expect(res.newStars).toBe(2);
      expect(getLevelStars(2)).toBe(2);
      expect(getTotalStars()).toBe(2);
    });
    test('awards 3 stars when coin target is met without crashing', () => {
      const res = saveLevelStars(3, 3);
      expect(res.isNewRecord).toBe(true);
      expect(res.newStars).toBe(3);
      expect(getLevelStars(3)).toBe(3);
      expect(getTotalStars()).toBe(3);
    });
    test('clamps stars between 0 and 3', () => {
      saveLevelStars(4, 5);
      expect(getLevelStars(4)).toBe(3);
      saveLevelStars(5, -2);
      expect(getLevelStars(5)).toBe(0);
    });
    test('NEVER reduces a previously earned star rating on replay', () => {
      // Player achieves 3 stars on Level 1
      saveLevelStars(1, 3);
      expect(getLevelStars(1)).toBe(3);
      expect(getTotalStars()).toBe(3);
      // Player replays Level 1 but only earns 1 star this time
      const retryRes = saveLevelStars(1, 1);
      expect(retryRes.isNewRecord).toBe(false);
      expect(retryRes.newStars).toBe(3); // Remains 3!
      expect(getLevelStars(1)).toBe(3); // Preserved!
      expect(getTotalStars()).toBe(3);
      // Player replays Level 1 and gets 2 stars
      const retryRes2 = saveLevelStars(1, 2);
      expect(retryRes2.isNewRecord).toBe(false);
      expect(retryRes2.newStars).toBe(3);
      expect(getLevelStars(1)).toBe(3);
    });
    test('upgrades star rating when a better score is achieved', () => {
      // Player first gets 1 star
      saveLevelStars(10, 1);
      expect(getLevelStars(10)).toBe(1);
      expect(getTotalStars()).toBe(1);
      // Player replays and earns 3 stars
      const upgradeRes = saveLevelStars(10, 3);
      expect(upgradeRes.isNewRecord).toBe(true);
      expect(upgradeRes.newStars).toBe(3);
      expect(getLevelStars(10)).toBe(3);
      expect(getTotalStars()).toBe(3);
    });
    test('correctly calculates total stars across multiple levels', () => {
      saveLevelStars(1, 3); // 3 stars
      saveLevelStars(2, 2); // 2 stars
      saveLevelStars(3, 1); // 1 star
      saveLevelStars(4, 3); // 3 stars
      expect(getTotalStars()).toBe(9);
      expect(getAllLevelStars()).toEqual({
        1: 3,
        2: 2,
        3: 1,
        4: 3,
      });
    });
    test('persists and restores star ratings from storage', async () => {
      saveLevelStars(1, 3);
      saveLevelStars(5, 2);
      saveLevelStars(10, 1);
      // Simulate app restart by re-initializing storage
      const data = await initStorage();
      expect(data.totalStars).toBe(6);
      expect(data.levelStars[1]).toBe(3);
      expect(data.levelStars[5]).toBe(2);
      expect(data.levelStars[10]).toBe(1);
      expect(getLevelStars(1)).toBe(3);
      expect(getLevelStars(5)).toBe(2);
      expect(getLevelStars(10)).toBe(1);
    });
  });
  describe('UI Components with Star Ratings', () => {
    test('renders RewardModal with 3-star rating, target coins, and crash status', () => {
      jest.useFakeTimers();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <RewardModal
            visible={true}
            level={1}
            earnedStars={3}
            bestStars={3}
            coinsCollected={3}
            coinTarget={3}
            noCrash={true}
            onNextLevel={() => {}}
            onReplay={() => {}}
            onClaim={() => {}}
            isAlreadyClaimed={false}
          />
        );
        jest.runAllTimers();
      });
      const root = renderer.root;
      expect(root.findByProps({ children: 'LEVEL COMPLETED!' })).toBeTruthy();
      expect(
        root.findByProps({ children: '🌟 PERFECT 3-STAR RUN! 🌟' })
      ).toBeTruthy();
      expect(root.findByProps({ children: 'Level Completed' })).toBeTruthy();
      expect(root.findByProps({ children: 'No Crashes' })).toBeTruthy();
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
      jest.useRealTimers();
    });
    test('renders RewardModal with 1-star rating when coins target not met and crashed', () => {
      jest.useFakeTimers();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <RewardModal
            visible={true}
            level={2}
            earnedStars={1}
            bestStars={1}
            coinsCollected={1}
            coinTarget={3}
            noCrash={false}
            onNextLevel={() => {}}
            onReplay={() => {}}
            onClaim={() => {}}
            isAlreadyClaimed={true}
          />
        );
        jest.runAllTimers();
      });
      const root = renderer.root;
      expect(root.findByProps({ children: 'LEVEL COMPLETED!' })).toBeTruthy();
      expect(
        root.findByProps({ children: '⭐ LEVEL CLEARED! ⭐' })
      ).toBeTruthy();
      expect(root.findByProps({ children: 'Level Completed' })).toBeTruthy();
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
      jest.useRealTimers();
    });
    test('renders LevelSelectModal with all 50 levels and earned stars', () => {
      saveUnlockedLevel(5);
      const testStars = {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
      };
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={3}
            highestUnlockedLevel={5}
            levelStars={testStars}
            totalStars={6}
            totalCoins={150}
            onSelectLevel={() => {}}
            onClose={() => {}}
          />
        );
      });
      const root = renderer.root;
      expect(root.findByProps({ children: '🗺️ SELECT LEVEL' })).toBeTruthy();
      expect(root.findByProps({ children: '6 / 150' })).toBeTruthy();
      expect(root.findByProps({ children: 150 })).toBeTruthy();
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
    test('renders LevelHeader with earned stars', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelHeader level={4} stars={3} onPress={() => {}} />
        );
      });
      const root = renderer.root;
      expect(root.findByProps({ children: 'LEVEL 4' })).toBeTruthy();
      expect(root.findByProps({ children: '▾' })).toBeTruthy();
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
    test('renders RampCanvas as a clean, solid black line without orange chain beads', () => {
      const points = [
        { x: 50, y: 300 },
        { x: 100, y: 250 },
        { x: 150, y: 200 },
      ];
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <RampCanvas points={points} roadY={400} />
        );
      });
      const root = renderer.root;
      // Joint caps and segments must have solid black color #181818, no orange (#F59E0B)
      const allViews = root.findAllByType(View);
      const hasOrangeColor = allViews.some((v) => {
        const style = Array.isArray(v.props.style)
          ? Object.assign({}, ...v.props.style)
          : v.props.style;
        return (
          style?.backgroundColor === '#F59E0B' ||
          style?.borderColor === '#D97706' ||
          style?.borderColor === '#B45309'
        );
      });
      expect(hasOrangeColor).toBe(false);
      const hasBlackSegments = allViews.some((v) => {
        const style = Array.isArray(v.props.style)
          ? Object.assign({}, ...v.props.style)
          : v.props.style;
        return style?.backgroundColor === '#181818';
      });
      expect(hasBlackSegments).toBe(true);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
  });
});
