import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
const COIN_SIZE = 26;
export const CoinItem = React.memo(({ x, y, collected }) => {
  const [isRendered, setIsRendered] = React.useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const collectScale = useRef(new Animated.Value(1)).current;
  const collectOpacity = useRef(new Animated.Value(1)).current;
  const collectTranslateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Gentle 3D spin loop
    const spinLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    // Subtle up-and-down floating bob
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 2,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    spinLoop.start();
    floatLoop.start();
    return () => {
      spinLoop.stop();
      floatLoop.stop();
    };
  }, [rotateAnim, floatAnim]);
  // When collected transitions to true, trigger pickup reward animation
  useEffect(() => {
    if (collected) {
      Animated.parallel([
        Animated.timing(collectScale, {
          toValue: 1.6,
          duration: 350,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(collectTranslateY, {
          toValue: -30,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(collectOpacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    } else {
      setIsRendered(true);
      collectScale.setValue(1);
      collectOpacity.setValue(1);
      collectTranslateY.setValue(0);
    }
  }, [collected, collectScale, collectOpacity, collectTranslateY]);
  if (!isRendered) {
    return null;
  }
  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: x - COIN_SIZE / 2,
          top: y - COIN_SIZE / 2,
          opacity: collectOpacity,
          transform: [
            { translateY: Animated.add(floatAnim, collectTranslateY) },
            { scale: collectScale },
            { rotateY: spinInterpolation },
          ],
        },
      ]}
    >
      {/* Outer golden glow */}
      <View style={styles.glowAura} />

      {/* Main Coin Disc */}
      <View style={styles.coinBody}>
        <View style={styles.innerRing}>
          <Text style={styles.starEmblem}>★</Text>
        </View>
      </View>
    </Animated.View>
  );
});
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  glowAura: {
    position: 'absolute',
    width: COIN_SIZE + 10,
    height: COIN_SIZE + 10,
    borderRadius: (COIN_SIZE + 10) / 2,
    backgroundColor: 'rgba(255, 215, 0, 0.35)',
  },
  coinBody: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  innerRing: {
    width: COIN_SIZE - 8,
    height: COIN_SIZE - 8,
    borderRadius: (COIN_SIZE - 8) / 2,
    borderWidth: 1,
    borderColor: '#B8860B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEB3B',
  },
  starEmblem: {
    fontSize: 10,
    color: '#B8860B',
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 12,
  },
});
