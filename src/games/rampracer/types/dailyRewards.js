/**
 * Daily Rewards System types and 7-day reward configuration.
 */
export const DAILY_REWARDS_7_DAYS = [
  {
    day: 1,
    rewardType: 'coins',
    coins: 25,
    label: '+25 Coins',
    symbol: '🪙',
  },
  {
    day: 2,
    rewardType: 'coins',
    coins: 50,
    label: '+50 Coins',
    symbol: '💰',
  },
  {
    day: 3,
    rewardType: 'coins',
    coins: 75,
    label: '+75 Coins',
    symbol: '🪙',
  },
  {
    day: 4,
    rewardType: 'coins',
    coins: 100,
    label: '+100 Coins',
    symbol: '💰',
    badge: 'SUPER',
  },
  {
    day: 5,
    rewardType: 'coins',
    coins: 150,
    label: '+150 Coins',
    symbol: '💎',
  },
  {
    day: 6,
    rewardType: 'coins',
    coins: 200,
    label: '+200 Coins',
    symbol: '🏆',
    badge: 'EPIC',
  },
  {
    day: 7,
    rewardType: 'jackpot',
    coins: 350,
    label: '+350 Coins + Crown',
    symbol: '👑',
    isGrandReward: true,
    badge: 'GRAND PRIZE',
  },
];
/**
 * Returns date formatted as YYYY-MM-DD in local time
 */
export function formatDateToYYYYMMDD(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
/**
 * Returns difference in calendar days: toDateStr - fromDateStr
 */
export function getCalendarDayDiff(fromDateStr, toDateStr) {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  const dObj1 = new Date(y1, m1 - 1, d1);
  const dObj2 = new Date(y2, m2 - 1, d2);
  const diffMs = dObj2.getTime() - dObj1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
