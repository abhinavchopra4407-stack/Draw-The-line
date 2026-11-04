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
export const DailyRewardButton = ({
  onPress,
  hasAvailableReward = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef(null);
  useEffect(() => {
    if (hasAvailableReward && !isTestEnv) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loopRef.current = loop;
      loop.start();
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
      pulseAnim.setValue(1);
    }
    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
    };
  }, [hasAvailableReward, pulseAnim]);
  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Daily Rewards"
        activeOpacity={0.75}
        onPress={onPress}
        style={styles.buttonShadowWrapper}
      >
        <View style={styles.buttonBody}>
          <View style={styles.glossSheen} />
          <Text style={styles.iconText}>🎁</Text>
        </View>

        {/* Pulsing red notification badge dot when reward is available to claim */}
        {hasAvailableReward && (
          <View style={styles.notificationDot}>
            <Text style={styles.notificationExclamation}>!</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  buttonShadowWrapper: {
    backgroundColor: '#581C87', // Deep purple 3D bottom bevel
    borderRadius: 24,
    paddingBottom: 3.5,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    position: 'relative',
  },
  buttonBody: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#9333EA', // Vibrant purple
    borderWidth: 2,
    borderColor: '#F3E8FF', // Soft lilac highlight
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glossSheen: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  iconText: {
    fontSize: 18,
    marginTop: -1,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  notificationExclamation: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: -1,
  },
});
