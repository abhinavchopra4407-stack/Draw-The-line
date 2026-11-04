import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { soundManager } from '../audio/soundManager';
export const WorldUnlockModal = ({ visible, world, onContinue }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(0)).current;
  const haloRotateAnim = useRef(new Animated.Value(0)).current;
  const loopAnimRef = useRef(null);
  useEffect(() => {
    if (visible && world) {
      soundManager.playSfx('level_win');
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      iconBounceAnim.setValue(0);
      haloRotateAnim.setValue(0);
      const isTest = process.env?.NODE_ENV === 'test';
      const loop = Animated.loop(
        Animated.timing(haloRotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: !isTest,
        })
      );
      loopAnimRef.current = loop;
      if (!isTest) {
        loop.start();
      }
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: !isTest,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: !isTest,
        }),
        Animated.spring(iconBounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: !isTest,
        }),
      ]).start();
    }
    return () => {
      if (loopAnimRef.current) {
        loopAnimRef.current.stop();
        loopAnimRef.current = null;
      }
    };
  }, [visible, world, scaleAnim, opacityAnim, iconBounceAnim, haloRotateAnim]);
  if (!visible || !world) return null;
  const spin = haloRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onContinue}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Glowing Sunburst Halo */}
          <Animated.View
            style={[
              styles.sunburstHalo,
              {
                borderColor: world.accentColor,
                transform: [{ rotate: spin }],
              },
            ]}
          />

          {/* Celebratory Ribbon */}
          <View
            style={[
              styles.ribbonWrapper,
              { backgroundColor: world.accentColor },
            ]}
          >
            <Text style={styles.ribbonText}>✨ NEW WORLD UNLOCKED! ✨</Text>
          </View>

          {/* Big Bouncing World Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: world.headerBadgeBg,
                borderColor: world.accentColor,
                transform: [{ scale: iconBounceAnim }],
              },
            ]}
          >
            <Text style={styles.iconText}>{world.icon}</Text>
          </Animated.View>

          {/* World Name & Subtitle */}
          <Text style={styles.worldName}>{world.name.toUpperCase()}</Text>
          <Text style={styles.worldSubtitle}>{world.subtitle}</Text>

          {/* Level Range Badge */}
          <View
            style={[
              styles.rangeBadge,
              { backgroundColor: world.headerBadgeBg },
            ]}
          >
            <Text style={[styles.rangeBadgeText, { color: world.accentColor }]}>
              {`PLAY LEVELS ${world.startLevel} – ${world.endLevel}`}
            </Text>
          </View>

          {/* Enter World Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Enter ${world.name}`}
            activeOpacity={0.8}
            onPress={() => {
              soundManager.playSfx('btn_click');
              onContinue();
            }}
            style={[styles.enterButton, { backgroundColor: world.accentColor }]}
          >
            <Text style={styles.enterButtonText}>ENTER WORLD 🚀</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  sunburstHalo: {
    position: 'absolute',
    top: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderStyle: 'dashed',
    opacity: 0.35,
  },
  ribbonWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  iconText: {
    fontSize: 48,
  },
  worldName: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  worldSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  rangeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rangeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  enterButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
