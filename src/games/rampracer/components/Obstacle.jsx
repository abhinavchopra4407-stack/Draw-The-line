import React from 'react';
import { StyleSheet, View } from 'react-native';
const BRICK_HEIGHT = 16;
const BRICK_WIDTH = 34;
export const Obstacle = ({ width = 80, height = 100, theme, style }) => {
  const rowCount = Math.max(1, Math.ceil((height - 8) / BRICK_HEIGHT));
  const bricksPerRow = Math.ceil(width / BRICK_WIDTH) + 1;
  return (
    <View
      style={[
        styles.container,
        theme && {
          backgroundColor: theme.containerBg,
          borderColor: theme.borderColor,
        },
        { width, height },
        style,
      ]}
    >
      {/* Top cap / platform edge */}
      <View
        style={[
          styles.topPlatform,
          theme && { backgroundColor: theme.topPlatformBg },
        ]}
      >
        <View
          style={[
            styles.topHighlight,
            theme && { backgroundColor: theme.topHighlightBg },
          ]}
        />
        <View style={styles.topShadow} />
      </View>

      {/* Brick body */}
      <View style={styles.bricksArea}>
        {Array.from({ length: rowCount }).map((_, rowIndex) => {
          const isShifted = rowIndex % 2 === 1;
          return (
            <View key={`obstacle-row-${rowIndex}`} style={styles.brickRow}>
              {isShifted && <View style={[styles.brick, styles.halfBrick]} />}
              {Array.from({ length: bricksPerRow }).map((__, colIndex) => {
                const isDark = (rowIndex + colIndex) % 2 === 0;
                const dynamicBg = theme
                  ? isDark
                    ? theme.brickToneDark
                    : theme.brickToneLight
                  : undefined;
                return (
                  <View
                    key={`obstacle-brick-${rowIndex}-${colIndex}`}
                    style={[
                      styles.brick,
                      dynamicBg
                        ? { backgroundColor: dynamicBg }
                        : isDark
                        ? styles.brickToneDark
                        : styles.brickToneLight,
                    ]}
                  >
                    <View
                      style={[
                        styles.brickBevel,
                        theme && { backgroundColor: theme.bevelBg },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* Side shadow / outline highlight */}
      <View style={styles.leftBorderHighlight} />
      <View style={styles.rightBorderShadow} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#272C33', // Mortar background
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1D2126',
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  topPlatform: {
    height: 8,
    backgroundColor: '#8C97A6',
    borderBottomWidth: 1.5,
    borderBottomColor: '#373D47',
  },
  topHighlight: {
    height: 2,
    backgroundColor: '#B3BDCB',
  },
  topShadow: {
    height: 1.5,
    backgroundColor: '#1E232A',
  },
  bricksArea: {
    flex: 1,
    paddingTop: 1,
  },
  brickRow: {
    flexDirection: 'row',
    height: BRICK_HEIGHT,
    marginBottom: 2, // Mortar gap
  },
  brick: {
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT - 2,
    marginRight: 2, // Mortar gap
    borderRadius: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  halfBrick: {
    width: BRICK_WIDTH / 2,
  },
  brickToneDark: {
    backgroundColor: '#3E4651',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#2B313A',
    borderRightColor: '#2B313A',
  },
  brickToneLight: {
    backgroundColor: '#4B5562',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#343B45',
    borderRightColor: '#343B45',
  },
  brickBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  leftBorderHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  rightBorderShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
