import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { POWER_UP_CONFIGS } from '../types/powerups';
const isTestEnv =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
export const PowerUpIndicator = ({ activePowerUp }) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef(null);
  const prevTypeRef = useRef(null);
  useEffect(() => {
    if (activePowerUp) {
      // Entrance slide down
      if (!isTestEnv && prevTypeRef.current !== activePowerUp.type) {
        prevTypeRef.current = activePowerUp.type;
        slideAnim.setValue(-40);
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }).start();
      }
      // Fast flash warning when expiring (< 1.3 seconds)
      const isExpiring =
        activePowerUp.remainingSeconds < 1.3 && activePowerUp.type !== 'shield';
      if (isExpiring && !isTestEnv) {
        if (!pulseLoopRef.current) {
          const loop = Animated.loop(
            Animated.sequence([
              Animated.timing(flashAnim, {
                toValue: 0.35,
                duration: 150,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.timing(flashAnim, {
                toValue: 1,
                duration: 150,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
            ])
          );
          pulseLoopRef.current = loop;
          loop.start();
        }
      } else {
        if (pulseLoopRef.current) {
          pulseLoopRef.current.stop();
          pulseLoopRef.current = null;
          flashAnim.setValue(1);
        }
      }
    } else {
      prevTypeRef.current = null;
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
    }
  }, [activePowerUp, slideAnim, flashAnim]);
  if (!activePowerUp) return null;
  const config = POWER_UP_CONFIGS[activePowerUp.type];
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      (activePowerUp.remainingSeconds / activePowerUp.totalDuration) * 100
    )
  );
  const isShield = activePowerUp.type === 'shield';
  const labelText = isShield
    ? `${config.symbol} ${config.name} (1 HIT)`
    : `${config.symbol} ${
        config.name
      } (${activePowerUp.remainingSeconds.toFixed(1)}s)`;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: flashAnim,
        },
      ]}
    >
      <View
        style={[
          styles.pillCard,
          {
            borderColor: config.glowColor,
            backgroundColor: 'rgba(10, 25, 47, 0.92)',
          },
        ]}
      >
        {/* Glow Accent Border */}
        <View style={[styles.glowBar, { backgroundColor: config.color }]} />

        {/* Content Row */}
        <View style={styles.contentRow}>
          <Text style={styles.symbolIcon}>{config.symbol}</Text>
          <View style={styles.textCol}>
            <View style={styles.nameRow}>
              <Text style={[styles.nameText, { color: config.glowColor }]}>
                {config.name}
              </Text>
              <Text style={styles.subText}>
                {isShield
                  ? '1 HIT REMAINING'
                  : `${activePowerUp.remainingSeconds.toFixed(1)}s`}
              </Text>
            </View>

            {/* Duration Progress Bar (for timer-based powerups) */}
            {!isShield && (
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: config.color,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 68,
    alignSelf: 'center',
    zIndex: 25,
  },
  pillCard: {
    flexDirection: 'column',
    borderRadius: 20,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  glowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  textCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.0,
  },
  subText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
