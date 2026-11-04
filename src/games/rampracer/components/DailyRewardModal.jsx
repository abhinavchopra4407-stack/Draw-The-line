import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { DAILY_REWARDS_7_DAYS } from '../types/dailyRewards';
import { soundManager } from '../audio/soundManager';
const isTestEnv =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
export const DailyRewardModal = ({
  visible,
  onClose,
  totalCoins,
  status,
  onClaimReward,
}) => {
  const [celebrationReward, setCelebrationReward] = useState(null);
  // Card highlight pulse animation for today's ready day
  const pulseTodayAnim = useRef(new Animated.Value(1)).current;
  // Celebration pop & shake animations
  const chestScaleAnim = useRef(new Animated.Value(0)).current;
  const chestShakeAnim = useRef(new Animated.Value(0)).current;
  const burstScaleAnim = useRef(new Animated.Value(0)).current;
  const burstOpacityAnim = useRef(new Animated.Value(1)).current;
  // Pulse animation for today's claimable card
  useEffect(() => {
    if (visible && status.canClaimToday && !isTestEnv) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseTodayAnim, {
            toValue: 1.06,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseTodayAnim, {
            toValue: 1.0,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseTodayAnim.setValue(1);
    }
  }, [visible, status.canClaimToday, pulseTodayAnim]);
  // Handle claiming today's reward
  const handleClaim = () => {
    if (!status.canClaimToday) return;
    soundManager.playSfx('daily_reward');
    const result = onClaimReward();
    if (result.success && result.reward) {
      setCelebrationReward(result.reward);
      // Start attractive reward-opening animation
      chestScaleAnim.setValue(0.3);
      chestShakeAnim.setValue(0);
      burstScaleAnim.setValue(0);
      burstOpacityAnim.setValue(1);
      if (!isTestEnv) {
        Animated.sequence([
          // Pop in
          Animated.spring(chestScaleAnim, {
            toValue: 1.15,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
          // Shake excitement
          Animated.sequence([
            Animated.timing(chestShakeAnim, {
              toValue: -12,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(chestShakeAnim, {
              toValue: 12,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(chestShakeAnim, {
              toValue: -8,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(chestShakeAnim, {
              toValue: 8,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(chestShakeAnim, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ]),
          // Settle and burst
          Animated.parallel([
            Animated.spring(chestScaleAnim, {
              toValue: 1.0,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.timing(burstScaleAnim, {
              toValue: 1.8,
              duration: 500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(burstOpacityAnim, {
              toValue: 0,
              duration: 500,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }
    }
  };
  const handleDismissCelebration = () => {
    soundManager.playSfx('btn_click');
    setCelebrationReward(null);
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.cardContainer}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerIcon}>🎁</Text>
              <Text style={styles.headerTitle}>DAILY REWARDS</Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close daily rewards"
              activeOpacity={0.7}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle & Streak Info */}
          <View style={styles.subHeader}>
            <Text style={styles.subHeaderText}>
              Log in daily to claim coins and unlock the 👑 Grand Prize!
            </Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>
                🔥 Streak: {status.streak}{' '}
                {status.streak === 1 ? 'Day' : 'Days'}
              </Text>
            </View>
          </View>

          {/* 7-Day Rewards Grid */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Row 1: Days 1 to 4 */}
            <View style={styles.daysRow}>
              {DAILY_REWARDS_7_DAYS.slice(0, 4).map((item) => {
                const isClaimed = status.claimedDays.includes(item.day);
                const isToday = status.todayDay === item.day;
                const isReadyToClaim = isToday && status.canClaimToday;
                const isLocked = !isClaimed && !isToday;
                return (
                  <Animated.View
                    key={`day-${item.day}`}
                    style={[
                      styles.dayCardWrapper,
                      isReadyToClaim && {
                        transform: [{ scale: pulseTodayAnim }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dayCard,
                        isClaimed && styles.dayCardClaimed,
                        isReadyToClaim && styles.dayCardTodayReady,
                        isToday &&
                          !status.canClaimToday &&
                          styles.dayCardTodayDone,
                        isLocked && styles.dayCardLocked,
                      ]}
                    >
                      {/* Top Day Header */}
                      <View
                        style={[
                          styles.dayHeader,
                          isReadyToClaim && styles.dayHeaderToday,
                        ]}
                      >
                        <Text
                          style={styles.dayHeaderText}
                        >{`DAY ${item.day}`}</Text>
                      </View>

                      {/* Icon */}
                      <Text style={styles.dayIcon}>{item.symbol}</Text>

                      {/* Coins Label */}
                      <Text
                        style={[
                          styles.dayRewardText,
                          isReadyToClaim && styles.dayRewardTextReady,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {/* State Badge / Overlay */}
                      {isClaimed && (
                        <View style={styles.claimedOverlay}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                          <Text style={styles.claimedText}>CLAIMED</Text>
                        </View>
                      )}

                      {isReadyToClaim && (
                        <View style={styles.readyBadge}>
                          <Text style={styles.readyBadgeText}>TODAY</Text>
                        </View>
                      )}

                      {isLocked && (
                        <View style={styles.lockOverlay}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                );
              })}
            </View>

            {/* Row 2: Days 5, 6, and Day 7 (Grand Prize featured) */}
            <View style={styles.daysRow}>
              {/* Day 5 & 6 */}
              {DAILY_REWARDS_7_DAYS.slice(4, 6).map((item) => {
                const isClaimed = status.claimedDays.includes(item.day);
                const isToday = status.todayDay === item.day;
                const isReadyToClaim = isToday && status.canClaimToday;
                const isLocked = !isClaimed && !isToday;
                return (
                  <Animated.View
                    key={`day-${item.day}`}
                    style={[
                      styles.dayCardWrapper,
                      isReadyToClaim && {
                        transform: [{ scale: pulseTodayAnim }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dayCard,
                        isClaimed && styles.dayCardClaimed,
                        isReadyToClaim && styles.dayCardTodayReady,
                        isToday &&
                          !status.canClaimToday &&
                          styles.dayCardTodayDone,
                        isLocked && styles.dayCardLocked,
                      ]}
                    >
                      <View
                        style={[
                          styles.dayHeader,
                          isReadyToClaim && styles.dayHeaderToday,
                        ]}
                      >
                        <Text
                          style={styles.dayHeaderText}
                        >{`DAY ${item.day}`}</Text>
                      </View>

                      <Text style={styles.dayIcon}>{item.symbol}</Text>
                      <Text
                        style={[
                          styles.dayRewardText,
                          isReadyToClaim && styles.dayRewardTextReady,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {isClaimed && (
                        <View style={styles.claimedOverlay}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                          <Text style={styles.claimedText}>CLAIMED</Text>
                        </View>
                      )}

                      {isReadyToClaim && (
                        <View style={styles.readyBadge}>
                          <Text style={styles.readyBadgeText}>TODAY</Text>
                        </View>
                      )}

                      {isLocked && (
                        <View style={styles.lockOverlay}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                );
              })}

              {/* Day 7: GRAND PRIZE DOUBLE-WIDTH CARD */}
              {(() => {
                const item = DAILY_REWARDS_7_DAYS[6];
                const isClaimed = status.claimedDays.includes(7);
                const isToday = status.todayDay === 7;
                const isReadyToClaim = isToday && status.canClaimToday;
                const isLocked = !isClaimed && !isToday;
                return (
                  <Animated.View
                    style={[
                      styles.grandPrizeCardWrapper,
                      isReadyToClaim && {
                        transform: [{ scale: pulseTodayAnim }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.grandPrizeCard,
                        isClaimed && styles.dayCardClaimed,
                        isReadyToClaim && styles.grandPrizeTodayReady,
                        isLocked && styles.dayCardLocked,
                      ]}
                    >
                      <View style={styles.grandPrizeHeader}>
                        <Text style={styles.grandPrizeHeaderText}>
                          👑 DAY 7 - GRAND PRIZE
                        </Text>
                      </View>

                      <View style={styles.grandPrizeContent}>
                        <Text style={styles.grandPrizeIcon}>👑</Text>
                        <View style={styles.grandPrizeInfo}>
                          <Text style={styles.grandPrizeCoins}>+350 COINS</Text>
                          <Text style={styles.grandPrizeSub}>
                            Mega Jackpot Reward
                          </Text>
                        </View>
                      </View>

                      {isClaimed && (
                        <View style={styles.claimedOverlay}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                          <Text style={styles.claimedText}>CLAIMED</Text>
                        </View>
                      )}

                      {isReadyToClaim && (
                        <View style={styles.readyBadge}>
                          <Text style={styles.readyBadgeText}>TODAY</Text>
                        </View>
                      )}

                      {isLocked && (
                        <View style={styles.lockOverlay}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                );
              })()}
            </View>

            {/* Bottom Claim Action Bar */}
            <View style={styles.actionSection}>
              {status.canClaimToday ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Claim daily reward"
                  activeOpacity={0.8}
                  onPress={handleClaim}
                  style={styles.claimButton}
                >
                  <View style={styles.buttonSheen} />
                  <Text style={styles.claimButtonText}>
                    🎁 CLAIM DAY {status.todayDay} ({status.todayReward.label})
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.claimedTodayCard}>
                  <Text style={styles.claimedTodayText}>✓ CLAIMED TODAY!</Text>
                  <Text style={styles.comeBackTomorrowText}>
                    Come back tomorrow for Day{' '}
                    {status.todayDay < 7 ? status.todayDay + 1 : 1} reward!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Celebration Reward Opening Animation Overlay */}
        {celebrationReward && (
          <View style={styles.celebrationOverlay}>
            {/* Animated Burst Aura */}
            <Animated.View
              style={[
                styles.burstAura,
                {
                  transform: [{ scale: burstScaleAnim }],
                  opacity: burstOpacityAnim,
                },
              ]}
            />

            {/* Shaking & Bouncing Chest Card */}
            <Animated.View
              style={[
                styles.celebrationCard,
                {
                  transform: [
                    { scale: chestScaleAnim },
                    { translateX: chestShakeAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.celebrationTitle}>🎉 REWARD CLAIMED!</Text>
              <Text style={styles.celebrationIcon}>
                {celebrationReward.symbol}
              </Text>
              <Text style={styles.celebrationAmount}>
                {celebrationReward.label}
              </Text>

              <View style={styles.streakCelebration}>
                <Text style={styles.streakCelebrationText}>
                  🔥 {status.streak} Day Streak Maintained!
                </Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Awesome"
                activeOpacity={0.8}
                onPress={handleDismissCelebration}
                style={styles.awesomeButton}
              >
                <View style={styles.buttonSheen} />
                <Text style={styles.awesomeButtonText}>AWESOME! 🚀</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 28, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A', // Slate 900
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#38BDF8', // Glowing cyan border
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#334155',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '700',
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subHeaderText: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
  },
  streakBadge: {
    backgroundColor: '#7C2D12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  streakText: {
    color: '#FFEDD5',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 12,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dayCardWrapper: {
    flex: 1,
  },
  dayCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    paddingBottom: 8,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 90,
  },
  dayCardClaimed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  dayCardTodayReady: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
    borderWidth: 2,
    elevation: 6,
  },
  dayCardTodayDone: {
    backgroundColor: '#1E293B',
    borderColor: '#10B981',
  },
  dayCardLocked: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    opacity: 0.75,
  },
  dayHeader: {
    width: '100%',
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayHeaderToday: {
    backgroundColor: '#0284C7',
  },
  dayHeaderText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '800',
  },
  dayIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  dayRewardText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '900',
  },
  dayRewardTextReady: {
    color: '#FDE047',
  },
  claimedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 78, 59, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: '#34D399',
    fontSize: 24,
    fontWeight: '900',
  },
  claimedText: {
    color: '#A7F3D0',
    fontSize: 9,
    fontWeight: '800',
  },
  readyBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EAB308',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  readyBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  lockOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  lockIcon: {
    fontSize: 12,
  },
  grandPrizeCardWrapper: {
    flex: 2,
  },
  grandPrizeCard: {
    backgroundColor: '#4C1D95', // Deep purple
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A855F7',
    overflow: 'hidden',
    minHeight: 90,
  },
  grandPrizeTodayReady: {
    borderColor: '#FACC15',
    borderWidth: 2,
  },
  grandPrizeHeader: {
    backgroundColor: '#6B21A8',
    paddingVertical: 3,
    alignItems: 'center',
  },
  grandPrizeHeaderText: {
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  grandPrizeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    flex: 1,
  },
  grandPrizeIcon: {
    fontSize: 32,
  },
  grandPrizeInfo: {
    flex: 1,
  },
  grandPrizeCoins: {
    color: '#FDE047',
    fontSize: 14,
    fontWeight: '900',
  },
  grandPrizeSub: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 8,
    paddingTop: 6,
  },
  claimButton: {
    backgroundColor: '#16A34A', // Vibrant green
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  buttonSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  claimedTodayCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  claimedTodayText: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '900',
  },
  comeBackTomorrowText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  burstAura: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(250, 204, 21, 0.35)',
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1E1B4B',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FACC15',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
  },
  celebrationTitle: {
    color: '#FACC15',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  celebrationIcon: {
    fontSize: 64,
    marginVertical: 8,
  },
  celebrationAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  streakCelebration: {
    backgroundColor: '#7C2D12',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 18,
  },
  streakCelebrationText: {
    color: '#FFEDD5',
    fontSize: 13,
    fontWeight: '800',
  },
  awesomeButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD',
    overflow: 'hidden',
    position: 'relative',
  },
  awesomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
