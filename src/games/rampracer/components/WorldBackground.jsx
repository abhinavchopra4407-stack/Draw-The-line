import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { getWorldForLevel } from '../types/worlds';
export const WorldBackground = ({ world: propWorld, level = 1, children }) => {
  const activeWorld = propWorld ?? getWorldForLevel(level);
  // Crossfade transition state when world changes
  const [currentWorld, setCurrentWorld] = useState(activeWorld);
  const [prevWorld, setPrevWorld] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (activeWorld.id !== currentWorld.id) {
      setPrevWorld(currentWorld);
      setCurrentWorld(activeWorld);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: process.env?.NODE_ENV !== 'test',
      }).start(() => {
        setPrevWorld(null);
      });
    }
  }, [activeWorld, currentWorld, fadeAnim]);
  return (
    <View style={styles.container}>
      {/* Background World Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Previous world fading out during transition */}
        {prevWorld && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            <WorldBackdrop world={prevWorld} />
          </Animated.View>
        )}

        {/* Current world fading in */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: prevWorld ? fadeAnim : 1,
            },
          ]}
        >
          <WorldBackdrop world={currentWorld} />
        </Animated.View>
      </View>

      {/* Children elements (gameplay area, header, modals) */}
      {children}
    </View>
  );
};
const WorldBackdrop = ({ world }) => {
  return (
    <View style={styles.backdropContainer}>
      {/* Sky Gradient Bands */}
      <View style={styles.gradientContainer}>
        {world.skyGradients.map((color, index) => (
          <View
            key={`sky-stop-${world.id}-${index}`}
            style={[styles.gradientBand, { backgroundColor: color }]}
          />
        ))}
      </View>

      {/* Thematic Scenery for each world */}
      {world.id === 'green_valley' && <GreenValleyScenery />}
      {world.id === 'desert_world' && <DesertScenery />}
      {world.id === 'snow_world' && <SnowScenery />}
      {world.id === 'candy_world' && <CandyScenery />}
      {world.id === 'space_world' && <SpaceScenery />}
    </View>
  );
};
/* -------------------------------------------------------------
 * 1. GREEN VALLEY SCENERY (Levels 1–10)
 * Green hills, trees, blue sky and clouds.
 * ------------------------------------------------------------- */
const GreenValleyScenery = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Cartoon Puffy Clouds */}
      <View style={[styles.cloud, styles.gvCloud1]}>
        <View style={styles.cloudMain} />
        <View style={[styles.cloudPuff, styles.gvPuff1]} />
        <View style={[styles.cloudPuff, styles.gvPuff2]} />
      </View>

      <View style={[styles.cloud, styles.gvCloud2]}>
        <View style={[styles.cloudMain, styles.gvCloud2Main]} />
        <View style={[styles.cloudPuff, styles.gvCloud2Puff1]} />
        <View style={[styles.cloudPuff, styles.gvCloud2Puff2]} />
      </View>

      <View style={[styles.cloud, styles.gvCloud3]}>
        <View style={[styles.cloudMain, styles.gvCloud3Main]} />
        <View style={[styles.cloudPuff, styles.gvCloud3Puff1]} />
      </View>

      {/* Distant Hills (Darker green) */}
      <View style={styles.gvDistantHills}>
        <View style={styles.gvHillFarLeft} />
        <View style={styles.gvHillFarCenter} />
        <View style={styles.gvHillFarRight} />
      </View>

      {/* Near Rolling Green Hills */}
      <View style={styles.gvNearHills}>
        <View style={styles.gvHillNearLeft} />
        <View style={styles.gvHillNearRight} />
      </View>

      {/* Pine & Oak Trees */}
      <View style={[styles.treeWrapper, { left: '8%', bottom: 95 }]}>
        <View style={styles.pineTreeTop} />
        <View style={styles.pineTreeMid} />
        <View style={styles.pineTreeBottom} />
        <View style={styles.treeTrunk} />
      </View>

      <View style={[styles.treeWrapper, { left: '32%', bottom: 90 }]}>
        <View style={styles.oakTreeFoliage} />
        <View style={styles.treeTrunk} />
      </View>

      <View style={[styles.treeWrapper, { right: '14%', bottom: 96 }]}>
        <View style={styles.pineTreeTop} />
        <View style={styles.pineTreeMid} />
        <View style={styles.pineTreeBottom} />
        <View style={styles.treeTrunk} />
      </View>

      <View style={[styles.treeWrapper, { right: '28%', bottom: 92 }]}>
        <View style={styles.oakTreeFoliageSmall} />
        <View style={styles.treeTrunk} />
      </View>
    </View>
  );
};
/* -------------------------------------------------------------
 * 2. DESERT WORLD SCENERY (Levels 11–20)
 * Sand dunes, cactus and warm sky.
 * ------------------------------------------------------------- */
