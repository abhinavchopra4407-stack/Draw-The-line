import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { soundManager } from '../audio/soundManager';
export const TutorialOverlay = ({
  visible,
  step,
  onContinue,
  onBack,
  onSkip,
  startX,
  roadY,
  finishX,
  cameraX,
  areaWidth,
  areaHeight,
  carX,
  carY,
  coins = [],
  coinsCollected = 0,
  earnedStars = 3,
  hasDrawnPoints = false,
  invalidDrawingMessage,
}) => {
  // Animation refs
  const cardSlideAnim = useRef(new Animated.Value(-30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const handProgress = useRef(new Animated.Value(0)).current;
  const arrowBounceAnim = useRef(new Animated.Value(0)).current;
  const sparkleRotateAnim = useRef(new Animated.Value(0)).current;
  const trophyBounceAnim = useRef(new Animated.Value(0.7)).current;
  // Handle card entrance animations whenever step changes
  useEffect(() => {
    if (!visible || step === 'none') return;
    cardSlideAnim.setValue(-25);
    cardFadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step, visible, cardSlideAnim, cardFadeAnim]);
  // Looping hand gesture and pulse animations
  useEffect(() => {
    if (!visible) return;
    // Pulse animation for target connection ring and buttons
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    // Hand drawing trajectory animation for Step 2 & Step 3
    const handLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(handProgress, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(400),
        Animated.timing(handProgress, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ])
    );
    handLoop.start();
    // Arrow bouncing for Step 1
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounceAnim, {
          toValue: 12,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowBounceAnim, {
          toValue: 0,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    arrowLoop.start();
    // Celebration rotate & bounce for completed step
    const sparkleLoop = Animated.loop(
      Animated.timing(sparkleRotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    sparkleLoop.start();
    if (step === 'completed') {
      Animated.spring(trophyBounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      pulseLoop.stop();
      handLoop.stop();
      arrowLoop.stop();
      sparkleLoop.stop();
    };
  }, [
    visible,
    step,
    pulseAnim,
    handProgress,
    arrowBounceAnim,
    sparkleRotateAnim,
    trophyBounceAnim,
  ]);
  if (!visible || step === 'none') {
    return null;
  }
  const handlePressContinue = () => {
    soundManager.playSfx('btn_click');
    onContinue();
  };
  const handlePressBack = () => {
    soundManager.playSfx('btn_click');
    onBack();
  };
  const handlePressSkip = () => {
    soundManager.playSfx('btn_click');
    onSkip();
  };
  // Screen positions
  const screenStartX = startX - cameraX;
  const screenFinishX = finishX - cameraX;
  const firstCoin = coins.length > 0 ? coins[0] : null;
  const screenCoinX = firstCoin ? firstCoin.x - cameraX : areaWidth * 0.55;
  const screenCoinY = firstCoin ? firstCoin.y : roadY - 70;
  // Hand movement calculations along a gentle parabolic arc:
  // Starts at screenStartX + 10, roadY - 5; ascends to height of 90px; lands ahead
  const handTranslateX = handProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      screenStartX + 15,
      Math.min(screenStartX + 190, areaWidth * 0.72),
    ],
  });
  const handTranslateY = handProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [roadY - 8, roadY - 110, roadY - 35],
  });
  const sparkleRotate = sparkleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <View pointerEvents="box-none" style={styles.overlayContainer}>
      {/* 1. INTRO STEP: Full Friendly Welcome Screen */}
      {step === 'intro' && (
        <View style={styles.fullBackdrop}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>🏁 LEVEL 1 TUTORIAL</Text>
            </View>

            <Text style={styles.introTitle}>Welcome to Ramp Racer! 👋</Text>
            <Text style={styles.introSubtitle}>Let's learn how to play!</Text>

            {/* Illustrated car & ramp badge */}
            <View style={styles.miniIllustration}>
              <View style={styles.miniRoad} />
              <View style={styles.miniRamp} />
              <Animated.View
                style={[
                  styles.miniCarWrapper,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={styles.miniCarEmoji}>🏎️💨</Text>
              </Animated.View>
              <Text style={styles.miniFlagEmoji}>🏁</Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                Draw ramps with your finger, jump over obstacles, and cross the
                finish line!
              </Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial"
                style={styles.skipBtn}
                activeOpacity={0.8}
                onPress={handlePressSkip}
              >
                <Text style={styles.skipBtnText}>SKIP ⏩</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Continue to Tutorial"
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={handlePressContinue}
              >
                <Text style={styles.primaryBtnText}>CONTINUE ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* 2. STEP 1: Understand the Goal */}
      {step === 'goal' && (
        <View pointerEvents="box-none" style={styles.stepContainer}>
          {/* Instruction Card at Top */}
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 1 OF 6</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial Step"
                onPress={handlePressSkip}
                style={styles.miniSkipBtn}
              >
                <Text style={styles.miniSkipText}>SKIP ⏩</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionTitle}>
              🎯 Your Goal: Reach The Finish Flag!
            </Text>
            <Text style={styles.instructionBody}>
              Your goal is to reach the finish flag at the end of the road!
            </Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Previous Tutorial Step"
                onPress={handlePressBack}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>◀ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Tutorial Step"
                onPress={handlePressContinue}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>CONTINUE ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Animated Arrow Pointing towards Finish Flag */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.finishArrowWrapper,
              {
                right: 30,
                top: roadY - 95,
                transform: [{ translateX: arrowBounceAnim }],
              },
            ]}
          >
            <View style={styles.finishArrowPill}>
              <Text style={styles.finishArrowText}>FINISH FLAG 🏁 ➔</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* 3. STEP 2: Learn to Draw */}
      {step === 'draw' && (
        <View pointerEvents="box-none" style={styles.stepContainer}>
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 2 OF 6</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial Step"
                onPress={handlePressSkip}
                style={styles.miniSkipBtn}
              >
                <Text style={styles.miniSkipText}>SKIP ⏩</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionTitle}>
              ✏️ Use Your Finger To Draw
            </Text>
            <Text style={styles.instructionBody}>
              Use your finger to draw a road for your car. Drag across the
              screen to create a ramp!
            </Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Previous Tutorial Step"
                onPress={handlePressBack}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>◀ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Tutorial Step"
                onPress={handlePressContinue}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>CONTINUE ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Highlighted Drawing Area Zone */}
          <View pointerEvents="none" style={styles.drawingZoneHighlight}>
            <View style={styles.drawingZoneBorder}>
              <Text style={styles.drawingZoneLabel}>
                ✨ DRAWING AREA • SWIPE HERE ✨
              </Text>
            </View>
          </View>

          {/* Animated Hand/Finger demonstrating drawing curve */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.handGestureWrapper,
              {
                transform: [
                  { translateX: handTranslateX },
                  { translateY: handTranslateY },
                ],
              },
            ]}
          >
            <Text style={styles.handGestureEmoji}>👆</Text>
            <View style={styles.handGestureTrail} />
          </Animated.View>
        </View>
      )}

      {/* 4. STEP 3: Draw a Connected Ramp */}
      {step === 'connected' && (
        <View pointerEvents="box-none" style={styles.stepContainer}>
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 3 OF 6</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial Step"
                onPress={handlePressSkip}
                style={styles.miniSkipBtn}
              >
                <Text style={styles.miniSkipText}>SKIP ⏩</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionTitle}>
              🛣️ Connect Your Ramp To The Road
            </Text>
            <Text style={styles.instructionBody}>
              Connect your ramp to the road so your car can drive on it. Start
              your line near the car!
            </Text>

            {invalidDrawingMessage && (
              <View style={styles.feedbackWarningBox}>
                <Text style={styles.feedbackWarningText}>
                  ⚠️ Try connecting your line to the road!
                </Text>
              </View>
            )}

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Previous Tutorial Step"
                onPress={handlePressBack}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>◀ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Tutorial Step"
                onPress={handlePressContinue}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>CONTINUE ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Glowing Target Ring on the starting road connection point */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.connectionTargetRing,
              {
                left: screenStartX + 20,
                top: roadY - 26,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.targetInnerDot} />
            <View style={styles.targetLabelPill}>
              <Text style={styles.targetLabelText}>🟢 START HERE</Text>
            </View>
          </Animated.View>

          {/* Sample connected line illustration curve */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.handGestureWrapper,
              {
                transform: [
                  { translateX: handTranslateX },
                  { translateY: handTranslateY },
                ],
              },
            ]}
          >
            <Text style={styles.handGestureEmoji}>👆</Text>
          </Animated.View>
        </View>
      )}

      {/* 5. STEP 4: Start Driving */}
      {step === 'driving' && (
        <View pointerEvents="box-none" style={styles.stepContainer}>
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 4 OF 6</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial Step"
                onPress={handlePressSkip}
                style={styles.miniSkipBtn}
              >
                <Text style={styles.miniSkipText}>SKIP ⏩</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionTitle}>
              🚗💨 Release Finger & Drive!
            </Text>
            <Text style={styles.instructionBody}>
              Release your finger and watch your car drive! Keep your wheels on
              the road to stay in control.
            </Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Tutorial Step"
                onPress={handlePressContinue}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>CONTINUE ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* 6. STEP 5: Collect Coins */}
      {step === 'coins' && (
        <View pointerEvents="box-none" style={styles.stepContainer}>
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 5 OF 6</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial Step"
                onPress={handlePressSkip}
                style={styles.miniSkipBtn}
              >
                <Text style={styles.miniSkipText}>SKIP ⏩</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionTitle}>
              ⭐💰 Collect Coins For Rewards!
            </Text>
            <Text style={styles.instructionBody}>
              Collect coins to earn rewards and get 3 stars on every level!
            </Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Previous Tutorial Step"
                onPress={handlePressBack}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>◀ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Tutorial Step"
                onPress={handlePressContinue}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>CONTINUE ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Sparkling Target around nearby coin */}
          {firstCoin && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.coinHighlightRing,
                {
                  left: screenCoinX - 22,
                  top: screenCoinY - 22,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.coinSparklePill}>
                <Text style={styles.coinSparkleText}>✨ COLLECT COINS ✨</Text>
              </View>
            </Animated.View>
          )}
        </View>
      )}

      {/* 7. STEP 6: Reach the Finish */}
      {step === 'finish' && (
        <View pointerEvents="box-none" style={styles.stepContainer}>
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }],
              },
            ]}
          >
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 6 OF 6</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Skip Tutorial Step"
                onPress={handlePressSkip}
                style={styles.miniSkipBtn}
              >
                <Text style={styles.miniSkipText}>SKIP ⏩</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionTitle}>
              🏁 Drive Safely To The Finish!
            </Text>
            <Text style={styles.instructionBody}>
              Drive safely across the finish line! Ground contact is required –
              flying finishes do not count.
            </Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Previous Tutorial Step"
                onPress={handlePressBack}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>◀ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Tutorial Step"
                onPress={handlePressContinue}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>LET'S RACE! ➔</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Highlight on the finish flag */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.finishTargetHighlight,
              {
                left: Math.max(30, screenFinishX - 35),
                top: roadY - 105,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.finishTargetPill}>
              <Text style={styles.finishTargetText}>🏁 FINISH LINE</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 900,
  },
  fullBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 18, 38, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  stepContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    paddingTop: 10,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0D223A',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  bannerBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1.2,
    borderColor: '#00F0FF',
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  introTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  introSubtitle: {
    color: '#FFEA00',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  miniIllustration: {
    width: 220,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  miniRoad: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#4A5568',
    borderRadius: 4,
  },
  miniRamp: {
    position: 'absolute',
    bottom: 8,
    left: 55,
    width: 80,
    height: 24,
    borderTopWidth: 5,
    borderColor: '#000000',
    transform: [{ rotate: '-18deg' }],
  },
  miniCarWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 20,
  },
  miniCarEmoji: {
    fontSize: 28,
  },
  miniFlagEmoji: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontSize: 26,
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tipText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '800',
  },
  primaryBtn: {
    flex: 1.5,
    paddingVertical: 13,
    backgroundColor: '#00D664',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7BFFB2',
    shadowColor: '#00D664',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#042813',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  instructionCard: {
    width: '92%',
    maxWidth: 390,
    backgroundColor: 'rgba(10, 26, 48, 0.94)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#00F0FF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBadge: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stepBadgeText: {
    color: '#05182D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  miniSkipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  miniSkipText: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '800',
  },
  instructionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  instructionBody: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  feedbackWarningBox: {
    backgroundColor: 'rgba(255, 170, 0, 0.22)',
    borderRadius: 10,
    padding: 7,
    borderWidth: 1.2,
    borderColor: '#FFAA00',
    marginBottom: 8,
  },
  feedbackWarningText: {
    color: '#FFEA00',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  nextBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00E676',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B9F6CA',
  },
  nextBtnText: {
    color: '#032612',
    fontSize: 13,
    fontWeight: '900',
  },
  finishArrowWrapper: {
    position: 'absolute',
    zIndex: 950,
  },
  finishArrowPill: {
    backgroundColor: '#FF2A6D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    shadowColor: '#FF2A6D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  finishArrowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  drawingZoneHighlight: {
    position: 'absolute',
    top: 75,
    left: 20,
    right: 20,
    height: 160,
    zIndex: 910,
  },
  drawingZoneBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.04)',
  },
  drawingZoneLabel: {
    color: 'rgba(0, 240, 255, 0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  handGestureWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 970,
  },
  handGestureEmoji: {
    fontSize: 34,
  },
  handGestureTrail: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  connectionTargetRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 960,
  },
  targetInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00E676',
  },
  targetLabelPill: {
    position: 'absolute',
    bottom: -22,
    backgroundColor: '#051E11',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  targetLabelText: {
    color: '#00E676',
    fontSize: 9,
    fontWeight: '900',
  },
  coinHighlightRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 960,
  },
  coinSparklePill: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: '#261D03',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  coinSparkleText: {
    color: '#FFEA00',
    fontSize: 9,
    fontWeight: '900',
  },
  finishTargetHighlight: {
    position: 'absolute',
    zIndex: 960,
  },
  finishTargetPill: {
    backgroundColor: '#FF2A6D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  finishTargetText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F2642',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 14,
  },
  celebrationSparkle: {
    fontSize: 22,
    marginBottom: 4,
  },
  celebrationTrophy: {
    fontSize: 54,
    marginBottom: 6,
  },
  celebrationTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  celebrationSubtitle: {
    color: '#7BFFB2',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  starIcon: {
    fontSize: 32,
  },
  rewardSummaryBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  rewardSummaryText: {
    color: '#FFEA00',
    fontSize: 14,
    fontWeight: '800',
  },
  celebrationBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#00E676',
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B9F6CA',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  celebrationBtnText: {
    color: '#032612',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
