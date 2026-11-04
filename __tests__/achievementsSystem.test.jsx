import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACHIEVEMENTS,
  getAchievementById,
} from '../src/games/rampracer/types/achievements';
import {
  getAchievementsProgress,
  claimAchievementReward,
  recordPowerUpUsage,
  resetAchievements,
  getUnclaimedAchievementsCount,
  isAchievementUnlocked,
  isAchievementRewardClaimed,
  getTotalCoins,
  saveTotalCoins,
  markLevelCompleted,
  saveLevelStars,
  initStorage,
  resetProgress,
  STORAGE_KEY_ACHIEVEMENTS,
} from '../src/games/rampracer/utils/levelStorage';
import { AchievementsModal } from '../src/games/rampracer/components/AchievementsModal';
import { AchievementUnlockBanner } from '../src/games/rampracer/components/AchievementUnlockBanner';
describe('Achievements and Badges System', () => {
  beforeEach(() => {
    resetProgress();
    resetAchievements();
  });
  describe('1. Achievement Configurations', () => {
    it('defines exactly the 7 requested achievements', () => {
      expect(ACHIEVEMENTS).toHaveLength(7);
      const ids = ACHIEVEMENTS.map((a) => a.id);
      expect(ids).toEqual([
        'first_victory',
        'coin_collector',
        'super_driver',
        'perfect_driver',
        'world_explorer',
        'powerup_master',
        'champion',
      ]);
    });
    it('each achievement has valid title, description, target, symbol and coin reward', () => {
      ACHIEVEMENTS.forEach((ach) => {
        expect(ach.id).toBeDefined();
        expect(ach.title.length).toBeGreaterThan(0);
        expect(ach.description.length).toBeGreaterThan(0);
        expect(ach.target).toBeGreaterThan(0);
        expect(ach.rewardCoins).toBeGreaterThan(0);
        expect(ach.symbol.length).toBeGreaterThan(0);
        expect(ach.badgeColor).toMatch(/^#/);
      });
    });
    it('getAchievementById returns correct achievement definition', () => {
      const fv = getAchievementById('first_victory');
      expect(fv).toBeDefined();
      expect(fv?.title).toBe('First Victory');
      expect(fv?.rewardCoins).toBe(25);
      const champ = getAchievementById('champion');
      expect(champ).toBeDefined();
      expect(champ?.title).toBe('Champion');
      expect(champ?.target).toBe(50);
      expect(champ?.rewardCoins).toBe(300);
    });
  });
  describe('2. Achievement Unlock Conditions', () => {
    it('unlocks "First Victory" upon completing Level 1', () => {
      expect(isAchievementUnlocked('first_victory')).toBe(false);
      markLevelCompleted(1);
      expect(isAchievementUnlocked('first_victory')).toBe(true);
    });
    it('unlocks "Coin Collector" upon reaching 100 total coins', () => {
      expect(isAchievementUnlocked('coin_collector')).toBe(false);
      saveTotalCoins(99);
      expect(isAchievementUnlocked('coin_collector')).toBe(false);
      saveTotalCoins(100);
      expect(isAchievementUnlocked('coin_collector')).toBe(true);
    });
    it('unlocks "Super Driver" upon completing 10 levels', () => {
      expect(isAchievementUnlocked('super_driver')).toBe(false);
      for (let i = 1; i <= 9; i++) {
        markLevelCompleted(i);
      }
      expect(isAchievementUnlocked('super_driver')).toBe(false);
      markLevelCompleted(10);
      expect(isAchievementUnlocked('super_driver')).toBe(true);
    });
    it('unlocks "Perfect Driver" upon earning 3 stars in 5 levels', () => {
      expect(isAchievementUnlocked('perfect_driver')).toBe(false);
      for (let i = 1; i <= 4; i++) {
        saveLevelStars(i, 3);
      }
      expect(isAchievementUnlocked('perfect_driver')).toBe(false);
      saveLevelStars(5, 3);
      expect(isAchievementUnlocked('perfect_driver')).toBe(true);
    });
    it('unlocks "World Explorer" upon reaching Level 41 (unlocking all 5 worlds)', () => {
      expect(isAchievementUnlocked('world_explorer')).toBe(false);
      for (let i = 1; i <= 40; i++) {
        markLevelCompleted(i);
      }
      expect(isAchievementUnlocked('world_explorer')).toBe(true);
    });
    it('unlocks "Power-Up Master" only after using all three power-ups', () => {
      expect(isAchievementUnlocked('powerup_master')).toBe(false);
      let newly = recordPowerUpUsage('magnet');
      expect(newly).not.toContain('powerup_master');
      newly = recordPowerUpUsage('shield');
      expect(newly).not.toContain('powerup_master');
      newly = recordPowerUpUsage('boost');
      expect(newly).toContain('powerup_master');
      expect(isAchievementUnlocked('powerup_master')).toBe(true);
    });
    it('unlocks "Champion" upon completing all 50 levels', () => {
      expect(isAchievementUnlocked('champion')).toBe(false);
      for (let i = 1; i <= 49; i++) {
        markLevelCompleted(i);
      }
      expect(isAchievementUnlocked('champion')).toBe(false);
      markLevelCompleted(50);
      expect(isAchievementUnlocked('champion')).toBe(true);
    });
  });
  describe('3. Reward Claiming & Anti-Duplicate Mechanism', () => {
    it('successfully claims bonus coins when unlocked', () => {
      saveTotalCoins(0);
      markLevelCompleted(1);
      expect(isAchievementUnlocked('first_victory')).toBe(true);
      expect(isAchievementRewardClaimed('first_victory')).toBe(false);
      const claimRes = claimAchievementReward('first_victory');
      expect(claimRes.success).toBe(true);
      expect(claimRes.coinsAwarded).toBe(25);
      expect(claimRes.newTotalCoins).toBe(25);
      expect(getTotalCoins()).toBe(25);
      expect(isAchievementRewardClaimed('first_victory')).toBe(true);
    });
    it('strictly prevents claiming the same achievement reward twice', () => {
      saveTotalCoins(10);
      markLevelCompleted(1);
      const claim1 = claimAchievementReward('first_victory');
      expect(claim1.success).toBe(true);
      expect(claim1.coinsAwarded).toBe(25);
      expect(getTotalCoins()).toBe(35);
      const claim2 = claimAchievementReward('first_victory');
      expect(claim2.success).toBe(false);
      expect(claim2.error).toBe('ALREADY_CLAIMED');
      expect(claim2.coinsAwarded).toBe(0);
      expect(getTotalCoins()).toBe(35); // Unchanged!
    });
    it('rejects claiming a locked achievement', () => {
      expect(isAchievementUnlocked('champion')).toBe(false);
      const claim = claimAchievementReward('champion');
      expect(claim.success).toBe(false);
      expect(claim.error).toBe('ACHIEVEMENT_LOCKED');
    });
    it('correctly tracks unclaimed count', () => {
      expect(getUnclaimedAchievementsCount()).toBe(0);
      markLevelCompleted(1);
      expect(getUnclaimedAchievementsCount()).toBe(1);
      claimAchievementReward('first_victory');
      expect(getUnclaimedAchievementsCount()).toBe(0);
    });
  });
  describe('4. Persistence and Storage Rehydration', () => {
    it('persists unlocked and claimed achievements in AsyncStorage', async () => {
      markLevelCompleted(1);
      claimAchievementReward('first_victory');
      const raw = await AsyncStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw);
      expect(parsed.unlockedIds).toContain('first_victory');
      expect(parsed.claimedRewardIds).toContain('first_victory');
    });
    it('rehydrates achievement state cleanly on initStorage()', async () => {
      const payload = {
        unlockedIds: ['first_victory', 'coin_collector'],
        claimedRewardIds: ['first_victory'],
        usedPowerUpTypes: ['magnet', 'boost'],
      };
      await AsyncStorage.setItem(
        STORAGE_KEY_ACHIEVEMENTS,
        JSON.stringify(payload)
      );
      await initStorage();
      expect(isAchievementUnlocked('first_victory')).toBe(true);
      expect(isAchievementRewardClaimed('first_victory')).toBe(true);
      expect(isAchievementUnlocked('coin_collector')).toBe(true);
      expect(isAchievementRewardClaimed('coin_collector')).toBe(false);
      const prog = getAchievementsProgress();
      const puProg = prog.find((p) => p.id === 'powerup_master');
      expect(puProg?.current).toBe(2);
    });
  });
  describe('5. UI Component Rendering', () => {
    it('renders AchievementsModal with badges, progress bars, and header stats', () => {
      markLevelCompleted(1);
      const progress = getAchievementsProgress();
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AchievementsModal
            visible={true}
            onClose={() => {}}
            totalCoins={100}
            achievements={progress}
            onClaimReward={() => {}}
          />
        );
      });
      const tree = renderer.toJSON();
      expect(tree).toBeDefined();
      const textNodes = renderer.root.findAllByType('Text');
      const texts = textNodes.map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : String(n.props.children)
      );
      // Verify header and achievements titles
      expect(texts.some((t) => t.includes('ACHIEVEMENTS'))).toBe(true);
      expect(texts.some((t) => t.includes('First Victory'))).toBe(true);
      expect(texts.some((t) => t.includes('Champion'))).toBe(true);
      expect(texts.some((t) => t.includes('1 / 7'))).toBe(true);
    });
    it('renders AchievementUnlockBanner with trophy, title, and bonus coins pill', () => {
      const def = getAchievementById('first_victory');
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <AchievementUnlockBanner
            achievement={def}
            onDismiss={() => {}}
            onPress={() => {}}
          />
        );
      });
      const tree = renderer.toJSON();
      expect(tree).toBeDefined();
      const textNodes = renderer.root.findAllByType('Text');
      const texts = textNodes.map((n) =>
        Array.isArray(n.props.children)
          ? n.props.children.join('')
          : String(n.props.children)
      );
      expect(texts.some((t) => t.includes('ACHIEVEMENT UNLOCKED!'))).toBe(true);
      expect(texts.some((t) => t.includes('First Victory'))).toBe(true);
      expect(texts.some((t) => t.includes('+25'))).toBe(true);
    });
  });
});
