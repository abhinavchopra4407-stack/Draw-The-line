import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
export const LoadingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const carTranslateX = useRef(new Animated.Value(-60)).current;
  useEffect(() => {
    const isTest =
      typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    // Pulsing brand text
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    if (!isTest) {
      pulseLoop.start();
    }
    // Fun animated toy car rolling across
    const carLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(carTranslateX, {
          toValue: 60,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(carTranslateX, {
          toValue: -60,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    if (!isTest) {
      carLoop.start();
    }
    return () => {
      pulseLoop.stop();
      carLoop.stop();
    };
  }, [pulseAnim, carTranslateX]);
  return (
    <View style={styles.container}>
      {/* Visual Sky & Cloud background styling */}
      <View style={styles.cloudBackdrop}>
        <View style={[styles.cloud, styles.cloud1]} />
        <View style={[styles.cloud, styles.cloud2]} />
      </View>

      <Animated.View
        style={[styles.brandContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <Text style={styles.brandTitle}>RAMP RACER</Text>
        <Text style={styles.gameSubtitle}>MITTSURE</Text>
      </Animated.View>

      <View style={styles.loadingTrack}>
        <Animated.View
          style={[
            styles.animatedCarWrapper,
            { transform: [{ translateX: carTranslateX }] },
          ]}
        >
          <Text style={styles.carIcon}>🏎️</Text>
        </Animated.View>
        <View style={styles.trackLine} />
      </View>

      <Text style={styles.loadingText}>Loading saved progress...</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#097BE8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  cloudBackdrop: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 50,
  },
  cloud1: {
    width: 140,
    height: 45,
    top: 90,
    left: 40,
  },
  cloud2: {
    width: 180,
    height: 55,
    bottom: 120,
    right: 30,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFEA00',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  gameSubtitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingTrack: {
    width: 180,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedCarWrapper: {
    marginBottom: 4,
  },
  carIcon: {
    fontSize: 32,
  },
  trackLine: {
    width: 160,
    height: 5,
    backgroundColor: '#3E444D',
    borderRadius: 3,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
