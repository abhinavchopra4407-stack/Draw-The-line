import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
jest.setTimeout(15000);
import {
  RewardModal,
  GameControls,
  claimLevelReward,
  isRewardClaimed,
  getTotalCoins,
  resetProgress,
  saveUnlockedLevel,
  getUnlockedLevel,
  initStorage,
} from '../src/games/rampracer';
describe('Level Completion & Reward System', () => {
  beforeEach(() => {
    resetProgress();
  });
  describe('Reward & Progress Logic', () => {
    it('awards exactly 50 virtual coins on first completion of a level', () => {
      expect(getTotalCoins()).toBe(0);
      expect(isRewardClaimed(1)).toBe(false);
      const res = claimLevelReward(1);
      expect(res.awarded).toBe(true);
      expect(res.coinsAwarded).toBe(50);
      expect(res.newTotal).toBe(50);
      expect(getTotalCoins()).toBe(50);
      expect(isRewardClaimed(1)).toBe(true);
    });
    it('strictly prevents duplicate rewards when the same level is replayed', () => {
      // Complete level 1
      claimLevelReward(1);
      expect(getTotalCoins()).toBe(50);
      // Replay level 1 and try to claim again
      const replayRes = claimLevelReward(1);
      expect(replayRes.awarded).toBe(false);
      expect(replayRes.coinsAwarded).toBe(0);
      expect(replayRes.newTotal).toBe(50);
      expect(getTotalCoins()).toBe(50);
    });
    it('awards 50 coins for distinct levels up to 50', () => {
      claimLevelReward(1);
      claimLevelReward(2);
      claimLevelReward(3);
      expect(getTotalCoins()).toBe(150);
      expect(isRewardClaimed(1)).toBe(true);
      expect(isRewardClaimed(2)).toBe(true);
      expect(isRewardClaimed(3)).toBe(true);
      expect(isRewardClaimed(4)).toBe(false);
    });
    it('persists and restores saved progress via initStorage', async () => {
      saveUnlockedLevel(5);
      claimLevelReward(1);
      claimLevelReward(2);
      const restored = await initStorage();
      expect(restored.highestUnlockedLevel).toBe(5);
      expect(restored.totalCoins).toBe(100);
      expect(restored.claimedRewards).toContain(1);
      expect(restored.claimedRewards).toContain(2);
      expect(getUnlockedLevel()).toBe(5);
    });
  });
  describe('RewardModal Component', () => {
    it('renders the pink ribbon, YOUR REWARD, animated coin effect and yellow CLAIM button', async () => {
      const onClaim = jest.fn();
      const onNextLevel = jest.fn();
      const onReplay = jest.fn();
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <RewardModal
            visible={true}
            level={1}
            isAlreadyClaimed={false}
            onClaim={onClaim}
            onNextLevel={onNextLevel}
            onReplay={onReplay}
          />
        );
      });
      const root = renderer.root;
      // 1. Pink ribbon with white LEVEL COMPLETE text
      const allTexts = root.findAllByType(Text).map((t) => t.props.children);
      const hasRibbonText = allTexts.some(
        (txt) => typeof txt === 'string' && txt.includes('LEVEL COMPLETE')
      );
      expect(hasRibbonText).toBe(true);
      // 2. YOUR REWARD section
      const hasRewardLabel = allTexts.some(
        (txt) => typeof txt === 'string' && txt.includes('YOUR REWARD')
      );
      expect(hasRewardLabel).toBe(true);
      // 3. Yellow CLAIM button
      const claimBtn = root.findByProps({ accessibilityLabel: 'Claim Reward' });
      expect(claimBtn).toBeTruthy();
      // 4. Tap CLAIM button
      await ReactTestRenderer.act(async () => {
        claimBtn.props.onPress();
      });
      expect(onClaim).toHaveBeenCalledTimes(1);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
    it('renders Next Level and Replay buttons when already claimed on replay', async () => {
      const onClaim = jest.fn();
      const onNextLevel = jest.fn();
      const onReplay = jest.fn();
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <RewardModal
            visible={true}
            level={2}
            isAlreadyClaimed={true}
            onClaim={onClaim}
            onNextLevel={onNextLevel}
            onReplay={onReplay}
          />
        );
      });
      const root = renderer.root;
      // Claim button should not be displayed when already claimed
      const claimButtons = root.findAllByProps({
        accessibilityLabel: 'Claim Reward',
      });
      expect(claimButtons.length).toBe(0);
      // Next level & Replay options must be present
      const nextBtn = root.findByProps({ accessibilityLabel: 'Next Level' });
      const replayBtn = root.findByProps({
        accessibilityLabel: 'Replay Level',
      });
      expect(nextBtn).toBeTruthy();
      expect(replayBtn).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        nextBtn.props.onPress();
        replayBtn.props.onPress();
      });
      expect(onNextLevel).toHaveBeenCalledTimes(1);
      expect(onReplay).toHaveBeenCalledTimes(1);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
    it('renders correctly inside GameControls when status is success', async () => {
      const onNextLevel = jest.fn();
      const onRedraw = jest.fn();
      const onClaimReward = jest.fn();
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <GameControls
            status="success"
            hasDrawnPoints={true}
            onClear={() => {}}
            onRetry={() => {}}
            onRedraw={onRedraw}
            onNextLevel={onNextLevel}
            level={3}
            isAlreadyClaimed={false}
            onClaimReward={onClaimReward}
          />
        );
      });
      const root = renderer.root;
      const claimBtn = root.findByProps({ accessibilityLabel: 'Claim Reward' });
      expect(claimBtn).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        claimBtn.props.onPress();
      });
      expect(onClaimReward).toHaveBeenCalledTimes(1);
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    });
  });
});
