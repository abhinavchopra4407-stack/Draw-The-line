import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
} from 'react-native';
import { Car } from './Car';
import { VEHICLES, getVehicleById } from '../types/vehicles';
import { soundManager } from '../audio/soundManager';
export const GarageModal = ({
  visible,
  onClose,
  totalCoins,
  unlockedVehicles,
  selectedVehicle,
  onSelectVehicle,
  onUnlockVehicle,
}) => {
  const [previewId, setPreviewId] = useState(selectedVehicle);
  const [errorMessage, setErrorMessage] = useState(null);
  // Turntable float animation
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      setPreviewId(selectedVehicle);
      setErrorMessage(null);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [visible, selectedVehicle, floatAnim]);
  const activeVehicle = getVehicleById(previewId);
  const isUnlocked = unlockedVehicles.includes(previewId);
  const isSelected = selectedVehicle === previewId;
  const canAfford = totalCoins >= activeVehicle.price;
  const handleSelect = (id) => {
    soundManager.playSfx('btn_click');
    onSelectVehicle(id);
  };
  const handleUnlock = (id) => {
    const res = onUnlockVehicle(id);
    if (res.success) {
      soundManager.playSfx('level_win');
      setErrorMessage(null);
    } else {
      soundManager.playSfx('car_fail');
      setErrorMessage(res.error || 'Failed to unlock');
    }
  };
  const handleCardPress = (id) => {
    soundManager.playSfx('btn_click');
    setPreviewId(id);
    setErrorMessage(null);
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.headerIcon}>🏎️</Text>
              <Text style={styles.titleText}>CAR GARAGE</Text>
            </View>

            {/* Coins Balance */}
            <View style={styles.coinsBadge}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={styles.coinsCount}>{totalCoins}</Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close Garage"
              style={styles.closeBtn}
              activeOpacity={0.8}
              onPress={() => {
                soundManager.playSfx('btn_click');
                onClose();
              }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Showroom Platform Preview Area */}
            <View style={styles.showroomStage}>
              <View style={styles.showroomLighting} />

              {/* Elevated Turntable Pedestal */}
              <View style={styles.pedestalPlatform}>
                <View style={styles.pedestalTop} />
                <View style={styles.pedestalRim} />
              </View>

              {/* Floating Vehicle Preview */}
              <Animated.View
                style={[
                  styles.previewCarWrapper,
                  { transform: [{ translateY: floatAnim }] },
                ]}
              >
                <Car vehicleId={previewId} scale={1.5} wheelRotation={0} />
              </Animated.View>

              {/* Status Badge */}
              <View style={styles.statusBadgeRow}>
                {isSelected ? (
                  <View style={[styles.badge, styles.badgeSelected]}>
                    <Text style={styles.badgeTextSelected}>✓ EQUIPPED</Text>
                  </View>
                ) : isUnlocked ? (
                  <View style={[styles.badge, styles.badgeUnlocked]}>
                    <Text style={styles.badgeTextUnlocked}>OWNED</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, styles.badgeLocked]}>
                    <Text style={styles.badgeTextLocked}>
                      🔒 LOCKED • 🪙 {activeVehicle.price}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Vehicle Details & Specifications */}
            <View style={styles.detailsCard}>
              <View style={styles.nameRow}>
                <Text style={styles.vehicleName}>{activeVehicle.name}</Text>
                <Text style={styles.vehicleTagline}>
                  {activeVehicle.tagline}
                </Text>
              </View>

              <Text style={styles.vehicleDesc}>
                {activeVehicle.description}
              </Text>

              {/* Vehicle Performance Stats */}
              <View style={styles.statsContainer}>
                <StatBar
                  icon="🏎️"
                  label="Speed"
                  value={activeVehicle.stats.speed}
                  color="#38BDF8"
                />
                <StatBar
                  icon="⚡"
                  label="Acceleration"
                  value={activeVehicle.stats.acceleration}
                  color="#FBBF24"
                />
                <StatBar
                  icon="🛡️"
                  label="Stability"
                  value={activeVehicle.stats.stability}
                  color="#34D399"
                />
              </View>

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              {/* Action Buttons: Equip / Unlock */}
              <View style={styles.actionRow}>
                {isSelected ? (
                  <View style={[styles.actionBtn, styles.actionBtnEquipped]}>
                    <Text style={styles.actionBtnTextEquipped}>
                      ✓ CURRENTLY ACTIVE
                    </Text>
                  </View>
                ) : isUnlocked ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${activeVehicle.name}`}
                    style={[styles.actionBtn, styles.actionBtnSelect]}
                    activeOpacity={0.8}
                    onPress={() => handleSelect(previewId)}
                  >
                    <Text style={styles.actionBtnTextSelect}>
                      SELECT VEHICLE
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Unlock ${activeVehicle.name} for ${activeVehicle.price} coins`}
                    disabled={!canAfford}
                    style={[
                      styles.actionBtn,
                      canAfford
                        ? styles.actionBtnUnlock
                        : styles.actionBtnDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleUnlock(previewId)}
                  >
                    <Text
                      style={[
                        styles.actionBtnTextUnlock,
                        !canAfford && styles.actionBtnTextDisabled,
                      ]}
                    >
                      {canAfford
                        ? `UNLOCK FOR 🪙 ${activeVehicle.price}`
                        : `NEED 🪙 ${activeVehicle.price - totalCoins} MORE`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Vehicle Selection Strip */}
            <Text style={styles.sectionTitle}>ALL VEHICLES</Text>
            <View style={styles.vehicleList}>
              {VEHICLES.map((item) => {
                const itemUnlocked = unlockedVehicles.includes(item.id);
                const itemSelected = selectedVehicle === item.id;
                const isItemPreviewed = previewId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, ${
                      itemSelected
                        ? 'equipped'
                        : itemUnlocked
                        ? 'owned'
                        : `locked, price ${item.price} coins`
                    }`}
                    style={[
                      styles.vehicleCard,
                      isItemPreviewed && styles.vehicleCardActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleCardPress(item.id)}
                  >
                    {/* Status Pip */}
                    <View style={styles.cardHeader}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.cardTitle,
                          isItemPreviewed && styles.cardTitleActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {itemSelected ? (
                        <Text style={styles.statusPipSelected}>✓</Text>
                      ) : !itemUnlocked ? (
                        <Text style={styles.statusPipLocked}>🔒</Text>
                      ) : null}
                    </View>

                    {/* Miniature thumbnail */}
                    <View style={styles.thumbWrapper}>
                      <Car vehicleId={item.id} scale={0.7} wheelRotation={0} />
                    </View>

                    {/* Price or Owned text */}
                    <View style={styles.cardFooter}>
                      {itemSelected ? (
                        <Text style={styles.cardFooterActive}>EQUIPPED</Text>
                      ) : itemUnlocked ? (
                        <Text style={styles.cardFooterOwned}>OWNED</Text>
                      ) : (
                        <Text style={styles.cardFooterPrice}>
                          🪙 {item.price}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
const StatBar = ({ icon, label, value, color }) => {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLabelCol}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.statTrack}>
        <View
          style={[
            styles.statFill,
            { width: `${Math.min(100, value * 10)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.statValueText}>{value}/10</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    height: '86%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1.5,
    borderBottomColor: '#334155',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 5,
  },
  coinIcon: {
    fontSize: 14,
  },
  coinsCount: {
    color: '#FFEA00',
    fontSize: 14,
    fontWeight: '900',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  showroomStage: {
    width: '100%',
    height: 140,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#475569',
  },
  showroomLighting: {
    position: 'absolute',
    top: -40,
    width: 180,
    height: 120,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 90,
  },
  pedestalPlatform: {
    position: 'absolute',
    bottom: 22,
    width: 140,
    height: 16,
    alignItems: 'center',
  },
  pedestalTop: {
    width: 140,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 70,
    borderWidth: 1,
    borderColor: '#64748B',
  },
  pedestalRim: {
    width: 136,
    height: 8,
    backgroundColor: '#0F172A',
    borderBottomLeftRadius: 68,
    borderBottomRightRadius: 68,
  },
  previewCarWrapper: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  statusBadgeRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#10B981',
  },
  badgeTextSelected: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '900',
  },
  badgeUnlocked: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38BDF8',
  },
  badgeTextUnlocked: {
    color: '#7DD3FC',
    fontSize: 11,
    fontWeight: '900',
  },
  badgeLocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  badgeTextLocked: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '900',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  nameRow: {
    marginBottom: 4,
  },
  vehicleName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vehicleTagline: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  vehicleDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  statsContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  statTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValueText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionRow: {
    marginTop: 2,
  },
  actionBtn: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnEquipped: {
    backgroundColor: '#064E3B',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  actionBtnTextEquipped: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionBtnSelect: {
    backgroundColor: '#EAB308',
    borderWidth: 1.5,
    borderColor: '#FACC15',
  },
  actionBtnTextSelect: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionBtnUnlock: {
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  actionBtnTextUnlock: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionBtnDisabled: {
    backgroundColor: '#334155',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  actionBtnTextDisabled: {
    color: '#94A3B8',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
  },
  vehicleList: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  vehicleCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
  },
  vehicleCardActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#243047',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  cardTitleActive: {
    color: '#FBBF24',
  },
  statusPipSelected: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '900',
  },
  statusPipLocked: {
    fontSize: 10,
  },
  thumbWrapper: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  cardFooter: {
    marginTop: 2,
  },
  cardFooterActive: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '900',
  },
  cardFooterOwned: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  cardFooterPrice: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
});
