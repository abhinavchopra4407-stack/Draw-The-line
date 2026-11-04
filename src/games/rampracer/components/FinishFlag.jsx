import React from 'react';
import { StyleSheet, View } from 'react-native';
export const FinishFlag = ({ style, height = 95 }) => {
  return (
    <View style={[styles.container, { height }, style]}>
      {/* Golden/White Finial Ball at Top */}
      <View style={styles.finialBall}>
        <View style={styles.finialHighlight} />
      </View>

      {/* Flagcloth & Pole assembly */}
      <View style={styles.upperAssembly}>
        {/* Pole */}
        <View style={styles.pole}>
          <View style={styles.poleHighlight} />
        </View>

        {/* Red Triangular Flag attached to pole, waving out */}
        <View style={styles.flagWrapper}>
          {/* Main Red Triangle */}
          <View style={styles.flagTriangle} />
          {/* Inner wave shadow for depth */}
          <View style={styles.flagInnerFold} />
        </View>
      </View>

      {/* Pole Base Stand */}
      <View style={styles.baseStand}>
        <View style={styles.basePlate} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  finialBall: {
    position: 'absolute',
    top: 0,
    left: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CFD8DC',
    zIndex: 3,
  },
  finialHighlight: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    marginLeft: 1,
  },
  upperAssembly: {
    flex: 1,
    width: '100%',
    paddingTop: 8,
    position: 'relative',
  },
  pole: {
    position: 'absolute',
    left: 4,
    top: 6,
    bottom: 0,
    width: 6,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#B0BEC5',
    zIndex: 2,
  },
  poleHighlight: {
    width: 2,
    height: '100%',
    backgroundColor: '#FFFFFF',
    marginLeft: 1,
  },
  flagWrapper: {
    position: 'absolute',
    left: 10,
    top: 7,
    width: 30,
    height: 24,
    zIndex: 1,
  },
  flagTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 13,
    borderBottomWidth: 13,
    borderLeftWidth: 28,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#E53935', // Crisp cartoon red
  },
  flagInnerFold: {
    position: 'absolute',
    top: 5,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(0, 0, 0, 0.15)',
  },
  baseStand: {
    width: 16,
    height: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
    marginLeft: -1,
  },
  basePlate: {
    width: 14,
    height: 4,
    backgroundColor: '#78909C',
    borderRadius: 2,
    borderTopWidth: 1,
    borderTopColor: '#CFD8DC',
  },
});
