/**
 * Achievement and Badge System types and configuration for Ramp Racer.
 */
export const ACHIEVEMENTS = [
  {
    id: 'first_victory',
    title: 'First Victory',
    description: 'Complete the first level',
    symbol: '🏁',
    target: 1,
    rewardCoins: 25,
    badgeColor: '#10B981',
    accentColor: '#34D399',
    category: 'progress',
  },
  {
    id: 'coin_collector',
    title: 'Coin Collector',
    description: 'Collect 100 coins',
    symbol: '🪙',
    target: 100,
    rewardCoins: 50,
    badgeColor: '#F59E0B',
    accentColor: '#FBBF24',
    category: 'collection',
  },
  {
    id: 'super_driver',
    title: 'Super Driver',
    description: 'Complete 10 levels',
    symbol: '🏎️',
    target: 10,
    rewardCoins: 75,
    badgeColor: '#3B82F6',
    accentColor: '#60A5FA',
    category: 'progress',
  },
  {
    id: 'perfect_driver',
    title: 'Perfect Driver',
    description: 'Earn 3 stars in 5 levels',
    symbol: '⭐',
    target: 5,
    rewardCoins: 100,
    badgeColor: '#8B5CF6',
    accentColor: '#A78BFA',
    category: 'skill',
  },
  {
    id: 'world_explorer',
    title: 'World Explorer',
    description: 'Unlock all 5 worlds',
    symbol: '🌍',
    target: 5,
    rewardCoins: 150,
    badgeColor: '#06B6D4',
    accentColor: '#22D3EE',
    category: 'progress',
  },
  {
    id: 'powerup_master',
    title: 'Power-Up Master',
    description: 'Use all three power-ups (Magnet, Shield, Boost)',
    symbol: '⚡',
    target: 3,
    rewardCoins: 100,
    badgeColor: '#EC4899',
    accentColor: '#F472B6',
    category: 'skill',
  },
  {
    id: 'champion',
    title: 'Champion',
    description: 'Complete all 50 levels',
    symbol: '👑',
    target: 50,
    rewardCoins: 300,
    badgeColor: '#EAB308',
    accentColor: '#FDE047',
    category: 'progress',
  },
];
export function getAchievementById(id) {
  const found = ACHIEVEMENTS.find((a) => a.id === id);
  if (!found) {
    throw new Error(`Unknown achievement id: ${id}`);
  }
  return found;
}
