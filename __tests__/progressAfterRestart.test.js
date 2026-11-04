'use strict';
const loadFreshStorageModule = () => {
  let mod;
  jest.isolateModules(() => {
    mod = require('../src/games/rampracer/utils/levelStorage');
  });
  return mod;
};
const flush = async () => {
  for (let i = 0; i < 5; i++)
    await new Promise((r) => setTimeout(() => r(), 0));
};
describe('progress survives an app restart', () => {
  it('restores levels, unlocks, stars, coins, claimed rewards, consumed power-ups and achievements', async () => {
    const first = loadFreshStorageModule();
    await first.initStorage();
    first.resetProgress();
    await flush();
    first.markLevelCompleted(1);
    first.markLevelCompleted(2);
    first.markLevelCompleted(3);
    first.saveLevelStars(1, 3);
    first.saveLevelStars(2, 2);
    first.saveLevelStars(3, 1);
    first.saveTotalCoins(77);
    const claim = first.claimLevelReward(1);
    expect(claim.awarded).toBe(true);
    first.consumePowerUp(5, 'lvl-5-powerup-magnet');
    first.saveLastPlayedLevel(3);
    await flush();
    // --- App restart: new module instance with empty memory ---
    const restarted = loadFreshStorageModule();
    expect(restarted.getTotalCoins()).toBe(0); // proves memory is really fresh before hydration
    const restored = await restarted.initStorage();
    expect([...restored.completedLevels].sort()).toEqual([1, 2, 3]);
    expect(restarted.getUnlockedLevel()).toBe(4);
    expect(restarted.getLastPlayedLevel()).toBe(3);
    expect(restarted.getLevelStars(1)).toBe(3);
    expect(restarted.getLevelStars(2)).toBe(2);
    expect(restarted.getLevelStars(3)).toBe(1);
    expect(restarted.getTotalStars()).toBe(6);
    expect(restarted.getTotalCoins()).toBe(claim.newTotal);
    expect(restarted.isRewardClaimed(1)).toBe(true);
    expect(restarted.claimLevelReward(1).awarded).toBe(false); // no duplicate reward after restart
    expect(restarted.isPowerUpConsumed(5, 'lvl-5-powerup-magnet')).toBe(true); // no refund after restart
    const firstVictory = restarted
      .getAchievementsProgress()
      .find((a) => a.id === 'first_victory');
    expect(firstVictory?.isUnlocked).toBe(true);
    // Earned stars are never reduced after restart either
    restarted.saveLevelStars(1, 1);
    expect(restarted.getLevelStars(1)).toBe(3);
  });
});
