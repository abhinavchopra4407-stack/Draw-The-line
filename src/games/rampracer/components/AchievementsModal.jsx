import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { soundManager } from '../audio/soundManager';
export const AchievementsModal = ({
  visible,
  onClose,
  totalCoins,
  achievements,
  onClaimReward,
}) => {
  const [justClaimedId, setJustClaimedId] = useState(null);
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const overallPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const handleClaim = (id) => {
    soundManager.playSfx('achievement_unlock');
    setJustClaimedId(id);
    onClaimReward(id);
    setTimeout(() => {
      setJustClaimedId(null);
    }, 1200);
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerIcon}>🏆</Text>
              <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close achievements"
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

          {/* Overall Progress Banner */}
          <View style={styles.progressBanner}>
            <View style={styles.progressBannerHeader}>
              <Text style={styles.progressBannerTitle}>
                Total Badges Unlocked:
              </Text>
              <View style={styles.badgeCountPill}>
                <Text style={styles.badgeCountText}>
                  {unlockedCount} / {totalCount} ({overallPercent}%)
                </Text>
              </View>
            </View>

            {/* Overall Progress Bar Track */}
            <View style={styles.overallTrack}>
              <View
                style={[styles.overallFill, { width: `${overallPercent}%` }]}
              />
            </View>
          </View>

          {/* List of 7 Achievements */}
          <ScrollView
            contentContainerStyle={styles.scrollList}
            showsVerticalScrollIndicator={false}
          >
            {achievements.map((item) => {
              const def = item.definition;
              const isClaimable = item.isUnlocked && !item.isClaimed;
              return (
                <View
                  key={`achievement-${item.id}`}
                  style={[
                    styles.achievementCard,
                    item.isUnlocked && styles.achievementCardUnlocked,
                    item.isClaimed && styles.achievementCardClaimed,
                  ]}
                >
                  {/* Left Badge Shield */}
                  <View
                    style={[
                      styles.badgeCircle,
                      item.isUnlocked
                        ? {
                            backgroundColor: def.badgeColor,
                            borderColor: def.accentColor,
                          }
                        : styles.badgeCircleLocked,
                    ]}
                  >
                    <Text style={styles.badgeIcon}>
                      {item.isUnlocked ? def.symbol : '🔒'}
                    </Text>
                  </View>

                  {/* Middle Info Column */}
                  <View style={styles.infoCol}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.cardTitle,
                          item.isUnlocked && styles.cardTitleUnlocked,
                        ]}
                      >
                        {def.title}
                      </Text>
                      <View
                        style={[
                          styles.categoryPill,
                          { borderColor: def.accentColor },
                        ]}
                      >
                        <Text style={styles.categoryText}>
                          {def.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardDesc}>{def.description}</Text>

                    {/* Progress Track and Counter */}
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${item.percent}%`,
                              backgroundColor: item.isUnlocked
                                ? '#10B981'
                                : def.accentColor,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressCountText}>
                        {item.current} / {item.target}
                      </Text>
                    </View>
                  </View>

                  {/* Right Action / Reward Column */}
                  <View style={styles.actionCol}>
                    {isClaimable ? (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Claim reward for ${def.title}`}
                        activeOpacity={0.8}
                        onPress={() => handleClaim(item.id)}
                        style={styles.claimButton}
                      >
                        <Text style={styles.claimButtonText}>CLAIM</Text>
                        <Text style={styles.claimButtonCoins}>
                          +{def.rewardCoins} 🪙
                        </Text>
                      </TouchableOpacity>
                    ) : item.isClaimed ? (
                      <View style={styles.claimedBadge}>
                        <Text style={styles.claimedCheck}>✓</Text>
                        <Text style={styles.claimedBadgeText}>CLAIMED</Text>
                      </View>
                    ) : (
                      <View style={styles.lockedRewardBadge}>
                        <Text style={styles.lockedRewardCoins}>
                          +{def.rewardCoins}
                        </Text>
                        <Text style={styles.lockedRewardCoinIcon}>🪙</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 28, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#0F172A', // Slate 900
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Amber trophy border
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
  progressBanner: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  progressBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBannerTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  badgeCountPill: {
    backgroundColor: '#78350F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  badgeCountText: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '900',
  },
  overallTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  scrollList: {
    padding: 12,
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 10,
    gap: 10,
  },
  achievementCardUnlocked: {
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
  },
  achievementCardClaimed: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
  },
  badgeCircleLocked: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
  },
  badgeIcon: {
    fontSize: 22,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  cardTitleUnlocked: {
    color: '#F8FAFC',
  },
  categoryPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    color: '#E2E8F0',
    fontSize: 8,
    fontWeight: '900',
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginVertical: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressCountText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
    minWidth: 44,
    textAlign: 'right',
  },
  actionCol: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  claimButton: {
    backgroundColor: '#16A34A', // Green
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    elevation: 4,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  claimButtonCoins: {
    color: '#FEF08A',
    fontSize: 10,
    fontWeight: '800',
  },
  claimedBadge: {
    alignItems: 'center',
  },
  claimedCheck: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  claimedBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  lockedRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 2,
  },
  lockedRewardCoins: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  lockedRewardCoinIcon: {
    fontSize: 10,
  },
});
