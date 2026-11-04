import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { POWER_UP_CONFIGS } from '../types/powerups';
const isTestEnv =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
const ITEM_SIZE = 34;
export const PowerUpItem = React.memo(({ type, x, y, collected }) => {
  const config = POWER_UP_CONFIGS[type] ?? POWER_UP_CONFIGS.boost;
  const [isRendered, setIsRendered] = React.useState(true);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const collectScale = useRef(new Animated.Value(1)).current;
  const collectOpacity = useRef(new Animated.Value(1)).current;
  const collectTranslateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Gentle vertical hover bob
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    // Glowing pulsing aura
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.92,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    if (!isTestEnv) {
      floatLoop.start();
      pulseLoop.start();
    }
    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, pulseAnim]);
  // Pickup reward animation when collected
  useEffect(() => {
    if (collected) {
      Animated.parallel([
        Animated.timing(collectScale, {
          toValue: 1.8,
          duration: 380,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
        Animated.timing(collectTranslateY, {
          toValue: -36,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(collectOpacity, {
          toValue: 0,
          duration: 380,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [collected, collectScale, collectTranslateY, collectOpacity]);
  if (!isRendered) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: x - ITEM_SIZE / 2,
          top: y - ITEM_SIZE / 2,
          transform: [
            { translateY: floatAnim },
            { translateY: collectTranslateY },
            { scale: collectScale },
          ],
          opacity: collectOpacity,
        },
      ]}
    >
      {/* Pulsing Outer Glow Aura */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: config.glowColor,
            backgroundColor: `${config.color}2A`,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Inner Capsule Badge */}
      <View
        style={[
          styles.capsule,
          {
            borderColor: config.glowColor,
            backgroundColor: config.color,
          },
        ]}
      >
        {/* Top Glass Gloss */}
        <View style={styles.gloss} />

        {/* Symbol */}
        <Text style={styles.symbolText}>{config.symbol}</Text>
      </View>

      {/* Floating Pickup Label on collection */}
      {collected && (
        <View style={[styles.pickupBadge, { backgroundColor: config.color }]}>
          <Text style={styles.pickupText}>{`+${config.name}!`}</Text>
        </View>
      )}
    </Animated.View>
  );
});
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  glowRing: {
    position: 'absolute',
    width: ITEM_SIZE + 16,
    height: ITEM_SIZE + 16,
    borderRadius: (ITEM_SIZE + 16) / 2,
    borderWidth: 2,
  },
  capsule: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: ITEM_SIZE * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: ITEM_SIZE / 2,
  },
  symbolText: {
    fontSize: 18,
    includeFontPadding: false,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pickupBadge: {
    position: 'absolute',
    top: -24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  pickupText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
