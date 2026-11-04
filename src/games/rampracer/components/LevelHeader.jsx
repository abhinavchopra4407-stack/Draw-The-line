import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export const LevelHeader = ({
  level = 1,
  stars,
  worldName,
  worldIcon,
  worldColor = '#FFEA00',
  onPress,
  style,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        <Text style={styles.levelText}>{`LEVEL ${level}`}</Text>
        {onPress && <Text style={styles.menuCaret}>▾</Text>}
      </View>
      {worldName && (
        <View style={styles.worldRow}>
          {worldIcon && <Text style={styles.worldIconText}>{worldIcon}</Text>}
          <Text style={[styles.worldNameText, { color: worldColor }]}>
            {worldName.toUpperCase()}
          </Text>
        </View>
      )}
      {stars !== undefined && stars > 0 && (
        <View style={styles.starsRow}>
          <Text
            style={[
              styles.star,
              stars >= 1 ? styles.starFilled : styles.starDim,
            ]}
          >
            ★
          </Text>
          <Text
            style={[
              styles.star,
              stars >= 2 ? styles.starFilled : styles.starDim,
            ]}
          >
            ★
          </Text>
          <Text
            style={[
              styles.star,
              stars >= 3 ? styles.starFilled : styles.starDim,
            ]}
          >
            ★
          </Text>
        </View>
      )}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Level ${level}, ${worldName ?? ''}, select level`}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
  },
  menuCaret: {
    color: '#FFEA00',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '900',
  },
  worldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  worldIconText: {
    fontSize: 11,
    marginRight: 4,
  },
  worldNameText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 1,
  },
  star: {
    fontSize: 11,
    marginHorizontal: 1,
  },
  starFilled: {
    color: '#FFEA00',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  starDim: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
