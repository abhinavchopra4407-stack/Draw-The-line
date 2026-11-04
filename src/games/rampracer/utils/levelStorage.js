/**
 * Level progression, persistent game storage & virtual coins reward helper.
 * Tracks highest unlocked level, last played level, completed levels, total coins,
 * claimed rewards, and sound/music preferences across sessions via AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_VEHICLE_ID,
  VEHICLES,
  getVehicleById,
} from '../types/vehicles';
import { WORLDS, getWorldById } from '../types/worlds';
import {
  DAILY_REWARDS_7_DAYS,
  formatDateToYYYYMMDD,
  getCalendarDayDiff,
} from '../types/dailyRewards';
import { ACHIEVEMENTS, getAchievementById } from '../types/achievements';
export const STORAGE_KEY_HIGHEST_UNLOCKED = '@rampracer_unlocked_level';
export const STORAGE_KEY_LAST_PLAYED = '@rampracer_last_played_level';
export const STORAGE_KEY_COMPLETED_LEVELS = '@rampracer_completed_levels';
export const STORAGE_KEY_TOTAL_COINS = '@rampracer_total_coins';
export const STORAGE_KEY_CLAIMED_LEVELS = '@rampracer_claimed_rewards';
export const STORAGE_KEY_SOUND_ENABLED = '@rampracer_sound_enabled';
export const STORAGE_KEY_MUSIC_ENABLED = '@rampracer_music_enabled';
export const STORAGE_KEY_LEVEL_STARS = '@rampracer_level_stars';
export const STORAGE_KEY_UNLOCKED_VEHICLES = '@rampracer_unlocked_vehicles';
export const STORAGE_KEY_SELECTED_VEHICLE = '@rampracer_selected_vehicle';
export const STORAGE_KEY_SEEN_WORLD_UNLOCKS = '@rampracer_seen_world_unlocks';
export const STORAGE_KEY_DAILY_REWARDS = '@rampracer_daily_rewards';
export const STORAGE_KEY_ACHIEVEMENTS = '@rampracer_achievements';
export const STORAGE_KEY_CONSUMED_POWERUPS = '@rampracer_consumed_powerups';
export const STORAGE_KEY_TUTORIAL_COMPLETED = '@rampracer_tutorial_completed';
export const COINS_PER_LEVEL = 50;
// In-memory cache for synchronous access and unit test compatibility
let memoryHighestUnlocked = 1;
let memoryLastPlayed = 1;
let memoryCompletedLevels = new Set();
let memoryTotalCoins = 0;
let memoryClaimedLevels = new Set();
let memorySoundEnabled = true;
let memoryMusicEnabled = true;
let memoryLevelStars = new Map();
let memoryUnlockedVehicles = new Set([DEFAULT_VEHICLE_ID]);
let memorySelectedVehicle = DEFAULT_VEHICLE_ID;
let memorySeenWorldUnlocks = new Set(['green_valley']);
let memoryTutorialCompleted = false;
let memoryDailyRewards = {
  lastClaimDate: null,
  currentDay: 1,
  claimedDays: [],
  streak: 0,
  totalClaimedCount: 0,
};
let memoryUnlockedAchievements = new Set();
let memoryClaimedAchievementRewards = new Set();
let memoryAchievementTimestamps = {};
let memoryUsedPowerUpTypes = new Set();
let memoryConsumedPowerUps = new Set();
let isInitialized = false;
/**
 * Restores previously saved progress from persistent storage when the game opens.
 * Resumes from the last played unlocked level.
 * Handles missing or corrupted storage data safely.
 */
