import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
const isTestEnv =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
export const AchievementUnlockBanner = ({
  achievement,
  onPress,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  useEffect(() => {
    if (achievement) {
      slideAnim.setValue(-120);
      if (!isTestEnv) {
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }).start();
        // Pulsing sparkle
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 400,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          { iterations: 4 }
        ).start();
      } else {
        slideAnim.setValue(0);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        if (!isTestEnv) {
          Animated.timing(slideAnim, {
            toValue: -120,
            duration: 350,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            if (onDismiss) onDismiss();
          });
        } else {
          if (onDismiss) onDismiss();
        }
      }, 3500);
    } else {
      slideAnim.setValue(-120);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [achievement, slideAnim, pulseAnim, onDismiss]);
  if (!achievement) return null;
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Achievement Unlocked: ${achievement.title}`}
        activeOpacity={0.85}
        onPress={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (onPress) onPress();
        }}
        style={[styles.bannerCard, { borderColor: achievement.accentColor }]}
      >
        <View style={styles.sheenBar} />

        {/* Left Badge Icon */}
        <View
          style={[
            styles.badgeCircle,
            { backgroundColor: achievement.badgeColor },
          ]}
        >
          <Text style={styles.badgeSymbol}>{achievement.symbol}</Text>
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <Text style={styles.unlockedHeader}>🏆 ACHIEVEMENT UNLOCKED!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDesc}>{achievement.description}</Text>
        </View>

        {/* Reward Pill */}
        <View style={styles.rewardPill}>
          <Text style={styles.rewardCoinsText}>
            +{achievement.rewardCoins} 🪙
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    maxWidth: 390,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.96)', // Deep slate
    borderRadius: 20,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 16,
    overflow: 'hidden',
  },
  sheenBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  badgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 10,
    elevation: 4,
  },
  badgeSymbol: {
    fontSize: 22,
  },
  infoCol: {
    flex: 1,
  },
  unlockedHeader: {
    color: '#FACC15', // Amber gold
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 1,
  },
  achievementDesc: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '500',
  },
  rewardPill: {
    backgroundColor: '#78350F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginLeft: 6,
  },
  rewardCoinsText: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '900',
  },
});
