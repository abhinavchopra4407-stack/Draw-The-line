import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { soundManager } from '../audio/soundManager';
export const SettingsModal = ({
  visible,
  onClose,
  sfxEnabled,
  musicEnabled,
  onToggleSfx,
  onToggleMusic,
  highestUnlockedLevel,
  completedCount,
  totalCoins,
  totalStars = 0,
  unlockedAchievementsCount = 0,
  onResetProgress,
  onOpenLevelSelect,
  onOpenGarage,
  onOpenAchievements,
  onReplayTutorial,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const handleResetPress = () => {
    soundManager.playSfx('btn_click');
    setConfirmingReset(true);
  };
  const handleConfirmReset = () => {
    soundManager.playSfx('btn_click');
    setConfirmingReset(false);
    onResetProgress();
    onClose();
  };
  const handleCancelReset = () => {
    soundManager.playSfx('btn_click');
    setConfirmingReset(false);
  };
  const handleClose = () => {
    soundManager.playSfx('btn_click');
    setConfirmingReset(false);
    onClose();
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚙️ GAME SETTINGS</Text>
          </View>

          {/* Audio Controls */}
          <View style={styles.section}>
            {/* Sound FX Toggle */}
            <View style={styles.row}>
              <View style={styles.labelCol}>
                <Text style={styles.rowTitle}>🔊 Sound Effects</Text>
                <Text style={styles.rowSub}>
                  Clicks, engine, collisions & chimes
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  sfxEnabled ? styles.toggleOn : styles.toggleOff,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  onToggleSfx(!sfxEnabled);
                }}
              >
                <Text style={styles.toggleText}>
                  {sfxEnabled ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Background Music Toggle */}
            <View style={[styles.row, { marginTop: 14 }]}>
              <View style={styles.labelCol}>
                <Text style={styles.rowTitle}>🎵 Background Music</Text>
                <Text style={styles.rowSub}>
                  Cheerful child-friendly melody
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  musicEnabled ? styles.toggleOn : styles.toggleOff,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  onToggleMusic(!musicEnabled);
                }}
              >
                <Text style={styles.toggleText}>
                  {musicEnabled ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Summary */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{`⭐ ${totalStars}`}</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={styles.statVal}
              >{`Lvl ${highestUnlockedLevel}`}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{`${completedCount} / 50`}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{`🪙 ${totalCoins}`}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </View>

          {/* Quick Navigation to Garage */}
          {onOpenGarage && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Car Garage"
              style={styles.garageBtn}
              activeOpacity={0.85}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
                onOpenGarage();
              }}
            >
              <Text style={styles.garageBtnText}>🏎️ OPEN CAR GARAGE</Text>
            </TouchableOpacity>
          )}

          {/* Quick Navigation to Achievements */}
          {onOpenAchievements && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View Achievements"
              style={styles.achievementsBtn}
              activeOpacity={0.85}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
                onOpenAchievements();
              }}
            >
              <Text style={styles.achievementsBtnText}>
                {`🏆 VIEW ACHIEVEMENTS (${unlockedAchievementsCount} / 7)`}
              </Text>
            </TouchableOpacity>
          )}

          {/* How to Play Tutorial Replay Button */}
          {onReplayTutorial && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="How to Play Tutorial"
              style={styles.tutorialBtn}
              activeOpacity={0.85}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
                onReplayTutorial();
              }}
            >
              <Text style={styles.tutorialBtnText}>
                🎓 HOW TO PLAY (TUTORIAL)
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Navigation to Level Select */}
          {onOpenLevelSelect && (
            <TouchableOpacity
              style={styles.levelSelectBtn}
              activeOpacity={0.85}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
                onOpenLevelSelect();
              }}
            >
              <Text style={styles.levelSelectBtnText}>
                🗺️ BROWSE ALL 50 LEVELS
              </Text>
            </TouchableOpacity>
          )}

          {/* Reset Progress Section */}
          {confirmingReset ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                ⚠️ Reset ALL progress, coins & unlocked levels?
              </Text>
              <View style={styles.confirmBtnRow}>
                <TouchableOpacity
                  style={[styles.smallBtn, styles.cancelBtn]}
                  onPress={handleCancelReset}
                >
                  <Text style={styles.smallBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, styles.dangerBtn]}
                  onPress={handleConfirmReset}
                >
                  <Text style={styles.smallBtnText}>Reset Everything</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.8}
              onPress={handleResetPress}
            >
              <Text style={styles.resetBtnText}>🔄 Reset Game Progress</Text>
            </TouchableOpacity>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.85}
            onPress={handleClose}
          >
            <Text style={styles.closeBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 18, 35, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 4,
    borderColor: '#3BD1FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D3880',
    letterSpacing: 1.5,
  },
  section: {
    backgroundColor: '#F3F9FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelCol: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C2E4A',
  },
  rowSub: {
    fontSize: 12,
    color: '#5C718E',
    marginTop: 2,
  },
  toggleBtn: {
    width: 68,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  toggleOn: {
    backgroundColor: '#1FD655',
    borderColor: '#11A83E',
  },
  toggleOff: {
    backgroundColor: '#9DA8B6',
    borderColor: '#6F7B8B',
  },
  toggleText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFE072',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#8A5800',
  },
  statLabel: {
    fontSize: 11,
    color: '#9C7A33',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#FFE072',
  },
  resetBtn: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFA5A5',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  resetBtnText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '800',
  },
  confirmBox: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB74D',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: '#BF360C',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: '#9E9E9E',
  },
  dangerBtn: {
    backgroundColor: '#E53935',
  },
  smallBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  closeBtn: {
    backgroundColor: '#FFB300',
    borderColor: '#D48800',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#B87200',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4,
  },
  closeBtnText: {
    color: '#422400',
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 2,
  },
  garageBtn: {
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderBottomWidth: 4,
    borderBottomColor: '#0369A1',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  garageBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  achievementsBtn: {
    backgroundColor: '#D97706', // Vibrant gold amber
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderBottomWidth: 4,
    borderBottomColor: '#78350F',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  achievementsBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  tutorialBtn: {
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#34D399',
    borderBottomWidth: 4,
    borderBottomColor: '#065F46',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  tutorialBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  levelSelectBtn: {
    backgroundColor: '#7B1FA2',
    borderWidth: 2,
    borderColor: '#BA68C8',
    borderBottomWidth: 4,
    borderBottomColor: '#4A148C',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  levelSelectBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
