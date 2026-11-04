import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { prepareRampPoints } from '../physics/physicsEngine';
const RAMP_THICKNESS = 5;
const CAP_RADIUS = RAMP_THICKNESS / 2;
export const RampCanvas = React.memo(({ points, roadY, isDrawing }) => {
  // Exact 1-to-1 visual alignment with physics geometry
  const displayPoints = React.useMemo(
    () => prepareRampPoints(points, roadY),
    [points, roadY]
  );
  if (points.length === 0) {
    return (
      <View style={styles.hintContainer} pointerEvents="none">
        <View style={styles.hintBubble}>
          <Text style={styles.hintIcon}>✏️</Text>
          <Text style={styles.hintText}>Draw a ramp with your finger!</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Smooth rounded joint caps at vertices */}
      {displayPoints.map((pt, index) => (
        <View
          key={`joint-${index}`}
          style={[
            styles.jointCap,
            {
              left: pt.x - CAP_RADIUS,
              top: pt.y - CAP_RADIUS,
            },
          ]}
        />
      ))}

      {/* Render solid clean black line segments */}
      {displayPoints.slice(0, displayPoints.length - 1).map((p1, index) => {
        const p2 = displayPoints[index + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < 0.5) return null;
        const angle = Math.atan2(dy, dx);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        return (
          <View
            key={`seg-${index}`}
            style={[
              styles.segment,
              {
                width: length + 1.5, // Slight overlap to ensure continuous seamless curve
                height: RAMP_THICKNESS,
                left: midX - length / 2 - 0.75,
                top: midY - RAMP_THICKNESS / 2,
                transform: [{ rotate: `${angle}rad` }],
              },
            ]}
          />
        );
      })}

      {/* Drawing active indicator on fingertip */}
      {isDrawing && points.length > 0 && (
        <View
          style={[
            styles.activeIndicator,
            {
              left: points[points.length - 1].x - 8,
              top: points[points.length - 1].y - 8,
            },
          ]}
        />
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  hintContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38BDF8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  hintIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  hintText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  jointCap: {
    position: 'absolute',
    width: RAMP_THICKNESS,
    height: RAMP_THICKNESS,
    borderRadius: CAP_RADIUS,
    backgroundColor: '#181818',
  },
  segment: {
    position: 'absolute',
    backgroundColor: '#181818',
    borderRadius: CAP_RADIUS,
  },
  activeIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(24, 24, 24, 0.65)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