export async function initStorage() {
  if (AsyncStorage) {
    try {
      const [
        highestVal,
        lastPlayedVal,
        completedVal,
        coinsVal,
        claimedVal,
        soundVal,
        musicVal,
        starsVal,
        unlockedVehiclesVal,
        selectedVehicleVal,
        seenWorldsVal,
        dailyRewardsVal,
        achievementsVal,
        consumedPowerUpsVal,
        tutorialCompletedVal,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_HIGHEST_UNLOCKED),
        AsyncStorage.getItem(STORAGE_KEY_LAST_PLAYED),
        AsyncStorage.getItem(STORAGE_KEY_COMPLETED_LEVELS),
        AsyncStorage.getItem(STORAGE_KEY_TOTAL_COINS),
        AsyncStorage.getItem(STORAGE_KEY_CLAIMED_LEVELS),
        AsyncStorage.getItem(STORAGE_KEY_SOUND_ENABLED),
        AsyncStorage.getItem(STORAGE_KEY_MUSIC_ENABLED),
        AsyncStorage.getItem(STORAGE_KEY_LEVEL_STARS),
        AsyncStorage.getItem(STORAGE_KEY_UNLOCKED_VEHICLES),
        AsyncStorage.getItem(STORAGE_KEY_SELECTED_VEHICLE),
        AsyncStorage.getItem(STORAGE_KEY_SEEN_WORLD_UNLOCKS),
        AsyncStorage.getItem(STORAGE_KEY_DAILY_REWARDS),
        AsyncStorage.getItem(STORAGE_KEY_ACHIEVEMENTS),
        AsyncStorage.getItem(STORAGE_KEY_CONSUMED_POWERUPS),
        AsyncStorage.getItem(STORAGE_KEY_TUTORIAL_COMPLETED),
      ]);
      if (highestVal) {
        const parsed = parseInt(highestVal, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
          memoryHighestUnlocked = Math.max(memoryHighestUnlocked, parsed);
        }
      }
      if (lastPlayedVal) {
        const parsed = parseInt(lastPlayedVal, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
          memoryLastPlayed = Math.min(parsed, memoryHighestUnlocked);
        } else {
          memoryLastPlayed = memoryHighestUnlocked;
        }
      } else {
        memoryLastPlayed = memoryHighestUnlocked;
      }
      if (completedVal) {
        try {
          const parsedArr = JSON.parse(completedVal);
          if (Array.isArray(parsedArr)) {
            parsedArr.forEach((lvl) => {
              if (typeof lvl === 'number' && lvl >= 1 && lvl <= 50) {
                memoryCompletedLevels.add(lvl);
              }
            });
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (coinsVal) {
        const parsed = parseInt(coinsVal, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          memoryTotalCoins = Math.max(memoryTotalCoins, parsed);
        }
      }
      if (claimedVal) {
        try {
          const parsedArr = JSON.parse(claimedVal);
          if (Array.isArray(parsedArr)) {
            parsedArr.forEach((lvl) => {
              if (typeof lvl === 'number' && lvl >= 1 && lvl <= 50) {
                memoryClaimedLevels.add(lvl);
              }
            });
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (soundVal !== null) {
        memorySoundEnabled = soundVal === 'true';
      }
      if (musicVal !== null) {
        memoryMusicEnabled = musicVal === 'true';
      }
      if (starsVal) {
        try {
          const parsed = JSON.parse(starsVal);
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([lvlStr, starCount]) => {
              const lvl = parseInt(lvlStr, 10);
              const stars =
                typeof starCount === 'number'
                  ? starCount
                  : parseInt(String(starCount), 10);
              if (!isNaN(lvl) && !isNaN(stars) && lvl >= 1 && lvl <= 50) {
                memoryLevelStars.set(lvl, Math.max(0, Math.min(3, stars)));
              }
            });
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (unlockedVehiclesVal) {
        try {
          const parsedArr = JSON.parse(unlockedVehiclesVal);
          if (Array.isArray(parsedArr)) {
            parsedArr.forEach((vId) => {
              if (VEHICLES.some((v) => v.id === vId)) {
                memoryUnlockedVehicles.add(vId);
              }
            });
          }
        } catch {
          // Ignore json parse error
        }
      }
      // Guarantee default vehicle is always unlocked
      memoryUnlockedVehicles.add(DEFAULT_VEHICLE_ID);
      if (
        selectedVehicleVal &&
        memoryUnlockedVehicles.has(selectedVehicleVal)
      ) {
        memorySelectedVehicle = selectedVehicleVal;
      } else {
        memorySelectedVehicle = DEFAULT_VEHICLE_ID;
      }
      if (seenWorldsVal) {
        try {
          const parsedArr = JSON.parse(seenWorldsVal);
          if (Array.isArray(parsedArr)) {
            parsedArr.forEach((wId) => {
              if (WORLDS.some((w) => w.id === wId)) {
                memorySeenWorldUnlocks.add(wId);
              }
            });
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (dailyRewardsVal) {
        try {
          const parsed = JSON.parse(dailyRewardsVal);
          if (parsed && typeof parsed === 'object') {
            memoryDailyRewards = {
              lastClaimDate:
                typeof parsed.lastClaimDate === 'string'
                  ? parsed.lastClaimDate
                  : null,
              currentDay:
                typeof parsed.currentDay === 'number' &&
                parsed.currentDay >= 1 &&
                parsed.currentDay <= 7
                  ? parsed.currentDay
                  : 1,
              claimedDays: Array.isArray(parsed.claimedDays)
                ? parsed.claimedDays.filter(
                    (d) => typeof d === 'number' && d >= 1 && d <= 7
                  )
                : [],
              streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
              totalClaimedCount:
                typeof parsed.totalClaimedCount === 'number'
                  ? parsed.totalClaimedCount
                  : 0,
            };
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (achievementsVal) {
        try {
          const parsed = JSON.parse(achievementsVal);
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.unlockedIds)) {
              parsed.unlockedIds.forEach((id) => {
                if (ACHIEVEMENTS.some((a) => a.id === id)) {
                  memoryUnlockedAchievements.add(id);
                }
              });
            }
            if (Array.isArray(parsed.claimedRewardIds)) {
              parsed.claimedRewardIds.forEach((id) => {
                if (ACHIEVEMENTS.some((a) => a.id === id)) {
                  memoryClaimedAchievementRewards.add(id);
                }
              });
            }
            if (
              parsed.unlockedTimestamps &&
              typeof parsed.unlockedTimestamps === 'object'
            ) {
              memoryAchievementTimestamps = { ...parsed.unlockedTimestamps };
            }
            if (Array.isArray(parsed.usedPowerUpTypes)) {
              parsed.usedPowerUpTypes.forEach((t) => {
                if (typeof t === 'string') {
                  memoryUsedPowerUpTypes.add(t);
                }
              });
            }
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (consumedPowerUpsVal) {
        try {
          const parsed = JSON.parse(consumedPowerUpsVal);
          if (Array.isArray(parsed)) {
            parsed.forEach((key) => {
              if (typeof key === 'string') {
                memoryConsumedPowerUps.add(key);
              }
            });
          }
        } catch {
          // Ignore json parse error
        }
      }
      if (tutorialCompletedVal !== null) {
        memoryTutorialCompleted = tutorialCompletedVal === 'true';
      }
      memorySeenWorldUnlocks.add('green_valley');
    } catch {
      // Storage read failed, fallback to memory defaults safely
    }
  }
  isInitialized = true;
  // Evaluate any achievements that are already earned by current progression
  checkAndUnlockAchievements(false);
  return {
    highestUnlockedLevel: memoryHighestUnlocked,
    lastPlayedLevel: memoryLastPlayed,
    completedLevels: Array.from(memoryCompletedLevels),
    totalCoins: memoryTotalCoins,
    claimedRewards: Array.from(memoryClaimedLevels),
    soundEnabled: memorySoundEnabled,
    musicEnabled: memoryMusicEnabled,
    levelStars: getAllLevelStars(),
    totalStars: getTotalStars(),
    unlockedVehicles: Array.from(memoryUnlockedVehicles),
    selectedVehicle: memorySelectedVehicle,
    unlockedWorlds: getUnlockedWorlds(),
    seenWorldUnlocks: Array.from(memorySeenWorldUnlocks),
    dailyRewards: { ...memoryDailyRewards },
    unlockedAchievements: Array.from(memoryUnlockedAchievements),
    claimedAchievementRewards: Array.from(memoryClaimedAchievementRewards),
    tutorialCompleted: memoryTutorialCompleted,
  };
}
export function isStorageInitialized() {
  return isInitialized;
}
export function getUnlockedLevel() {
  return memoryHighestUnlocked;
}
export function getLastPlayedLevel() {
  return memoryLastPlayed;
}
export function saveLastPlayedLevel(level) {
  if (level >= 1 && level <= 50) {
    memoryLastPlayed = level;
    if (AsyncStorage) {
      AsyncStorage.setItem(STORAGE_KEY_LAST_PLAYED, String(level)).catch(
        () => {}
      );
    }
  }
}
export function saveUnlockedLevel(level) {
  if (level > memoryHighestUnlocked && level <= 50) {
    memoryHighestUnlocked = level;
    if (AsyncStorage) {
      AsyncStorage.setItem(STORAGE_KEY_HIGHEST_UNLOCKED, String(level)).catch(
        () => {}
      );
    }
  }
  return memoryHighestUnlocked;
}
export function isLevelUnlocked(level) {
  return level >= 1 && level <= memoryHighestUnlocked;
}
export function isLevelCompleted(level) {
  return memoryCompletedLevels.has(level);
}
export function getCompletedLevels() {
  return Array.from(memoryCompletedLevels);
}
/**
 * Gets the highest star rating achieved for a specific level (0 to 3).
 */
export function getLevelStars(level) {
  return memoryLevelStars.get(level) ?? 0;
}
/**
 * Returns a map of all levels to their highest earned star rating.
 */
export function getAllLevelStars() {
  const result = {};
  memoryLevelStars.forEach((stars, lvl) => {
    result[lvl] = stars;
  });
  return result;
}
/**
 * Calculates the total stars earned by the player across all levels (max 150).
 */
export function getTotalStars() {
  let total = 0;
  memoryLevelStars.forEach((stars) => {
    total += stars;
  });
  return total;
}
/**
 * Saves the highest star rating achieved for a level.
 * NEVER reduces a previously earned star rating.
 * Saves immediately to persistent storage.
 */
export function saveLevelStars(level, stars) {
  const clampedStars = Math.max(0, Math.min(3, Math.floor(stars)));
  const previousStars = memoryLevelStars.get(level) ?? 0;
  // Never reduce previously earned star rating
  if (clampedStars > previousStars) {
    memoryLevelStars.set(level, clampedStars);
    if (AsyncStorage) {
      const allStars = getAllLevelStars();
      AsyncStorage.setItem(
        STORAGE_KEY_LEVEL_STARS,
        JSON.stringify(allStars)
      ).catch(() => {});
    }
    checkAndUnlockAchievements();
    return {
      previousStars,
      newStars: clampedStars,
      isNewRecord: true,
    };
  }
  return {
    previousStars,
    newStars: previousStars,
    isNewRecord: false,
  };
}
/**
 * When a player completes a level:
 * - Marks that level as completed.
 * - Unlocks the next level immediately.
 * - Saves progress to persistent storage immediately.
 */
export function markLevelCompleted(level) {
  memoryCompletedLevels.add(level);
  let unlockedNew = false;
  const nextLvl = Math.min(50, level + 1);
  if (nextLvl > memoryHighestUnlocked) {
    memoryHighestUnlocked = nextLvl;
    unlockedNew = true;
  }
  if (AsyncStorage) {
    Promise.all([
      AsyncStorage.setItem(
        STORAGE_KEY_COMPLETED_LEVELS,
        JSON.stringify(Array.from(memoryCompletedLevels))
      ),
      AsyncStorage.setItem(
        STORAGE_KEY_HIGHEST_UNLOCKED,
        String(memoryHighestUnlocked)
      ),
    ]).catch(() => {});
  }
  checkAndUnlockAchievements();
  return {
    nextLevel: nextLvl,
    unlockedNew,
  };
}
export function getTotalCoins() {
  return memoryTotalCoins;
}
export function saveTotalCoins(coins) {
  memoryTotalCoins = Math.max(0, Math.floor(coins));
  if (AsyncStorage) {
    AsyncStorage.setItem(
      STORAGE_KEY_TOTAL_COINS,
      String(memoryTotalCoins)
    ).catch(() => {});
  }
  checkAndUnlockAchievements();
  return memoryTotalCoins;
}
export function isRewardClaimed(level) {
  return memoryClaimedLevels.has(level);
}
export function getClaimedLevels() {
  return Array.from(memoryClaimedLevels);
}
/**
 * Awards 50 virtual coins for the FIRST completion of a level.
 * Prevents duplicate rewards when the same level is replayed.
 * Saves immediately to persistent storage.
 */
export function claimLevelReward(level) {
  if (memoryClaimedLevels.has(level)) {
    return {
      awarded: false,
      coinsAwarded: 0,
      newTotal: memoryTotalCoins,
    };
  }
  memoryClaimedLevels.add(level);
  memoryTotalCoins += COINS_PER_LEVEL;
  if (AsyncStorage) {
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_TOTAL_COINS, String(memoryTotalCoins)),
      AsyncStorage.setItem(
        STORAGE_KEY_CLAIMED_LEVELS,
        JSON.stringify(Array.from(memoryClaimedLevels))
      ),
    ]).catch(() => {});
  }
  return {
    awarded: true,
    coinsAwarded: COINS_PER_LEVEL,
    newTotal: memoryTotalCoins,
  };
}
export function getSoundPreferences() {
  return {
    soundEnabled: memorySoundEnabled,
    musicEnabled: memoryMusicEnabled,
  };
}
export function setSoundPreferences(soundEnabled, musicEnabled) {
  memorySoundEnabled = soundEnabled;
  memoryMusicEnabled = musicEnabled;
  if (AsyncStorage) {
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_SOUND_ENABLED, String(soundEnabled)),
      AsyncStorage.setItem(STORAGE_KEY_MUSIC_ENABLED, String(musicEnabled)),
    ]).catch(() => {});
  }
}
/**
 * Resets all progression, unlocked levels, coins, and claimed rewards.
 * Only invoked when explicitly confirmed by the player.
 */
export function resetProgress() {
  memoryHighestUnlocked = 1;
  memoryLastPlayed = 1;
  memoryCompletedLevels.clear();
  memoryTotalCoins = 0;
  memoryClaimedLevels.clear();
  memoryLevelStars.clear();
  memoryUnlockedVehicles.clear();
  memoryUnlockedVehicles.add(DEFAULT_VEHICLE_ID);
  memorySelectedVehicle = DEFAULT_VEHICLE_ID;
  memorySeenWorldUnlocks.clear();
  memorySeenWorldUnlocks.add('green_valley');
  memoryDailyRewards = {
    lastClaimDate: null,
    currentDay: 1,
    claimedDays: [],
    streak: 0,
    totalClaimedCount: 0,
  };
  memoryUnlockedAchievements.clear();
  memoryClaimedAchievementRewards.clear();
  memoryAchievementTimestamps = {};
  memoryUsedPowerUpTypes.clear();
  memoryConsumedPowerUps.clear();
  memoryTutorialCompleted = false;
  isInitialized = true;
  if (AsyncStorage) {
    Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY_HIGHEST_UNLOCKED),
      AsyncStorage.removeItem(STORAGE_KEY_LAST_PLAYED),
      AsyncStorage.removeItem(STORAGE_KEY_COMPLETED_LEVELS),
      AsyncStorage.removeItem(STORAGE_KEY_TOTAL_COINS),
      AsyncStorage.removeItem(STORAGE_KEY_CLAIMED_LEVELS),
      AsyncStorage.removeItem(STORAGE_KEY_LEVEL_STARS),
      AsyncStorage.removeItem(STORAGE_KEY_UNLOCKED_VEHICLES),
      AsyncStorage.removeItem(STORAGE_KEY_SELECTED_VEHICLE),
      AsyncStorage.removeItem(STORAGE_KEY_SEEN_WORLD_UNLOCKS),
      AsyncStorage.removeItem(STORAGE_KEY_DAILY_REWARDS),
      AsyncStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS),
      AsyncStorage.removeItem(STORAGE_KEY_CONSUMED_POWERUPS),
      AsyncStorage.removeItem(STORAGE_KEY_TUTORIAL_COMPLETED),
    ]).catch(() => {});
  }
}
// ==========================================
// Level 1 Interactive Tutorial State
// ==========================================
export function isTutorialCompleted() {
  return memoryTutorialCompleted;
}
export function setTutorialCompleted(completed = true) {
  memoryTutorialCompleted = completed;
  if (AsyncStorage) {
    AsyncStorage.setItem(
      STORAGE_KEY_TUTORIAL_COMPLETED,
      String(completed)
    ).catch(() => {});
  }
}
export function resetTutorialProgress() {
  memoryTutorialCompleted = false;
  if (AsyncStorage) {
    AsyncStorage.removeItem(STORAGE_KEY_TUTORIAL_COMPLETED).catch(() => {});
  }
}
// ==========================================
// Consumed Power-Up Permanent Tracking
// ==========================================
export function consumePowerUp(level, powerUpId) {
  const key = `${level}:${powerUpId}`;
  memoryConsumedPowerUps.add(key);
  if (AsyncStorage) {
    AsyncStorage.setItem(
      STORAGE_KEY_CONSUMED_POWERUPS,
      JSON.stringify(Array.from(memoryConsumedPowerUps))
    ).catch(() => {});
  }
}
export function isPowerUpConsumed(level, powerUpId) {
  return memoryConsumedPowerUps.has(`${level}:${powerUpId}`);
}
export function getConsumedPowerUps() {
  return Array.from(memoryConsumedPowerUps);
}
export function resetConsumedPowerUpsForTesting() {
  memoryConsumedPowerUps.clear();
  if (AsyncStorage) {
    AsyncStorage.removeItem(STORAGE_KEY_CONSUMED_POWERUPS).catch(() => {});
  }
}
// ==========================================
// Vehicle Unlock & Garage Management
// ==========================================
export function getUnlockedVehicles() {
  return Array.from(memoryUnlockedVehicles);
}
export function isVehicleUnlocked(id) {
  return memoryUnlockedVehicles.has(id);
}
export function getSelectedVehicle() {
  return memorySelectedVehicle;
}
export function selectVehicle(id) {
  if (!memoryUnlockedVehicles.has(id)) {
    return false;
  }
  memorySelectedVehicle = id;
  if (AsyncStorage) {
    AsyncStorage.setItem(STORAGE_KEY_SELECTED_VEHICLE, id).catch(() => {});
  }
  return true;
}
export function unlockVehicle(id) {
  // Prevent duplicate purchases
  if (memoryUnlockedVehicles.has(id)) {
    return {
      success: false,
      error: 'Vehicle already unlocked',
      remainingCoins: memoryTotalCoins,
    };
  }
  const def = getVehicleById(id);
  if (memoryTotalCoins < def.price) {
    return {
      success: false,
      error: 'Insufficient coins',
      remainingCoins: memoryTotalCoins,
    };
  }
  memoryTotalCoins -= def.price;
  memoryUnlockedVehicles.add(id);
  memorySelectedVehicle = id; // Automatically equip newly unlocked vehicle
  if (AsyncStorage) {
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_TOTAL_COINS, String(memoryTotalCoins)),
      AsyncStorage.setItem(
        STORAGE_KEY_UNLOCKED_VEHICLES,
        JSON.stringify(Array.from(memoryUnlockedVehicles))
      ),
      AsyncStorage.setItem(STORAGE_KEY_SELECTED_VEHICLE, id),
    ]).catch(() => {});
  }
  return {
    success: true,
    remainingCoins: memoryTotalCoins,
  };
}
// ==========================================
// World Progression & Unlocks
// ==========================================
export function getUnlockedWorlds() {
  return WORLDS.filter((w) => memoryHighestUnlocked >= w.startLevel).map(
    (w) => w.id
  );
}
export function isWorldUnlockedById(worldId) {
  const world = getWorldById(worldId);
  return memoryHighestUnlocked >= world.startLevel;
}
export function hasSeenWorldUnlock(worldId) {
  return memorySeenWorldUnlocks.has(worldId);
}
export function markWorldUnlockSeen(worldId) {
  memorySeenWorldUnlocks.add(worldId);
  if (AsyncStorage) {
    AsyncStorage.setItem(
      STORAGE_KEY_SEEN_WORLD_UNLOCKS,
      JSON.stringify(Array.from(memorySeenWorldUnlocks))
    ).catch(() => {});
  }
}
/**
 * Checks if advancing to newUnlockedLevel unlocked a new world that the player hasn't seen yet.
 * Returns the WorldConfig if a new world was unlocked, or null otherwise.
 */
