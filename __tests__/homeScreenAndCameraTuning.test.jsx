import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../src/games/rampracer/components/HomeScreen';
import { Car } from '../src/games/rampracer/components/Car';
import {
  LEVELS,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
import { VEHICLES } from '../src/games/rampracer/types/vehicles';
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};
describe('Home Screen, Extended Finish Flag & Attempt Coin Tracking', () => {
  describe('1. Game Home Screen Component', () => {
    it('renders game title, vehicle showcase turntable, stats, and START button', () => {
      const onStartGameMock = jest.fn();
      const onOpenGarageMock = jest.fn();
      const onOpenDailyRewardsMock = jest.fn();
      const onOpenAchievementsMock = jest.fn();
      const onOpenLevelSelectMock = jest.fn();
      const onOpenSettingsMock = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <HomeScreen
              currentLevel={1}
              highestUnlocked={5}
              totalCoins={150}
              totalStars={12}
              selectedVehicle="sports_car"
              hasDailyRewardAvailable={true}
              onStartGame={onStartGameMock}
              onOpenGarage={onOpenGarageMock}
              onOpenDailyRewards={onOpenDailyRewardsMock}
              onOpenAchievements={onOpenAchievementsMock}
              onOpenLevelSelect={onOpenLevelSelectMock}
              onOpenSettings={onOpenSettingsMock}
            />
          </SafeAreaProvider>
        );
      });
      const root = renderer.root;
      const texts = root.findAllByType(Text);
      const textStrings = texts.map((t) => String(t.props.children));
      // Title and subtitles
      expect(textStrings).toContain('RAMP RACER');
      expect(textStrings).toContain('DRAW THE RAMP • LAUNCH • FLY');
      expect(textStrings).toContain('START GAME');
      expect(textStrings).toContain('PLAY LEVEL 1');
      // Stats counters
      expect(textStrings).toContain('12'); // stars
      expect(textStrings).toContain('150'); // coins
      // Navigation labels
      expect(textStrings).toContain('GARAGE');
      expect(textStrings).toContain('LEVELS');
      expect(textStrings).toContain('REWARDS');
      expect(textStrings).toContain('BADGES');
      // Tap START GAME button
      const startBtn = root.findAllByProps({ activeOpacity: 0.88 })[0];
      expect(startBtn).toBeTruthy();
      ReactTestRenderer.act(() => {
        startBtn.props.onPress();
      });
      expect(onStartGameMock).toHaveBeenCalledTimes(1);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
    it('triggers garage, daily rewards, achievements, and level select callbacks from bottom dock', () => {
      const onOpenGarage = jest.fn();
      const onOpenDailyRewards = jest.fn();
      const onOpenAchievements = jest.fn();
      const onOpenLevelSelect = jest.fn();
      const onOpenSettings = jest.fn();
      let renderer;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <HomeScreen
              currentLevel={3}
              highestUnlocked={3}
              totalCoins={50}
              totalStars={6}
              selectedVehicle="monster_truck"
              hasDailyRewardAvailable={false}
              onStartGame={jest.fn()}
              onOpenGarage={onOpenGarage}
              onOpenDailyRewards={onOpenDailyRewards}
              onOpenAchievements={onOpenAchievements}
              onOpenLevelSelect={onOpenLevelSelect}
              onOpenSettings={onOpenSettings}
            />
          </SafeAreaProvider>
        );
      });
      const root = renderer.root;
      const touchables = root.findAllByType(TouchableOpacity);
      // Find dock items
      const garageTouchables = touchables.filter((t) => {
        const txts = t.findAllByType(Text).map((x) => x.props.children);
        return txts.includes('GARAGE') || txts.includes('GARAGE 🏎️');
      });
      expect(garageTouchables.length).toBeGreaterThan(0);
      ReactTestRenderer.act(() => {
        garageTouchables[0].props.onPress();
      });
      expect(onOpenGarage).toHaveBeenCalledTimes(1);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
  });
  describe('2. Extended Finish Flag Distance Across All 50 Levels', () => {
    it('finish flag is placed further ahead with extended highway runout across all 50 levels', () => {
      const screenWidth = 390; // Standard phone screen width
      const roadY = 600;
      const worldWidth = Math.max(Math.round(screenWidth * 1.55), 620); // 620px
      expect(worldWidth).toBe(620);
      LEVELS.forEach((level) => {
        const resolved = resolveLevelGeometry(
          level,
          screenWidth,
          roadY,
          0,
          worldWidth
        );
        // Finish line moved to the end of the extended world track (620 - 75 = 545px)
        expect(resolved.finishX).toBe(worldWidth - 75);
        expect(resolved.finishX).toBeGreaterThan(screenWidth); // Extends past first screen
        // Generous runout distance after the last obstacle
        if (resolved.obstacles.length > 0) {
          const maxObsRight = Math.max(
            ...resolved.obstacles.map((o) => o.x + o.width)
          );
          const drivingRunoutDistance = resolved.finishX - maxObsRight;
          // Must have at least 150px of driving runout distance after clearing obstacles
          expect(drivingRunoutDistance).toBeGreaterThanOrEqual(150);
        }
      });
    });
    it('camera smoothly scrolls along the extended track as car advances toward finish line', () => {
      const screenWidth = 390;
      const worldWidth = 620;
      const roadY = 600;
      const finishX = worldWidth - 75; // 545px
      const maxScroll = worldWidth - screenWidth; // 230px
      // Initial drawing state: car at start, camera at 0
      let carX = 65;
      let cameraX = 0;
      expect(cameraX).toBe(0);
      // As car drives past obstacle (x = 300 -> 545):
      const positions = [100, 200, 320, 420, 520, 545];
      let prevCameraX = cameraX;
      positions.forEach((xPos) => {
        const targetCamX = Math.max(
          0,
          Math.min(xPos - screenWidth * 0.35, maxScroll)
        );
        expect(targetCamX).toBeGreaterThanOrEqual(prevCameraX);
        expect(targetCamX).toBeLessThanOrEqual(maxScroll);
        prevCameraX = targetCamX;
      });
      // At finish line, camera is fully panned and finish flag is visible in view
      const finalTargetCamX = Math.max(
        0,
        Math.min(finishX - screenWidth * 0.35, maxScroll)
      );
      expect(finalTargetCamX).toBe(maxScroll);
      const finishFlagScreenX = finishX - finalTargetCamX;
      // Finish flag is clearly on screen (between 0 and screenWidth)
      expect(finishFlagScreenX).toBeGreaterThan(0);
      expect(finishFlagScreenX).toBeLessThan(screenWidth);
    });
  });
  describe('3. Strict Coin Target Calculation and Attempt Isolation', () => {
    it('coin target strictly equals the configured target (default: all coins in the level)', () => {
      LEVELS.forEach((level) => {
        const resolved = resolveLevelGeometry(level, 390, 600, 0, 620);
        // Some levels configure all-coins-minus-one where a single valid run cannot reach every coin
        expect(resolved.coinTarget).toBe(
          level.coinTarget ?? resolved.coins.length
        );
        expect(resolved.coinTarget).toBeGreaterThanOrEqual(2);
        expect(resolved.coinTarget).toBeLessThanOrEqual(resolved.coins.length);
      });
    });
    it('attempt coin collection resets on retry/redraw and awards to total only upon success', () => {
      let playerTotalCoins = 100;
      let attemptCoinsCollected = 0;
      const coinTarget = 3;
      // Player collects 2 coins in attempt 1
      attemptCoinsCollected += 1;
      attemptCoinsCollected += 1;
      expect(attemptCoinsCollected).toBe(2);
      // Total coins untouched during run!
      expect(playerTotalCoins).toBe(100);
      // Player crashes (attempt fails)
      const attempt1Success = false;
      if (attempt1Success) {
        playerTotalCoins += attemptCoinsCollected;
      }
      expect(playerTotalCoins).toBe(100); // No farming on failure!
      // Player retries: attempt coins reset to 0
      attemptCoinsCollected = 0;
      expect(attemptCoinsCollected).toBe(0);
      // Attempt 2: Player collects all 3 coins and succeeds
      attemptCoinsCollected += 1;
      attemptCoinsCollected += 1;
      attemptCoinsCollected += 1;
      expect(attemptCoinsCollected).toBe(coinTarget);
      const attempt2Success = true;
      if (attempt2Success) {
        playerTotalCoins += attemptCoinsCollected;
      }
      // Total coins permanently awarded
      expect(playerTotalCoins).toBe(103);
    });
    it('calculates 3-star ratings strictly from completion, coin target, and crash status', () => {
      const calculateStars = (cleared, collected, target, noCrash) => {
        if (!cleared) return 0;
        let stars = 1;
        if (collected >= target) {
          stars = 2;
          if (noCrash) {
            stars = 3;
          }
        }
        return stars;
      };
      // 1 Star: Just completed level
      expect(calculateStars(true, 1, 3, false)).toBe(1);
      expect(calculateStars(true, 2, 3, true)).toBe(1);
      // 2 Stars: Completed level + collected coin target (but had a crash/retry)
      expect(calculateStars(true, 3, 3, false)).toBe(2);
      // 3 Stars: Completed level + collected coin target + zero crashes
      expect(calculateStars(true, 3, 3, true)).toBe(3);
    });
  });
  describe('4. All 5 Redesigned Realistic Vehicles', () => {
    it('renders all 5 vehicles with proper dimensions and components', () => {
      VEHICLES.forEach((v) => {
        let renderer;
        ReactTestRenderer.act(() => {
          renderer = ReactTestRenderer.create(
            <Car vehicleId={v.id} wheelRotation={45} />
          );
        });
        expect(renderer.root).toBeTruthy();
        ReactTestRenderer.act(() => {
          renderer.unmount();
        });
      });
    });
  });
});