const DesertScenery = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Radiant Desert Sun */}
      <View style={styles.desertSunOuter}>
        <View style={styles.desertSunMid}>
          <View style={styles.desertSunCore} />
        </View>
      </View>

      {/* Heat Haze Wisps */}
      <View style={[styles.heatHaze, { top: 90, left: '20%' }]} />
      <View style={[styles.heatHaze, { top: 120, right: '25%', width: 140 }]} />

      {/* Distant Amber Sand Dunes */}
      <View style={styles.desertDunesFar}>
        <View style={styles.desertDuneFar1} />
        <View style={styles.desertDuneFar2} />
        <View style={styles.desertDuneFar3} />
      </View>

      {/* Near Golden Sand Dunes */}
      <View style={styles.desertDunesNear}>
        <View style={styles.desertDuneNear1} />
        <View style={styles.desertDuneNear2} />
      </View>

      {/* Saguaro Cacti */}
      <View style={[styles.cactusWrapper, { left: '10%', bottom: 92 }]}>
        <View style={styles.cactusStem} />
        <View style={styles.cactusLeftArmH} />
        <View style={styles.cactusLeftArmV} />
        <View style={styles.cactusRightArmH} />
        <View style={styles.cactusRightArmV} />
      </View>

      <View
        style={[
          styles.cactusWrapper,
          { left: '46%', bottom: 95, transform: [{ scale: 0.75 }] },
        ]}
      >
        <View style={styles.cactusStem} />
        <View style={styles.cactusLeftArmH} />
        <View style={styles.cactusLeftArmV} />
      </View>

      <View
        style={[
          styles.cactusWrapper,
          { right: '12%', bottom: 92, transform: [{ scale: 0.9 }] },
        ]}
      >
        <View style={styles.cactusStem} />
        <View style={styles.cactusLeftArmH} />
        <View style={styles.cactusLeftArmV} />
        <View style={styles.cactusRightArmH} />
        <View style={styles.cactusRightArmV} />
      </View>
    </View>
  );
};
/* -------------------------------------------------------------
 * 3. SNOW WORLD SCENERY (Levels 21–30)
 * Snow-covered mountains and icy surroundings.
 * ------------------------------------------------------------- */