export function checkNewWorldUnlock(newUnlockedLevel) {
  for (const world of WORLDS) {
    if (world.id === 'green_valley') continue; // World 1 is unlocked from the start
    if (
      newUnlockedLevel >= world.startLevel &&
      !memorySeenWorldUnlocks.has(world.id)
    ) {
      return world;
    }
  }
  return null;
}
// ==========================================
// Daily Rewards System (7-Day Cycle)
// ==========================================
export function getDailyRewardsData() {
  return { ...memoryDailyRewards };
}
/**
 * Calculates current status for Daily Rewards based on calendar day.
 * - Compares YYYY-MM-DD strings so timezone / calendar boundaries work reliably.
 * - Allows exactly one claim per calendar day.
 * - If last claimed yesterday: streak continues to next day (1..7).
 * - If completed Day 7: next consecutive day begins new 7-day cycle at Day 1.
 * - If missed 1+ days: streak resets to Day 1 (level progress is NEVER reset).
 */
export function getDailyRewardsStatus(referenceDate = new Date()) {
  const todayStr = formatDateToYYYYMMDD(referenceDate);
  const lastClaim = memoryDailyRewards.lastClaimDate;
  // Never claimed before
  if (!lastClaim) {
    return {
      canClaimToday: true,
      todayDay: 1,
      lastClaimDate: null,
      claimedDays: [],
      streak: 0,
      todayReward: DAILY_REWARDS_7_DAYS[0],
      isClaimedToday: false,
      cycleCompleted: false,
    };
  }
  // Claimed today already
  if (lastClaim === todayStr) {
    const dayIndex = Math.max(1, Math.min(7, memoryDailyRewards.currentDay));
    return {
      canClaimToday: false,
      todayDay: dayIndex,
      lastClaimDate: lastClaim,
      claimedDays: [...memoryDailyRewards.claimedDays],
      streak: memoryDailyRewards.streak,
      todayReward: DAILY_REWARDS_7_DAYS[dayIndex - 1],
      isClaimedToday: true,
      cycleCompleted: memoryDailyRewards.claimedDays.length === 7,
    };
  }
  const diffDays = getCalendarDayDiff(lastClaim, todayStr);
  // If clock was moved backwards into past
  if (diffDays < 0) {
    const dayIndex = Math.max(1, Math.min(7, memoryDailyRewards.currentDay));
    return {
      canClaimToday: false,
      todayDay: dayIndex,
      lastClaimDate: lastClaim,
      claimedDays: [...memoryDailyRewards.claimedDays],
      streak: memoryDailyRewards.streak,
      todayReward: DAILY_REWARDS_7_DAYS[dayIndex - 1],
      isClaimedToday: true,
      cycleCompleted: memoryDailyRewards.claimedDays.length === 7,
    };
  }
  // Exactly next calendar day (consecutive claim)
  if (diffDays === 1) {
    // If player completed Day 7 on previous day, roll over to Day 1
    if (
      memoryDailyRewards.currentDay >= 7 &&
      memoryDailyRewards.claimedDays.length >= 7
    ) {
      return {
        canClaimToday: true,
        todayDay: 1,
        lastClaimDate: lastClaim,
        claimedDays: [],
        streak: memoryDailyRewards.streak,
        todayReward: DAILY_REWARDS_7_DAYS[0],
        isClaimedToday: false,
        cycleCompleted: false,
      };
    } else {
      const nextDay = Math.min(7, memoryDailyRewards.currentDay + 1);
      return {
        canClaimToday: true,
        todayDay: nextDay,
        lastClaimDate: lastClaim,
        claimedDays: [...memoryDailyRewards.claimedDays],
        streak: memoryDailyRewards.streak,
        todayReward: DAILY_REWARDS_7_DAYS[nextDay - 1],
        isClaimedToday: false,
        cycleCompleted: false,
      };
    }
  }
  // Missed one or more days (diffDays > 1)
  // Streak restarts at Day 1; level progress remains untouched!
  return {
    canClaimToday: true,
    todayDay: 1,
    lastClaimDate: lastClaim,
    claimedDays: [],
    streak: 0,
    todayReward: DAILY_REWARDS_7_DAYS[0],
    isClaimedToday: false,
    cycleCompleted: false,
  };
}
/**
 * Claims today's daily reward if available.
 * Awards coins, persists date, advances streak, and prevents duplicate claims.
 */
