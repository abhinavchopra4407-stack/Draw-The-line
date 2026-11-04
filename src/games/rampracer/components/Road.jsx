import React from 'react';
import { StyleSheet, View } from 'react-native';
const BRICK_HEIGHT = 16;
const BRICK_WIDTH = 38;
export const Road = ({
  width = '100%',
  height = 90,
  gaps = [],
  theme,
  style,
}) => {
  const rowCount = Math.ceil(height / BRICK_HEIGHT);
  // Estimate bricks per row for full width world coverage (up to 2400px extended track)
  const numericWidth = typeof width === 'number' ? width : 2000;
  const bricksPerRow = Math.max(55, Math.ceil(numericWidth / BRICK_WIDTH) + 6);
  return (
    <View
      style={[
        styles.roadContainer,
        theme && {
          backgroundColor: theme.containerBg,
          borderTopColor: theme.topCurbBg,
        },
        { width, height },
        style,
      ]}
    >
      {/* Top curb / edge highlight */}
      <View
        style={[
          styles.topCurb,
          theme && {
            backgroundColor: theme.topCurbBg,
            borderBottomColor: theme.containerBg,
          },
        ]}
      >
        <View
          style={[
            styles.curbHighlight,
            theme && { backgroundColor: theme.curbHighlight },
          ]}
        />
      </View>

      {/* Brick texture rows */}
      <View
        style={[
          styles.bricksWrapper,
          theme && { backgroundColor: theme.mortarBg },
        ]}
      >
        {Array.from({ length: rowCount }).map((_, rowIndex) => {
          const isShifted = rowIndex % 2 === 1;
          return (
            <View key={`road-row-${rowIndex}`} style={styles.brickRow}>
              {isShifted && <View style={[styles.brick, styles.halfBrick]} />}
              {Array.from({ length: bricksPerRow }).map((__, colIndex) => {
                const toneIndex = (rowIndex + colIndex) % 3;
                const dynamicToneBg = theme
                  ? theme.brickTones[toneIndex]
                  : undefined;
                return (
                  <View
                    key={`road-brick-${rowIndex}-${colIndex}`}
                    style={[
                      styles.brick,
                      dynamicToneBg
                        ? { backgroundColor: dynamicToneBg }
                        : toneIndex === 0
                        ? styles.brickToneA
                        : toneIndex === 1
                        ? styles.brickToneB
                        : styles.brickToneC,
                    ]}
                  >
                    <View
                      style={[
                        styles.brickTopBevel,
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

      {/* Render road pits / gaps */}
      {gaps.map((gap, idx) => (
        <View
          key={`road-gap-${idx}`}
          style={[
            styles.pitCutout,
            {
              left: gap.x,
              width: gap.width,
            },
          ]}
        >
          <View
            style={[
              styles.pitDepth,
              theme && { backgroundColor: theme.pitDepthBg },
            ]}
          />
        </View>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  roadContainer: {
    backgroundColor: '#3F4751',
    borderTopWidth: 3,
    borderTopColor: '#2D333B',
    overflow: 'hidden',
    position: 'relative',
  },
  topCurb: {
    height: 4,
    backgroundColor: '#9AA4B2',
    borderBottomWidth: 1,
    borderBottomColor: '#262C33',
  },
  curbHighlight: {
    height: 1.5,
    backgroundColor: '#D1D7E0',
  },
  bricksWrapper: {
    flex: 1,
    backgroundColor: '#2A3038', // Mortar color between bricks
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
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  halfBrick: {
    width: BRICK_WIDTH / 2,
  },
  brickToneA: {
    backgroundColor: '#687280',
    borderBottomColor: '#454D57',
    borderRightColor: '#454D57',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },
  brickToneB: {
    backgroundColor: '#5A6370',
    borderBottomColor: '#3A424D',
    borderRightColor: '#3A424D',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },
  brickToneC: {
    backgroundColor: '#4D5663',
    borderBottomColor: '#2F363F',
    borderRightColor: '#2F363F',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },
  brickTopBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  pitCutout: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#0D1117',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#1D2126',
    overflow: 'hidden',
  },
  pitDepth: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#050709',
  },
});
