import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVehicleById } from '../types/vehicles';
import { Car } from './Car';
import { WorldBackground } from './WorldBackground';
import { getWorldForLevel } from '../types/worlds';
import { soundManager } from '../audio/soundManager';
export const HomeScreen = ({
  currentLevel,
  highestUnlocked,
  totalCoins,
  totalStars,
  selectedVehicle,
  hasDailyRewardAvailable = false,
  onStartGame,
  onOpenGarage,
  onOpenDailyRewards,
  onOpenAchievements,
  onOpenLevelSelect,
  onOpenSettings,
  onStartTutorial,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  const vehicleData = getVehicleById(selectedVehicle);
  const worldConfig = getWorldForLevel(currentLevel);
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.85)).current;
  const titleDropAnim = useRef(new Animated.Value(-30)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(titleDropAnim, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // Start Button pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    // Car idle hover floating animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    // Start button glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.25,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.85,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    floatLoop.start();
    glowLoop.start();
    return () => {
      pulseLoop.stop();
      floatLoop.stop();
      glowLoop.stop();
    };
  }, [pulseAnim, floatAnim, glowAnim, titleDropAnim, contentFadeAnim]);
  const handleStartPress = () => {
    soundManager.playSfx('btn_click');
    soundManager.playSfx('car_engine', 0.8);
    onStartGame();
  };
  const handleAction = (cb) => {
    soundManager.playSfx('btn_click');
    cb();
  };
  return (
    <WorldBackground world={worldConfig} level={currentLevel}>
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 10),
            paddingBottom: Math.max(insets.bottom, 10),
            paddingLeft: Math.max(insets.left, 12),
            paddingRight: Math.max(insets.right, 12),
          },
        ]}
      >
        {/* Top Header Stats Bar */}
        <View style={styles.topBar}>
          <View style={styles.statsGroup}>
            {/* Total Stars Counter */}
            <View style={styles.statPill}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.starValue}>{totalStars}</Text>
            </View>

            {/* Total Coins Counter */}
            <View style={[styles.statPill, styles.coinPill]}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.coinValue}>
                {totalCoins.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Top Right Actions */}
          <View style={styles.topRightGroup}>
            {onStartTutorial && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="How to Play Tutorial"
                activeOpacity={0.8}
                onPress={() => handleAction(onStartTutorial)}
                style={styles.howToPlayBtn}
              >
                <Text style={styles.howToPlayText}>❓ TUTORIAL</Text>
              </TouchableOpacity>
            )}

            {/* Quick Settings Icon */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Settings"
              activeOpacity={0.8}
              onPress={() => handleAction(onOpenSettings)}
              style={styles.settingsBtn}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Area */}
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: contentFadeAnim,
              flexDirection: isLandscape ? 'row' : 'column',
            },
          ]}
        >
          {/* Title & Brand Section */}
          <Animated.View
            style={[
              styles.titleSection,
              { transform: [{ translateY: titleDropAnim }] },
            ]}
          >
            <View style={styles.titleBadge}>
              <Text style={styles.flagIcon}>🏁</Text>
              <Text style={styles.superTitle}>EXTREME PHYSICS</Text>
              <Text style={styles.flagIcon}>🏁</Text>
            </View>
            <Text style={styles.gameTitle}>RAMP RACER</Text>
            <Text style={styles.subTitle}>DRAW THE RAMP • LAUNCH • FLY</Text>
            <View style={styles.worldPill}>
              <Text style={styles.worldPillText}>
                {worldConfig.icon} {worldConfig.name.toUpperCase()} • LEVEL{' '}
                {currentLevel}
              </Text>
            </View>
          </Animated.View>

          {/* Vehicle Showcase Card */}
          <View style={styles.showcaseSection}>
            <View style={styles.pedestalGlow} />
            <Animated.View
              style={[
                styles.vehicleContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <View style={styles.carScaleWrapper}>
                <Car vehicleId={selectedVehicle} wheelRotation={0} />
              </View>
            </Animated.View>

            {/* Pedestal Base */}
            <View style={styles.pedestalBase}>
              <View style={styles.pedestalHighlight} />
            </View>

            {/* Selected Vehicle Info & Quick Garage Button */}
            <View style={styles.vehicleInfoBar}>
              <Text style={styles.vehicleName}>
                {vehicleData.name.toUpperCase()}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.changeVehicleBtn}
                onPress={() => handleAction(onOpenGarage)}
              >
                <Text style={styles.changeVehicleText}>GARAGE 🏎️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Navigation Dock */}
        <View style={styles.bottomDock}>
          {/* Garage */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dockItem}
            onPress={() => handleAction(onOpenGarage)}
          >
            <View pointerEvents="none" style={styles.dockIconBadge}>
              <Text style={styles.dockIcon}>🏎️</Text>
            </View>
            <Text pointerEvents="none" style={styles.dockLabel}>
              GARAGE
            </Text>
          </TouchableOpacity>

          {/* Level Select */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dockItem}
            onPress={() => handleAction(onOpenLevelSelect)}
          >
            <View pointerEvents="none" style={styles.dockIconBadge}>
              <Text style={styles.dockIcon}>🗺️</Text>
            </View>
            <Text pointerEvents="none" style={styles.dockLabel}>
              LEVELS
            </Text>
          </TouchableOpacity>

          {/* Daily Rewards (with unread claim indicator) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dockItem}
            onPress={() => handleAction(onOpenDailyRewards)}
          >
            <View pointerEvents="none" style={styles.dockIconBadge}>
              <Text style={styles.dockIcon}>🎁</Text>
              {hasDailyRewardAvailable && <View style={styles.notifyDot} />}
            </View>
            <Text pointerEvents="none" style={styles.dockLabel}>
              REWARDS
            </Text>
          </TouchableOpacity>

          {/* Achievements */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dockItem}
            onPress={() => handleAction(onOpenAchievements)}
          >
            <View pointerEvents="none" style={styles.dockIconBadge}>
              <Text style={styles.dockIcon}>🏆</Text>
            </View>
            <Text pointerEvents="none" style={styles.dockLabel}>
              BADGES
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WorldBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
    marginBottom: 6,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 25, 45, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    marginRight: 8,
  },
  coinPill: {
    borderColor: '#FFE082',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  starValue: {
    color: '#FFEA00',
    fontSize: 16,
    fontWeight: '900',
  },
  coinValue: {
    color: '#FFF9C4',
    fontSize: 16,
    fontWeight: '900',
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  howToPlayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToPlayText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    marginBottom: 4,
  },
  flagIcon: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  superTitle: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  gameTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E0F2FE',
    letterSpacing: 1.8,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  worldPill: {
    marginTop: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  worldPillText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  showcaseSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  pedestalGlow: {
    position: 'absolute',
    width: 220,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    bottom: 24,
  },
  vehicleContainer: {
    width: 140,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  carScaleWrapper: {
    transform: [{ scale: 1.35 }],
  },
  pedestalBase: {
    width: 190,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 2,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  pedestalHighlight: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  vehicleInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(10, 25, 45, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  vehicleName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 10,
  },
  changeVehicleBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  changeVehicleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  startSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  startGlowAura: {
    position: 'absolute',
    width: 260,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(34, 197, 94, 0.45)',
  },
  startBtn: {
    width: 250,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    borderWidth: 3,
    borderColor: '#86EFAC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  startBtnGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  startBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnPlayIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  startBtnTextCol: {
    alignItems: 'flex-start',
  },
  startBtnText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  startBtnSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DCFCE7',
    letterSpacing: 1,
  },
  bottomDock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 25, 45, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dockIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  dockIcon: {
    fontSize: 20,
  },
  dockLabel: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  notifyDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
