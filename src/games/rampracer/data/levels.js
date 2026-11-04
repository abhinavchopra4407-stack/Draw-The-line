import { CAR_HALF_WIDTH } from '../physics/physicsEngine';
export const TOTAL_LEVELS = 50;
/**
 * 50 Hand-crafted, genuinely distinct, non-repeating levels.
 * Each level features a unique combination of obstacle geometries, heights,
 * gaps, platforms, moving hazards, and challenges, ordered with progressive difficulty.
 */
export const LEVELS = [
  // --- TIER 1: Foundations & Single Hurdles (Levels 1 - 10) ---
  {
    levelNumber: 1,
    name: 'First Steps',
    challengeType: 'Standard Block',
    description: 'A modest brick hurdle to learn the basics of drawing ramps.',
    carStartXFraction: 0.12,
    finishXFraction: 0.88,
    obstacles: [{ id: 'l1-b1', xFraction: 0.5, width: 70, height: 80 }],
  },
  {
    levelNumber: 2,
    name: 'The Brick Wall',
    challengeType: 'Tall Wall',
    description: 'A higher wall requiring a steeper, smoother takeoff.',
    carStartXFraction: 0.12,
    finishXFraction: 0.88,
    obstacles: [{ id: 'l2-w1', xFraction: 0.5, width: 55, height: 115 }],
  },
  {
    levelNumber: 3,
    name: 'Canyon Gap',
    challengeType: 'Road Gap',
    description:
      'The road drops away into a canyon. Draw a bridge to span the gap.',
    carStartXFraction: 0.12,
    finishXFraction: 0.88,
    obstacles: [],
    roadGaps: [{ xFraction: 0.42, widthFraction: 0.18 }],
  },
  {
    levelNumber: 4,
    name: 'Double Trouble',
    challengeType: 'Twin Hurdles',
    description:
      'Two spaced blocks. Build enough momentum to clear both in one leap.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      { id: 'l4-b1', xFraction: 0.38, width: 50, height: 60 },
      { id: 'l4-b2', xFraction: 0.62, width: 50, height: 60 },
    ],
  },
  {
    levelNumber: 5,
    name: 'Stepping Stones',
    challengeType: 'Ascending Steps',
    description: 'A low step leading directly into a medium step.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    obstacles: [
      { id: 'l5-s1', xFraction: 0.42, width: 55, height: 45 },
      { id: 'l5-s2', xFraction: 0.56, width: 55, height: 90 },
    ],
  },
  {
    levelNumber: 6,
    name: 'The Great Chasm',
    challengeType: 'Wide Gap',
    description:
      'A wider canyon pit demanding high speed and a smooth parabolic ramp.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [],
    roadGaps: [{ xFraction: 0.38, widthFraction: 0.25 }],
  },
  {
    levelNumber: 7,
    name: 'High Platform',
    challengeType: 'Floating Platform',
    description: 'A mid-air platform floating above the ground.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      // Top unchanged (107px above road); underside 30px above road so the car cannot drive under it
      {
        id: 'l7-p1',
        xFraction: 0.5,
        width: 90,
        height: 77,
        yOffsetFromRoad: 30,
      },
    ],
  },
  {
    levelNumber: 8,
    name: 'The Pyramid',
    challengeType: 'Symmetric Hill',
    description: 'Three blocks arranged in a classic pyramid mound.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      { id: 'l8-p1', xFraction: 0.38, width: 50, height: 50 },
      { id: 'l8-p2', xFraction: 0.5, width: 50, height: 95 },
      { id: 'l8-p3', xFraction: 0.62, width: 50, height: 50 },
    ],
  },
  {
    levelNumber: 9,
    name: 'The Trench Wall',
    challengeType: 'Pit and Barrier',
    description: 'A hazardous trench right in front of a raised brick wall.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    obstacles: [{ id: 'l9-w1', xFraction: 0.55, width: 55, height: 90 }],
    roadGaps: [{ xFraction: 0.38, widthFraction: 0.13 }],
  },
  {
    levelNumber: 10,
    name: 'The Sentry Post',
    challengeType: 'Moving Obstacle',
    description:
      'A mechanized block sliding vertically up and down in your path.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    obstacles: [
      {
        id: 'l10-m1',
        xFraction: 0.5,
        width: 65,
        height: 80,
        movement: { axis: 'y', range: 35, speed: 1.1 },
      },
    ],
  },
  // --- TIER 2: Multi-step & Combined Challenges (Levels 11 - 20) ---
  {
    levelNumber: 11,
    name: 'Stairway',
    challengeType: '3-Step Staircase',
    description: 'Three ascending stair-step blocks leading high into the air.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      { id: 'l11-s1', xFraction: 0.36, width: 50, height: 40 },
      { id: 'l11-s2', xFraction: 0.48, width: 50, height: 75 },
      { id: 'l11-s3', xFraction: 0.6, width: 50, height: 110 },
    ],
  },
  {
    levelNumber: 12,
    name: 'The Drop Step',
    challengeType: 'Descending Steps',
    description: 'A high block that steps down to a lower shelf.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    obstacles: [
      { id: 'l12-s1', xFraction: 0.4, width: 55, height: 105 },
      { id: 'l12-s2', xFraction: 0.54, width: 55, height: 55 },
    ],
  },
  {
    levelNumber: 13,
    name: 'Rooftop Run',
    challengeType: 'Elevated Platform Over Pit',
    description: 'A floating platform bridging across a dangerous road gap.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      {
        id: 'l13-p1',
        xFraction: 0.48,
        width: 95,
        height: 20,
        yOffsetFromRoad: 70,
      },
    ],
    roadGaps: [{ xFraction: 0.38, widthFraction: 0.2 }],
  },
  {
    levelNumber: 14,
    name: 'Double Pits',
    challengeType: 'Dual Road Gaps',
    description: 'Two separate road pits divided by a narrow center island.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [],
    roadGaps: [
      { xFraction: 0.34, widthFraction: 0.13 },
      { xFraction: 0.56, widthFraction: 0.13 },
    ],
  },
  {
    levelNumber: 15,
    name: 'Twin Monoliths',
    challengeType: 'Tall Wall Pair',
    description: 'Two tall narrow pylons standing side by side.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l15-w1', xFraction: 0.38, width: 45, height: 125 },
      { id: 'l15-w2', xFraction: 0.62, width: 45, height: 125 },
    ],
  },
  {
    levelNumber: 16,
    name: 'Island in the Abyss',
    challengeType: 'Center Island Gap',
    description:
      'A wide canyon with a solid pillar stepping stone standing in the middle.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [{ id: 'l16-p1', xFraction: 0.5, width: 50, height: 85 }],
    roadGaps: [{ xFraction: 0.35, widthFraction: 0.3 }],
  },
  {
    levelNumber: 17,
    name: 'Camel Dunes',
    challengeType: 'Double Mounds',
    description: 'Two rounded hill-like blocks with a dip between them.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    coinTarget: 4, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l17-h1', xFraction: 0.38, width: 60, height: 75 },
      { id: 'l17-h2', xFraction: 0.62, width: 60, height: 75 },
    ],
  },
  {
    levelNumber: 18,
    name: 'Patrol Sentry',
    challengeType: 'Horizontal Patrol',
    description:
      'A horizontal barrier that slides back and forth across the roadway.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    obstacles: [
      {
        id: 'l18-m1',
        xFraction: 0.5,
        width: 60,
        height: 70,
        movement: { axis: 'x', range: 45, speed: 0.8 },
      },
    ],
  },
  {
    levelNumber: 19,
    name: 'Overhang Canopy',
    challengeType: 'Pillar & Roof',
    description: 'A vertical pillar topped by a floating horizontal canopy.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      { id: 'l19-w1', xFraction: 0.42, width: 45, height: 95 },
      {
        id: 'l19-c1',
        xFraction: 0.56,
        width: 85,
        height: 20,
        yOffsetFromRoad: 125,
      },
    ],
  },
  {
    levelNumber: 20,
    name: 'Fortress Gate',
    challengeType: 'Wall & Rear Pit',
    description: 'A defensive wall with a drop pit lurking directly behind it.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [{ id: 'l20-w1', xFraction: 0.4, width: 50, height: 110 }],
    roadGaps: [{ xFraction: 0.54, widthFraction: 0.16 }],
  },
  // --- TIER 3: Complex Geometry & Narrow Passes (Levels 21 - 30) ---
  {
    levelNumber: 21,
    name: 'The Zigzag Stair',
    challengeType: '4-Tier Stair',
    description: 'Three steps ascending to a plateau, then a sudden drop step.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      { id: 'l21-s1', xFraction: 0.32, width: 45, height: 35 },
      { id: 'l21-s2', xFraction: 0.42, width: 45, height: 65 },
      { id: 'l21-s3', xFraction: 0.52, width: 45, height: 95 },
      { id: 'l21-s4', xFraction: 0.64, width: 45, height: 50 },
    ],
  },
  {
    levelNumber: 22,
    name: 'Chasm Pillar',
    challengeType: 'Deep Gap with Pillar',
    description: 'A massive road canyon with an elevated stone pillar inside.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [{ id: 'l22-p1', xFraction: 0.5, width: 50, height: 90 }],
    roadGaps: [{ xFraction: 0.34, widthFraction: 0.32 }],
  },
  {
    levelNumber: 23,
    name: 'The Skyscraper',
    challengeType: 'Ultra-Tall Wall',
    description:
      'A towering 145dp monolith that demands a steep, high-launch ramp.',
    carStartXFraction: 0.08,
    finishXFraction: 0.9,
    obstacles: [{ id: 'l23-w1', xFraction: 0.48, width: 50, height: 145 }],
  },
  {
    levelNumber: 24,
    name: 'Floating Archipelago',
    challengeType: 'Staggered Platforms',
    description:
      'Three suspended platforms at alternating heights forming a mid-air path.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      // Top unchanged (80px above road); underside 30px above road blocks the drive-under shortcut
      {
        id: 'l24-p1',
        xFraction: 0.34,
        width: 55,
        height: 50,
        yOffsetFromRoad: 30,
      },
      {
        id: 'l24-p2',
        xFraction: 0.48,
        width: 55,
        height: 20,
        yOffsetFromRoad: 110,
      },
      {
        id: 'l24-p3',
        xFraction: 0.62,
        width: 55,
        height: 20,
        yOffsetFromRoad: 75,
      },
    ],
  },
  {
    levelNumber: 25,
    name: 'Castle Moat',
    challengeType: 'Moat & High Wall',
    description:
      'A deep road moat followed immediately by a heavy castle wall.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [{ id: 'l25-w1', xFraction: 0.55, width: 60, height: 120 }],
    roadGaps: [{ xFraction: 0.34, widthFraction: 0.15 }],
  },
  {
    levelNumber: 26,
    name: 'Hydraulic Piston',
    challengeType: 'Piston Between Walls',
    description:
      'A moving elevator block oscillating between two stationary pillars.',
    carStartXFraction: 0.08,
    finishXFraction: 0.9,
    obstacles: [
      { id: 'l26-w1', xFraction: 0.35, width: 40, height: 75 },
      {
        id: 'l26-m1',
        xFraction: 0.5,
        width: 50,
        height: 75,
        movement: { axis: 'y', range: 40, speed: 1.1 },
      },
      { id: 'l26-w2', xFraction: 0.65, width: 40, height: 75 },
    ],
  },
  {
    levelNumber: 27,
    name: 'Highway Overpass',
    challengeType: 'Long Elevated Bridge',
    description:
      'A long elevated bridge spanning a damaged section of highway.',
    carStartXFraction: 0.1,
    finishXFraction: 0.9,
    obstacles: [
      {
        id: 'l27-b1',
        xFraction: 0.5,
        width: 120,
        height: 22,
        yOffsetFromRoad: 80,
      },
    ],
    roadGaps: [{ xFraction: 0.38, widthFraction: 0.24 }],
  },
  {
    levelNumber: 28,
    name: 'The Low Ceiling',
    challengeType: 'Tunnel Squeeze',
    description:
      'A road barrier with a floating ceiling overhead, creating a narrow gap.',
    carStartXFraction: 0.1,
    finishXFraction: 0.88,
    obstacles: [
      { id: 'l28-b1', xFraction: 0.48, width: 65, height: 50 },
      {
        id: 'l28-c1',
        xFraction: 0.48,
        width: 75,
        height: 24,
        yOffsetFromRoad: 135,
      },
    ],
  },
  {
    levelNumber: 29,
    name: 'Trident Spikes',
    challengeType: '3 Alternating Pillars',
    description: 'Three alternating vertical pillars: tall, medium, and tall.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 4, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l29-p1', xFraction: 0.34, width: 35, height: 115 },
      { id: 'l29-p2', xFraction: 0.48, width: 35, height: 70 },
      { id: 'l29-p3', xFraction: 0.62, width: 35, height: 115 },
    ],
  },
  {
    levelNumber: 30,
    name: 'High Vault & Pit',
    challengeType: 'Vault Wall & Landing Pit',
    description: 'A launch barrier followed by an expansive landing pit.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [{ id: 'l30-w1', xFraction: 0.38, width: 50, height: 120 }],
    roadGaps: [{ xFraction: 0.52, widthFraction: 0.22 }],
  },
  // --- TIER 4: Dynamic Hazards & Multi-Gap Formations (Levels 31 - 40) ---
  {
    levelNumber: 31,
    name: 'Pendulum Pass',
    challengeType: 'Fast Crusher & Gap',
    description:
      'A fast vertical moving crusher obstacle followed by a road gap.',
    carStartXFraction: 0.08,
    finishXFraction: 0.9,
    obstacles: [
      {
        id: 'l31-m1',
        xFraction: 0.42,
        width: 50,
        height: 90,
        movement: { axis: 'y', range: 45, speed: 1.5 },
      },
    ],
    roadGaps: [{ xFraction: 0.58, widthFraction: 0.15 }],
  },
  {
    levelNumber: 32,
    name: 'Cascading Falls',
    challengeType: '4 Descending Steps',
    description: 'Four stepped platforms cascading down over a broken roadway.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l32-s1', xFraction: 0.32, width: 40, height: 120 },
      { id: 'l32-s2', xFraction: 0.42, width: 40, height: 90 },
      { id: 'l32-s3', xFraction: 0.52, width: 40, height: 60 },
      { id: 'l32-s4', xFraction: 0.62, width: 40, height: 30 },
    ],
  },
  {
    levelNumber: 33,
    name: 'Stratosphere Bridge',
    challengeType: 'High Beam Vault',
    description:
      'A high-altitude suspended beam requiring an elevated flight path.',
    carStartXFraction: 0.08,
    finishXFraction: 0.9,
    coinTarget: 2, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l33-h1', xFraction: 0.46, width: 60, height: 45 },
      {
        id: 'l33-b1',
        xFraction: 0.46,
        width: 90,
        height: 20,
        yOffsetFromRoad: 130,
      },
    ],
  },
  {
    levelNumber: 34,
    name: 'Twin Pistons',
    challengeType: 'Dual Moving Pillars',
    description:
      'Two vertical pillars oscillating out-of-phase with each other.',
    carStartXFraction: 0.08,
    finishXFraction: 0.9,
    obstacles: [
      {
        id: 'l34-p1',
        xFraction: 0.38,
        width: 45,
        height: 80,
        movement: { axis: 'y', range: 35, speed: 1.2, phase: 0 },
      },
      {
        id: 'l34-p2',
        xFraction: 0.58,
        width: 45,
        height: 80,
        movement: { axis: 'y', range: 35, speed: 1.2, phase: Math.PI },
      },
    ],
  },
  {
    levelNumber: 35,
    name: 'The Triple Gauntlet',
    challengeType: 'Hurdle, Gap & Platform',
    description:
      'A ground hurdle, road pit, and elevated platform in rapid succession.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l35-h1', xFraction: 0.32, width: 45, height: 50 },
      {
        id: 'l35-p1',
        xFraction: 0.62,
        width: 70,
        height: 20,
        yOffsetFromRoad: 85,
      },
    ],
    roadGaps: [{ xFraction: 0.44, widthFraction: 0.14 }],
  },
  {
    levelNumber: 36,
    name: 'The Grand Ziggurat',
    challengeType: '5-Stage Pyramid',
    description: 'A monumental five-stage symmetrical temple pyramid.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 3, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l36-s1', xFraction: 0.28, width: 35, height: 30 },
      { id: 'l36-s2', xFraction: 0.38, width: 35, height: 65 },
      { id: 'l36-s3', xFraction: 0.48, width: 35, height: 105 },
      { id: 'l36-s4', xFraction: 0.58, width: 35, height: 65 },
      { id: 'l36-s5', xFraction: 0.68, width: 35, height: 30 },
    ],
  },
  {
    levelNumber: 37,
    name: 'Leap of Faith',
    challengeType: 'Double Gap & Mid Landing',
    description: 'Two road chasms flanking a narrow mid-air landing strip.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      {
        id: 'l37-p1',
        xFraction: 0.45,
        width: 60,
        height: 20,
        yOffsetFromRoad: 70,
      },
    ],
    roadGaps: [
      { xFraction: 0.33, widthFraction: 0.12 },
      { xFraction: 0.56, widthFraction: 0.12 },
    ],
  },
  {
    levelNumber: 38,
    name: 'Dual Sentry Crossfire',
    challengeType: 'Two Horizontal Sentries',
    description:
      'Two patrol blocks sweeping across different horizontal sectors.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      {
        id: 'l38-s1',
        xFraction: 0.38,
        width: 45,
        height: 65,
        movement: { axis: 'x', range: 30, speed: 1.0, phase: 0 },
      },
      {
        id: 'l38-s2',
        xFraction: 0.6,
        width: 45,
        height: 65,
        movement: { axis: 'x', range: 30, speed: 1.2, phase: Math.PI },
      },
    ],
  },
  {
    levelNumber: 39,
    name: 'Needle in the Sky',
    challengeType: 'Ultra-Tall Spire',
    description: 'A 165dp thin spire requiring an arching trajectory to clear.',
    carStartXFraction: 0.08,
    finishXFraction: 0.9,
    coinTarget: 4, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [{ id: 'l39-s1', xFraction: 0.48, width: 32, height: 165 }],
  },
  {
    levelNumber: 40,
    name: 'The Citadel Courtyard',
    challengeType: 'Citadel Complex',
    description:
      'Road moat, front gatehouse, elevated courtyard, and rear watchtower.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      { id: 'l40-w1', xFraction: 0.42, width: 40, height: 95 },
      {
        id: 'l40-c1',
        xFraction: 0.54,
        width: 65,
        height: 20,
        yOffsetFromRoad: 80,
      },
      { id: 'l40-w2', xFraction: 0.66, width: 35, height: 110 },
    ],
    roadGaps: [{ xFraction: 0.3, widthFraction: 0.1 }],
  },
  // --- TIER 5: Master Engineering & Apex Challenges (Levels 41 - 50) ---
  {
    levelNumber: 41,
    name: 'Wave Rollercoaster',
    challengeType: 'Alternating Terrain',
    description:
      'Alternating hurdles, gaps, and floating platforms creating wave terrain.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      { id: 'l41-b1', xFraction: 0.32, width: 40, height: 75 },
      {
        id: 'l41-p1',
        xFraction: 0.52,
        width: 70,
        height: 20,
        yOffsetFromRoad: 95,
      },
      { id: 'l41-b2', xFraction: 0.66, width: 40, height: 60 },
    ],
    roadGaps: [{ xFraction: 0.4, widthFraction: 0.12 }],
  },
  {
    levelNumber: 42,
    name: 'Diagonal Stepper',
    challengeType: 'Floating Diagonal Stairs',
    description:
      'Three floating platform steps climbing diagonally with no ground support.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      // Top unchanged (68px above road); underside 30px above road blocks the drive-under shortcut
      {
        id: 'l42-p1',
        xFraction: 0.34,
        width: 55,
        height: 38,
        yOffsetFromRoad: 30,
      },
      {
        id: 'l42-p2',
        xFraction: 0.48,
        width: 55,
        height: 18,
        yOffsetFromRoad: 90,
      },
      {
        id: 'l42-p3',
        xFraction: 0.62,
        width: 55,
        height: 18,
        yOffsetFromRoad: 130,
      },
    ],
  },
  {
    levelNumber: 43,
    name: 'The Endless Abyss',
    challengeType: 'Double Wide Gap & Pivot',
    description:
      'Two massive road chasms with a single pivot island in the center.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      {
        id: 'l43-p1',
        xFraction: 0.47,
        width: 35,
        height: 20,
        yOffsetFromRoad: 75,
      },
    ],
    roadGaps: [
      { xFraction: 0.3, widthFraction: 0.16 },
      { xFraction: 0.54, widthFraction: 0.16 },
    ],
  },
  {
    levelNumber: 44,
    name: 'Moving Fortress',
    challengeType: 'Sweeping Fortress Over Pit',
    description:
      'A large horizontal fortress block sweeping across a deep road pit.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      {
        id: 'l44-m1',
        xFraction: 0.48,
        width: 75,
        height: 90,
        movement: { axis: 'x', range: 45, speed: 1.1 },
      },
    ],
    roadGaps: [{ xFraction: 0.4, widthFraction: 0.2 }],
  },
  {
    levelNumber: 45,
    name: 'Pillar Colonnade',
    challengeType: 'Triple High Columns',
    description:
      'Three towering pillars with tight spacing demanding precision flying.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 4, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      { id: 'l45-p1', xFraction: 0.34, width: 35, height: 130 },
      { id: 'l45-p2', xFraction: 0.48, width: 35, height: 150 },
      { id: 'l45-p3', xFraction: 0.62, width: 35, height: 130 },
    ],
  },
  {
    levelNumber: 46,
    name: 'Sky Trench & Crusher',
    challengeType: 'Dual Pits with Elevated Walkway',
    description:
      'Dual road pits with an elevated walkway and a moving vertical crusher overhead.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    coinTarget: 4, // best single valid run reaches all coins minus one (solver-verified)
    obstacles: [
      {
        id: 'l46-p1',
        xFraction: 0.46,
        width: 65,
        height: 20,
        yOffsetFromRoad: 70,
      },
      {
        id: 'l46-m1',
        xFraction: 0.46,
        width: 55,
        height: 50,
        yOffsetFromRoad: 135,
        movement: { axis: 'y', range: 30, speed: 1.4 },
      },
    ],
    roadGaps: [
      { xFraction: 0.33, widthFraction: 0.12 },
      { xFraction: 0.58, widthFraction: 0.12 },
    ],
  },
  {
    levelNumber: 47,
    name: 'The Colosseum',
    challengeType: 'Ascending Steps & Cavern Gap',
    description:
      'Tiered ascending stadium steps, a center cavern gap, and a high podium landing.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      { id: 'l47-s1', xFraction: 0.28, width: 40, height: 40 },
      { id: 'l47-s2', xFraction: 0.36, width: 40, height: 80 },
      { id: 'l47-s3', xFraction: 0.44, width: 40, height: 120 },
      { id: 'l47-p1', xFraction: 0.66, width: 55, height: 85 },
    ],
    roadGaps: [{ xFraction: 0.52, widthFraction: 0.14 }],
  },
  {
    levelNumber: 48,
    name: 'The Triple Threat',
    challengeType: 'Moving Pillar, Abyss & Monolith',
    description:
      'A vertically moving pillar, a wide road abyss, and a towering monolith.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      {
        id: 'l48-m1',
        xFraction: 0.32,
        width: 45,
        height: 80,
        movement: { axis: 'y', range: 35, speed: 1.3 },
      },
      { id: 'l48-w1', xFraction: 0.64, width: 50, height: 130 },
    ],
    roadGaps: [{ xFraction: 0.44, widthFraction: 0.18 }],
  },
  {
    levelNumber: 49,
    name: 'Labyrinth Course',
    challengeType: '5-Element Obstacle Course',
    description:
      'Starter hurdle, road pit, floating canopy, second pit, and fortress pylon.',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      { id: 'l49-h1', xFraction: 0.28, width: 40, height: 45 },
      {
        id: 'l49-c1',
        xFraction: 0.46,
        width: 65,
        height: 20,
        yOffsetFromRoad: 105,
      },
      { id: 'l49-w1', xFraction: 0.66, width: 45, height: 125 },
    ],
    roadGaps: [
      { xFraction: 0.35, widthFraction: 0.11 },
      { xFraction: 0.55, widthFraction: 0.11 },
    ],
  },
  {
    levelNumber: 50,
    name: 'Apex Championship',
    challengeType: 'The Ultimate Grand Master Course',
    description:
      'The pinnacle challenge: multi-tier ramparts, canyon abyss, suspended island, and dynamic oscillating barrier guarding the finish line!',
    carStartXFraction: 0.08,
    finishXFraction: 0.92,
    obstacles: [
      { id: 'l50-s1', xFraction: 0.26, width: 35, height: 40 },
      { id: 'l50-s2', xFraction: 0.34, width: 35, height: 80 },
      {
        id: 'l50-p1',
        xFraction: 0.48,
        width: 65,
        height: 22,
        yOffsetFromRoad: 85,
      },
      {
        id: 'l50-m1',
        xFraction: 0.6,
        width: 45,
        height: 110,
        movement: { axis: 'y', range: 40, speed: 1.4 },
      },
      { id: 'l50-g1', xFraction: 0.72, width: 40, height: 70 },
    ],
    roadGaps: [{ xFraction: 0.4, widthFraction: 0.16 }],
  },
];
/**
 * Helper to fetch a level configuration by number (1-50, clamped).
 */
