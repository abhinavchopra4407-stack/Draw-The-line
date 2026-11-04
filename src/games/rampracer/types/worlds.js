/**
 * World definitions, visual themes, and progression rules for Ramp Racer.
 * 5 distinct worlds distributed across 50 levels:
 * 1. Levels 1–10: Green Valley
 * 2. Levels 11–20: Desert World
 * 3. Levels 21–30: Snow World
 * 4. Levels 31–40: Candy World
 * 5. Levels 41–50: Space World
 */
export const WORLDS = [
  {
    id: 'green_valley',
    name: 'Green Valley',
    subtitle: 'Lush Hills & Sunny Skies',
    startLevel: 1,
    endLevel: 10,
    icon: '🌿',
    accentColor: '#10B981',
    headerBadgeBg: '#065F46',
    skyGradients: [
      '#097BE8',
      '#0E8EEC',
      '#13A0F0',
      '#19B2F4',
      '#20C3F8',
      '#27D3FB',
      '#30E0FD',
      '#3CEBFE',
      '#4AF3FF',
      '#5EF8FF',
      '#72FCFF',
      '#87FFFF',
    ],
    roadTheme: {
      containerBg: '#3F4751',
      topCurbBg: '#15803D', // Lush green grass curb
      curbHighlight: '#4ADE80',
      mortarBg: '#2A3038',
      brickTones: ['#47515D', '#3F4751', '#38404A'],
      bevelBg: '#596472',
      pitDepthBg: '#090C0F',
    },
    obstacleTheme: {
      containerBg: '#272C33',
      borderColor: '#1D2126',
      topPlatformBg: '#8C97A6',
      topHighlightBg: '#B3BDCB',
      brickToneDark: '#3E4651',
      brickToneLight: '#4B5562',
      bevelBg: '#616E7F',
    },
  },
  {
    id: 'desert_world',
    name: 'Desert World',
    subtitle: 'Golden Dunes & Sunlit Cacti',
    startLevel: 11,
    endLevel: 20,
    icon: '🏜️',
    accentColor: '#F59E0B',
    headerBadgeBg: '#78350F',
    skyGradients: [
      '#C2410C',
      '#D97706',
      '#EA580C',
      '#F59E0B',
      '#F97316',
      '#FB923C',
      '#FBBF24',
      '#FCD34D',
      '#FDE047',
      '#FDE68A',
      '#FEF08A',
      '#FEF9C3',
    ],
    roadTheme: {
      containerBg: '#78350F',
      topCurbBg: '#D97706', // Sunlit gold sand curb
      curbHighlight: '#FDE68A',
      mortarBg: '#451A03',
      brickTones: ['#92400E', '#B45309', '#A16207'],
      bevelBg: '#D97706',
      pitDepthBg: '#1A0701',
    },
    obstacleTheme: {
      containerBg: '#451A03',
      borderColor: '#2D1102',
      topPlatformBg: '#D97706',
      topHighlightBg: '#FDE68A',
      brickToneDark: '#78350F',
      brickToneLight: '#92400E',
      bevelBg: '#B45309',
    },
  },
  {
    id: 'snow_world',
    name: 'Snow World',
    subtitle: 'Glacial Peaks & Frosty Ice',
    startLevel: 21,
    endLevel: 30,
    icon: '❄️',
    accentColor: '#38BDF8',
    headerBadgeBg: '#0C4A6E',
    skyGradients: [
      '#0F172A',
      '#1E293B',
      '#0369A1',
      '#0284C7',
      '#0EA5E9',
      '#38BDF8',
      '#7DD3FC',
      '#BAE6FD',
      '#E0F2FE',
      '#F0F9FF',
      '#F8FAFC',
      '#FFFFFF',
    ],
    roadTheme: {
      containerBg: '#1E293B',
      topCurbBg: '#E2E8F0', // Pure frosted snow curb
      curbHighlight: '#FFFFFF',
      mortarBg: '#0F172A',
      brickTones: ['#334155', '#475569', '#3B82F6'],
      bevelBg: '#64748B',
      pitDepthBg: '#050B14',
    },
    obstacleTheme: {
      containerBg: '#0F172A',
      borderColor: '#0284C7',
      topPlatformBg: '#BAE6FD',
      topHighlightBg: '#F8FAFC',
      brickToneDark: '#1E293B',
      brickToneLight: '#334155',
      bevelBg: '#38BDF8',
    },
  },
  {
    id: 'candy_world',
    name: 'Candy World',
    subtitle: 'Sweet Marshmallows & Lollipops',
    startLevel: 31,
    endLevel: 40,
    icon: '🍭',
    accentColor: '#EC4899',
    headerBadgeBg: '#831843',
    skyGradients: [
      '#701A75',
      '#86198F',
      '#A21CAF',
      '#C026D3',
      '#D946EF',
      '#E879F9',
      '#EC4899',
      '#F472B6',
      '#FB7185',
      '#FDA4AF',
      '#FECDD3',
      '#FDF4FF',
    ],
    roadTheme: {
      containerBg: '#500724',
      topCurbBg: '#F43F5E', // Strawberry frosting curb
      curbHighlight: '#FECDD3',
      mortarBg: '#370617',
      brickTones: ['#881337', '#9D174D', '#BE185D'],
      bevelBg: '#F472B6',
      pitDepthBg: '#1B020B',
    },
    obstacleTheme: {
      containerBg: '#370617',
      borderColor: '#881337',
      topPlatformBg: '#F472B6',
      topHighlightBg: '#FDF4FF',
      brickToneDark: '#701A75',
      brickToneLight: '#86198F',
      bevelBg: '#D946EF',
    },
  },
  {
    id: 'space_world',
    name: 'Space World',
    subtitle: 'Cosmic Nebulae & Distant Planets',
    startLevel: 41,
    endLevel: 50,
    icon: '🚀',
    accentColor: '#8B5CF6',
    headerBadgeBg: '#2E1065',
    skyGradients: [
      '#030712',
      '#050816',
      '#0B0F2A',
      '#11183E',
      '#1E1B4B',
      '#2E1065',
      '#3B0764',
      '#4C1D95',
      '#581C87',
      '#6B21A8',
      '#7E22CE',
      '#4338CA',
    ],
    roadTheme: {
      containerBg: '#090D16',
      topCurbBg: '#06B6D4', // Glowing cyan neon highway curb
      curbHighlight: '#67E8F9',
      mortarBg: '#030712',
      brickTones: ['#111827', '#1F2937', '#1E1B4B'],
      bevelBg: '#374151',
      pitDepthBg: '#010204',
    },
    obstacleTheme: {
      containerBg: '#0B0F19',
      borderColor: '#8B5CF6',
      topPlatformBg: '#A855F7',
      topHighlightBg: '#E9D5FF',
      brickToneDark: '#1E1B4B',
      brickToneLight: '#2E1065',
      bevelBg: '#C084FC',
    },
  },
];
/**
 * Returns the world configuration corresponding to a given level (1 to 50).
 */
export function getWorldForLevel(level) {
  const clamped = Math.max(1, Math.min(50, Math.floor(level)));
  const match = WORLDS.find(
    (w) => clamped >= w.startLevel && clamped <= w.endLevel
  );
  return match ?? WORLDS[0];
}
/**
 * Returns the world configuration corresponding to an ID.
 */
export function getWorldById(id) {
  const match = WORLDS.find((w) => w.id === id);
  return match ?? WORLDS[0];
}
/**
 * Checks if a specific world is unlocked given the player's highest unlocked level.
 */
export function isWorldUnlocked(world, highestUnlockedLevel) {
  return highestUnlockedLevel >= world.startLevel;
}