const SnowScenery = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Arctic Aurora Glow */}
      <View style={styles.auroraGlow} />

      {/* Falling / Floating Snowflakes */}
      <View
        style={[
          styles.snowflake,
          { top: 70, left: '15%', width: 6, height: 6 },
        ]}
      />
      <View
        style={[
          styles.snowflake,
          { top: 110, left: '42%', width: 8, height: 8 },
        ]}
      />
      <View
        style={[
          styles.snowflake,
          { top: 85, right: '22%', width: 7, height: 7 },
        ]}
      />
      <View
        style={[
          styles.snowflake,
          { top: 160, left: '28%', width: 5, height: 5 },
        ]}
      />
      <View
        style={[
          styles.snowflake,
          { top: 190, right: '35%', width: 9, height: 9 },
        ]}
      />
      <View
        style={[
          styles.snowflake,
          { top: 230, right: '12%', width: 6, height: 6 },
        ]}
      />
      <View
        style={[
          styles.snowflake,
          { top: 260, left: '50%', width: 7, height: 7 },
        ]}
      />

      {/* Distant Mountain Peaks */}
      <View style={styles.snowMountainsBack}>
        <View style={[styles.mountainPeak, styles.peakBackLeft]}>
          <View style={styles.peakSnowCap} />
        </View>
        <View style={[styles.mountainPeak, styles.peakBackCenter]}>
          <View style={styles.peakSnowCap} />
        </View>
        <View style={[styles.mountainPeak, styles.peakBackRight]}>
          <View style={styles.peakSnowCap} />
        </View>
      </View>

      {/* Fore Mountains */}
      <View style={styles.snowMountainsFore}>
        <View style={[styles.mountainPeak, styles.peakForeLeft]}>
          <View style={styles.peakSnowCapLarge} />
        </View>
        <View style={[styles.mountainPeak, styles.peakForeRight]}>
          <View style={styles.peakSnowCapLarge} />
        </View>
      </View>

      {/* Frosted Pine Trees with White Snow */}
      <View style={[styles.snowPineWrapper, { left: '12%', bottom: 94 }]}>
        <View style={styles.snowPineSnow3} />
        <View style={styles.snowPineLayer3} />
        <View style={styles.snowPineSnow2} />
        <View style={styles.snowPineLayer2} />
        <View style={styles.snowPineSnow1} />
        <View style={styles.snowPineLayer1} />
        <View style={styles.snowPineTrunk} />
      </View>

      <View
        style={[
          styles.snowPineWrapper,
          { right: '18%', bottom: 94, transform: [{ scale: 0.85 }] },
        ]}
      >
        <View style={styles.snowPineSnow3} />
        <View style={styles.snowPineLayer3} />
        <View style={styles.snowPineSnow2} />
        <View style={styles.snowPineLayer2} />
        <View style={styles.snowPineSnow1} />
        <View style={styles.snowPineLayer1} />
        <View style={styles.snowPineTrunk} />
      </View>
    </View>
  );
};
/* -------------------------------------------------------------
 * 4. CANDY WORLD SCENERY (Levels 31–40)
 * Colourful candy decorations and fantasy backgrounds.
 * ------------------------------------------------------------- */
const CandyScenery = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Fantasy Sparkles / Candies */}
      <View style={[styles.candySparkle, { top: 60, left: '20%' }]}>
        <View style={styles.sparkleDot} />
      </View>
      <View
        style={[
          styles.candySparkle,
          { top: 110, right: '25%', transform: [{ scale: 1.3 }] },
        ]}
      >
        <View style={[styles.sparkleDot, { backgroundColor: '#FDE047' }]} />
      </View>
      <View style={[styles.candySparkle, { top: 170, left: '45%' }]}>
        <View style={[styles.sparkleDot, { backgroundColor: '#A7F3D0' }]} />
      </View>

      {/* Pastel Marshmallow Hills */}
      <View style={styles.candyHillsFar}>
        <View style={styles.marshmallowHill1} />
        <View style={styles.marshmallowHill2} />
      </View>
      <View style={styles.candyHillsNear}>
        <View style={styles.marshmallowHill3} />
        <View style={styles.marshmallowHill4} />
      </View>

      {/* Giant Swirl Lollipop Left */}
      <View style={[styles.lollipopWrapper, { left: '10%', bottom: 94 }]}>
        <View style={[styles.lollipopHead, { backgroundColor: '#F43F5E' }]}>
          <View style={styles.lollipopSwirlInner} />
          <View style={styles.lollipopCenterDot} />
        </View>
        <View style={styles.lollipopStick} />
      </View>

      {/* Striped Candy Cane Center-Right */}
      <View style={[styles.candyCaneWrapper, { right: '26%', bottom: 92 }]}>
        <View style={styles.candyCaneHook} />
        <View style={styles.candyCaneStem} />
      </View>

      {/* Giant Swirl Lollipop Right */}
      <View
        style={[
          styles.lollipopWrapper,
          { right: '8%', bottom: 94, transform: [{ scale: 0.85 }] },
        ]}
      >
        <View style={[styles.lollipopHead, { backgroundColor: '#8B5CF6' }]}>
          <View
            style={[styles.lollipopSwirlInner, { borderColor: '#E9D5FF' }]}
          />
          <View
            style={[styles.lollipopCenterDot, { backgroundColor: '#FDE047' }]}
          />
        </View>
        <View style={styles.lollipopStick} />
      </View>
    </View>
  );
};
/* -------------------------------------------------------------
 * 5. SPACE WORLD SCENERY (Levels 41–50)
 * Stars, planets and colourful space backgrounds.
 * ------------------------------------------------------------- */
