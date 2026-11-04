import React from 'react';
import { StyleSheet, View } from 'react-native';
// 24 smooth steps from bright royal sky blue to vibrant cyan
const GRADIENT_STOPS = [
  '#097BE8',
  '#0B84EA',
  '#0E8EEC',
  '#1097EE',
  '#13A0F0',
  '#16A9F2',
  '#19B2F4',
  '#1DBBF6',
  '#20C3F8',
  '#24CCFA',
  '#27D3FB',
  '#2BD9FC',
  '#30E0FD',
  '#35E6FE',
  '#3CEBFE',
  '#43EFFF',
  '#4AF3FF',
  '#53F6FF',
  '#5EF8FF',
  '#68FAFF',
  '#72FCFF',
  '#7DFEFF',
  '#87FFFF',
  '#92FFFF',
];
export const SkyBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {GRADIENT_STOPS.map((color, index) => (
          <View
            key={`sky-band-${index}`}
            style={[styles.gradientBand, { backgroundColor: color }]}
          />
        ))}

        {/* Decorative cartoon clouds */}
        <View style={[styles.cloud, styles.cloud1]}>
          <View style={styles.cloudPartMain} />
          <View style={[styles.cloudPuff, styles.puff1]} />
          <View style={[styles.cloudPuff, styles.puff2]} />
        </View>

        <View style={[styles.cloud, styles.cloud2]}>
          <View style={[styles.cloudPartMain, styles.cloud2Main]} />
          <View style={[styles.cloudPuff, styles.cloud2Puff1]} />
          <View style={[styles.cloudPuff, styles.cloud2Puff2]} />
        </View>

        <View style={[styles.cloud, styles.cloud3]}>
          <View style={[styles.cloudPartMain, styles.cloud3Main]} />
          <View style={[styles.cloudPuff, styles.cloud3Puff1]} />
          <View style={[styles.cloudPuff, styles.cloud3Puff2]} />
        </View>
      </View>
      {children}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  gradientBand: {
    flex: 1,
  },
  cloud: {
    position: 'absolute',
    opacity: 0.85,
  },
  cloud1: {
    top: 55,
    left: '12%',
  },
  cloud2: {
    top: 95,
    right: '15%',
  },
  cloud3: {
    top: 150,
    left: '48%',
  },
  cloudPartMain: {
    width: 110,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  cloud2Main: {
    width: 90,
    height: 26,
  },
  cloud3Main: {
    width: 70,
    height: 22,
  },
  cloudPuff: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },
  puff1: {
    top: -16,
    left: 20,
    width: 42,
    height: 42,
  },
  puff2: {
    top: -24,
    left: 48,
    width: 52,
    height: 52,
  },
  cloud2Puff1: {
    top: -14,
    left: 16,
    width: 34,
    height: 34,
  },
  cloud2Puff2: {
    top: -20,
    left: 38,
    width: 44,
    height: 44,
  },
  cloud3Puff1: {
    top: -10,
    left: 12,
    width: 28,
    height: 28,
  },
  cloud3Puff2: {
    top: -15,
    left: 30,
    width: 32,
    height: 32,
  },
});
