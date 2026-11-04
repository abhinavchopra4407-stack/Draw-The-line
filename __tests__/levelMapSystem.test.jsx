import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { LevelSelectModal } from '../src/games/rampracer/components/LevelSelectModal';
import { soundManager } from '../src/games/rampracer/audio/soundManager';
describe('Level Map & Progression System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(soundManager, 'playSfx').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('1. Level Map Layout & All 50 Levels', () => {
    it('renders all 50 levels in a connected winding path', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={10}
            levelStars={{ 1: 3, 2: 2, 3: 1 }}
            totalStars={6}
            totalCoins={250}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      const allTexts = root
        .findAllByType(Text)
        .map((t) => String(t.props.children));
      // Header and progress dashboard
      expect(allTexts).toContain('🗺️ SELECT LEVEL');
      expect(allTexts).toContain('ADVENTURE MAP');
      expect(allTexts).toContain('6 / 150');
      expect(allTexts).toContain('250');
      // Verify all 50 levels exist on the map
      for (let level = 1; level <= 50; level++) {
        const found = allTexts.some(
          (txt) => txt === String(level) || txt.includes(String(level))
        );
        expect(found).toBe(true);
      }
      // Grand Champion Finish Podium
      expect(allTexts).toContain('RAMP RACER CHAMPION!');
    });
    it('displays decorative elements for different worlds', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={50}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      const allTexts = root
        .findAllByType(Text)
        .map((t) => String(t.props.children));
      // World 1 Green Valley decorations
      expect(allTexts).toContain('🏁');
      expect(allTexts).toContain('START LINE');
      expect(allTexts).toContain('Meadow');
      // World 2 Desert decorations
      expect(allTexts).toContain('Canyon Gate');
      expect(allTexts).toContain('Pyramids');
      // World 3 Snow decorations
      expect(allTexts).toContain('Frost Peak');
      expect(allTexts).toContain('Polar Igloo');
      // World 4 Candy decorations
      expect(allTexts).toContain('Sugar Land');
      expect(allTexts).toContain('Donut Peak');
      // World 5 Space decorations
      expect(allTexts).toContain('Launch Pad');
      expect(allTexts).toContain('CHAMPION PODIUM');
    });
  });
  describe('2. Level States (Completed, Unlocked, Locked)', () => {
    it('shows completed appearance with checkmark and earned stars', () => {
      const mockStars = { 1: 3, 2: 2, 3: 1 };
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={3}
            highestUnlockedLevel={5}
            levelStars={mockStars}
            completedLevels={[1, 2]}
            totalStars={6}
            totalCoins={100}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      // Find node buttons
      const buttons = root.findAllByType(TouchableOpacity);
      // Level 1: completed, checkmark badge (✓) is rendered
      const checkmarks = root.findAllByProps({ children: '✓' });
      expect(checkmarks.length).toBeGreaterThanOrEqual(1);
      // Earned stars
      const earnedStars = root.findAllByProps({ children: '★' });
      expect(earnedStars.length).toBeGreaterThanOrEqual(3);
    });
    it('allows player to tap and play unlocked levels', () => {
      const onSelectMock = jest.fn();
      const onCloseMock = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={5}
            levelStars={{ 1: 3 }}
            onSelectLevel={onSelectMock}
            onClose={onCloseMock}
          />
        );
      });
      const root = renderer.root;
      // Tap Level 2 (which is unlocked)
      const level2Btn = root.findByProps({
        accessibilityLabel: 'Level 2, unlocked',
      });
      expect(level2Btn).toBeTruthy();
      ReactTestRenderer.act(() => {
        level2Btn.props.onPress();
      });
      expect(soundManager.playSfx).toHaveBeenCalledWith('btn_click');
      expect(onSelectMock).toHaveBeenCalledWith(2);
      expect(onCloseMock).toHaveBeenCalled();
    });
    it('prevents playing locked levels and plays warning feedback', () => {
      const onSelectMock = jest.fn();
      const onCloseMock = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={3}
            levelStars={{ 1: 3 }}
            onSelectLevel={onSelectMock}
            onClose={onCloseMock}
          />
        );
      });
      const root = renderer.root;
      // Level 15 is locked (highest unlocked is 3)
      const level15Btn = root.findByProps({
        accessibilityLabel: 'Level 15, locked',
      });
      expect(level15Btn).toBeTruthy();
      // Ensure DEV bypass is not active in standard test mode
      const originalDev = globalThis.__DEV__;
      globalThis.__DEV__ = false;
      ReactTestRenderer.act(() => {
        level15Btn.props.onPress();
      });
      expect(soundManager.playSfx).toHaveBeenCalledWith('obstacle_hit');
      expect(onSelectMock).not.toHaveBeenCalled();
      expect(onCloseMock).not.toHaveBeenCalled();
      // Check child-friendly toast message
      const toastText = root.findAllByProps({
        children: '🔒 Complete Level 14 to unlock Level 15!',
      });
      expect(toastText.length).toBeGreaterThanOrEqual(1);
      globalThis.__DEV__ = originalDev;
    });
    it('shows current playable indicator tag on active level', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={4}
            highestUnlockedLevel={4}
            levelStars={{ 1: 3, 2: 3, 3: 3 }}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      // "PLAY" tag indicator
      const playBadge = root.findAllByProps({ children: 'PLAY' });
      expect(playBadge.length).toBeGreaterThanOrEqual(1);
      const carIcons = root.findAllByProps({ children: '🏎️' });
      expect(carIcons.length).toBeGreaterThanOrEqual(1);
    });
  });
  describe('3. World Progression (5 Distinct Worlds)', () => {
    it('organizes 50 levels into 5 worlds with correct ranges', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={25}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      const allTexts = root
        .findAllByType(Text)
        .map((t) => String(t.props.children));
      // 5 World Names in uppercase
      expect(allTexts).toContain('GREEN VALLEY');
      expect(allTexts).toContain('DESERT WORLD');
      expect(allTexts).toContain('SNOW WORLD');
      expect(allTexts).toContain('CANDY WORLD');
      expect(allTexts).toContain('SPACE WORLD');
      // World range subtitles
      expect(allTexts.some((txt) => txt.includes('Levels 1–10'))).toBe(true);
      expect(allTexts.some((txt) => txt.includes('Levels 11–20'))).toBe(true);
      expect(allTexts.some((txt) => txt.includes('Levels 21–30'))).toBe(true);
      expect(allTexts.some((txt) => txt.includes('Levels 31–40'))).toBe(true);
      expect(allTexts.some((txt) => txt.includes('Levels 41–50'))).toBe(true);
    });
    it('renders quick world jump tabs that trigger smooth scroll', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={10}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      // Find world tab buttons in worldTabBar
      const buttons = root.findAllByType(TouchableOpacity);
      const snowTab = buttons.find((btn) => {
        const texts = btn
          .findAllByType(Text)
          .map((t) => String(t.props.children));
        return texts.includes('SNOW WORLD');
      });
      expect(snowTab).toBeTruthy();
      ReactTestRenderer.act(() => {
        snowTab.props.onPress();
      });
      expect(soundManager.playSfx).toHaveBeenCalledWith('btn_click');
    });
  });
  describe('4. Player Progress Dashboard', () => {
    it('displays total completed levels, total stars, coins, and current level', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={7}
            highestUnlockedLevel={7}
            completedLevels={[1, 2, 3, 4, 5, 6]}
            levelStars={{ 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 1 }}
            totalStars={14}
            totalCoins={420}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      const allTexts = root
        .findAllByType(Text)
        .map((t) => String(t.props.children));
      // Stars
      expect(allTexts).toContain('14 / 150');
      // Coins
      expect(allTexts).toContain('420');
      // Completed levels: 6/50
      expect(allTexts).toContain('6/50');
      // Current unlocked level
      expect(allTexts).toContain('Lvl 7');
    });
    it('renders floating "CURRENT" button to quickly center the active level', () => {
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={12}
            highestUnlockedLevel={12}
            onSelectLevel={jest.fn()}
            onClose={jest.fn()}
          />
        );
      });
      const root = renderer.root;
      const currentBtn = root.findByProps({
        accessibilityLabel: 'Jump to current level',
      });
      expect(currentBtn).toBeTruthy();
      ReactTestRenderer.act(() => {
        currentBtn.props.onPress();
      });
      expect(soundManager.playSfx).toHaveBeenCalledWith('btn_click');
    });
  });
  describe('5. Close Button & Dismissal', () => {
    it('calls onClose when close button ✕ is tapped', () => {
      const onCloseMock = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <LevelSelectModal
            visible={true}
            currentLevel={1}
            highestUnlockedLevel={1}
            onSelectLevel={jest.fn()}
            onClose={onCloseMock}
          />
        );
      });
      const root = renderer.root;
      const closeBtn = root.findByProps({
        accessibilityLabel: 'Close Level Select',
      });
      expect(closeBtn).toBeTruthy();
      ReactTestRenderer.act(() => {
        closeBtn.props.onPress();
      });
      expect(soundManager.playSfx).toHaveBeenCalledWith('btn_click');
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});