const SpaceScenery = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Cosmic Nebula Glow Dust */}
      <View style={styles.spaceNebula} />
      <View style={styles.spaceNebula2} />

      {/* Twinkling Stars across Space */}
      <View style={[styles.spaceStar, { top: 40, left: '10%' }]} />
      <View
        style={[
          styles.spaceStar,
          { top: 60, left: '35%', width: 4, height: 4 },
        ]}
      />
      <View
        style={[
          styles.spaceStar,
          {
            top: 35,
            right: '15%',
            width: 5,
            height: 5,
            backgroundColor: '#FDE047',
          },
        ]}
      />
      <View style={[styles.spaceStar, { top: 90, left: '60%' }]} />
      <View
        style={[
          styles.spaceStar,
          { top: 120, left: '22%', width: 4, height: 4 },
        ]}
      />
      <View style={[styles.spaceStar, { top: 145, right: '30%' }]} />
      <View
        style={[
          styles.spaceStar,
          { top: 175, left: '80%', width: 3, height: 3 },
        ]}
      />
      <View
        style={[
          styles.spaceStar,
          {
            top: 210,
            left: '15%',
            width: 5,
            height: 5,
            backgroundColor: '#67E8F9',
          },
        ]}
      />
      <View
        style={[
          styles.spaceStar,
          { top: 250, right: '18%', width: 4, height: 4 },
        ]}
      />

      {/* Ringed Giant Planet (Saturn-like) */}
      <View style={styles.saturnPlanetWrapper}>
        <View style={styles.saturnRingBack} />
        <View style={styles.saturnSphere}>
          <View style={styles.saturnAtmosphereBand} />
        </View>
        <View style={styles.saturnRingFront} />
      </View>

      {/* Distant Cratered Moon / Exoplanet */}
      <View style={styles.spaceMoonWrapper}>
        <View style={styles.spaceMoonSphere}>
          <View
            style={[
              styles.moonCrater,
              { top: 8, left: 6, width: 8, height: 8 },
            ]}
          />
          <View
            style={[
              styles.moonCrater,
              { top: 16, left: 18, width: 10, height: 10 },
            ]}
          />
          <View
            style={[
              styles.moonCrater,
              { top: 24, left: 9, width: 6, height: 6 },
            ]}
          />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  backdropContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBand: {
    flex: 1,
  },
  /* Common Cloud styles */
  cloud: {
    position: 'absolute',
    opacity: 0.88,
  },
  cloudMain: {
    width: 100,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  cloudPuff: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
  },
  /* Green Valley */
  gvCloud1: { top: 55, left: '10%' },
  gvPuff1: { width: 44, height: 44, top: -20, left: 16 },
  gvPuff2: { width: 34, height: 34, top: -14, left: 48 },
  gvCloud2: { top: 90, right: '12%' },
  gvCloud2Main: { width: 85, height: 26 },
  gvCloud2Puff1: { width: 36, height: 36, top: -16, left: 14 },
  gvCloud2Puff2: { width: 28, height: 28, top: -12, left: 42 },
  gvCloud3: { top: 140, left: '46%' },
  gvCloud3Main: { width: 75, height: 22 },
  gvCloud3Puff1: { width: 30, height: 30, top: -12, left: 22 },
  gvDistantHills: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 120,
  },
  gvHillFarLeft: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    width: 240,
    height: 110,
    backgroundColor: '#15803D',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    opacity: 0.7,
  },
  gvHillFarCenter: {
    position: 'absolute',
    bottom: 0,
    left: '30%',
    width: 260,
    height: 95,
    backgroundColor: '#166534',
    borderTopLeftRadius: 130,
    borderTopRightRadius: 130,
    opacity: 0.65,
  },
  gvHillFarRight: {
    position: 'absolute',
    bottom: 0,
    right: -50,
    width: 280,
    height: 115,
    backgroundColor: '#15803D',
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    opacity: 0.7,
  },
  gvNearHills: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 75,
  },
  gvHillNearLeft: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    width: 220,
    height: 70,
    backgroundColor: '#22C55E',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
  },
  gvHillNearRight: {
    position: 'absolute',
    bottom: 0,
    right: -30,
    width: 250,
    height: 65,
    backgroundColor: '#16A34A',
    borderTopLeftRadius: 125,
    borderTopRightRadius: 125,
  },
  treeWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  pineTreeTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#166534',
  },
  pineTreeMid: {
    width: 0,
    height: 0,
    marginTop: -8,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#15803D',
  },
  pineTreeBottom: {
    width: 0,
    height: 0,
    marginTop: -8,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#16A34A',
  },
  oakTreeFoliage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#15803D',
  },
  oakTreeFoliageSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#166534',
  },
  treeTrunk: {
    width: 8,
    height: 14,
    backgroundColor: '#78350F',
    borderRadius: 2,
  },
  /* Desert World */
  desertSunOuter: {
    position: 'absolute',
    top: 50,
    right: '18%',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(254, 240, 138, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desertSunMid: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(253, 224, 71, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desertSunCore: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEF08A',
  },
  heatHaze: {
    position: 'absolute',
    width: 100,
    height: 6,
    backgroundColor: 'rgba(254, 243, 199, 0.35)',
    borderRadius: 3,
  },
  desertDunesFar: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 120,
  },
  desertDuneFar1: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    width: 250,
    height: 100,
    backgroundColor: '#B45309',
    borderTopLeftRadius: 140,
    borderTopRightRadius: 110,
    opacity: 0.75,
  },
  desertDuneFar2: {
    position: 'absolute',
    bottom: 0,
    left: '35%',
    width: 280,
    height: 115,
    backgroundColor: '#92400E',
    borderTopLeftRadius: 150,
    borderTopRightRadius: 130,
    opacity: 0.75,
  },
  desertDuneFar3: {
    position: 'absolute',
    bottom: 0,
    right: -40,
    width: 230,
    height: 90,
    backgroundColor: '#B45309',
    borderTopLeftRadius: 130,
    borderTopRightRadius: 120,
    opacity: 0.7,
  },
  desertDunesNear: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 70,
  },
  desertDuneNear1: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    width: 240,
    height: 65,
    backgroundColor: '#D97706',
    borderTopLeftRadius: 130,
    borderTopRightRadius: 120,
  },
  desertDuneNear2: {
    position: 'absolute',
    bottom: 0,
    right: -20,
    width: 260,
    height: 60,
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 140,
    borderTopRightRadius: 120,
  },
  cactusWrapper: {
    position: 'absolute',
    width: 32,
    height: 58,
    alignItems: 'center',
  },
  cactusStem: {
    width: 10,
    height: 54,
    backgroundColor: '#15803D',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#166534',
  },
  cactusLeftArmH: {
    position: 'absolute',
    top: 22,
    left: 2,
    width: 11,
    height: 7,
    backgroundColor: '#15803D',
  },
  cactusLeftArmV: {
    position: 'absolute',
    top: 10,
    left: 2,
    width: 7,
    height: 18,
    backgroundColor: '#15803D',
    borderRadius: 3.5,
  },
  cactusRightArmH: {
    position: 'absolute',
    top: 14,
    right: 2,
    width: 11,
    height: 7,
    backgroundColor: '#15803D',
  },
  cactusRightArmV: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 7,
    height: 16,
    backgroundColor: '#15803D',
    borderRadius: 3.5,
  },
  /* Snow World */
  auroraGlow: {
    position: 'absolute',
    top: 30,
    left: '5%',
    right: '5%',
    height: 120,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderRadius: 60,
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    opacity: 0.85,
  },
  snowMountainsBack: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 140,
  },
  mountainPeak: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  peakBackLeft: {
    bottom: 0,
    left: '5%',
    borderLeftWidth: 70,
    borderRightWidth: 70,
    borderBottomWidth: 110,
    borderBottomColor: '#475569',
  },
  peakBackCenter: {
    bottom: 0,
    left: '32%',
    borderLeftWidth: 95,
    borderRightWidth: 95,
    borderBottomWidth: 140,
    borderBottomColor: '#334155',
  },
  peakBackRight: {
    bottom: 0,
    right: '2%',
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 120,
    borderBottomColor: '#475569',
  },
  peakSnowCap: {
    position: 'absolute',
    top: 0,
    left: -24,
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 38,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F8FAFC',
  },
  snowMountainsFore: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 90,
  },
  peakForeLeft: {
    bottom: 0,
    left: -15,
    borderLeftWidth: 85,
    borderRightWidth: 85,
    borderBottomWidth: 85,
    borderBottomColor: '#64748B',
  },
  peakForeRight: {
    bottom: 0,
    right: -20,
    borderLeftWidth: 90,
    borderRightWidth: 90,
    borderBottomWidth: 80,
    borderBottomColor: '#64748B',
  },
  peakSnowCapLarge: {
    position: 'absolute',
    top: 0,
    left: -28,
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderBottomWidth: 32,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  snowPineWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  snowPineLayer1: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0F766E',
  },
  snowPineSnow1: {
    width: 0,
    height: 0,
    marginBottom: -8,
    zIndex: 2,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F8FAFC',
  },
  snowPineLayer2: {
    width: 0,
    height: 0,
    marginTop: -8,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0D9488',
  },
  snowPineSnow2: {
    width: 0,
    height: 0,
    marginBottom: -8,
    zIndex: 2,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  snowPineLayer3: {
    width: 0,
    height: 0,
    marginTop: -8,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#14B8A6',
  },
  snowPineSnow3: {
    width: 0,
    height: 0,
    marginBottom: -6,
    zIndex: 2,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  snowPineTrunk: {
    width: 6,
    height: 10,
    backgroundColor: '#334155',
  },
  /* Candy World */
  candySparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    shadowColor: '#F472B6',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  candyHillsFar: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 110,
  },
  marshmallowHill1: {
    position: 'absolute',
    bottom: 0,
    left: -30,
    width: 250,
    height: 100,
    backgroundColor: '#C084FC',
    borderTopLeftRadius: 130,
    borderTopRightRadius: 130,
    opacity: 0.75,
  },
  marshmallowHill2: {
    position: 'absolute',
    bottom: 0,
    right: -40,
    width: 270,
    height: 105,
    backgroundColor: '#E879F9',
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    opacity: 0.75,
  },
  candyHillsNear: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    height: 65,
  },
  marshmallowHill3: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 200,
    height: 60,
    backgroundColor: '#F472B6',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  marshmallowHill4: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    width: 220,
    height: 55,
    backgroundColor: '#FB7185',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
  },
  lollipopWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  lollipopHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lollipopSwirlInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#FECDD3',
  },
  lollipopCenterDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  lollipopStick: {
    width: 4,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  candyCaneWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  candyCaneHook: {
    width: 22,
    height: 22,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 5,
    borderBottomWidth: 0,
    borderColor: '#EF4444',
    backgroundColor: 'transparent',
  },
  candyCaneStem: {
    width: 5,
    height: 36,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 2,
    marginTop: -2,
  },
  /* Space World */
  spaceNebula: {
    position: 'absolute',
    top: 50,
    left: '10%',
    width: 180,
    height: 90,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderRadius: 45,
  },
  spaceNebula2: {
    position: 'absolute',
    top: 130,
    right: '15%',
    width: 140,
    height: 80,
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    borderRadius: 40,
  },
  spaceStar: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
    opacity: 0.9,
  },
  saturnPlanetWrapper: {
    position: 'absolute',
    top: 65,
    right: '12%',
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saturnRingBack: {
    position: 'absolute',
    width: 84,
    height: 18,
    borderRadius: 42,
    borderWidth: 3.5,
    borderColor: 'rgba(253, 224, 71, 0.75)',
    transform: [{ rotate: '-18deg' }],
  },
  saturnSphere: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F59E0B',
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  saturnAtmosphereBand: {
    width: '100%',
    height: 9,
    backgroundColor: '#D97706',
  },
  saturnRingFront: {
    position: 'absolute',
    width: 84,
    height: 18,
    borderRadius: 42,
    borderWidth: 3.5,
    borderColor: '#FEF08A',
    transform: [{ rotate: '-18deg' }],
    opacity: 0.85,
  },
  spaceMoonWrapper: {
    position: 'absolute',
    top: 155,
    left: '14%',
  },
  spaceMoonSphere: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#67E8F9',
    borderWidth: 1.5,
    borderColor: '#CFFAFE',
    overflow: 'hidden',
  },
  moonCrater: {
    position: 'absolute',
    backgroundColor: '#0891B2',
    borderRadius: 10,
    opacity: 0.5,
  },
});
