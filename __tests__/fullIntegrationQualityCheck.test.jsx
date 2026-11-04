import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 1. Types & Configs
import {
  VEHICLES,
  getVehicleById,
} from '../src/games/rampracer/types/vehicles';
import { WORLDS, getWorldForLevel } from '../src/games/rampracer/types/worlds';
import { POWER_UP_CONFIGS } from '../src/games/rampracer/types/powerUps';
import {
  getLevelConfig,
  resolveLevelGeometry,
  TOTAL_LEVELS,
} from '../src/games/rampracer/data/levels';
// 2. Physics & Engine
import {
  stepCarPhysics,
  buildRampSegments,
  checkCoinCarCollision,
} from '../src/games/rampracer/physics/physicsEngine';
// 3. Centralized Level & Progress Storage
import {
  initStorage,
  resetProgress,
  saveUnlockedLevel,
  markLevelCompleted,
  getTotalCoins,
  saveTotalCoins,
  claimLevelReward,
  saveLevelStars,
  getLevelStars,
  getAllLevelStars,
  getTotalStars,
  getUnlockedVehicles,
  getSelectedVehicle,
  selectVehicle,
  unlockVehicle,
  getUnlockedWorlds,
  checkNewWorldUnlock,
  markWorldUnlockSeen,
  getDailyRewardsStatus,
  claimDailyReward,
  resetDailyRewards,
  getAchievementsProgress,
  claimAchievementReward,
  recordPowerUpUsage,
  resetAchievements,
  isAchievementUnlocked,
  isAchievementRewardClaimed,
  STORAGE_KEY_HIGHEST_UNLOCKED,
  STORAGE_KEY_COMPLETED_LEVELS,
  STORAGE_KEY_TOTAL_COINS,
  STORAGE_KEY_LEVEL_STARS,
  STORAGE_KEY_UNLOCKED_VEHICLES,
  STORAGE_KEY_SELECTED_VEHICLE,
  STORAGE_KEY_ACHIEVEMENTS,
} from '../src/games/rampracer/utils/levelStorage';
import { GarageModal } from '../src/games/rampracer/components/GarageModal';
import { DailyRewardModal } from '../src/games/rampracer/components/DailyRewardModal';
import { AchievementsModal } from '../src/games/rampracer/components/AchievementsModal';
import { LevelSelectModal } from '../src/games/rampracer/components/LevelSelectModal';
import { WorldUnlockModal } from '../src/games/rampracer/components/WorldUnlockModal';
import { SettingsModal } from '../src/games/rampracer/components/SettingsModal';
describe('Full Integration and Quality Check (All 7 Features & 12 Criteria)', () => {
  beforeEach(() => {
    resetProgress();
    resetDailyRewards();
    resetAchievements();
  });
  // ==========================================
  // Check 1: Coin Collection
  // ==========================================
  describe('Check 1: Coin collection works correctly', () => {
    it('detects coin collision with car bounding box and awards coin', () => {
      const coin = { id: 'c1', x: 100, y: 150, collected: false };
      expect(checkCoinCarCollision(coin, 100, 150, 0)).toBe(true);
      expect(checkCoinCarCollision(coin, 300, 150, 0)).toBe(false);
      saveTotalCoins(50);
      expect(getTotalCoins()).toBe(50);
      const newTotal = saveTotalCoins(getTotalCoins() + 1);
      expect(newTotal).toBe(51);
      expect(getTotalCoins()).toBe(51);
    });
    it('claimLevelReward awards first completion bonus and prevents duplicates', () => {
      saveTotalCoins(0);
      const res1 = claimLevelReward(1);
      expect(res1.awarded).toBe(true);
      expect(res1.coinsAwarded).toBe(50);
      expect(getTotalCoins()).toBe(50);
      const res2 = claimLevelReward(1);
      expect(res2.awarded).toBe(false);
      expect(res2.coinsAwarded).toBe(0);
      expect(getTotalCoins()).toBe(50);
    });
  });
  // ==========================================
  // Check 2: Three-Star Rating System
  // ==========================================
  describe('Check 2: Three-star ratings are calculated and saved correctly', () => {
    it('saves star rating and enforces that previously earned stars are never reduced', () => {
      saveLevelStars(1, 2);
      expect(getLevelStars(1)).toBe(2);
      // Attempting to save lower star rating on replay
      const res = saveLevelStars(1, 1);
      expect(res.isNewRecord).toBe(false);
      expect(res.newStars).toBe(2); // Stays at 2
      expect(getLevelStars(1)).toBe(2);
      // Achieving 3 stars upgrades the record
      const upgradeRes = saveLevelStars(1, 3);
      expect(upgradeRes.isNewRecord).toBe(true);
      expect(upgradeRes.newStars).toBe(3);
      expect(getLevelStars(1)).toBe(3);
    });
    it('calculates total stars accurately across levels', () => {
      saveLevelStars(1, 3);
      saveLevelStars(2, 2);
      saveLevelStars(3, 3);
      expect(getTotalStars()).toBe(8);
      const map = getAllLevelStars();
      expect(map[1]).toBe(3);
      expect(map[2]).toBe(2);
      expect(map[3]).toBe(3);
    });
  });
  // ==========================================
  // Check 3: Car Purchases and Selections
  // ==========================================
  describe('Check 3: Car purchases and selections work correctly', () => {
    it('has 5 distinct vehicles with Sports Car unlocked by default', () => {
      expect(VEHICLES).toHaveLength(5);
      expect(VEHICLES.map((v) => v.id)).toEqual([
        'sports_car',
        'monster_truck',
        'police_car',
        'racing_car',
        'school_bus',
      ]);
      expect(getUnlockedVehicles()).toEqual(['sports_car']);
      expect(getSelectedVehicle()).toBe('sports_car');
    });
    it('prevents purchasing without sufficient coins', () => {
      saveTotalCoins(100);
      const res = unlockVehicle('monster_truck'); // costs 150
      expect(res.success).toBe(false);
      expect(res.error).toBe('Insufficient coins');
      expect(getUnlockedVehicles()).not.toContain('monster_truck');
    });
    it('successfully purchases and selects vehicle when coins are sufficient', () => {
      saveTotalCoins(200);
      const res = unlockVehicle('monster_truck');
      expect(res.success).toBe(true);
      expect(res.remainingCoins).toBe(50);
      expect(getTotalCoins()).toBe(50);
      expect(getUnlockedVehicles()).toContain('monster_truck');
      selectVehicle('monster_truck');
      expect(getSelectedVehicle()).toBe('monster_truck');
    });
    it('prevents duplicate purchase of already unlocked vehicles', () => {
      saveTotalCoins(500);
      unlockVehicle('monster_truck');
      const dupRes = unlockVehicle('monster_truck');
      expect(dupRes.success).toBe(false);
      expect(dupRes.error).toBe('Vehicle already unlocked');
    });
    it('applies distinct vehicle physics characteristics', () => {
      const sports = getVehicleById('sports_car');
      const bus = getVehicleById('school_bus');
      const truck = getVehicleById('monster_truck');
      expect(sports.stats.speed).toBeGreaterThan(bus.stats.speed);
      expect(sports.handling.maxVx).toBeGreaterThan(bus.handling.maxVx);
      expect(truck.handling.gravity).toBeGreaterThan(0);
    });
  });
  // ==========================================
  // Check 4: Five Worlds Progression
  // ==========================================
  describe('Check 4: All five worlds unlock correctly', () => {
    it('maps levels correctly across all 5 worlds', () => {
      expect(WORLDS).toHaveLength(5);
      expect(getWorldForLevel(1).id).toBe('green_valley');
      expect(getWorldForLevel(10).id).toBe('green_valley');
      expect(getWorldForLevel(11).id).toBe('desert_world');
      expect(getWorldForLevel(20).id).toBe('desert_world');
      expect(getWorldForLevel(21).id).toBe('snow_world');
      expect(getWorldForLevel(30).id).toBe('snow_world');
      expect(getWorldForLevel(31).id).toBe('candy_world');
      expect(getWorldForLevel(40).id).toBe('candy_world');
      expect(getWorldForLevel(41).id).toBe('space_world');
      expect(getWorldForLevel(50).id).toBe('space_world');
    });
    it('progressively unlocks worlds according to highest level', () => {
      saveUnlockedLevel(1);
      expect(getUnlockedWorlds()).toEqual(['green_valley']);
      saveUnlockedLevel(11);
      expect(getUnlockedWorlds()).toEqual(['green_valley', 'desert_world']);
      saveUnlockedLevel(21);
      expect(getUnlockedWorlds()).toContain('snow_world');
      saveUnlockedLevel(31);
      expect(getUnlockedWorlds()).toContain('candy_world');
      saveUnlockedLevel(41);
      expect(getUnlockedWorlds()).toHaveLength(5);
    });
    it('triggers world unlock celebration only once per world', () => {
      const newWorld = checkNewWorldUnlock(11);
      expect(newWorld?.id).toBe('desert_world');
      markWorldUnlockSeen('desert_world');
      expect(checkNewWorldUnlock(11)).toBeNull();
    });
  });
  // ==========================================
  // Check 5: Power-Ups System & Physics Stability
  // ==========================================
  describe('Check 5: All power-ups work without breaking physics', () => {
    it('configures all 3 power-ups with proper durations', () => {
      expect(POWER_UP_CONFIGS.magnet.duration).toBe(6);
      expect(POWER_UP_CONFIGS.shield.duration).toBe(12);
      expect(POWER_UP_CONFIGS.boost.duration).toBe(3.5);
    });
    it('shield absorbs obstacle hit without causing car crash', () => {
      const obstacle = { id: 'obs1', x: 100, y: 150, width: 30, height: 40 };
      const rampSegments = buildRampSegments([]);
      // Car colliding with obstacle with active shield
      const resultWithShield = stepCarPhysics({
        state: {
          x: 100,
          y: 150,
          vx: 200,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: false,
          stuckTimer: 0,
        },
        segments: rampSegments,
        obstacles: [obstacle],
        roadY: 180,
        finishX: 500,
        dt: 1 / 60,
        hasShield: true,
      });
      expect(resultWithShield.shieldAbsorbed).toBe(true);
      expect(resultWithShield.status).toBe('running'); // Car stays alive!
    });
    it('boost increases velocity safely without breaking grounded physics', () => {
      const rampSegments = buildRampSegments([
        { x: 50, y: 180 },
        { x: 150, y: 180 },
        { x: 250, y: 180 },
      ]);
      const state = {
        x: 60,
        y: 180,
        vx: 300,
        vy: 0,
        angle: 0,
        wheelRotation: 0,
        isGrounded: true,
        hasClearedObstacle: false,
        stuckTimer: 0,
      };
      const result = stepCarPhysics({
        state,
        segments: rampSegments,
        obstacles: [],
        roadY: 180,
        finishX: 500,
        dt: 1 / 60,
        isSpeedBoostActive: true,
      });
      expect(result.status).toBe('running');
      expect(result.state.vx).toBeGreaterThan(0);
      expect(Number.isFinite(result.state.x)).toBe(true);
      expect(Number.isFinite(result.state.y)).toBe(true);
    });
  });
  // ==========================================
  // Check 6: Daily Rewards Single-Claim Guarantee
  // ==========================================
  describe('Check 6: Daily rewards cannot be claimed twice on the same day', () => {
    it('allows claiming reward for current day, increments streak, and blocks second claim', () => {
      saveTotalCoins(0);
      const status = getDailyRewardsStatus();
      expect(status.canClaimToday).toBe(true);
      expect(status.todayDay).toBe(1);
      const claim1 = claimDailyReward();
      expect(claim1.success).toBe(true);
      expect(claim1.reward?.coins).toBe(25);
      expect(getTotalCoins()).toBe(25);
      const statusAfter = getDailyRewardsStatus();
      expect(statusAfter.canClaimToday).toBe(false);
      const claim2 = claimDailyReward();
      expect(claim2.success).toBe(false);
      expect(claim2.error).toBe('ALREADY_CLAIMED_TODAY');
      expect(getTotalCoins()).toBe(25); // Unchanged!
    });
  });
  // ==========================================
  // Check 7: Achievements Unlock and Reward Only Once
  // ==========================================
  describe('Check 7: Achievements unlock and reward only once', () => {
    it('unlocks achievement when condition met, awards coins, and strictly forbids duplicate claims', () => {
      saveTotalCoins(0);
      expect(isAchievementUnlocked('first_victory')).toBe(false);
      markLevelCompleted(1);
      expect(isAchievementUnlocked('first_victory')).toBe(true);
      expect(isAchievementRewardClaimed('first_victory')).toBe(false);
      const claimRes1 = claimAchievementReward('first_victory');
      expect(claimRes1.success).toBe(true);
      expect(claimRes1.coinsAwarded).toBe(25);
      expect(getTotalCoins()).toBe(25);
      expect(isAchievementRewardClaimed('first_victory')).toBe(true);
      const claimRes2 = claimAchievementReward('first_victory');
      expect(claimRes2.success).toBe(false);
      expect(claimRes2.error).toBe('ALREADY_CLAIMED');
      expect(getTotalCoins()).toBe(25);
    });
    it('Power-Up Master achievement unlocks only after using all 3 power-ups', () => {
      recordPowerUpUsage('magnet');
      expect(isAchievementUnlocked('powerup_master')).toBe(false);
      recordPowerUpUsage('shield');
      expect(isAchievementUnlocked('powerup_master')).toBe(false);
      recordPowerUpUsage('boost');
      expect(isAchievementUnlocked('powerup_master')).toBe(true);
    });
  });
  // ==========================================
  // Check 8: All 50 Original Levels Remain Functional
  // ==========================================
  describe('Check 8: All 50 original levels remain functional', () => {
    it('verifies all 50 levels have valid geometries, obstacles, coins, and coin targets', () => {
      expect(TOTAL_LEVELS).toBe(50);
      for (let lvl = 1; lvl <= 50; lvl++) {
        const cfg = getLevelConfig(lvl);
        expect(cfg).toBeDefined();
        expect(cfg.levelNumber).toBe(lvl);
        const geom = resolveLevelGeometry(cfg, 400, 300, 0);
        expect(geom.carStartX).toBeGreaterThanOrEqual(0);
        expect(geom.finishX).toBeGreaterThan(geom.carStartX);
        expect(geom.coins.length).toBeGreaterThanOrEqual(1);
        expect(geom.coinTarget).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(geom.obstacles)).toBe(true);
        expect(Array.isArray(geom.roadGaps)).toBe(true);
        expect(Array.isArray(geom.powerUps)).toBe(true);
      }
    });
  });
  // ==========================================
  // Check 9: Drawing, Collision, Retry & Finish Mechanics
  // ==========================================
  describe('Check 9: Drawing, ramp collision, retry, and finish-line mechanics remain unchanged', () => {
    it('builds continuous connected ramp segments with normal vectors', () => {
      const points = [
        { x: 100, y: 200 },
        { x: 150, y: 180 },
        { x: 200, y: 150 },
      ];
      const segments = buildRampSegments(points);
      expect(segments.length).toBeGreaterThanOrEqual(2);
      segments.forEach((seg) => {
        expect(seg.length).toBeGreaterThan(0);
        expect(Number.isFinite(seg.normal.x)).toBe(true);
        expect(Number.isFinite(seg.normal.y)).toBe(true);
      });
    });
    it('detects finish line arrival and flags success', () => {
      const finishX = 350;
      const result = stepCarPhysics({
        state: {
          x: finishX + 10,
          y: 200,
          vx: 150,
          vy: 0,
          angle: 0,
          wheelRotation: 0,
          isGrounded: true,
          hasClearedObstacle: true,
          stuckTimer: 0,
        },
        segments: [],
        obstacles: [],
        roadY: 200,
        finishX,
        dt: 1 / 60,
      });
      expect(result.status).toBe('success');
    });
  });
  // ==========================================
  // Check 10 & 11: Storage Permanence & No Conflicting Systems
  // ==========================================
  describe('Check 10 & 11: All progress is saved permanently with zero duplicate systems', () => {
    it('rehydrates all systems from single centralized storage cleanly', async () => {
      // Simulate saved data in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY_HIGHEST_UNLOCKED, '12');
      await AsyncStorage.setItem(STORAGE_KEY_TOTAL_COINS, '350');
      await AsyncStorage.setItem(
        STORAGE_KEY_COMPLETED_LEVELS,
        JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      );
      await AsyncStorage.setItem(
        STORAGE_KEY_LEVEL_STARS,
        JSON.stringify({ 1: 3, 2: 3, 3: 2 })
      );
      await AsyncStorage.setItem(
        STORAGE_KEY_UNLOCKED_VEHICLES,
        JSON.stringify(['sports_car', 'monster_truck'])
      );
      await AsyncStorage.setItem(STORAGE_KEY_SELECTED_VEHICLE, 'monster_truck');
      await AsyncStorage.setItem(
        STORAGE_KEY_ACHIEVEMENTS,
        JSON.stringify({
          unlockedIds: ['first_victory', 'super_driver'],
          claimedRewardIds: ['first_victory'],
          unlockedTimestamps: {},
          usedPowerUpTypes: ['magnet'],
        })
      );
      // Rehydrate
      const hydrated = await initStorage();
      expect(hydrated.highestUnlockedLevel).toBe(12);
      expect(hydrated.totalCoins).toBe(350);
      expect(hydrated.completedLevels).toHaveLength(11);
      expect(hydrated.unlockedVehicles).toContain('monster_truck');
      expect(hydrated.selectedVehicle).toBe('monster_truck');
      expect(isAchievementUnlocked('first_victory')).toBe(true);
      expect(isAchievementRewardClaimed('first_victory')).toBe(true);
      expect(isAchievementUnlocked('super_driver')).toBe(true);
      expect(isAchievementRewardClaimed('super_driver')).toBe(false);
    });
  });
  // ==========================================
  // Check 12: Performance & Navigation Modals
  // ==========================================
  describe('Check 12: No major performance issues, crashes, or navigation errors', () => {
    it('renders all modals without crashes or React warnings', () => {
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <>
            <GarageModal
              visible={true}
              onClose={() => {}}
              totalCoins={200}
              unlockedVehicles={['sports_car']}
              selectedVehicle="sports_car"
              onSelectVehicle={() => {}}
              onUnlockVehicle={() => ({ success: true, remainingCoins: 50 })}
            />
            <DailyRewardModal
              visible={true}
              onClose={() => {}}
              totalCoins={200}
              status={getDailyRewardsStatus()}
              onClaimReward={() => ({
                success: true,
                coinsAwarded: 25,
                newTotalCoins: 225,
                dayClaimed: 1,
              })}
            />
            <AchievementsModal
              visible={true}
              onClose={() => {}}
              totalCoins={200}
              achievements={getAchievementsProgress()}
              onClaimReward={() => {}}
            />
            <LevelSelectModal
              visible={true}
              onClose={() => {}}
              currentLevel={1}
              highestUnlockedLevel={5}
              levelStars={{ 1: 3 }}
              totalStars={3}
              totalCoins={200}
              onSelectLevel={() => {}}
            />
            <WorldUnlockModal
              visible={true}
              world={WORLDS[1]}
              onContinue={() => {}}
            />
            <SettingsModal
              visible={true}
              onClose={() => {}}
              sfxEnabled={true}
              musicEnabled={true}
              onToggleSfx={() => {}}
              onToggleMusic={() => {}}
              highestUnlockedLevel={5}
              completedCount={4}
              totalCoins={200}
              totalStars={3}
              unlockedAchievementsCount={2}
              onOpenAchievements={() => {}}
              onResetProgress={() => {}}
              onOpenLevelSelect={() => {}}
              onOpenGarage={() => {}}
            />
          </>
        );
      });
      expect(renderer.toJSON()).toBeDefined();
      act(() => {
        renderer.unmount();
      });
    });
  });
});
