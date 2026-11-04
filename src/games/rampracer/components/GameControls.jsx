import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RewardModal } from './RewardModal';
import { soundManager } from '../audio/soundManager';
export const GameControls = ({
  status,
  hasDrawnPoints,
  onClear,
  onRetry,
  onRedraw,
  onNextLevel,
  invalidDrawingMessage,
  isAutoStarting,
  level = 1,
  earnedStars = 1,
  bestStars = 1,
  coinsCollected = 3,
  coinTarget = 3,
  noCrash = true,
  isAlreadyClaimed = false,
  onClaimReward = () => {},
  onOpenLevelSelect,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Auto-start transition banner */}
      {isAutoStarting && (
        <View style={styles.autoStartPill}>
          <Text style={styles.autoStartText}>🚀 Launching car...</Text>
        </View>
      )}

      {/* Invalid drawing warning banner */}
      {invalidDrawingMessage && !isAutoStarting && status === 'drawing' && (
        <View style={styles.warningPill}>
          <Text style={styles.warningText}>{invalidDrawingMessage}</Text>
        </View>
      )}

      {/* Stuck / Crash Banner with RETRY and REDRAW prominently in the upper area */}
      {status === 'stuck' && (
        <View style={styles.upperStuckBanner} pointerEvents="auto">
          <View style={styles.upperStuckHeader}>
            <Text style={styles.upperStuckEmoji}>🚗💥</Text>
            <View style={styles.upperStuckTextCol}>
              <Text style={styles.upperStuckTitle}>CAR STUCK! TRY AGAIN</Text>
              <Text style={styles.upperStuckSubtitle}>
                Tap Retry to launch again or Redraw your ramp
              </Text>
            </View>
          </View>
          <View style={styles.upperStuckButtonRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Retry Attempt"
              activeOpacity={0.8}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onRetry();
              }}
              style={[styles.glossyButton, styles.stuckPrimaryButton]}
            >
              <View style={styles.glossSheen} />
              <Text style={styles.stuckPrimaryButtonText}>RETRY ↺</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Redraw Ramp"
              activeOpacity={0.8}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onRedraw();
              }}
              style={[styles.glossyButton, styles.stuckSecondaryButton]}
            >
              <View style={styles.glossSheen} />
              <Text style={styles.stuckSecondaryButtonText}>REDRAW ✏️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Level Complete Reward Modal with Pink Ribbon, Animated Stars & Coin, Claim, Next Level & Replay */}
      <RewardModal
        visible={status === 'success'}
        level={level}
        earnedStars={earnedStars}
        bestStars={bestStars}
        coinsCollected={coinsCollected}
        coinTarget={coinTarget}
        noCrash={noCrash}
        isAlreadyClaimed={isAlreadyClaimed}
        onClaim={onClaimReward}
        onNextLevel={onNextLevel || onRetry}
        onReplay={onRedraw}
        onOpenLevelSelect={onOpenLevelSelect}
      />

      {/* Upper Floating Control Bar (clearly visible, easy to tap, avoiding Android gesture/navigation bar) */}
      <View style={styles.upperBar} pointerEvents="box-none">
        {status === 'running' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Retry Attempt"
              activeOpacity={0.8}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onRetry();
              }}
              style={[styles.glossyButton, styles.retryUpperButton]}
            >
              <View style={styles.glossSheen} />
              <Text style={styles.retryUpperButtonText}>↺ RETRY</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'drawing' && hasDrawnPoints && !isAutoStarting && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear Drawing"
              activeOpacity={0.8}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClear();
              }}
              style={[styles.glossyButton, styles.clearButton]}
            >
              <View style={styles.glossSheen} />
              <Text style={styles.clearButtonText}>REDRAW ✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  autoStartPill: {
    position: 'absolute',
    top: 14,
    backgroundColor: '#059669',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 35,
  },
  autoStartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  warningPill: {
    position: 'absolute',
    top: 14,
    backgroundColor: '#DC2626',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FECACA',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 35,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  upperStuckBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    width: '92%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EF4444',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 60,
  },
  upperStuckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  upperStuckEmoji: {
    fontSize: 26,
  },
  upperStuckTextCol: {
    alignItems: 'flex-start',
  },
  upperStuckTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  upperStuckSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  upperStuckButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  stuckPrimaryButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderColor: '#FDE68A',
    borderBottomColor: '#B45309',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stuckPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stuckSecondaryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderColor: '#93C5FD',
    borderBottomColor: '#1D4ED8',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stuckSecondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalBanner: {
    position: 'absolute',
    top: 14,
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#EF4444',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
    zIndex: 50,
  },
  successBanner: {
    borderColor: '#10B981',
  },
  modalEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  retryBigButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderBottomWidth: 4,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  primaryModalButton: {
    backgroundColor: '#F59E0B',
    borderColor: '#FDE68A',
    borderBottomColor: '#B45309',
  },
  secondaryModalButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#BAE6FD',
    borderBottomColor: '#1D4ED8',
  },
  successButton: {
    backgroundColor: '#10B981',
    borderColor: '#A7F3D0',
    borderBottomColor: '#047857',
  },
  retryBigButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  upperBar: {
    position: 'absolute',
    top: 14,
    width: '100%',
    alignItems: 'center',
    zIndex: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  glossyButton: {
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderBottomWidth: 4,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  glossSheen: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  clearButton: {
    backgroundColor: '#EF4444',
    borderColor: '#FECACA',
    borderBottomColor: '#B91C1C',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  retryUpperButton: {
    backgroundColor: '#F59E0B',
    borderColor: '#FDE68A',
    borderBottomColor: '#B45309',
    paddingVertical: 9,
    paddingHorizontal: 24,
  },
  retryUpperButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
