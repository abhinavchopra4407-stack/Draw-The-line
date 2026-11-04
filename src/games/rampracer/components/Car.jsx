import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
export const Car = ({
  vehicleId = 'sports_car',
  style,
  scale = 1,
  wheelRotation = 0,
  angle = 0,
  hasMagnet = false,
  hasShield = false,
  hasSpeedBoost = false,
}) => {
  return (
    <View
      style={[
        styles.carRoot,
        {
          transform: [{ rotate: `${angle}deg` }, { scale }],
        },
        style,
      ]}
    >
      {/* Speed Boost Nitro Exhaust Flames & Speed Streaks */}
      {hasSpeedBoost && (
        <View style={powerUpFxStyles.nitroContainer} pointerEvents="none">
          <View style={powerUpFxStyles.nitroFlameOuter}>
            <View style={powerUpFxStyles.nitroFlameInner} />
          </View>
          <View
            style={[
              powerUpFxStyles.nitroFlameOuter,
              { top: 30, transform: [{ scale: 0.85 }] },
            ]}
          >
            <View style={powerUpFxStyles.nitroFlameInner} />
          </View>
          <View style={powerUpFxStyles.speedStreak1} />
          <View style={powerUpFxStyles.speedStreak2} />
        </View>
      )}

      {/* Redesigned Realistic Vehicle Bodies */}
      {vehicleId === 'sports_car' && (
        <SportsCarBody wheelRotation={wheelRotation} />
      )}
      {vehicleId === 'monster_truck' && (
        <MonsterTruckBody wheelRotation={wheelRotation} />
      )}
      {vehicleId === 'police_car' && (
        <PoliceCarBody wheelRotation={wheelRotation} />
      )}
      {vehicleId === 'racing_car' && (
        <RacingCarBody wheelRotation={wheelRotation} />
      )}
      {vehicleId === 'school_bus' && (
        <SchoolBusBody wheelRotation={wheelRotation} />
      )}

      {/* Magnet Electromagnetic Flux Rings */}
      {hasMagnet && (
        <View style={powerUpFxStyles.magnetField} pointerEvents="none">
          <View style={powerUpFxStyles.magnetRing1} />
          <View style={powerUpFxStyles.magnetRing2} />
        </View>
      )}

      {/* Shield Energy Bubble Barrier */}
      {hasShield && (
        <View style={powerUpFxStyles.shieldBubble} pointerEvents="none">
          <View style={powerUpFxStyles.shieldShimmer} />
          <View style={powerUpFxStyles.shieldHighlight} />
        </View>
      )}
    </View>
  );
};
// =========================================================================
// 1. SPORTS CAR - Realistic Crimson Aerodynamic GT Supercar
// =========================================================================
const SportsCarBody = ({ wheelRotation }) => {
  return (
    <View style={styles.chassis}>
      {/* Aerodynamic Carbon GT Rear Wing */}
      <View style={sportsStyles.wingStrutLeft} />
      <View style={sportsStyles.wingStrutRight} />
      <View style={sportsStyles.wingBlade}>
        <View style={sportsStyles.wingEndplate} />
      </View>

      {/* Low-Drag Greenhouse Cockpit */}
      <View style={sportsStyles.cockpit}>
        {/* Rear Quarter Window */}
        <View style={sportsStyles.rearQuarterWindow}>
          <View style={sharedStyles.windowReflect} />
        </View>
        {/* Sleek B-Pillar */}
        <View style={sportsStyles.pillar} />
        {/* Main Side Window */}
        <View style={sportsStyles.sideWindow}>
          <View style={sharedStyles.windowReflect} />
        </View>
        {/* Fastback Windshield Slope */}
        <View style={sportsStyles.windshield}>
          <View style={sharedStyles.windshieldGlare} />
        </View>
      </View>

      {/* Sculpted Supercar Body Shell */}
      <View style={sportsStyles.body}>
        {/* Metallic Red Hood Highlight */}
        <View style={sportsStyles.hoodHighlight} />
        {/* Subtle Hood Air Vent */}
        <View style={sportsStyles.hoodVent} />
        {/* Silver Character Line / Stripe */}
        <View style={sportsStyles.accentStripe} />
        {/* Door Cutline & Handle */}
        <View style={sportsStyles.doorSeam} />
        <View style={sportsStyles.doorHandle} />
        {/* Side Air Intake Scoop */}
        <View style={sportsStyles.sideAirIntake}>
          <View style={sportsStyles.intakeInnerMesh} />
        </View>
        {/* Aerodynamic Side Mirror */}
        <View style={sportsStyles.sideMirror} />
        {/* Projector LED Headlight with Cyan Daytime Running Light */}
        <View style={sportsStyles.headlight}>
          <View style={sportsStyles.headlightBeam} />
        </View>
        {/* Carbon-Fiber Lower Front Splitter */}
        <View style={sportsStyles.frontSplitter} />
        {/* Rear LED Light Strip & Diffuser */}
        <View style={sportsStyles.taillight} />
        <View style={sportsStyles.rearExhaust}>
          <View style={sportsStyles.exhaustTip} />
          <View style={sportsStyles.exhaustTip} />
        </View>
        {/* Realistic Flared Wheel Arches */}
        <View style={[sharedStyles.wheelArch, sharedStyles.rearArch]} />
        <View style={[sharedStyles.wheelArch, sharedStyles.frontArch]} />
      </View>

      {/* Realistic 5-Spoke Sport Alloy Wheels with Red Brake Caliper */}
      <SportsAlloyWheel
        style={sharedStyles.rearWheel}
        wheelRotation={wheelRotation}
        accentColor="#EF4444"
      />
      <SportsAlloyWheel
        style={sharedStyles.frontWheel}
        wheelRotation={wheelRotation}
        accentColor="#EF4444"
      />
    </View>
  );
};
// =========================================================================
// 2. MONSTER TRUCK - Lifted Heavy-Duty 4x4 with Steel Roll Cage & Shocks
// =========================================================================
const MonsterTruckBody = ({ wheelRotation }) => {
  return (
    <View style={styles.chassis}>
      {/* 4-Pod Roof Spotlight Bar */}
      <View style={monsterStyles.spotlightBar}>
        <View style={monsterStyles.lightPod} />
        <View style={monsterStyles.lightPod} />
        <View style={monsterStyles.lightPod} />
        <View style={monsterStyles.lightPod} />
      </View>

      {/* Heavy Steel Roll Cage & Truck Cab */}
      <View style={monsterStyles.rollCage}>
        <View style={monsterStyles.cageBarDiagonal} />
        <View style={monsterStyles.cageBarVertical} />
        <View style={monsterStyles.cabWindow}>
          <View style={sharedStyles.windowReflect} />
        </View>
      </View>

      {/* Lifted Truck Body with Pickup Bed */}
      <View style={monsterStyles.body}>
        {/* Gloss Emerald Teal Highlight */}
        <View style={monsterStyles.bodyTopHighlight} />
        {/* Yellow Thunder Racing Livery */}
        <View style={monsterStyles.lightningDecal} />
        {/* Vertical Chrome Exhaust Smoke Stack */}
        <View style={monsterStyles.exhaustStack}>
          <View style={monsterStyles.stackCap} />
        </View>
        {/* Heavy Steel Front Bull Bar / Brush Guard */}
        <View style={monsterStyles.bullBar}>
          <View style={monsterStyles.bullBarCross} />
        </View>
        {/* Amber Headlight */}
        <View style={monsterStyles.headlight}>
          <View style={monsterStyles.headlightCore} />
        </View>
        {/* High-Clearance Fender Flares */}
        <View
          style={[
            sharedStyles.wheelArch,
            sharedStyles.rearArch,
            monsterStyles.highClearanceArch,
          ]}
        />
        <View
          style={[
            sharedStyles.wheelArch,
            sharedStyles.frontArch,
            monsterStyles.highClearanceArch,
          ]}
        />
      </View>

      {/* Exposed Tubular Ladder Chassis Frame */}
      <View style={monsterStyles.chassisBeam} />

      {/* Heavy-Duty Suspension Shocks with Dual Red Coil Springs */}
      <View style={[monsterStyles.shockUnit, monsterStyles.rearShock]}>
        <View style={monsterStyles.shockPiston} />
        <View style={monsterStyles.coilSpring} />
        <View style={monsterStyles.coilSpring} />
      </View>
      <View style={[monsterStyles.shockUnit, monsterStyles.frontShock]}>
        <View style={monsterStyles.shockPiston} />
        <View style={monsterStyles.coilSpring} />
        <View style={monsterStyles.coilSpring} />
      </View>

      {/* Massive Deep-Tread Off-Road Monster Wheels */}
      <MonsterLugWheel
        style={sharedStyles.rearWheel}
        wheelRotation={wheelRotation}
      />
      <MonsterLugWheel
        style={sharedStyles.frontWheel}
        wheelRotation={wheelRotation}
      />
    </View>
  );
};
// =========================================================================
// 3. POLICE CAR - High-Speed Tactical Pursuit Interceptor
// =========================================================================
const PoliceCarBody = ({ wheelRotation }) => {
  return (
    <View style={styles.chassis}>
      {/* Aerodynamic Dual-Color LED Pursuit Lightbar */}
      <View style={policeStyles.lightbarContainer}>
        <View style={policeStyles.lightbarLensRed} />
        <View style={policeStyles.lightbarCenterWhite} />
        <View style={policeStyles.lightbarLensBlue} />
      </View>

      {/* Pursuit Sedan Cabin */}
      <View style={policeStyles.cabin}>
        {/* Tinted Rear Passenger Window */}
        <View style={policeStyles.rearWindow}>
          <View style={sharedStyles.windowReflect} />
        </View>
        {/* Center Pillar */}
        <View style={policeStyles.centerPillar} />
        {/* Front Patrol Window */}
        <View style={policeStyles.frontWindow}>
          <View style={sharedStyles.windowReflect} />
        </View>
        {/* Front Windshield Angle */}
        <View style={policeStyles.windshield}>
          <View style={sharedStyles.windshieldGlare} />
        </View>
      </View>

      {/* Classic Black & White Interceptor Body */}
      <View style={policeStyles.body}>
        {/* Gloss Black Rear Quarter & Trunk */}
        <View style={policeStyles.rearBlackSection} />
        {/* High-Gloss White Center Patrol Door */}
        <View style={policeStyles.whiteDoorSection}>
          {/* Gold Star Police Emblem Badge */}
          <View style={policeStyles.policeShield}>
            <Text style={policeStyles.shieldStarText}>★</Text>
          </View>
          <Text style={policeStyles.policeLabelText}>POLICE</Text>
        </View>
        {/* Gloss Black Front Engine Hood */}
        <View style={policeStyles.frontBlackSection} />
        {/* A-Pillar Tactical Spotlight */}
        <View style={policeStyles.aPillarSpotlight} />
        {/* Xenon Pursuit Headlight */}
        <View style={policeStyles.headlight}>
          <View style={policeStyles.headlightLens} />
        </View>
        {/* Heavy-Duty Steel Push Bumper (PIT Bar) */}
        <View style={policeStyles.pushBumper}>
          <View style={policeStyles.pushPadTop} />
          <View style={policeStyles.pushPadBottom} />
        </View>
        {/* Rear Red/Amber Tail Pod */}
        <View style={policeStyles.tailPod} />
        {/* Wheel Arches */}
        <View style={[sharedStyles.wheelArch, sharedStyles.rearArch]} />
        <View style={[sharedStyles.wheelArch, sharedStyles.frontArch]} />
      </View>

      {/* Pursuit Steel Wheels with Chrome Dog-Dish Center Cap */}
      <PursuitSteelWheel
        style={sharedStyles.rearWheel}
        wheelRotation={wheelRotation}
      />
      <PursuitSteelWheel
        style={sharedStyles.frontWheel}
        wheelRotation={wheelRotation}
      />
    </View>
  );
};
// =========================================================================
// 4. RACING CAR - Low-Downforce Prototype / Formula Endurance Racer
// =========================================================================
const RacingCarBody = ({ wheelRotation }) => {
  return (
    <View style={styles.chassis}>
      {/* High-Mount Dual-Plane Carbon Rear Wing with Endplates */}
      <View style={racingStyles.rearWingMount}>
        <View style={racingStyles.rearWingPlate} />
        <View style={racingStyles.wingFlap} />
      </View>

      {/* Low-Profile Cockpit Canopy with Driver Helmet & Halo */}
      <View style={racingStyles.cockpitCanopy}>
        <View style={racingStyles.airSnorkelFin} />
        <View style={racingStyles.driverHelmet}>
          <View style={racingStyles.helmetVisor} />
        </View>
        <View style={racingStyles.aeroWindDeflector}>
          <View style={sharedStyles.windshieldGlare} />
        </View>
      </View>

      {/* Low Ground-Effects Prototype Body */}
      <View style={racingStyles.body}>
        {/* Sunburst Orange Metallic Hood */}
        <View style={racingStyles.hoodReflect} />
        {/* White Motorsport Roundel with Racing #7 */}
        <View style={racingStyles.numberRoundel}>
          <Text style={racingStyles.numberText}>7</Text>
        </View>
        {/* Carbon Sidepod Radiator Air Intake */}
        <View style={racingStyles.sidepodIntake} />
        {/* Low Extended Nose Splitter with Front Dive Planes */}
        <View style={racingStyles.frontNoseCone} />
        <View style={racingStyles.divePlaneCanard} />
        {/* Ultra-Slim Endurance LED Light Bar */}
        <View style={racingStyles.headlight} />
        {/* Carbon Underfloor Skid Plank */}
        <View style={racingStyles.underfloorPlank} />
        {/* Wheel Arches */}
        <View style={[sharedStyles.wheelArch, sharedStyles.rearArch]} />
        <View style={[sharedStyles.wheelArch, sharedStyles.frontArch]} />
      </View>

      {/* Lightweight Gold Forged Motorsport Racing Wheels */}
      <MotorsportGoldWheel
        style={sharedStyles.rearWheel}
        wheelRotation={wheelRotation}
      />
      <MotorsportGoldWheel
        style={sharedStyles.frontWheel}
        wheelRotation={wheelRotation}
      />
    </View>
  );
};
// =========================================================================
// 5. SCHOOL BUS - Classic American Conventional Transit Bus
// =========================================================================
const SchoolBusBody = ({ wheelRotation }) => {
  return (
    <View style={styles.chassis}>
      {/* Curved Roof Cap with Overhead Warning Flashers */}
      <View style={busStyles.roofCap}>
        <View style={busStyles.roofLightAmber} />
        <Text style={busStyles.schoolBusHeaderText}>SCHOOL BUS</Text>
        <Text style={busStyles.schoolBusBannerText}>BUS</Text>
        <View style={busStyles.roofLightRed} />
      </View>

      {/* Main Bus Passenger Body */}
      <View style={busStyles.body}>
        {/* Top Gloss Curve Reflection */}
        <View style={busStyles.topHighlight} />

        {/* Row of 4 Distinct Passenger Windows with Divided Panes */}
        <View style={busStyles.windowsBay}>
          <View style={busStyles.windowPane}>
            <View style={busStyles.windowDivider} />
            <View style={sharedStyles.windowReflect} />
          </View>
          <View style={busStyles.windowPane}>
            <View style={busStyles.windowDivider} />
            <View style={sharedStyles.windowReflect} />
          </View>
          <View style={busStyles.windowPane}>
            <View style={busStyles.windowDivider} />
            <View style={sharedStyles.windowReflect} />
          </View>
          <View style={[busStyles.windowPane, busStyles.windshieldPane]}>
            <View style={sharedStyles.windshieldGlare} />
          </View>
        </View>

        {/* Distinct Black Safety Rub Rails along Body Panels */}
        <View style={busStyles.upperRubRail} />
        <View style={busStyles.lowerRubRail} />

        {/* Folding Octagonal STOP Arm Paddle */}
        <View style={busStyles.stopPaddle}>
          <Text style={busStyles.stopPaddleText}>STOP</Text>
        </View>

        {/* Stepped Front Engine Cowl & Radiator Grille */}
        <View style={busStyles.engineHood}>
          <View style={busStyles.grilleSlat1} />
          <View style={busStyles.grilleSlat2} />
        </View>

        {/* Round Chrome Headlight */}
        <View style={busStyles.headlight}>
          <View style={busStyles.headlightCore} />
        </View>

        {/* Heavy Black Channel Steel Front Bumper */}
        <View style={busStyles.frontBumper} />

        {/* Wheel Arches */}
        <View style={[sharedStyles.wheelArch, sharedStyles.rearArch]} />
        <View style={[sharedStyles.wheelArch, sharedStyles.frontArch]} />
      </View>

      {/* Commercial 6-Lug Transit Wheels */}
      <TransitBusWheel
        style={sharedStyles.rearWheel}
        wheelRotation={wheelRotation}
      />
      <TransitBusWheel
        style={sharedStyles.frontWheel}
        wheelRotation={wheelRotation}
      />
    </View>
  );
};
// =========================================================================
// HIGH-FIDELITY REUSABLE WHEELS (22x22, R=11, Perfectly Aligned)
// =========================================================================
// 1. Sports Car Alloy Wheel (5-Spoke Star Rim + Red Brake Caliper)
const SportsAlloyWheel = ({
  style,
  wheelRotation,
  accentColor = '#EF4444',
}) => {
  return (
    <View style={[sharedStyles.wheelRoot, style]}>
      {/* Outer Rubber Tire with Tread Grip */}
      <View style={sharedStyles.tireOuter}>
        <View style={sharedStyles.tireInnerGrip} />
      </View>
      {/* Brake Disc Rotor with Red Caliper Behind Rim */}
      <View style={wheelStyles.brakeDisc}>
        <View
          style={[wheelStyles.brakeCaliper, { backgroundColor: accentColor }]}
        />
      </View>
      {/* Rotating 5-Spoke Diamond Cut Rim */}
      <View
        style={[
          wheelStyles.sportsRim,
          { transform: [{ rotate: `${wheelRotation}deg` }] },
        ]}
      >
        <View style={wheelStyles.starSpoke1} />
        <View style={wheelStyles.starSpoke2} />
        <View style={wheelStyles.starSpoke3} />
        <View style={wheelStyles.centerHubCap} />
      </View>
    </View>
  );
};
// 2. Monster Truck Lugged Wheel (Deep Tire Grooves + Beadlock Ring)
const MonsterLugWheel = ({ style, wheelRotation }) => {
  return (
    <View style={[sharedStyles.wheelRoot, style]}>
      <View style={wheelStyles.monsterTireTreads}>
        <View style={wheelStyles.lugBar1} />
        <View style={wheelStyles.lugBar2} />
        <View style={wheelStyles.lugBar3} />
      </View>
      {/* Heavy Beadlock Rim with Gold Hex Hub */}
      <View
        style={[
          wheelStyles.beadlockRim,
          { transform: [{ rotate: `${wheelRotation}deg` }] },
        ]}
      >
        <View style={wheelStyles.beadlockBoltRing} />
        <View style={wheelStyles.heavySpokeX} />
        <View style={wheelStyles.heavySpokeY} />
        <View style={wheelStyles.goldHexHub} />
      </View>
    </View>
  );
};
// 3. Police Car Steel Wheel (Heavy Black Steelie + Chrome Hubcap)
const PursuitSteelWheel = ({ style, wheelRotation }) => {
  return (
    <View style={[sharedStyles.wheelRoot, style]}>
      <View style={sharedStyles.tireOuter} />
      <View
        style={[
          wheelStyles.policeSteelRim,
          { transform: [{ rotate: `${wheelRotation}deg` }] },
        ]}
      >
        {/* Steel Vent Holes */}
        <View style={wheelStyles.steelHole1} />
        <View style={wheelStyles.steelHole2} />
        <View style={wheelStyles.steelHole3} />
        <View style={wheelStyles.steelHole4} />
        {/* Chrome Dog-Dish Hubcap */}
        <View style={wheelStyles.chromeCenterCap}>
          <View style={wheelStyles.chromeHighlight} />
        </View>
      </View>
    </View>
  );
};
// 4. Motorsport Gold Racing Wheel (Centerlock BBS-Style Mesh)
const MotorsportGoldWheel = ({ style, wheelRotation }) => {
  return (
    <View style={[sharedStyles.wheelRoot, style]}>
      <View style={wheelStyles.slickTireOuter}>
        <View style={wheelStyles.yellowPirelliStripe} />
      </View>
      <View
        style={[
          wheelStyles.goldRacingRim,
          { transform: [{ rotate: `${wheelRotation}deg` }] },
        ]}
      >
        <View style={wheelStyles.goldSpoke1} />
        <View style={wheelStyles.goldSpoke2} />
        <View style={wheelStyles.goldSpoke3} />
        <View style={wheelStyles.goldSpoke4} />
        <View style={wheelStyles.anodizedCenterLock} />
      </View>
    </View>
  );
};
// 5. Commercial Transit Bus Wheel (Steel Rim with 6 Lug Bolts)
const TransitBusWheel = ({ style, wheelRotation }) => {
  return (
    <View style={[sharedStyles.wheelRoot, style]}>
      <View style={sharedStyles.tireOuter} />
      <View
        style={[
          wheelStyles.busSteelRim,
          { transform: [{ rotate: `${wheelRotation}deg` }] },
        ]}
      >
        <View style={wheelStyles.busHubRing} />
        <View style={wheelStyles.busYellowCenter} />
      </View>
    </View>
  );
};
// =========================================================================
// STYLESHEETS
// =========================================================================
const styles = StyleSheet.create({
  carRoot: {
    width: 82,
    height: 48,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  chassis: {
    width: 82,
    height: 48,
    position: 'relative',
  },
});
const sharedStyles = StyleSheet.create({
  // Wheel geometry (22x22, radius 11, bottom 0)
  wheelRoot: {
    position: 'absolute',
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  rearWheel: {
    left: 10,
  },
  frontWheel: {
    right: 9,
  },
  tireOuter: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tireInnerGrip: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  wheelArch: {
    position: 'absolute',
    bottom: -1,
    width: 24,
    height: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#0F172A',
    zIndex: 2,
  },
  rearArch: {
    left: 9,
  },
  frontArch: {
    right: 8,
  },
  windowReflect: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 2,
  },
  windshieldGlare: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 6,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 2,
    transform: [{ rotate: '25deg' }],
  },
});
// 1. SPORTS CAR STYLES
const sportsStyles = StyleSheet.create({
  wingStrutLeft: {
    position: 'absolute',
    top: 12,
    left: 6,
    width: 2,
    height: 8,
    backgroundColor: '#1E293B',
    zIndex: 1,
  },
  wingStrutRight: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 2,
    height: 8,
    backgroundColor: '#1E293B',
    zIndex: 1,
  },
  wingBlade: {
    position: 'absolute',
    top: 9,
    left: 3,
    width: 16,
    height: 3.5,
    backgroundColor: '#0F172A',
    borderRadius: 1.5,
    zIndex: 2,
  },
  wingEndplate: {
    position: 'absolute',
    left: -1,
    top: -2,
    width: 2,
    height: 7,
    backgroundColor: '#DC2626',
    borderRadius: 1,
  },
  cockpit: {
    position: 'absolute',
    top: 14,
    left: 20,
    width: 38,
    height: 14,
    flexDirection: 'row',
    zIndex: 2,
  },
  rearQuarterWindow: {
    width: 10,
    height: 12,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  pillar: {
    width: 3,
    height: 13,
    backgroundColor: '#B91C1C',
  },
  sideWindow: {
    width: 14,
    height: 13,
    backgroundColor: '#0EA5E9',
    opacity: 0.85,
    borderWidth: 1,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  windshield: {
    width: 11,
    height: 13,
    backgroundColor: '#38BDF8',
    opacity: 0.9,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  body: {
    position: 'absolute',
    top: 25,
    left: 4,
    width: 74,
    height: 16,
    backgroundColor: '#DC2626',
    borderRadius: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 9,
    borderWidth: 1.5,
    borderColor: '#7F1D1D',
    overflow: 'hidden',
    zIndex: 3,
  },
  hoodHighlight: {
    position: 'absolute',
    top: 0,
    left: 26,
    right: 4,
    height: 3,
    backgroundColor: '#F87171',
    borderTopRightRadius: 6,
  },
  hoodVent: {
    position: 'absolute',
    top: 2,
    right: 14,
    width: 6,
    height: 2,
    backgroundColor: '#450A0A',
    borderRadius: 1,
  },
  accentStripe: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 18,
    height: 2,
    backgroundColor: '#F1F5F9',
    opacity: 0.9,
  },
  doorSeam: {
    position: 'absolute',
    top: 4,
    left: 26,
    width: 1,
    height: 10,
    backgroundColor: '#991B1B',
  },
  doorHandle: {
    position: 'absolute',
    top: 5,
    left: 28,
    width: 4,
    height: 1.5,
    backgroundColor: '#450A0A',
    borderRadius: 0.5,
  },
  sideAirIntake: {
    position: 'absolute',
    top: 4,
    left: 17,
    width: 7,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  intakeInnerMesh: {
    width: 4,
    height: 3,
    backgroundColor: '#0F172A',
  },
  sideMirror: {
    position: 'absolute',
    top: -2,
    right: 28,
    width: 4,
    height: 3,
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderWidth: 0.5,
    borderColor: '#7F1D1D',
    zIndex: 4,
  },
  headlight: {
    position: 'absolute',
    top: 2,
    right: 1,
    width: 8,
    height: 5,
    backgroundColor: '#E0F2FE',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#38BDF8',
  },
  headlightBeam: {
    width: 4,
    height: 3,
    backgroundColor: '#38BDF8',
    borderRadius: 1,
  },
  frontSplitter: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 3,
  },
  taillight: {
    position: 'absolute',
    top: 2,
    left: 0,
    width: 3.5,
    height: 5,
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  rearExhaust: {
    position: 'absolute',
    bottom: 0,
    left: 1,
    flexDirection: 'row',
    gap: 1.5,
  },
  exhaustTip: {
    width: 3,
    height: 2.5,
    backgroundColor: '#CBD5E1',
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
  },
});
// 2. MONSTER TRUCK STYLES
const monsterStyles = StyleSheet.create({
  spotlightBar: {
    position: 'absolute',
    top: 2,
    left: 26,
    width: 30,
    height: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#475569',
    zIndex: 4,
  },
  lightPod: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#FBBF24',
    borderWidth: 0.5,
    borderColor: '#D97706',
  },
  rollCage: {
    position: 'absolute',
    top: 7,
    left: 22,
    width: 36,
    height: 16,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64748B',
    overflow: 'hidden',
    zIndex: 2,
  },
  cageBarDiagonal: {
    position: 'absolute',
    top: -2,
    left: 8,
    width: 2,
    height: 20,
    backgroundColor: '#94A3B8',
    transform: [{ rotate: '42deg' }],
  },
  cageBarVertical: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 2,
    height: 16,
    backgroundColor: '#94A3B8',
  },
  cabWindow: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 10,
    backgroundColor: '#0284C7',
    opacity: 0.85,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  body: {
    position: 'absolute',
    top: 20,
    left: 5,
    width: 72,
    height: 16,
    backgroundColor: '#0D9488',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#042F2E',
    overflow: 'hidden',
    zIndex: 3,
  },
  bodyTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: '#2DD4BF',
  },
  lightningDecal: {
    position: 'absolute',
    top: 5,
    left: 12,
    width: 26,
    height: 4,
    backgroundColor: '#FBBF24',
    borderRadius: 2,
    transform: [{ skewX: '-25deg' }],
  },
  exhaustStack: {
    position: 'absolute',
    top: -6,
    left: 18,
    width: 4,
    height: 8,
    backgroundColor: '#94A3B8',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    zIndex: 1,
  },
  stackCap: {
    width: 5,
    height: 1.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 0.5,
  },
  bullBar: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 8,
    height: 12,
    backgroundColor: '#334155',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bullBarCross: {
    width: 6,
    height: 2,
    backgroundColor: '#CBD5E1',
  },
  headlight: {
    position: 'absolute',
    top: 3,
    right: 8,
    width: 6,
    height: 5,
    backgroundColor: '#FEF08A',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlightCore: {
    width: 3,
    height: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 1.5,
  },
  highClearanceArch: {
    height: 16,
    backgroundColor: '#042F2E',
  },
  chassisBeam: {
    position: 'absolute',
    top: 34,
    left: 8,
    width: 66,
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    zIndex: 1,
  },
  shockUnit: {
    position: 'absolute',
    top: 26,
    width: 6,
    height: 14,
    alignItems: 'center',
    zIndex: 2,
  },
  rearShock: {
    left: 17,
  },
  frontShock: {
    right: 17,
  },
  shockPiston: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 14,
    backgroundColor: '#CBD5E1',
  },
  coilSpring: {
    width: 6,
    height: 4,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    marginVertical: 1,
  },
});
// 3. POLICE CAR STYLES
const policeStyles = StyleSheet.create({
  lightbarContainer: {
    position: 'absolute',
    top: 6,
    left: 29,
    width: 24,
    height: 6,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#475569',
    zIndex: 4,
  },
  lightbarLensRed: {
    flex: 1,
    backgroundColor: '#EF4444',
  },
  lightbarCenterWhite: {
    width: 4,
    backgroundColor: '#FFFFFF',
  },
  lightbarLensBlue: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  cabin: {
    position: 'absolute',
    top: 11,
    left: 17,
    width: 46,
    height: 15,
    backgroundColor: '#090D16',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    zIndex: 2,
  },
  rearWindow: {
    width: 13,
    height: 14,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 5,
    overflow: 'hidden',
  },
  centerPillar: {
    width: 4,
    height: 14,
    backgroundColor: '#F8FAFC',
  },
  frontWindow: {
    width: 15,
    height: 14,
    backgroundColor: '#0284C7',
    opacity: 0.85,
    overflow: 'hidden',
  },
  windshield: {
    width: 12,
    height: 14,
    backgroundColor: '#38BDF8',
    opacity: 0.9,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  body: {
    position: 'absolute',
    top: 24,
    left: 4,
    width: 74,
    height: 17,
    flexDirection: 'row',
    borderRadius: 4,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
    zIndex: 3,
  },
  rearBlackSection: {
    width: 22,
    height: '100%',
    backgroundColor: '#090D16',
  },
  whiteDoorSection: {
    width: 26,
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontBlackSection: {
    flex: 1,
    height: '100%',
    backgroundColor: '#090D16',
  },
  policeShield: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#B45309',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldStarText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 8,
  },
  policeLabelText: {
    color: '#0F172A',
    fontSize: 5.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  aPillarSpotlight: {
    position: 'absolute',
    top: -3,
    right: 20,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    zIndex: 5,
  },
  headlight: {
    position: 'absolute',
    top: 2,
    right: 1,
    width: 7,
    height: 5,
    backgroundColor: '#F8FAFC',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlightLens: {
    width: 3.5,
    height: 3,
    backgroundColor: '#60A5FA',
    borderRadius: 1,
  },
  pushBumper: {
    position: 'absolute',
    bottom: 0,
    right: -1,
    width: 5,
    height: 14,
    backgroundColor: '#1E293B',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  pushPadTop: {
    width: 4,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  pushPadBottom: {
    width: 4,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  tailPod: {
    position: 'absolute',
    top: 2,
    left: 0,
    width: 3,
    height: 6,
    backgroundColor: '#EF4444',
  },
});
// 4. RACING CAR STYLES
const racingStyles = StyleSheet.create({
  rearWingMount: {
    position: 'absolute',
    top: 8,
    left: 4,
    width: 14,
    height: 12,
    zIndex: 2,
  },
  rearWingPlate: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 14,
    height: 3,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  wingFlap: {
    position: 'absolute',
    top: -2,
    left: -1,
    width: 2.5,
    height: 7,
    backgroundColor: '#EA580C',
    borderRadius: 1,
  },
  cockpitCanopy: {
    position: 'absolute',
    top: 13,
    left: 20,
    width: 36,
    height: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  airSnorkelFin: {
    width: 8,
    height: 13,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 2,
  },
  driverHelmet: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 1,
    marginBottom: 1,
  },
  helmetVisor: {
    width: 5,
    height: 3.5,
    backgroundColor: '#0284C7',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  aeroWindDeflector: {
    width: 14,
    height: 8,
    backgroundColor: '#38BDF8',
    opacity: 0.85,
    borderTopRightRadius: 7,
    overflow: 'hidden',
  },
  body: {
    position: 'absolute',
    top: 26,
    left: 4,
    width: 74,
    height: 15,
    backgroundColor: '#EA580C',
    borderRadius: 3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderColor: '#9A3412',
    overflow: 'hidden',
    zIndex: 3,
  },
  hoodReflect: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 4,
    height: 2.5,
    backgroundColor: '#FDBA74',
  },
  numberRoundel: {
    position: 'absolute',
    top: 2,
    left: 24,
    width: 11,
    height: 10,
    borderRadius: 5.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9A3412',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#0F172A',
    fontSize: 7.5,
    fontWeight: '900',
    includeFontPadding: false,
  },
  sidepodIntake: {
    position: 'absolute',
    top: 3,
    left: 15,
    width: 6,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  frontNoseCone: {
    position: 'absolute',
    top: 4,
    right: 0,
    width: 14,
    height: 6,
    backgroundColor: '#C2410C',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 2,
  },
  divePlaneCanard: {
    position: 'absolute',
    top: 1,
    right: 4,
    width: 7,
    height: 2,
    backgroundColor: '#0F172A',
    borderRadius: 1,
    transform: [{ rotate: '-12deg' }],
  },
  headlight: {
    position: 'absolute',
    top: 5,
    right: 1,
    width: 4,
    height: 3,
    backgroundColor: '#FEF08A',
    borderRadius: 1,
  },
  underfloorPlank: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0F172A',
  },
});
// 5. SCHOOL BUS STYLES
const busStyles = StyleSheet.create({
  roofCap: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 62,
    height: 8,
    backgroundColor: '#D97706',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#78350F',
    zIndex: 4,
  },
  schoolBusHeaderText: {
    color: '#000000',
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  schoolBusBannerText: {
    color: '#000000',
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.5,
    includeFontPadding: false,
    display: 'none',
  },
  roofLightAmber: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#FBBF24',
  },
  roofLightRed: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#EF4444',
  },
  body: {
    position: 'absolute',
    top: 15,
    left: 6,
    width: 70,
    height: 25,
    backgroundColor: '#F59E0B',
    borderRadius: 3,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 7,
    borderWidth: 1.5,
    borderColor: '#B45309',
    overflow: 'hidden',
    zIndex: 3,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#FDE68A',
  },
  windowsBay: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 48,
    height: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  windowPane: {
    width: 10,
    height: 10,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  windshieldPane: {
    width: 12,
    borderTopRightRadius: 5,
    backgroundColor: '#38BDF8',
  },
  windowDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 4.5,
    width: 1,
    backgroundColor: '#0F172A',
  },
  upperRubRail: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 14,
    height: 1.5,
    backgroundColor: '#0F172A',
  },
  lowerRubRail: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 14,
    height: 1.5,
    backgroundColor: '#0F172A',
  },
  stopPaddle: {
    position: 'absolute',
    top: 9,
    left: 2,
    width: 9,
    height: 8,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  stopPaddleText: {
    color: '#FFFFFF',
    fontSize: 3.5,
    fontWeight: '900',
    includeFontPadding: false,
  },
  engineHood: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 15,
    backgroundColor: '#D97706',
    borderTopRightRadius: 6,
    justifyContent: 'center',
    paddingLeft: 2,
  },
  grilleSlat1: {
    width: 10,
    height: 1.5,
    backgroundColor: '#0F172A',
    marginVertical: 1,
  },
  grilleSlat2: {
    width: 10,
    height: 1.5,
    backgroundColor: '#0F172A',
  },
  headlight: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FEF08A',
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlightCore: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#F59E0B',
  },
  frontBumper: {
    position: 'absolute',
    bottom: 0,
    right: -1,
    width: 6,
    height: 6,
    backgroundColor: '#1E293B',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});
// WHEEL STYLES
const wheelStyles = StyleSheet.create({
  brakeDisc: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#94A3B8',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  brakeCaliper: {
    width: 5,
    height: 5,
    borderRadius: 1.5,
  },
  sportsRim: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starSpoke1: {
    position: 'absolute',
    width: 2,
    height: 13,
    backgroundColor: '#CBD5E1',
  },
  starSpoke2: {
    position: 'absolute',
    width: 2,
    height: 13,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '60deg' }],
  },
  starSpoke3: {
    position: 'absolute',
    width: 2,
    height: 13,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '120deg' }],
  },
  centerHubCap: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  monsterTireTreads: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#090D16',
    borderWidth: 2,
    borderColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lugBar1: {
    position: 'absolute',
    width: 3,
    height: 22,
    backgroundColor: '#1E293B',
  },
  lugBar2: {
    position: 'absolute',
    width: 3,
    height: 22,
    backgroundColor: '#1E293B',
    transform: [{ rotate: '60deg' }],
  },
  lugBar3: {
    position: 'absolute',
    width: 3,
    height: 22,
    backgroundColor: '#1E293B',
    transform: [{ rotate: '120deg' }],
  },
  beadlockRim: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beadlockBoltRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  heavySpokeX: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#334155',
  },
  heavySpokeY: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#334155',
  },
  goldHexHub: {
    width: 4.5,
    height: 4.5,
    backgroundColor: '#F59E0B',
    borderRadius: 1,
  },
  policeSteelRim: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#090D16',
    borderWidth: 1.5,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  steelHole1: {
    position: 'absolute',
    top: 1,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#475569',
  },
  steelHole2: {
    position: 'absolute',
    bottom: 1,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#475569',
  },
  steelHole3: {
    position: 'absolute',
    left: 1,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#475569',
  },
  steelHole4: {
    position: 'absolute',
    right: 1,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#475569',
  },
  chromeCenterCap: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#CBD5E1',
    borderWidth: 1,
    borderColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chromeHighlight: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  slickTireOuter: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yellowPirelliStripe: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  goldRacingRim: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#78350F',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldSpoke1: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: '#FBBF24',
  },
  goldSpoke2: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: '#FBBF24',
    transform: [{ rotate: '45deg' }],
  },
  goldSpoke3: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: '#FBBF24',
    transform: [{ rotate: '90deg' }],
  },
  goldSpoke4: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: '#FBBF24',
    transform: [{ rotate: '135deg' }],
  },
  anodizedCenterLock: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DC2626',
  },
  busSteelRim: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busHubRing: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
  },
  busYellowCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
});
// POWER-UP EFFECT STYLES
const powerUpFxStyles = StyleSheet.create({
  shieldBubble: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 98,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  shieldShimmer: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: 4,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  shieldHighlight: {
    position: 'absolute',
    top: 6,
    left: 16,
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-15deg' }],
  },
  magnetField: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 98,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F87171',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  magnetRing1: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 6,
    right: 6,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  magnetRing2: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 14,
    right: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    opacity: 0.6,
  },
  nitroContainer: {
    position: 'absolute',
    left: -28,
    top: 14,
    width: 32,
    height: 30,
    justifyContent: 'center',
    zIndex: 1,
  },
  nitroFlameOuter: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 24,
    height: 12,
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  nitroFlameInner: {
    width: 14,
    height: 6,
    backgroundColor: '#FEF08A',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  speedStreak1: {
    position: 'absolute',
    left: -16,
    top: -4,
    width: 22,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 1,
  },
  speedStreak2: {
    position: 'absolute',
    left: -22,
    top: 22,
    width: 18,
    height: 1.5,
    backgroundColor: 'rgba(251, 191, 36, 0.8)',
    borderRadius: 1,
  },
});
