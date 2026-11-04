import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DAILY_REWARDS_7_DAYS,
  formatDateToYYYYMMDD,
  getCalendarDayDiff,
} from '../src/games/rampracer/types/dailyRewards';
import {
  getDailyRewardsStatus,
  claimDailyReward,
  resetDailyRewards,
  getTotalCoins,
  initStorage,
  resetProgress,
  markLevelCompleted,
  getUnlockedLevel,
  STORAGE_KEY_DAILY_REWARDS,
} from '../src/games/rampracer/utils/levelStorage';
import { DailyRewardButton } from '../src/games/rampracer/components/DailyRewardButton';
import { DailyRewardModal } from '../src/games/rampracer/components/DailyRewardModal';
describe('Daily Rewards System (7-Day Cycle)', () => {
  beforeEach(() => {
    resetProgress();
    resetDailyRewards();
  });
  describe('1. 7-Day Reward Cycle Configuration', () => {
    it('has exactly 7 days configured in the cycle', () => {
      expect(DAILY_REWARDS_7_DAYS).toHaveLength(7);
      DAILY_REWARDS_7_DAYS.forEach((r, idx) => {
        expect(r.day).toBe(idx + 1);
        expect(r.coins).toBeGreaterThan(0);
        expect(r.label).toBeDefined();
        expect(r.symbol).toBeDefined();
      });
    });
    it('defines increasing rewards with Day 7 as Grand Prize', () => {
      expect(DAILY_REWARDS_7_DAYS[0].coins).toBe(25);
      expect(DAILY_REWARDS_7_DAYS[1].coins).toBe(50);
      expect(DAILY_REWARDS_7_DAYS[2].coins).toBe(75);
      expect(DAILY_REWARDS_7_DAYS[3].coins).toBe(100);
      expect(DAILY_REWARDS_7_DAYS[4].coins).toBe(150);
      expect(DAILY_REWARDS_7_DAYS[5].coins).toBe(200);
      expect(DAILY_REWARDS_7_DAYS[6].coins).toBe(350);
      expect(DAILY_REWARDS_7_DAYS[6].isGrandReward).toBe(true);
      expect(DAILY_REWARDS_7_DAYS[6].symbol).toBe('👑');
    });
  });
  describe('2. Date Math Utilities', () => {
    it('formats dates consistently as YYYY-MM-DD', () => {
      const d = new Date(2026, 9, 31); // Oct 31, 2026
      expect(formatDateToYYYYMMDD(d)).toBe('2026-10-31');
    });
    it('calculates calendar day differences accurately across months and leap days', () => {
      expect(getCalendarDayDiff('2026-10-30', '2026-10-31')).toBe(1);
      expect(getCalendarDayDiff('2026-10-31', '2026-11-01')).toBe(1);
      expect(getCalendarDayDiff('2026-10-25', '2026-10-31')).toBe(6);
      expect(getCalendarDayDiff('2026-10-31', '2026-10-31')).toBe(0);
    });
  });
  describe('3. Initial Claim (Day 1)', () => {
    const day1Date = new Date(2026, 9, 1); // Oct 1, 2026
    it('allows claiming Day 1 on a fresh profile', () => {
      const status = getDailyRewardsStatus(day1Date);
      expect(status.canClaimToday).toBe(true);
      expect(status.todayDay).toBe(1);
      expect(status.claimedDays).toEqual([]);
      expect(status.streak).toBe(0);
      expect(status.todayReward.coins).toBe(25);
    });
    it('claims Day 1, awards 25 coins, and records streak', () => {
      const initialCoins = getTotalCoins();
      const res = claimDailyReward(day1Date);
      expect(res.success).toBe(true);
      expect(res.dayClaimed).toBe(1);
      expect(res.reward?.coins).toBe(25);
      expect(getTotalCoins()).toBe(initialCoins + 25);
      const statusAfter = getDailyRewardsStatus(day1Date);
      expect(statusAfter.canClaimToday).toBe(false);
      expect(statusAfter.isClaimedToday).toBe(true);
      expect(statusAfter.todayDay).toBe(1);
      expect(statusAfter.claimedDays).toContain(1);
      expect(statusAfter.streak).toBe(1);
    });
  });
  describe('4. Duplicate Claim Prevention on Same Calendar Day', () => {
    const day1Date = new Date(2026, 9, 1);
    it('prevents multiple claims on the same calendar day', () => {
      // First claim succeeds
      const first = claimDailyReward(day1Date);
      expect(first.success).toBe(true);
      const coinsAfterFirst = getTotalCoins();
      // Second claim on same day is blocked
      const second = claimDailyReward(day1Date);
      expect(second.success).toBe(false);
      expect(second.error).toBe('ALREADY_CLAIMED_TODAY');
      expect(getTotalCoins()).toBe(coinsAfterFirst); // Coins unchanged
    });
  });
  describe('5. Consecutive Day Progression (Days 1 to 7)', () => {
    it('progresses consecutively through all 7 days and unlocks Day 7 jackpot', () => {
      let coins = getTotalCoins();
      for (let day = 1; day <= 7; day++) {
        const currentDate = new Date(2026, 9, day);
        const status = getDailyRewardsStatus(currentDate);
        expect(status.canClaimToday).toBe(true);
        expect(status.todayDay).toBe(day);
        expect(status.todayReward.coins).toBe(
          DAILY_REWARDS_7_DAYS[day - 1].coins
        );
        const res = claimDailyReward(currentDate);
        expect(res.success).toBe(true);
        expect(res.dayClaimed).toBe(day);
        coins += DAILY_REWARDS_7_DAYS[day - 1].coins;
        expect(getTotalCoins()).toBe(coins);
        const postStatus = getDailyRewardsStatus(currentDate);
        expect(postStatus.canClaimToday).toBe(false);
        expect(postStatus.streak).toBe(day);
      }
      // After Day 7 claim, all 7 days should be in claimedDays
      const finalStatus = getDailyRewardsStatus(new Date(2026, 9, 7));
      expect(finalStatus.claimedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(finalStatus.cycleCompleted).toBe(true);
    });
    it('rolls over to Day 1 on Day 8 without resetting level progress', () => {
      // Advance level progress to Level 8
      markLevelCompleted(1);
      markLevelCompleted(2);
      markLevelCompleted(3);
      expect(getUnlockedLevel()).toBe(4);
      // Claim all 7 days
      for (let day = 1; day <= 7; day++) {
        claimDailyReward(new Date(2026, 9, day));
      }
      // On Day 8 (consecutive next day)
      const day8Date = new Date(2026, 9, 8);
      const day8Status = getDailyRewardsStatus(day8Date);
      expect(day8Status.canClaimToday).toBe(true);
      expect(day8Status.todayDay).toBe(1); // Rolled over to Day 1!
      expect(day8Status.todayReward.coins).toBe(25);
      // Level progress remains completely intact!
      expect(getUnlockedLevel()).toBe(4);
    });
  });
  describe('6. Streak Reset on Missed Days', () => {
    it('resets reward cycle to Day 1 when one or more days are missed without resetting level progress', () => {
      markLevelCompleted(1);
      markLevelCompleted(2);
      expect(getUnlockedLevel()).toBe(3);
      // Claim Day 1 on Oct 1
      claimDailyReward(new Date(2026, 9, 1));
      // Skip 2 days, return on Oct 4
      const skippedDate = new Date(2026, 9, 4);
      const status = getDailyRewardsStatus(skippedDate);
      expect(status.canClaimToday).toBe(true);
      expect(status.todayDay).toBe(1); // Resets to Day 1
      expect(status.streak).toBe(0);
      // Level progress still untouched!
      expect(getUnlockedLevel()).toBe(3);
    });
  });
  describe('7. Persistence Across App Restart', () => {
    it('persists claimed daily rewards and restores them on initStorage()', async () => {
      const claimDate = new Date(2026, 9, 15);
      claimDailyReward(claimDate);
      // Verify stored in AsyncStorage mock
      const stored = await AsyncStorage.getItem(STORAGE_KEY_DAILY_REWARDS);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored);
      expect(parsed.lastClaimDate).toBe('2026-10-15');
      expect(parsed.currentDay).toBe(1);
      expect(parsed.claimedDays).toEqual([1]);
      // Reinitialize storage
      const rehydrated = await initStorage();
      expect(rehydrated.dailyRewards.lastClaimDate).toBe('2026-10-15');
      expect(rehydrated.dailyRewards.currentDay).toBe(1);
      expect(rehydrated.dailyRewards.claimedDays).toEqual([1]);
    });
  });
  describe('8. UI Components Rendering', () => {
    it('renders DailyRewardButton with notification dot when reward is available', () => {
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <DailyRewardButton onPress={() => {}} hasAvailableReward={true} />
        );
      });
      const tree = renderer.toJSON();
      expect(tree).toBeDefined();
      const textNodes = renderer.root.findAllByType('Text');
      expect(textNodes.some((n) => n.props.children === '🎁')).toBe(true);
      expect(textNodes.some((n) => n.props.children === '!')).toBe(true);
    });
    it('renders DailyRewardModal with all 7 days and claim button', () => {
      const status = getDailyRewardsStatus(new Date(2026, 9, 1));
      let renderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <DailyRewardModal
            visible={true}
            onClose={() => {}}
            totalCoins={100}
            status={status}
            onClaimReward={() => ({ success: true })}
          />
        );
      });
      const root = renderer.root;
      const textNodes = root.findAllByType('Text');
      // Verifies title and 7-day labels
      expect(textNodes.some((n) => n.props.children === 'DAILY REWARDS')).toBe(
        true
      );
      expect(textNodes.some((n) => n.props.children === 'DAY 1')).toBe(true);
      expect(textNodes.some((n) => n.props.children === 'DAY 2')).toBe(true);
      expect(textNodes.some((n) => n.props.children === 'DAY 3')).toBe(true);
      expect(textNodes.some((n) => n.props.children === 'DAY 4')).toBe(true);
      expect(textNodes.some((n) => n.props.children === 'DAY 5')).toBe(true);
      expect(textNodes.some((n) => n.props.children === 'DAY 6')).toBe(true);
      expect(
        textNodes.some((n) => String(n.props.children).includes('DAY 7'))
      ).toBe(true);
    });
  });
});