export function claimDailyReward(referenceDate = new Date()) {
  const status = getDailyRewardsStatus(referenceDate);
  if (!status.canClaimToday) {
    return {
      success: false,
      error: 'ALREADY_CLAIMED_TODAY',
    };
  }
  const todayStr = formatDateToYYYYMMDD(referenceDate);
  const dayToClaim = status.todayDay;
  const reward = DAILY_REWARDS_7_DAYS[dayToClaim - 1];
  let newClaimedDays;
  if (dayToClaim === 1) {
    newClaimedDays = [1];
  } else {
    newClaimedDays = Array.from(new Set([...status.claimedDays, dayToClaim]));
  }
  const newStreak = (status.streak || 0) + 1;
  const newTotalCoins = saveTotalCoins(memoryTotalCoins + reward.coins);
  memoryDailyRewards = {
    lastClaimDate: todayStr,
    currentDay: dayToClaim,
    claimedDays: newClaimedDays,
    streak: newStreak,
    totalClaimedCount: (memoryDailyRewards.totalClaimedCount || 0) + 1,
  };
  if (AsyncStorage) {
    AsyncStorage.setItem(
      STORAGE_KEY_DAILY_REWARDS,
      JSON.stringify(memoryDailyRewards)
    ).catch(() => {});
  }
  return {
    success: true,
    reward,
    newTotalCoins,
    dayClaimed: dayToClaim,
  };
}
/**
 * Reset daily rewards state (primarily used in unit testing)
 */