export function getLevelConfig(levelNumber) {
  const clamped = Math.max(1, Math.min(TOTAL_LEVELS, levelNumber));
  return LEVELS[clamped - 1] || LEVELS[0];
}
export const DEFAULT_POWER_UP_PLACEMENTS = {
  // World 1 (Green Valley)
  2: { type: 'shield', xFraction: 0.3 },
  4: { type: 'boost', xFraction: 0.24 },
  5: { type: 'magnet', xFraction: 0.26 },
  7: { type: 'shield', xFraction: 0.26 },
  9: { type: 'boost', xFraction: 0.24 },
  // World 2 (Desert World)
  11: { type: 'magnet', xFraction: 0.26 },
  13: { type: 'shield', xFraction: 0.25 },
  15: { type: 'boost', xFraction: 0.24 },
  18: { type: 'shield', xFraction: 0.25 },
  20: { type: 'magnet', xFraction: 0.24 },
  // World 3 (Snow World)
  22: { type: 'boost', xFraction: 0.25 },
  24: { type: 'shield', xFraction: 0.26 },
  26: { type: 'magnet', xFraction: 0.24 },
  28: { type: 'boost', xFraction: 0.25 },
  30: { type: 'shield', xFraction: 0.25 },
  // World 4 (Candy World)
  32: { type: 'magnet', xFraction: 0.25 },
  34: { type: 'shield', xFraction: 0.25 },
  36: { type: 'boost', xFraction: 0.24 },
  38: { type: 'magnet', xFraction: 0.25 },
  40: { type: 'boost', xFraction: 0.24 },
  // World 5 (Space World)
  42: { type: 'boost', xFraction: 0.24 },
  44: { type: 'shield', xFraction: 0.25 },
  46: { type: 'magnet', xFraction: 0.24 },
  48: { type: 'shield', xFraction: 0.25 },
  50: { type: 'boost', xFraction: 0.24 },
};
/**
 * Resolves level obstacles into absolute geometry coordinates for collision and rendering,
 * taking into account animated movements at time `timeSeconds`.
 */
