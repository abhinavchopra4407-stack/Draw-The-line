export function calculateLevelStars({
  coinsCollected,
  coinTarget,
  hasFailedThisSession,
}) {
  if (coinsCollected < coinTarget) return 1;
  return hasFailedThisSession ? 2 : 3;
}