export function resetDailyRewards() {
  memoryDailyRewards = {
    lastClaimDate: null,
    currentDay: 1,
    claimedDays: [],
    streak: 0,
    totalClaimedCount: 0,
  };
  if (AsyncStorage) {
    AsyncStorage.removeItem(STORAGE_KEY_DAILY_REWARDS).catch(() => {});
  }
}
// ==========================================
// Achievement & Badge System
// ==========================================
async function persistAchievements() {
  if (AsyncStorage) {
    try {
      const data = {
        unlockedIds: Array.from(memoryUnlockedAchievements),
        claimedRewardIds: Array.from(memoryClaimedAchievementRewards),
        unlockedTimestamps: { ...memoryAchievementTimestamps },
        usedPowerUpTypes: Array.from(memoryUsedPowerUpTypes),
      };
      await AsyncStorage.setItem(
        STORAGE_KEY_ACHIEVEMENTS,
        JSON.stringify(data)
      );
    } catch {
      // Ignore
    }
  }
}
/**
 * Records when a player collects/uses a power-up.
 * Checks if Power-Up Master achievement is unlocked.
 */
export function recordPowerUpUsage(type) {
  if (typeof type === 'string' && type.length > 0) {
    memoryUsedPowerUpTypes.add(type);
    persistAchievements();
    return checkAndUnlockAchievements();
  }
  return [];
}
export function getUsedPowerUpTypes() {
  return Array.from(memoryUsedPowerUpTypes);
}
/**
 * Computes live progress, locked/unlocked state, and completion percentage for all 7 achievements.
 */