export function resolveLevelGeometry(
  config,
  areaWidth,
  roadY,
  timeSeconds = 0,
  worldWidth
) {
  // Move finish flag further to the right across ALL 50 levels with extended highway runout
  const effectiveWorldWidth =
    worldWidth ?? Math.max(Math.round(areaWidth * 1.55), 620);
  const carStartX = Math.max(
    CAR_HALF_WIDTH + 2,
    areaWidth * (config.carStartXFraction ?? 0.1)
  );
  const finishX =
    worldWidth !== undefined
      ? worldWidth - 75
      : Math.round(areaWidth * (config.finishXFraction ?? 0.9));
  const roadGaps = (config.roadGaps || []).map((gap) => ({
    x: gap.xFraction * areaWidth,
    width: Math.min(gap.widthFraction * areaWidth, 220),
  }));
  let maxObstacleRight = 0;
  let highestObstacleTop = roadY;
  const obstacles = config.obstacles.map((obs) => {
    const width =
      obs.width ?? (obs.widthFraction ? obs.widthFraction * areaWidth : 60);
    const baseX = obs.xFraction * areaWidth - width / 2;
    const baseY = roadY - obs.height - (obs.yOffsetFromRoad ?? 0);
    let currentX = baseX;
    let currentY = baseY;
    if (obs.movement) {
      const phase = obs.movement.phase ?? 0;
      const oscillation = Math.sin(
        timeSeconds * obs.movement.speed * 2 * Math.PI + phase
      );
      if (obs.movement.axis === 'x') {
        currentX += oscillation * obs.movement.range;
      } else {
        currentY += oscillation * obs.movement.range;
      }
    }
    if (currentX + width > maxObstacleRight) {
      maxObstacleRight = currentX + width;
    }
    if (currentY < highestObstacleTop) {
      highestObstacleTop = currentY;
    }
    return {
      id: obs.id,
      x: currentX,
      y: currentY,
      width,
      height: obs.height,
      movement: obs.movement,
      initialX: baseX,
      initialY: baseY,
    };
  });
  const clearThresholdX =
    config.clearThresholdFraction !== undefined
      ? config.clearThresholdFraction * areaWidth
      : maxObstacleRight > 0
      ? maxObstacleRight + 5
      : (carStartX + finishX) / 2;
  // Level-specific Seeded Pseudo-Random Number Generator (Mulberry32)
  // Ensures reproducible, identical coin positions for every attempt/retry of a given level,
  // while generating genuinely distinct counts, heights, and positions across all 50 levels.
  const levelSeed = (config.levelNumber * 7919 + 104729) >>> 0;
  let s = levelSeed;
  const nextRng = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Determine balanced coin count per level (3 to 5 coins).
  // Independent of config.coinTarget: a configured target must never move or add coins.
  let numCoins = 3;
  if (config.levelNumber === 1) {
    numCoins = 3;
  } else if (config.levelNumber <= 15) {
    numCoins = 3 + (nextRng() > 0.55 ? 1 : 0); // 3 or 4 coins
  } else if (config.levelNumber <= 35) {
    numCoins = 3 + Math.floor(nextRng() * 3); // 3, 4, or 5 coins
  } else {
    numCoins = 4 + (nextRng() > 0.4 ? 1 : 0); // 4 or 5 coins
  }
  const startZoneX = carStartX + 35;
  const endZoneX = finishX - 25;
  const totalZoneWidth = Math.max(120, endZoneX - startZoneX);
  const bandWidth = totalZoneWidth / numCoins;
  const coins = [];
  for (let i = 0; i < numCoins; i++) {
    const bandLeft = startZoneX + i * bandWidth;
    const margin = Math.min(18, bandWidth * 0.2);
    const usableBand = Math.max(10, bandWidth - margin * 2);
    const coinX = bandLeft + margin + nextRng() * usableBand;
    // Check if coinX is near any obstacle
    const nearbyObstacle = obstacles.find(
      (obs) => coinX >= obs.x - 12 && coinX <= obs.x + obs.width + 12
    );
    // Check if coinX is over a road gap
    const nearbyGap = roadGaps.find(
      (gap) => coinX >= gap.x - 5 && coinX <= gap.x + gap.width + 5
    );
    let coinY;
    if (nearbyObstacle) {
      // Float above the obstacle top along the ramp jump arc
      const arcOffset = 28 + nextRng() * 32;
      coinY = Math.max(40, nearbyObstacle.y - arcOffset);
    } else if (nearbyGap) {
      // Float across the road gap
      const gapOffset = 40 + nextRng() * 45;
      coinY = Math.max(45, roadY - gapOffset);
    } else {
      // Open road or ramp trajectory: vary heights (climb, crest, or descent)
      if (i === 0) {
        // Ramp takeoff / ascent
        coinY = roadY - 32 - nextRng() * 38;
      } else if (i === numCoins - 1) {
        // Landing / approach
        coinY = roadY - 30 - nextRng() * 30;
      } else {
        // Mid-flight / arc
        const midElev = Math.min(highestObstacleTop - 25, roadY - 50);
        coinY = midElev - nextRng() * 45;
      }
    }
    // Strict boundary & collision safety checks:
    // 1. Ensure coin is never embedded inside any obstacle bounds
    for (const obs of obstacles) {
      if (
        coinX >= obs.x - 14 &&
        coinX <= obs.x + obs.width + 14 &&
        coinY >= obs.y - 12 &&
        coinY <= obs.y + obs.height + 12
      ) {
        coinY = obs.y - 30;
      }
    }
    // 2. Ensure coin is never below road level
    if (coinY > roadY - 26) {
      coinY = roadY - 26;
    }
    // 3. Ensure coin is never above screen ceiling
    if (coinY < 35) {
      coinY = 35;
    }
    coins.push({
      id: `lvl-${config.levelNumber}-c${i + 1}`,
      x: coinX,
      y: coinY,
      collected: false,
    });
  }
  // Strategic Power-Up Placement
  const powerUps = [];
  const powerUpSpec =
    config.powerUp ?? DEFAULT_POWER_UP_PLACEMENTS[config.levelNumber];
  if (powerUpSpec) {
    const puX = areaWidth * powerUpSpec.xFraction;
    let puY = roadY - (powerUpSpec.yOffsetFromRoad ?? 32);
    // Ensure power-up isn't embedded inside an obstacle
    for (const obs of obstacles) {
      if (puX >= obs.x - 15 && puX <= obs.x + obs.width + 15) {
        puY = Math.min(puY, obs.y - 32);
      }
    }
    // Safe boundary limits
    puY = Math.max(45, Math.min(roadY - 26, puY));
    powerUps.push({
      id: `lvl-${config.levelNumber}-powerup-${powerUpSpec.type}`,
      type: powerUpSpec.type,
      x: puX,
      y: puY,
      collected: false,
    });
  }
  // Star-2 coin target: configured per level where not every coin is reachable in one valid run.
  const coinTarget = Math.max(
    1,
    Math.min(config.coinTarget ?? coins.length, coins.length)
  );
  return {
    obstacles,
    roadGaps,
    coins,
    coinTarget,
    powerUps,
    carStartX,
    finishX,
    clearThresholdX,
    worldWidth: effectiveWorldWidth,
  };
}
