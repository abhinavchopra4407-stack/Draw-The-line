import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.setTimeout(15000);
import {
  initStorage,
  saveLastPlayedLevel,
  getLastPlayedLevel,
  saveUnlockedLevel,
  getUnlockedLevel,
  markLevelCompleted,
  isLevelCompleted,
  getCompletedLevels,
  claimLevelReward,
  isRewardClaimed,
  getTotalCoins,
  setSoundPreferences,
  getSoundPreferences,
  resetProgress,
  COINS_PER_LEVEL,
} from '../src/games/rampracer/utils/levelStorage';
import { soundManager } from '../src/games/rampracer/audio/soundManager';
import { SettingsModal } from '../src/games/rampracer/components/SettingsModal';
import { LoadingScreen } from '../src/games/rampracer/components/LoadingScreen';
describe('Level Progression & Persistent Storage', () => {
  beforeEach(() => {
    resetProgress();
  });
  it('initializes with default values on fresh launch (Level 1, 0 coins, sound enabled)', async () => {
    const data = await initStorage();
    expect(data.highestUnlockedLevel).toBe(1);
    expect(data.lastPlayedLevel).toBe(1);
    expect(data.completedLevels).toEqual([]);
    expect(data.totalCoins).toBe(0);
    expect(data.claimedRewards).toEqual([]);
    expect(data.soundEnabled).toBe(true);
    expect(data.musicEnabled).toBe(true);
  });
  it('restores last played level and resumes without resetting to Level 1', async () => {
    // Player reached and was playing Level 4
    saveUnlockedLevel(5);
    saveLastPlayedLevel(4);
    markLevelCompleted(1);
    markLevelCompleted(2);
    markLevelCompleted(3);
    claimLevelReward(1);
    claimLevelReward(2);
    claimLevelReward(3);
    expect(getLastPlayedLevel()).toBe(4);
    expect(getUnlockedLevel()).toBe(5);
    // Simulate reopening app
    const restored = await initStorage();
    expect(restored.lastPlayedLevel).toBe(4);
    expect(restored.highestUnlockedLevel).toBe(5);
    expect(restored.completedLevels).toEqual([1, 2, 3]);
    expect(restored.totalCoins).toBe(150);
  });
  it('marks level completed, unlocks next level, and prevents duplicate rewards', () => {
    // Level 1 complete
    const comp1 = markLevelCompleted(1);
    expect(comp1.nextLevel).toBe(2);
    expect(comp1.unlockedNew).toBe(true);
    expect(isLevelCompleted(1)).toBe(true);
    const claim1 = claimLevelReward(1);
    expect(claim1.awarded).toBe(true);
    expect(claim1.coinsAwarded).toBe(COINS_PER_LEVEL);
    expect(getTotalCoins()).toBe(50);
    // Replay Level 1: reward must not be given again
    const claim1Again = claimLevelReward(1);
    expect(claim1Again.awarded).toBe(false);
    expect(claim1Again.coinsAwarded).toBe(0);
    expect(getTotalCoins()).toBe(50);
  });
  it('preserves progress when retrying an attempt', () => {
    saveUnlockedLevel(8);
    markLevelCompleted(7);
    claimLevelReward(7);
    // Retrying level 7 should not delete progress
    expect(getUnlockedLevel()).toBe(8);
    expect(isLevelCompleted(7)).toBe(true);
    expect(getTotalCoins()).toBe(50);
  });
  it('resets progress back to Level 1 and 0 coins only when resetProgress is called', () => {
    saveUnlockedLevel(10);
    saveLastPlayedLevel(9);
    markLevelCompleted(8);
    claimLevelReward(8);
    expect(getUnlockedLevel()).toBe(10);
    resetProgress();
    expect(getUnlockedLevel()).toBe(1);
    expect(getLastPlayedLevel()).toBe(1);
    expect(getTotalCoins()).toBe(0);
    expect(getCompletedLevels()).toEqual([]);
    expect(isRewardClaimed(8)).toBe(false);
  });
});
describe('Sound System & Preferences', () => {
  it('saves and restores sound and music preferences', () => {
    setSoundPreferences(false, false);
    const prefs = getSoundPreferences();
    expect(prefs.soundEnabled).toBe(false);
    expect(prefs.musicEnabled).toBe(false);
    soundManager.init(false, false);
    expect(soundManager.isSfxEnabled()).toBe(false);
    expect(soundManager.isMusicEnabled()).toBe(false);
    soundManager.setSfxEnabled(true);
    expect(soundManager.isSfxEnabled()).toBe(true);
  });
  it('handles soundManager playSfx and music lifecycle without throwing', () => {
    expect(() => {
      soundManager.playSfx('btn_click');
      soundManager.playSfx('car_engine');
      soundManager.playSfx('draw_ramp');
      soundManager.playSfx('wheel_ramp');
      soundManager.playSfx('obstacle_hit');
      soundManager.playSfx('level_win');
      soundManager.playSfx('coin_collect');
      soundManager.playSfx('next_level');
      soundManager.playSfx('car_fail');
      soundManager.startMusic();
      soundManager.pauseMusic();
      soundManager.resumeMusic();
      soundManager.stopMusic();
    }).not.toThrow();
  });
});
describe('SettingsModal & LoadingScreen Components', () => {
  it('renders LoadingScreen with MITTSURE branding', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<LoadingScreen />);
    });
    const root = renderer.root;
    expect(root.findByProps({ children: 'MITTSURE' })).toBeTruthy();
    expect(root.findByProps({ children: 'RAMP RACER' })).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
  it('renders SettingsModal with audio toggles and stats', async () => {
    const onToggleSfx = jest.fn();
    const onToggleMusic = jest.fn();
    const onReset = jest.fn();
    const onClose = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SettingsModal
          visible={true}
          onClose={onClose}
          sfxEnabled={true}
          musicEnabled={true}
          onToggleSfx={onToggleSfx}
          onToggleMusic={onToggleMusic}
          highestUnlockedLevel={5}
          completedCount={4}
          totalCoins={200}
          onResetProgress={onReset}
        />
      );
    });
    const root = renderer.root;
    expect(root.findByProps({ children: '⚙️ GAME SETTINGS' })).toBeTruthy();
    expect(root.findByProps({ children: '🔊 Sound Effects' })).toBeTruthy();
    expect(root.findByProps({ children: '🎵 Background Music' })).toBeTruthy();
    expect(root.findByProps({ children: 'Lvl 5' })).toBeTruthy();
    expect(root.findByProps({ children: '4 / 50' })).toBeTruthy();
    expect(root.findByProps({ children: '🪙 200' })).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
});
