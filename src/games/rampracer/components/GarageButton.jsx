import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export const GarageButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Car Garage"
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.buttonShadowWrapper, style]}
    >
      <View style={styles.buttonBody}>
        <View style={styles.glossSheen} />
        <Text style={styles.iconText}>🏎️</Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  buttonShadowWrapper: {
    backgroundColor: '#78350F', // Warm amber 3D bottom edge
    borderRadius: 24,
    paddingBottom: 3.5,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  buttonBody: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D97706', // Vibrant gold-amber
    borderWidth: 2,
    borderColor: '#FDE68A', // Light gold highlight
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glossSheen: {
    position: 'absolute',
    top: 1,
    left: 3,
    right: 3,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconText: {
    fontSize: 18,
  },
});
