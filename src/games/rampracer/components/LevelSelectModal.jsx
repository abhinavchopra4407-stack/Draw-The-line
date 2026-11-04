/**
 * Ramp Racer - Professional, Colourful and Child-Friendly Level Progression Map.
 *
 * Features:
 * 1. Visual 50-Level Winding Progression Path (S-curve adventure trail).
 * 2. 5 Distinct Themed Worlds:
 *    - Green Valley (Levels 1–10)
 *    - Desert World (Levels 11–20)
 *    - Snow World (Levels 21–30)
 *    - Candy World (Levels 31–40)
 *    - Space World (Levels 41–50)
 * 3. 3 Distinct Level States:
 *    - Completed Levels: Emerald/gold glossy circle, 1-3 earned stars, checkmark badge (✓).
 *    - Unlocked / Current Playable Levels: Vibrant glowing circle, pulsing beacon, floating car pointer.
 *    - Locked Levels: Slate grey stone circle, lock icon (🔒), locked feedback toast.
 * 4. Rich Child-Friendly Decorative Scenery:
 *    - Trees, roads, hills, clouds, cacti, pyramids, snowmen, crystals, cupcakes, planets, rockets, flags, and trophies.
 * 5. Player Progress Dashboard:
 *    - Total stars (⭐ X / 150), total coins (🪙 X), completed levels (🏆 X / 50), and current level.
 * 6. Smooth Scrolling & Navigation:
 *    - Auto-scrolls to current level when opened.
 *    - Quick world-jump tabs (Green Valley, Desert, Snow, Candy, Space).
 *    - Floating "📍 CURRENT" button to quickly center the active level.
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TOTAL_LEVELS } from '../data/levels';
import { soundManager } from '../audio/soundManager';
import { WORLDS, isWorldUnlocked } from '../types/worlds';
import { getCompletedLevels } from '../utils/levelStorage';
// Serpentine horizontal offsets for 10 levels in each world
const WINDING_OFFSETS = [0, 56, 88, 58, 0, -58, -88, -56, 0, 0];
// Step height for each level row in px
const LEVEL_STEP_HEIGHT = 92;
const WORLD_BANNER_HEIGHT = 100;
const WORLD_BLOCK_HEIGHT = WORLD_BANNER_HEIGHT + 10 * LEVEL_STEP_HEIGHT + 24;
// Thematic decorative scenery for all 50 levels
const LEVEL_DECORATIONS = {
  // World 1: Green Valley (1-10)
  1: { emoji: '🏁', label: 'START LINE', side: 'left' },
  2: { emoji: '🌲🌲', label: 'Meadow', side: 'left' },
  3: { emoji: '☁️', label: 'Sunny Hills', side: 'left' },
  4: { emoji: '🌸🦋', label: 'Blossoms', side: 'left' },
  5: { emoji: '🪧', label: 'Valley Trail', side: 'right' },
  6: { emoji: '🌳🍄', label: 'Oak Grove', side: 'right' },
  7: { emoji: '🌲🐦', label: 'Pine Ridge', side: 'right' },
  8: { emoji: '🌄🌺', label: 'Lookout', side: 'right' },
  9: { emoji: '☁️', label: 'Sky Pass', side: 'left' },
  10: { emoji: '🌿👑', label: 'Valley Summit', side: 'center' },
  // World 2: Desert World (11-20)
  11: { emoji: '🏜️🌵', label: 'Canyon Gate', side: 'left' },
  12: { emoji: '☀️🌾', label: 'Dunes', side: 'left' },
  13: { emoji: '🪨', label: 'Sun Rock', side: 'left' },
  14: { emoji: '🌴💧', label: 'Oasis Spring', side: 'left' },
  15: { emoji: '⚱️🏜️', label: 'Pyramids', side: 'right' },
  16: { emoji: '🌵🌵', label: 'Cactus Plain', side: 'right' },
  17: { emoji: '🐪', label: 'Caravan', side: 'right' },
  18: { emoji: '🏜️', label: 'Red Mesa', side: 'right' },
  19: { emoji: '🌴🏺', label: 'Palm Haven', side: 'left' },
  20: { emoji: '🏛️🔥', label: 'Desert Fortress', side: 'center' },
  // World 3: Snow World (21-30)
  21: { emoji: '❄️🌲', label: 'Frost Peak', side: 'left' },
  22: { emoji: '⛄', label: 'Snowman', side: 'left' },
  23: { emoji: '🌨️💎', label: 'Ice Cave', side: 'left' },
  24: { emoji: '🏔️', label: 'Twin Peaks', side: 'left' },
  25: { emoji: '🧊', label: 'Polar Igloo', side: 'right' },
  26: { emoji: '💎❄️', label: 'Glacier', side: 'right' },
  27: { emoji: '🐾', label: 'Bear Tracks', side: 'right' },
  28: { emoji: '🌲❄️', label: 'Frozen Pine', side: 'right' },
  29: { emoji: '✨🌌', label: 'Aurora', side: 'left' },
  30: { emoji: '🏰❄️', label: 'Ice Palace', side: 'center' },
  // World 4: Candy World (31-40)
  31: { emoji: '🍭🍬', label: 'Sugar Land', side: 'left' },
  32: { emoji: '🧁', label: 'Cupcake Hill', side: 'left' },
  33: { emoji: '🍬🍬', label: 'Candy Canes', side: 'left' },
  34: { emoji: '🐻', label: 'Gummy Valley', side: 'left' },
  35: { emoji: '🍩', label: 'Donut Peak', side: 'right' },
  36: { emoji: '🍡☁️', label: 'Marshmallow', side: 'right' },
  37: { emoji: '🍫', label: 'Choco Trail', side: 'right' },
  38: { emoji: '🍨✨', label: 'Sundae Hill', side: 'right' },
  39: { emoji: '🍬🌈', label: 'Jelly Drops', side: 'left' },
  40: { emoji: '🎪👑', label: 'Candy Kingdom', side: 'center' },
  // World 5: Space World (41-50)
  41: { emoji: '🚀🌌', label: 'Launch Pad', side: 'left' },
  42: { emoji: '🌙', label: 'Moon Orbit', side: 'left' },
  43: { emoji: '🪐', label: 'Saturn Rings', side: 'left' },
  44: { emoji: '☄️', label: 'Comet Belt', side: 'left' },
  45: { emoji: '🛰️', label: 'Satellite', side: 'right' },
  46: { emoji: '🌌✨', label: 'Nebula', side: 'right' },
  47: { emoji: '🛸', label: 'Flying Saucer', side: 'right' },
  48: { emoji: '⚡🛸', label: 'Pulsar Station', side: 'right' },
  49: { emoji: '🌠', label: 'Star Dust', side: 'left' },
  50: { emoji: '🏆👑', label: 'CHAMPION PODIUM', side: 'center' },
};
export const LevelSelectModal = ({
  visible,
  currentLevel,
  highestUnlockedLevel,
  levelStars = {},
  totalStars = 0,
  totalCoins = 0,
  completedLevels,
  onSelectLevel,
  onClose,
}) => {
  const scrollViewRef = useRef(null);
  // Animations: Avatar bounce and pulsing beacon ring for current level
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Child-friendly locked level toast notification
  const [lockedToast, setLockedToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  // Compute completed level count
  const completedCount = useMemo(() => {
    if (completedLevels && completedLevels.length > 0) {
      return completedLevels.length;
    }
    try {
      const stored = getCompletedLevels();
      if (stored && stored.length > 0) return stored.length;
    } catch {
      // Fallback
    }
    return Object.keys(levelStars).filter(
      (k) => (levelStars[Number(k)] ?? 0) > 0
    ).length;
  }, [completedLevels, levelStars]);
  // Set of completed levels for quick O(1) lookup
  const completedSet = useMemo(() => {
    const set = new Set();
    if (completedLevels) {
      completedLevels.forEach((l) => set.add(l));
    }
    Object.keys(levelStars).forEach((k) => {
      const lvl = Number(k);
      if ((levelStars[lvl] ?? 0) > 0) set.add(lvl);
    });
    return set;
  }, [completedLevels, levelStars]);
  // Start continuous floating and pulsing animations
  useEffect(() => {
    if (process.env?.NODE_ENV === 'test') {
      return;
    }
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    pulseLoop.start();
    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, pulseAnim]);
  // Auto-scroll to active level on open
  useEffect(() => {
    if (process.env?.NODE_ENV === 'test') {
      return;
    }
    if (visible) {
      const targetLevel = currentLevel || highestUnlockedLevel || 1;
      const worldIndex = Math.floor((targetLevel - 1) / 10);
      const levelIndexInWorld = (targetLevel - 1) % 10;
      const targetY = Math.max(
        0,
        worldIndex * WORLD_BLOCK_HEIGHT +
          WORLD_BANNER_HEIGHT +
          levelIndexInWorld * LEVEL_STEP_HEIGHT -
          180
      );
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [visible, currentLevel, highestUnlockedLevel]);
  // Handle Level Tap
  const handleLevelPress = (level) => {
    const isUnlocked = level <= highestUnlockedLevel;
    if (isUnlocked) {
      soundManager.playSfx('btn_click');
      onSelectLevel(level);
      onClose();
    } else {
      soundManager.playSfx('obstacle_hit');
      showLockedToast(
        `🔒 Complete Level ${level - 1} to unlock Level ${level}!`
      );
    }
  };
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);
  const showLockedToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setLockedToast(msg);
    if (process.env?.NODE_ENV !== 'test') {
      toastTimeoutRef.current = setTimeout(() => {
        setLockedToast(null);
      }, 2400);
    }
  };
  // Quick jump to a world
  const handleWorldJump = (worldIdx) => {
    soundManager.playSfx('btn_click');
    const targetY = Math.max(0, worldIdx * WORLD_BLOCK_HEIGHT);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  };
  // Quick jump to current level
  const handleJumpToCurrent = () => {
    soundManager.playSfx('btn_click');
    const targetLevel = highestUnlockedLevel || currentLevel || 1;
    const worldIndex = Math.floor((targetLevel - 1) / 10);
    const levelIndexInWorld = (targetLevel - 1) % 10;
    const targetY = Math.max(
      0,
      worldIndex * WORLD_BLOCK_HEIGHT +
        WORLD_BANNER_HEIGHT +
        levelIndexInWorld * LEVEL_STEP_HEIGHT -
        180
    );
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Top Header & Player Progress Dashboard */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>🗺️ SELECT LEVEL</Text>
                <View style={styles.pathSubBadge}>
                  <Text style={styles.pathSubText}>ADVENTURE MAP</Text>
                </View>
              </View>

              {/* Progress Dashboard */}
              <View style={styles.statsRow}>
                {/* Total Stars Counter */}
                <View style={styles.starBadge}>
                  <Text style={styles.badgeIcon}>⭐</Text>
                  <Text style={styles.badgeText}>
                    {`${totalStars} / ${TOTAL_LEVELS * 3}`}
                  </Text>
                </View>

                {/* Total Coins Counter */}
                <View style={styles.coinBadge}>
                  <Text style={styles.badgeIcon}>🪙</Text>
                  <Text style={styles.badgeText}>{totalCoins}</Text>
                </View>

                {/* Levels Completed Counter */}
                <View style={styles.completedBadge}>
                  <Text style={styles.badgeIcon}>🏆</Text>
                  <Text
                    style={styles.badgeText}
                  >{`${completedCount}/${TOTAL_LEVELS}`}</Text>
                </View>

                {/* Current Unlocked Level Indicator */}
                <View style={styles.currentUnlockedBadge}>
                  <Text style={styles.badgeIcon}>📍</Text>
                  <Text
                    style={styles.badgeText}
                  >{`Lvl ${highestUnlockedLevel}`}</Text>
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close Level Select"
              style={styles.closeBtn}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick World Navigation Bar */}
          <View style={styles.worldTabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.worldTabContent}
            >
              {WORLDS.map((w, idx) => {
                const isUnlocked = isWorldUnlocked(w, highestUnlockedLevel);
                const isCurrentWorld =
                  highestUnlockedLevel >= w.startLevel &&
                  highestUnlockedLevel <= w.endLevel;
                return (
                  <TouchableOpacity
                    key={`world-tab-${w.id}`}
                    activeOpacity={0.8}
                    onPress={() => handleWorldJump(idx)}
                    style={[
                      styles.worldTabItem,
                      isCurrentWorld && styles.worldTabItemActive,
                      { borderColor: w.accentColor },
                    ]}
                  >
                    <Text style={styles.worldTabIcon}>{w.icon}</Text>
                    <Text
                      style={[
                        styles.worldTabText,
                        isCurrentWorld && styles.worldTabTextActive,
                      ]}
                    >
                      {w.name.toUpperCase()}
                    </Text>
                    {!isUnlocked && <Text style={styles.worldTabLock}>🔒</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Scrollable Progression Winding Map */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {WORLDS.map((world, wIdx) => {
              const worldUnlocked = isWorldUnlocked(
                world,
                highestUnlockedLevel
              );
              const worldLevels = Array.from(
                { length: world.endLevel - world.startLevel + 1 },
                (_, i) => world.startLevel + i
              );
              // Calculate stars collected in this specific world
              let worldStarsEarned = 0;
              let worldCompletedCount = 0;
              worldLevels.forEach((lvl) => {
                const s = levelStars[lvl] ?? 0;
                worldStarsEarned += s;
                if (completedSet.has(lvl) || s > 0) {
                  worldCompletedCount += 1;
                }
              });
              return (
                <View
                  key={`world-map-${world.id}`}
                  style={[
                    styles.worldBlock,
                    !worldUnlocked && styles.worldBlockLocked,
                  ]}
                >
                  {/* World Gateway Banner */}
                  <View
                    style={[
                      styles.worldGatewayBanner,
                      {
                        backgroundColor: world.headerBadgeBg,
                        borderColor: world.accentColor,
                      },
                    ]}
                  >
                    <View style={styles.worldGatewayLeft}>
                      <Text style={styles.worldGatewayIcon}>{world.icon}</Text>
                      <View>
                        <Text style={styles.worldGatewayTitle}>
                          {world.name.toUpperCase()}
                        </Text>
                        <Text style={styles.worldGatewaySubtitle}>
                          {`Levels ${world.startLevel}–${world.endLevel} • ${world.subtitle}`}
                        </Text>
                      </View>
                    </View>

                    {/* World Status & Star Counter */}
                    <View
                      style={[
                        styles.worldProgressPill,
                        worldUnlocked
                          ? { backgroundColor: world.accentColor }
                          : styles.worldProgressPillLocked,
                      ]}
                    >
                      {worldUnlocked ? (
                        <Text style={styles.worldProgressText}>
                          {`⭐ ${worldStarsEarned}/${worldLevels.length * 3}`}
                        </Text>
                      ) : (
                        <Text style={styles.worldProgressText}>
                          {`🔒 Lvl ${world.startLevel}`}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* 10 Winding Levels Path */}
                  <View style={styles.pathTrailContainer}>
                    {worldLevels.map((level, lvlIdx) => {
                      const isUnlocked = level <= highestUnlockedLevel;
                      const isCurrent = level === currentLevel;
                      const isHighestUnlocked = level === highestUnlockedLevel;
                      const isCompleted =
                        completedSet.has(level) || (levelStars[level] ?? 0) > 0;
                      const stars = levelStars[level] ?? 0;
                      const offset = WINDING_OFFSETS[lvlIdx] ?? 0;
                      const nextOffset =
                        lvlIdx < 9 ? WINDING_OFFSETS[lvlIdx + 1] : 0;
                      const decoration = LEVEL_DECORATIONS[level];
                      return (
                        <View
                          key={`map-lvl-${level}`}
                          style={styles.levelRowContainer}
                        >
                          {/* Stepping Trail Dots connecting to next level */}
                          {lvlIdx < 9 && (
                            <View
                              pointerEvents="none"
                              style={[
                                styles.trailDotsWrapper,
                                {
                                  left: `50%`,
                                  transform: [
                                    {
                                      translateX: (offset + nextOffset) / 2 - 4,
                                    },
                                  ],
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.trailDot,
                                  isUnlocked
                                    ? styles.trailDotUnlocked
                                    : styles.trailDotLocked,
                                ]}
                              />
                              <View
                                style={[
                                  styles.trailDot,
                                  styles.trailDotMid,
                                  isUnlocked
                                    ? styles.trailDotUnlocked
                                    : styles.trailDotLocked,
                                ]}
                              />
                              <View
                                style={[
                                  styles.trailDot,
                                  isUnlocked
                                    ? styles.trailDotUnlocked
                                    : styles.trailDotLocked,
                                ]}
                              />
                            </View>
                          )}

                          {/* Decorative Side Scenery Element */}
                          {decoration && (
                            <View
                              pointerEvents="none"
                              style={[
                                styles.decorationPlacement,
                                decoration.side === 'left' && styles.decLeft,
                                decoration.side === 'right' && styles.decRight,
                                decoration.side === 'center' &&
                                  styles.decCenter,
                              ]}
                            >
                              <Text style={styles.decorationEmoji}>
                                {decoration.emoji}
                              </Text>
                              {decoration.label && (
                                <Text style={styles.decorationLabel}>
                                  {decoration.label}
                                </Text>
                              )}
                            </View>
                          )}

                          {/* The Circular Level Node (with horizontal offset) */}
                          <View
                            style={[
                              styles.nodeWrapper,
                              { transform: [{ translateX: offset }] },
                            ]}
                          >
                            {/* Current / Highest Playable Level Avatar Pointer */}
                            {(isCurrent ||
                              (isHighestUnlocked && !isCompleted)) && (
                              <Animated.View
                                pointerEvents="none"
                                style={[
                                  styles.currentPointer,
                                  { transform: [{ translateY: floatAnim }] },
                                ]}
                              >
                                <View
                                  pointerEvents="none"
                                  style={styles.pointerBadge}
                                >
                                  <Text style={styles.pointerBadgeIcon}>
                                    🏎️
                                  </Text>
                                  <Text style={styles.pointerBadgeText}>
                                    PLAY
                                  </Text>
                                </View>
                                <View
                                  pointerEvents="none"
                                  style={styles.pointerArrow}
                                />
                              </Animated.View>
                            )}

                            {/* Pulsing Beacon Ring for Current Level */}
                            {(isCurrent ||
                              (isHighestUnlocked && !isCompleted)) && (
                              <Animated.View
                                pointerEvents="none"
                                style={[
                                  styles.pulsingRing,
                                  { transform: [{ scale: pulseAnim }] },
                                ]}
                              />
                            )}

                            {/* Circular Button */}
                            <TouchableOpacity
                              accessibilityRole="button"
                              accessibilityLabel={`Level ${level}, ${
                                isCompleted
                                  ? `${stars} stars earned`
                                  : isUnlocked
                                  ? 'unlocked'
                                  : 'locked'
                              }`}
                              activeOpacity={0.75}
                              onPress={() => handleLevelPress(level)}
                              style={[
                                styles.circularNode,
                                isCompleted
                                  ? styles.completedNode
                                  : isUnlocked
                                  ? styles.unlockedNode
                                  : styles.lockedNode,
                                isCurrent && styles.currentNodeBorder,
                              ]}
                            >
                              {/* 3D Gloss Sheen for unlocked / completed */}
                              {isUnlocked && (
                                <View
                                  pointerEvents="none"
                                  style={styles.nodeGloss}
                                />
                              )}

                              {/* Completed Checkmark Badge */}
                              {isCompleted && (
                                <View
                                  pointerEvents="none"
                                  style={styles.checkBadge}
                                >
                                  <Text style={styles.checkText}>✓</Text>
                                </View>
                              )}

                              {/* Center Content: Level Number or Lock Icon */}
                              {isUnlocked ? (
                                <Text
                                  pointerEvents="none"
                                  style={[
                                    styles.nodeNumberText,
                                    isCurrent && styles.currentNodeText,
                                  ]}
                                >
                                  {level}
                                </Text>
                              ) : (
                                <View
                                  pointerEvents="none"
                                  style={styles.lockedCenter}
                                >
                                  <Text style={styles.nodeLockIcon}>🔒</Text>
                                  <Text style={styles.nodeLockedNum}>
                                    {level}
                                  </Text>
                                </View>
                              )}
                            </TouchableOpacity>

                            {/* 3-Star Rating Display below node */}
                            <View style={styles.nodeStarsContainer}>
                              {isCompleted ? (
                                <View style={styles.starRow}>
                                  <Text
                                    style={[
                                      styles.starText,
                                      stars >= 1
                                        ? styles.starEarned
                                        : styles.starEmpty,
                                    ]}
                                  >
                                    ★
                                  </Text>
                                  <Text
                                    style={[
                                      styles.starText,
                                      stars >= 2
                                        ? styles.starEarned
                                        : styles.starEmpty,
                                    ]}
                                  >
                                    ★
                                  </Text>
                                  <Text
                                    style={[
                                      styles.starText,
                                      stars >= 3
                                        ? styles.starEarned
                                        : styles.starEmpty,
                                    ]}
                                  >
                                    ★
                                  </Text>
                                </View>
                              ) : isUnlocked ? (
                                <View style={styles.starRow}>
                                  <Text style={styles.starUnplayed}>☆</Text>
                                  <Text style={styles.starUnplayed}>☆</Text>
                                  <Text style={styles.starUnplayed}>☆</Text>
                                </View>
                              ) : (
                                <View style={styles.starRow}>
                                  <View style={styles.lockedDot} />
                                  <View style={styles.lockedDot} />
                                  <View style={styles.lockedDot} />
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Grand Finish Podium at the end of Level 50 */}
            <View style={styles.grandFinishCard}>
              <Text style={styles.grandTrophyIcon}>🏆</Text>
              <Text style={styles.grandFinishTitle}>RAMP RACER CHAMPION!</Text>
              <Text style={styles.grandFinishSubtitle}>
                Complete all 50 levels to conquer the cosmos!
              </Text>
              <View style={styles.finishFlagRow}>
                <Text style={styles.flagIcon}>🏁</Text>
                <Text style={styles.finishStatusText}>
                  {completedCount >= 50
                    ? '🎉 ALL 50 LEVELS COMPLETED! YOU ARE A LEGEND!'
                    : `KEEP RACING: ${50 - completedCount} LEVELS REMAINING`}
                </Text>
                <Text style={styles.flagIcon}>🏁</Text>
              </View>
            </View>
          </ScrollView>

          {/* Floating "📍 CURRENT" quick button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Jump to current level"
            activeOpacity={0.85}
            onPress={handleJumpToCurrent}
            style={styles.floatingCurrentBtn}
          >
            <Text style={styles.floatingCurrentIcon}>📍</Text>
            <Text style={styles.floatingCurrentText}>CURRENT</Text>
          </TouchableOpacity>

          {/* Locked feedback toast banner */}
          {lockedToast && (
            <View pointerEvents="none" style={styles.lockedToast}>
              <Text style={styles.lockedToastText}>{lockedToast}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 20, 40, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  container: {
    width: '100%',
    maxWidth: 520,
    height: '92%',
    backgroundColor: '#0A2540',
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 16,
  },
  /* Top Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F3860',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#0369A1',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  pathSubBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  pathSubText: {
    color: '#7DD3FC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  /* Player Stats Dashboard */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.2,
    borderColor: '#FFD700',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.2,
    borderColor: '#F59E0B',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.2,
    borderColor: '#10B981',
  },
  currentUnlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.2,
    borderColor: '#38BDF8',
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  /* Close Button */
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    includeFontPadding: false,
    lineHeight: 20,
  },
  /* World Quick-Jump Tabs */
  worldTabBar: {
    backgroundColor: '#07203A',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
  },
  worldTabContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  worldTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 45, 75, 0.8)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
  },
  worldTabItemActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.35)',
  },
  worldTabIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  worldTabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  worldTabTextActive: {
    color: '#38BDF8',
  },
  worldTabLock: {
    fontSize: 10,
    marginLeft: 4,
  },
  /* Toast Notification */
  lockedToast: {
    position: 'absolute',
    top: 135,
    left: 24,
    right: 24,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '#FECACA',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 20,
  },
  lockedToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  /* Scrollable Map Area */
  scrollArea: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  scrollContent: {
    paddingBottom: 48,
    paddingTop: 8,
  },
  /* World Block */
  worldBlock: {
    marginBottom: 16,
  },
  worldBlockLocked: {
    opacity: 0.72,
  },
  /* World Gateway Banner */
  worldGatewayBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  worldGatewayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  worldGatewayIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  worldGatewayTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  worldGatewaySubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  worldProgressPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  worldProgressPillLocked: {
    backgroundColor: '#334155',
  },
  worldProgressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  /* Path Container */
  pathTrailContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  levelRowContainer: {
    width: '100%',
    height: LEVEL_STEP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  /* Stepping Trail Dots */
  trailDotsWrapper: {
    position: 'absolute',
    top: 54,
    height: 40,
    width: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  trailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trailDotMid: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trailDotUnlocked: {
    backgroundColor: '#FDE047',
    borderWidth: 1,
    borderColor: '#B45309',
  },
  trailDotLocked: {
    backgroundColor: '#475569',
  },
  /* Side Decorative Scenery */
  decorationPlacement: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    maxWidth: 100,
  },
  decLeft: {
    left: 20,
  },
  decRight: {
    right: 20,
  },
  decCenter: {
    left: 20,
  },
  decorationEmoji: {
    fontSize: 26,
  },
  decorationLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
    backgroundColor: 'rgba(10, 30, 50, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  /* Node Wrapper */
  nodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: 84,
  },
  /* Avatar Pointer above Current Level */
  currentPointer: {
    position: 'absolute',
    top: -34,
    alignItems: 'center',
    zIndex: 20,
  },
  pointerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 6,
  },
  pointerBadgeIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  pointerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pointerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
  },
  /* Pulsing Beacon Ring */
  pulsingRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(250, 204, 21, 0.7)',
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    zIndex: 5,
  },
  /* Circular Level Nodes */
  circularNode: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 6,
  },
  completedNode: {
    backgroundColor: '#059669',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  unlockedNode: {
    backgroundColor: '#EA580C',
    borderWidth: 3,
    borderColor: '#FDE047',
  },
  lockedNode: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    opacity: 0.85,
  },
  currentNodeBorder: {
    borderColor: '#FFFFFF',
    borderWidth: 3.5,
  },
  /* Gloss Sheen */
  nodeGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
  },
  /* Completed Checkmark Badge */
  checkBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
  /* Center Typography */
  nodeNumberText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  currentNodeText: {
    color: '#FEF08A',
  },
  lockedCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLockIcon: {
    fontSize: 16,
    opacity: 0.8,
  },
  nodeLockedNum: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: -2,
  },
  /* 3 Stars Container below Node */
  nodeStarsContainer: {
    marginTop: 3,
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    fontSize: 10,
    marginHorizontal: 0.5,
  },
  starEarned: {
    color: '#FACC15',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  starEmpty: {
    color: 'rgba(15, 23, 42, 0.65)',
  },
  starUnplayed: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 0.5,
  },
  lockedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 2,
  },
  /* Grand Finish Card */
  grandFinishCard: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#FACC15',
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  grandTrophyIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  grandFinishTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 1.5,
  },
  grandFinishSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  finishFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  flagIcon: {
    fontSize: 16,
    marginHorizontal: 6,
  },
  finishStatusText: {
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  /* Floating Current Level Button */
  floatingCurrentBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#7DD3FC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 10,
  },
  floatingCurrentIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  floatingCurrentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
