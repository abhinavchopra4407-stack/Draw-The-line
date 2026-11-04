import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { soundManager } from '../audio/soundManager';
export const RewardModal = ({
  visible,
  level,
  earnedStars = 1,
  bestStars = 1,
  coinsCollected = 0,
  coinTarget = 3,
  noCrash = true,
  isAlreadyClaimed,
  onClaim,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  const [claimedLocally, setClaimedLocally] = useState(isAlreadyClaimed);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const trophyBounce = useRef(new Animated.Value(0.6)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;
  // Staggered star reveal animations
  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;
  // Looping 3D virtual coin animations
  const coinScale = useRef(new Animated.Value(1)).current;
  const coinRotateY = useRef(new Animated.Value(0)).current;
  const coinGlow = useRef(new Animated.Value(0.85)).current;
  const claimPop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    setClaimedLocally(isAlreadyClaimed);
  }, [isAlreadyClaimed, visible]);
  useEffect(() => {
    let isMounted = true;
    if (visible) {
      // Reset values
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
      sparkleRotate.setValue(0);
      // Entrance sequence
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 6.5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(trophyBounce, {
          toValue: 1,
          friction: 4,
          tension: 85,
          useNativeDriver: true,
        }),
      ]).start();
      // Rotating sparkles around the trophy
      const sparkleAnim = Animated.loop(
        Animated.timing(sparkleRotate, {
          toValue: 1,
          duration: 3500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      sparkleAnim.start();
      // Staggered star reveal animations
      const t1 = setTimeout(() => {
        if (!isMounted) return;
        if (earnedStars >= 1) {
          soundManager.playSfx('coin_collect');
          Animated.spring(star1Scale, {
            toValue: 1,
            friction: 4,
            tension: 90,
            useNativeDriver: true,
          }).start();
        }
      }, 180);
      const t2 = setTimeout(() => {
        if (!isMounted) return;
        if (earnedStars >= 2) {
          soundManager.playSfx('coin_collect');
          Animated.spring(star2Scale, {
            toValue: 1,
            friction: 4,
            tension: 90,
            useNativeDriver: true,
          }).start();
        }
      }, 380);
      const t3 = setTimeout(() => {
        if (!isMounted) return;
        if (earnedStars >= 3) {
          soundManager.playSfx('level_win');
          Animated.spring(star3Scale, {
            toValue: 1,
            friction: 3.5,
            tension: 95,
            useNativeDriver: true,
          }).start();
        }
      }, 580);
      // Looping coin animations
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(coinGlow, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(coinGlow, {
            toValue: 0.85,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      const floatAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(coinScale, {
            toValue: 1.06,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(coinScale, {
            toValue: 0.94,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      const spinAnim = Animated.loop(
        Animated.timing(coinRotateY, {
          toValue: 1,
          duration: 2600,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      pulseAnim.start();
      floatAnim.start();
      spinAnim.start();
      return () => {
        isMounted = false;
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        sparkleAnim.stop();
        pulseAnim.stop();
        floatAnim.stop();
        spinAnim.stop();
      };
    } else {
      backdropOpacity.setValue(0);
      modalScale.setValue(0.85);
      trophyBounce.setValue(0.6);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
    }
  }, [
    visible,
    earnedStars,
    backdropOpacity,
    modalScale,
    trophyBounce,
    sparkleRotate,
    coinGlow,
    coinScale,
    coinRotateY,
    star1Scale,
    star2Scale,
    star3Scale,
  ]);
  if (!visible) return null;
  const handleClaimPress = () => {
    if (claimedLocally) return;
    soundManager.playSfx('coin_collect');
    // Trigger bouncy pop on claim
    Animated.sequence([
      Animated.timing(claimPop, {
        toValue: 1.2,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(claimPop, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    setClaimedLocally(true);
    onClaim();
  };
  const spinInterpolation = coinRotateY.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '90deg', '180deg', '270deg', '360deg'],
  });
  const sparkleInterpolation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  // Calculate reward figures
  const bonusCoins = isAlreadyClaimed ? 0 : 50;
  const totalCoinsEarned = coinsCollected + bonusCoins;
  // Responsive dynamic sizing
  const isCompactScreen = windowHeight < 680 || windowWidth < 360;
  const cardMaxWidth = Math.min(350, windowWidth - 28);
  const cardMaxHeight = Math.min(
    580,
    windowHeight - (Math.max(insets.top, 10) + Math.max(insets.bottom, 10) + 16)
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      {/* 1. Deep Dim Backdrop Overlay to completely subdue background gameplay */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.82],
            }),
          },
        ]}
      />

      {/* 2. Modal Center Container respecting safe areas */}
      <View
        style={[
          styles.centerContainer,
          {
            paddingTop: Math.max(insets.top, 10),
            paddingBottom: Math.max(insets.bottom, 10),
            paddingLeft: Math.max(insets.left, 12),
            paddingRight: Math.max(insets.right, 12),
          },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              maxWidth: cardMaxWidth,
              maxHeight: cardMaxHeight,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isCompactScreen && styles.scrollContentCompact,
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* ========================================================= */}
            {/* COMPACT HEADER: 1. LEVEL COMPLETED!, 2. Level, 3. Trophy, */}
            {/* 4. Stars Rating, 5. Short Message                         */}
            {/* ========================================================= */}
            <View style={styles.headerSection}>
              {/* 1. LEVEL COMPLETED! Ribbon */}
              <View style={styles.headerRibbon}>
                <View style={styles.ribbonGloss} />
                <Text style={styles.headerTitleText}>LEVEL COMPLETED!</Text>
              </View>

              {/* 2. Level Number */}
              <Text style={styles.headerLevelSubtitle}>{`LEVEL ${level}`}</Text>

              {/* 3. Small Trophy Icon & Celebration Sparkles */}
              <View style={styles.trophyWrapper}>
                <Animated.Text
                  style={[
                    styles.celebrationSparkles,
                    { transform: [{ rotate: sparkleInterpolation }] },
                  ]}
                >
                  ✨ 🌟 ✨
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.trophyIcon,
                    { transform: [{ scale: trophyBounce }] },
                  ]}
                >
                  🏆
                </Animated.Text>
              </View>

              {/* 4. Earned Star Rating */}
              <View style={styles.starsRow}>
                {/* Star 1 */}
                <View style={styles.starSlot}>
                  <Text style={styles.starGrey}>★</Text>
                  {earnedStars >= 1 && (
                    <Animated.View
                      style={[
                        styles.starActiveWrapper,
                        { transform: [{ scale: star1Scale }] },
                      ]}
                    >
                      <Text style={styles.starGold}>★</Text>
                    </Animated.View>
                  )}
                </View>

                {/* Star 2 (Center - slightly larger) */}
                <View style={[styles.starSlot, styles.centerStarSlot]}>
                  <Text style={[styles.starGrey, styles.centerStarGrey]}>
                    ★
                  </Text>
                  {earnedStars >= 2 && (
                    <Animated.View
                      style={[
                        styles.starActiveWrapper,
                        { transform: [{ scale: star2Scale }] },
                      ]}
                    >
                      <Text style={[styles.starGold, styles.centerStarGold]}>
                        ★
                      </Text>
                    </Animated.View>
                  )}
                </View>

                {/* Star 3 */}
                <View style={styles.starSlot}>
                  <Text style={styles.starGrey}>★</Text>
                  {earnedStars >= 3 && (
                    <Animated.View
                      style={[
                        styles.starActiveWrapper,
                        { transform: [{ scale: star3Scale }] },
                      ]}
                    >
                      <Text style={styles.starGold}>★</Text>
                    </Animated.View>
                  )}
                </View>
              </View>

              <Text style={styles.starHeadline}>
                {earnedStars === 3
                  ? '🌟 PERFECT 3-STAR RUN! 🌟'
                  : earnedStars === 2
                  ? '⭐ GREAT 2-STAR RUN! ⭐'
                  : '⭐ LEVEL CLEARED! ⭐'}
              </Text>

              {/* 5. Short Completion Message */}
              <View style={styles.completionMessageSection}>
                <Text style={styles.completionTitle}>Great Job!</Text>
                <Text style={styles.completionSubtitle}>
                  {`You completed Level ${level}!`}
                </Text>
              </View>
            </View>

            {/* ========================================================= */}
            {/* COMPACT PERFORMANCE SUMMARY: Level, Coin Target, No Crashes */}
            {/* ========================================================= */}
            <View style={styles.summaryCard}>
              {/* Row 1: Level Completed */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryIcon}>🏁</Text>
                  <Text style={styles.summaryLabel}>Level Completed</Text>
                </View>
                <View style={styles.checkBadgeGreen}>
                  <Text style={styles.checkTextGreen}>✓</Text>
                </View>
              </View>

              {/* Row 2: Coin Target */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryIcon}>🪙</Text>
                  <Text style={styles.summaryLabel}>
                    {`Coin Target (${coinsCollected}/${coinTarget})`}
                  </Text>
                </View>
                <View
                  style={
                    coinsCollected >= coinTarget
                      ? styles.checkBadgeGreen
                      : styles.checkBadgeRed
                  }
                >
                  <Text
                    style={
                      coinsCollected >= coinTarget
                        ? styles.checkTextGreen
                        : styles.checkTextRed
                    }
                  >
                    {coinsCollected >= coinTarget ? '✓' : '✗'}
                  </Text>
                </View>
              </View>

              {/* Row 3: No Crashes */}
              <View style={[styles.summaryRow, styles.lastSummaryRow]}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryIcon}>🛡️</Text>
                  <Text style={styles.summaryLabel}>No Crashes</Text>
                </View>
                <View
                  style={
                    noCrash ? styles.checkBadgeGreen : styles.checkBadgeRed
                  }
                >
                  <Text
                    style={
                      noCrash ? styles.checkTextGreen : styles.checkTextRed
                    }
                  >
                    {noCrash ? '✓' : '✗'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ========================================================= */}
            {/* COMPACT REWARDS: Coin Illustration, Breakdown & Claim Status */}
            {/* ========================================================= */}
            <View style={styles.rewardsSection}>
              <View style={styles.rewardsHeaderRow}>
                <Text style={styles.rewardsHeaderLabel}>YOUR REWARD</Text>
                {/* Compact 3D Animated Gold Virtual Coin */}
                <View style={styles.coinEffectArea}>
                  <Animated.View
                    style={[
                      styles.coinAura,
                      { transform: [{ scale: coinGlow }] },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.coinWrapper,
                      {
                        transform: [
                          { scale: Animated.multiply(coinScale, claimPop) },
                          { rotateY: spinInterpolation },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.coinOuterCircle}>
                      <View style={styles.coinInnerCircle}>
                        <View style={styles.coinSheen} />
                        <Text style={styles.coinEmblem}>★</Text>
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </View>

              {/* Reward Breakdown Rows */}
              <View style={styles.rewardBreakdownBox}>
                <View style={styles.rewardBreakdownRow}>
                  <Text style={styles.rewardBreakdownLabel}>Level Coins:</Text>
                  <Text
                    style={styles.rewardBreakdownValue}
                  >{`+${coinsCollected} 🪙`}</Text>
                </View>
                <View style={styles.rewardBreakdownRow}>
                  <Text style={styles.rewardBreakdownLabel}>
                    Completion Bonus:
                  </Text>
                  <Text style={styles.rewardBreakdownValue}>
                    {isAlreadyClaimed ? 'Claimed 🪙' : '+50 🪙'}
                  </Text>
                </View>
                <View style={styles.rewardTotalDivider} />
                <View style={styles.rewardBreakdownRow}>
                  <Text style={styles.rewardTotalLabel}>Total Earned:</Text>
                  <Text
                    style={styles.rewardTotalValue}
                  >{`+${totalCoinsEarned} Coins`}</Text>
                </View>
              </View>

              {/* Claim Action or Claimed Status */}
              {!claimedLocally ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Claim Reward"
                  activeOpacity={0.85}
                  onPress={handleClaimPress}
                  style={styles.claimButton}
                >
                  <View style={styles.claimButtonGloss} />
                  <Text style={styles.claimButtonText}>CLAIM REWARD 🪙</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.claimedPill}>
                  <Text style={styles.claimedPillText}>
                    ✓ Reward Claimed! 🪙
                  </Text>
                  {isAlreadyClaimed && (
                    <Text style={styles.alreadyClaimedNote}>
                      (Level replayed — 50 bonus coins awarded on first
                      completion)
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* ========================================================= */}
            {/* NAVIGATION BUTTONS: 1. REPLAY, 2. NEXT LEVEL, 3. LEVEL MAP */}
            {/* ========================================================= */}
            <View style={styles.navigationRow}>
              {/* 1. REPLAY (First Position) */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Replay Level"
                activeOpacity={0.82}
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  onReplay();
                }}
                style={[styles.navBtn, styles.replayBtn]}
              >
                <View style={styles.btnGloss} />
                <Text style={styles.navBtnText}>↺ REPLAY</Text>
              </TouchableOpacity>

              {/* 2. NEXT LEVEL (Center Position) */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Level"
                activeOpacity={0.82}
                onPress={() => {
                  soundManager.playSfx('next_level');
                  onNextLevel();
                }}
                style={[styles.navBtn, styles.nextBtn]}
              >
                <View style={styles.btnGloss} />
                <Text style={styles.navBtnText}>NEXT LEVEL ▶</Text>
              </TouchableOpacity>

              {/* 3. LEVEL MAP (Last Position) */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Level Map"
                activeOpacity={0.82}
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  if (onOpenLevelSelect) {
                    onOpenLevelSelect();
                  } else {
                    onReplay();
                  }
                }}
                style={[styles.navBtn, styles.mapBtn]}
              >
                <View style={styles.btnGloss} />
                <Text style={styles.navBtnText}>LEVEL MAP 🗺️</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#040C1A',
    zIndex: 90,
  },
  centerContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FCD34D',
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: 'center',
  },
  scrollContentCompact: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  // SECTION 1: HEADER
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRibbon: {
    backgroundColor: '#FF2A7A',
    borderWidth: 1.5,
    borderColor: '#FF80AB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4.5,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  ribbonGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerLevelSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 3,
    letterSpacing: 0.6,
  },
  trophyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
    height: 32,
    position: 'relative',
  },
  celebrationSparkles: {
    position: 'absolute',
    fontSize: 11,
    color: '#F59E0B',
  },
  trophyIcon: {
    fontSize: 24,
  },
  // STARS
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 1,
  },
  starSlot: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerStarSlot: {
    width: 38,
    height: 38,
    marginTop: -5,
  },
  starGrey: {
    color: '#CBD5E1',
    fontSize: 28,
    fontWeight: '900',
  },
  centerStarGrey: {
    fontSize: 34,
  },
  starActiveWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starGold: {
    color: '#F59E0B',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(217, 119, 6, 0.6)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  centerStarGold: {
    fontSize: 34,
  },
  starHeadline: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  // SHORT COMPLETION MESSAGE
  completionMessageSection: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  completionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  completionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 1,
  },
  // PERFORMANCE SUMMARY CARD
  summaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastSummaryRow: {
    borderBottomWidth: 0,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryIcon: {
    fontSize: 12,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  checkBadgeGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkTextGreen: {
    color: '#166534',
    fontSize: 10.5,
    fontWeight: '900',
  },
  checkBadgeRed: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.2,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkTextRed: {
    color: '#991B1B',
    fontSize: 10.5,
    fontWeight: '900',
  },
  // REWARDS SECTION
  rewardsSection: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    padding: 7,
    alignItems: 'center',
    marginBottom: 7,
  },
  rewardsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 2,
  },
  rewardsHeaderLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.8,
  },
  coinEffectArea: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coinAura: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.35)',
  },
  coinWrapper: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinOuterCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  coinInnerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D97706',
    borderWidth: 1,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  coinSheen: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 4,
  },
  coinEmblem: {
    color: '#FEF3C7',
    fontSize: 9,
    fontWeight: '900',
  },
  rewardBreakdownBox: {
    width: '100%',
    paddingHorizontal: 4,
    marginVertical: 2,
  },
  rewardBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  rewardBreakdownLabel: {
    fontSize: 11,
    color: '#78350F',
    fontWeight: '600',
  },
  rewardBreakdownValue: {
    fontSize: 11,
    color: '#78350F',
    fontWeight: '800',
  },
  rewardTotalDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 2,
  },
  rewardTotalLabel: {
    fontSize: 11.5,
    color: '#92400E',
    fontWeight: '900',
  },
  rewardTotalValue: {
    fontSize: 11.5,
    color: '#B45309',
    fontWeight: '900',
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderBottomWidth: 3,
    borderBottomColor: '#B45309',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  claimButtonGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(180, 83, 9, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  claimedPill: {
    alignItems: 'center',
    marginTop: 2,
  },
  claimedPillText: {
    color: '#059669',
    fontSize: 11.5,
    fontWeight: '800',
  },
  alreadyClaimedNote: {
    fontSize: 9.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 1,
  },
  // NAVIGATION BUTTONS (REPLAY, NEXT LEVEL, LEVEL MAP)
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
  },
  navBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.2,
    borderBottomWidth: 2.8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
  },
  btnGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },
  replayBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
    borderBottomColor: '#1D4ED8',
  },
  nextBtn: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
    borderBottomColor: '#047857',
  },
  mapBtn: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
    borderBottomColor: '#6D28D9',
  },
});