export function getAchievementsProgress() {
  // 1. First Victory: Complete the first level
  const firstVictoryCurrent =
    memoryCompletedLevels.has(1) || memoryCompletedLevels.size > 0 ? 1 : 0;
  // 2. Coin Collector: Collect 100 coins
  const coinCollectorCurrent = Math.min(100, memoryTotalCoins);
  // 3. Super Driver: Complete 10 levels
  const superDriverCurrent = Math.min(10, memoryCompletedLevels.size);
  // 4. Perfect Driver: Earn 3 stars in 5 levels
  let threeStarCount = 0;
  memoryLevelStars.forEach((stars) => {
    if (stars >= 3) threeStarCount++;
  });
  const perfectDriverCurrent = Math.min(5, threeStarCount);
  // 5. World Explorer: Unlock all 5 worlds
  const worldExplorerCurrent = Math.min(5, getUnlockedWorlds().length);
  // 6. Power-Up Master: Use all three power-ups (magnet, shield, boost)
  const powerUpMasterCurrent = Math.min(3, memoryUsedPowerUpTypes.size);
  // 7. Champion: Complete all 50 levels
  const championCurrent = Math.min(50, memoryCompletedLevels.size);
  const currents = {
    first_victory: firstVictoryCurrent,
    coin_collector: coinCollectorCurrent,
    super_driver: superDriverCurrent,
    perfect_driver: perfectDriverCurrent,
    world_explorer: worldExplorerCurrent,
    powerup_master: powerUpMasterCurrent,
    champion: championCurrent,
  };
  return ACHIEVEMENTS.map((def) => {
    const isUnlocked = memoryUnlockedAchievements.has(def.id);
    const isClaimed = memoryClaimedAchievementRewards.has(def.id);
    const current = isUnlocked ? def.target : currents[def.id];
    const percent = Math.min(100, Math.round((current / def.target) * 100));
    return {
      id: def.id,
      definition: def,
      current,
      target: def.target,
      isUnlocked,
      isClaimed,
      unlockedAt: memoryAchievementTimestamps[def.id],
      percent,
    };
  });
}
/**
 * Runs a progress-saving action and returns every achievement it unlocked, including ones
 * unlocked internally by saveTotalCoins / saveLevelStars (whose results are not returned).
 */
