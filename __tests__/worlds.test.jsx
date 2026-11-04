import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  WORLDS,
  getWorldForLevel,
  getWorldById,
} from '../src/games/rampracer/types/worlds';
import {
  getUnlockedWorlds,
  isWorldUnlockedById,
  hasSeenWorldUnlock,
  markWorldUnlockSeen,
  checkNewWorldUnlock,
  resetProgress,
  saveUnlockedLevel,
  initStorage,
} from '../src/games/rampracer/utils/levelStorage';
import { WorldBackground } from '../src/games/rampracer/components/WorldBackground';
import { WorldUnlockModal } from '../src/games/rampracer/components/WorldUnlockModal';
import { LevelSelectModal } from '../src/games/rampracer/components/LevelSelectModal';
import { Road } from '../src/games/rampracer/components/Road';
import { Obstacle } from '../src/games/rampracer/components/Obstacle';
describe('Five Worlds System', () => {
  beforeEach(() => {
    resetProgress();
  });
  describe('World Distribution & Configuration', () => {
    it('has exactly 5 unique worlds across 50 levels', () => {
      expect(WORLDS).toHaveLength(5);
      const worldIds = WORLDS.map((w) => w.id);
      expect(new Set(worldIds).size).toBe(5);
    });
    it('maps levels 1-10 to Green Valley', () => {
      for (let lvl = 1; lvl <= 10; lvl++) {
        const world = getWorldForLevel(lvl);
        expect(world.id).toBe('green_valley');
        expect(world.name).toBe('Green Valley');
        expect(world.icon).toBe('🌿');
      }
    });
    it('maps levels 11-20 to Desert World', () => {
      for (let lvl = 11; lvl <= 20; lvl++) {
        const world = getWorldForLevel(lvl);
        expect(world.id).toBe('desert_world');
        expect(world.name).toBe('Desert World');
        expect(world.icon).toBe('🏜️');
      }
    });
    it('maps levels 21-30 to Snow World', () => {
      for (let lvl = 21; lvl <= 30; lvl++) {
        const world = getWorldForLevel(lvl);
        expect(world.id).toBe('snow_world');
        expect(world.name).toBe('Snow World');
        expect(world.icon).toBe('❄️');
      }
    });
    it('maps levels 31-40 to Candy World', () => {
      for (let lvl = 31; lvl <= 40; lvl++) {
        const world = getWorldForLevel(lvl);
        expect(world.id).toBe('candy_world');
        expect(world.name).toBe('Candy World');
        expect(world.icon).toBe('🍭');
      }
    });
    it('maps levels 41-50 to Space World', () => {
      for (let lvl = 41; lvl <= 50; lvl++) {
        const world = getWorldForLevel(lvl);
        expect(world.id).toBe('space_world');
        expect(world.name).toBe('Space World');
        expect(world.icon).toBe('🚀');
      }
    });
    it('clamps levels safely below 1 and above 50', () => {
      expect(getWorldForLevel(0).id).toBe('green_valley');
      expect(getWorldForLevel(-5).id).toBe('green_valley');
      expect(getWorldForLevel(55).id).toBe('space_world');
    });
    it('finds world by ID correctly', () => {
      expect(getWorldById('snow_world').name).toBe('Snow World');
      expect(getWorldById('desert_world').name).toBe('Desert World');
      expect(getWorldById('space_world').name).toBe('Space World');
    });
  });
  describe('World Unlock Progression & Storage Persistence', () => {
    it('unlocks Green Valley by default while other worlds remain locked', () => {
      expect(isWorldUnlockedById('green_valley')).toBe(true);
      expect(isWorldUnlockedById('desert_world')).toBe(false);
      expect(isWorldUnlockedById('snow_world')).toBe(false);
      expect(isWorldUnlockedById('candy_world')).toBe(false);
      expect(isWorldUnlockedById('space_world')).toBe(false);
      expect(getUnlockedWorlds()).toEqual(['green_valley']);
    });
    it('unlocks Desert World upon reaching level 11', () => {
      saveUnlockedLevel(11);
      expect(isWorldUnlockedById('desert_world')).toBe(true);
      expect(getUnlockedWorlds()).toEqual(['green_valley', 'desert_world']);
    });
    it('unlocks Snow World upon reaching level 21', () => {
      saveUnlockedLevel(21);
      expect(isWorldUnlockedById('snow_world')).toBe(true);
      expect(getUnlockedWorlds()).toContain('snow_world');
    });
    it('unlocks Candy World upon reaching level 31', () => {
      saveUnlockedLevel(31);
      expect(isWorldUnlockedById('candy_world')).toBe(true);
      expect(getUnlockedWorlds()).toContain('candy_world');
    });
    it('unlocks Space World upon reaching level 41', () => {
      saveUnlockedLevel(41);
      expect(isWorldUnlockedById('space_world')).toBe(true);
      expect(getUnlockedWorlds()).toHaveLength(5);
    });
    it('detects newly unlocked world only once', () => {
      // Advance to level 11 (unlocks Desert World)
      const newWorld = checkNewWorldUnlock(11);
      expect(newWorld).not.toBeNull();
      expect(newWorld?.id).toBe('desert_world');
      // Once marked seen, it will not trigger again
      markWorldUnlockSeen('desert_world');
      expect(hasSeenWorldUnlock('desert_world')).toBe(true);
      expect(checkNewWorldUnlock(11)).toBeNull();
    });
    it('restores unlocked worlds correctly on initStorage', async () => {
      saveUnlockedLevel(25);
      const data = await initStorage();
      expect(data.unlockedWorlds).toContain('green_valley');
      expect(data.unlockedWorlds).toContain('desert_world');
      expect(data.unlockedWorlds).toContain('snow_world');
      expect(data.unlockedWorlds).not.toContain('candy_world');
    });
  });
  describe('World Theming & Components', () => {
    it('renders WorldBackground for all five worlds without errors', () => {
      WORLDS.forEach((world) => {
        let renderer;
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(
            <WorldBackground world={world} />
          );
        });
        expect(renderer.toJSON()).not.toBeNull();
      });
    });
    it('renders Road with world-specific themes', () => {
      WORLDS.forEach((world) => {
        let renderer;
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(
            <Road height={80} theme={world.roadTheme} />
          );
        });
        expect(renderer.toJSON()).not.toBeNull();
      });
    });
    it('renders Obstacle with world-specific themes', () => {
      WORLDS.forEach((world) => {
        let renderer;
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(
            <Obstacle width={80} height={100} theme={world.obstacleTheme} />
          );
        });
        expect(renderer.toJSON()).not.toBeNull();
      });
    });
    it('renders LevelSelectModal displaying all five world names', () => {
      const handleSelect = jest.fn();
      const handleClose = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={15}
            onSelectLevel={handleSelect}
            onClose={handleClose}
          />
        );
      });
      const root = renderer.root;
      const textNodes = root.findAllByType('Text');
      const textContents = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContents).toContain('GREEN VALLEY');
      expect(textContents).toContain('DESERT WORLD');
      expect(textContents).toContain('SNOW WORLD');
      expect(textContents).toContain('CANDY WORLD');
      expect(textContents).toContain('SPACE WORLD');
    });
    it('renders WorldUnlockModal and responds to continue button', () => {
      const desertWorld = getWorldById('desert_world');
      const handleContinue = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <WorldUnlockModal
            visible={true}
            world={desertWorld}
            onContinue={handleContinue}
          />
        );
      });
      const root = renderer.root;
      const button = root.findByProps({
        accessibilityLabel: 'Enter Desert World',
      });
      expect(button).toBeDefined();
      ReactTestRenderer.act(() => {
        button.props.onPress();
      });
      expect(handleContinue).toHaveBeenCalledTimes(1);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
  });
});