export function collectNewlyUnlockedAchievements(action) {
  const before = new Set(memoryUnlockedAchievements);
  action();
  checkAndUnlockAchievements();
  return Array.from(memoryUnlockedAchievements).filter((id) => !before.has(id));
}
/**
 * Checks all achievement conditions against current game progress.
 * Unlocks any newly qualified achievements, saves them, and returns their IDs.
 */
export function checkAndUnlockAchievements(persist = true) {
  const progresses = getAchievementsProgress();
  const newlyUnlocked = [];
  for (const p of progresses) {
    if (!memoryUnlockedAchievements.has(p.id) && p.current >= p.target) {
      memoryUnlockedAchievements.add(p.id);
      memoryAchievementTimestamps[p.id] = new Date().toISOString();
      newlyUnlocked.push(p.id);
    }
  }
  if (newlyUnlocked.length > 0 && persist) {
    persistAchievements();
  }
  return newlyUnlocked;
}
/**
 * Claims bonus coins for an unlocked achievement.
 * NEVER awards the same achievement reward twice.
 */
export function claimAchievementReward(id) {
  if (!memoryUnlockedAchievements.has(id)) {
    return {
      success: false,
      coinsAwarded: 0,
      newTotalCoins: memoryTotalCoins,
      error: 'ACHIEVEMENT_LOCKED',
    };
  }
  if (memoryClaimedAchievementRewards.has(id)) {
    return {
      success: false,
      coinsAwarded: 0,
      newTotalCoins: memoryTotalCoins,
      error: 'ALREADY_CLAIMED',
    };
  }
  const def = getAchievementById(id);
  memoryClaimedAchievementRewards.add(id);
  const newCoins = saveTotalCoins(memoryTotalCoins + def.rewardCoins);
  persistAchievements();
  return {
    success: true,
    coinsAwarded: def.rewardCoins,
    newTotalCoins: newCoins,
  };
}
export function getTotalUnlockedAchievementsCount() {
  return memoryUnlockedAchievements.size;
}
export function getUnclaimedAchievementsCount() {
  let count = 0;
  for (const id of memoryUnlockedAchievements) {
    if (!memoryClaimedAchievementRewards.has(id)) {
      count++;
    }
  }
  return count;
}
export function isAchievementUnlocked(id) {
  return memoryUnlockedAchievements.has(id);
}
export function isAchievementRewardClaimed(id) {
  return memoryClaimedAchievementRewards.has(id);
}
export function resetAchievements() {
  memoryUnlockedAchievements.clear();
  memoryClaimedAchievementRewards.clear();
  memoryAchievementTimestamps = {};
  memoryUsedPowerUpTypes.clear();
  if (AsyncStorage) {
    AsyncStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS).catch(() => {});
  }
}
