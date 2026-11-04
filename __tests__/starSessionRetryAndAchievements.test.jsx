/**
 * P1 regressions: star rules + level session, Retry state, magnet coin reset, achievement banners.
 * Integration tests drive the real RampRacerScreen: real PanResponder handlers, real physics loop
 * (fake timers, 16ms frames), real storage (mocked AsyncStorage).
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RampRacerScreen } from '../src/games/rampracer/RampRacerScreen';
import { GameControls } from '../src/games/rampracer/components/GameControls';
import { RewardModal } from '../src/games/rampracer/components/RewardModal';
import { AchievementUnlockBanner } from '../src/games/rampracer/components/AchievementUnlockBanner';
import { CoinItem } from '../src/games/rampracer/components/CoinItem';
import { RampCanvas } from '../src/games/rampracer/components/RampCanvas';
import { LevelSelectModal } from '../src/games/rampracer/components/LevelSelectModal';
import { calculateLevelStars } from '../src/games/rampracer/utils/starRating';
import {
  checkAndUnlockAchievements,
  collectNewlyUnlockedAchievements,
  getLevelStars,
  getTotalCoins,
  markLevelCompleted,
  resetProgress,
  saveLevelStars,
  saveTotalCoins,
} from '../src/games/rampracer/utils/levelStorage';
import { resample, skiJumpStroke } from '../test-utils/levelSolver';
jest.setTimeout(120000);
// ---------- Pure rules ----------
describe('calculateLevelStars', () => {
  it.each([
    [0, 3, false, 1],
    [2, 3, false, 1],
    [2, 3, true, 1],
    [3, 3, true, 2],
    [4, 3, true, 2],
    [3, 3, false, 3],
  ])(
    'coins %i / target %i, failed=%s -> %i stars',
    (coins, target, failed, expected) => {
      expect(
        calculateLevelStars({
          coinsCollected: coins,
          coinTarget: target,
          hasFailedThisSession: failed,
        })
      ).toBe(expected);
    }
  );
});
describe('collectNewlyUnlockedAchievements', () => {
  beforeEach(() => resetProgress());
  it('reports unlocks that saveLevelStars performs internally (root cause of the missing banner)', () => {
    markLevelCompleted(1);
    saveLevelStars(1, 1); // unlocks First Victory internally and discards the result
    expect(checkAndUnlockAchievements()).toEqual([]); // the screen's old follow-up check saw nothing
    resetProgress();
    const ids = collectNewlyUnlockedAchievements(() => {
      markLevelCompleted(1);
      saveLevelStars(1, 1);
    });
    expect(ids).toEqual(['first_victory']);
  });
});
// ---------- Screen integration harness ----------
const W = 800;
const H = 280;
const g = globalThis;
const realRaf = g.requestAnimationFrame;
const realCaf = g.cancelAnimationFrame;
let renderer;
let ts = 1000;
const initialMetrics = {
  frame: { x: 0, y: 0, width: W, height: 360 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const root = () => renderer.root;
const gameArea = () =>
  root().findAll(
    (n) =>
      typeof n.props.onResponderGrant === 'function' &&
      typeof n.props.onLayout === 'function'
  )[0];
const controls = () => root().findByType(GameControls);
const reward = () => root().findByType(RewardModal).props;
const bannerId = () =>
  root().findByType(AchievementUnlockBanner).props.achievement?.id ?? null;
// React.memo components are matched by their inner component type in react-test-renderer
const unmemo = (c) => c.type ?? c;
const coins = () =>
  root()
    .findAllByType(unmemo(CoinItem))
    .map((c) => ({ x: c.props.x, y: c.props.y, collected: c.props.collected }));
const roadY = () => root().findByType(unmemo(RampCanvas)).props.roadY;
function touchEvent(p, start, prev) {
  ts += 16;
  return {
    nativeEvent: {
      pageX: p.x,
      pageY: p.y,
      locationX: p.x,
      locationY: p.y,
      timestamp: ts,
      identifier: 0,
      touches: [],
      changedTouches: [],
    },
    touchHistory: {
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: ts,
      touchBank: [
        {
          touchActive: true,
          startPageX: start.x,
          startPageY: start.y,
          startTimeStamp: ts,
          currentPageX: p.x,
          currentPageY: p.y,
          currentTimeStamp: ts,
          previousPageX: prev.x,
          previousPageY: prev.y,
          previousTimeStamp: ts - 16,
        },
      ],
    },
  };
}
async function mount(level) {
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <RampRacerScreen initialScreen="game" level={level} />
      </SafeAreaProvider>
    );
  });
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
  await act(async () => {
    gameArea().props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width: W, height: H } },
    });
  });
  expect(roadY()).toBe(195); // fixtures below were solved for this geometry (portrait road in jest)
}
async function draw(points) {
  const start = points[0];
  await act(async () => {
    gameArea().props.onResponderGrant(touchEvent(start, start, start));
  });
  for (let i = 1; i < points.length; i++) {
    const ev = touchEvent(points[i], start, points[i - 1]);
    await act(async () => {
      gameArea().props.onResponderMove(ev);
    });
  }
  const last = points[points.length - 1];
  await act(async () => {
    gameArea().props.onResponderRelease(touchEvent(last, start, last));
  });
}
async function advance(ms) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}
async function runUntilFinished() {
  for (let i = 0; i < 300; i++) {
    await advance(100);
    const s = controls().props.status;
    if (s === 'success' || s === 'stuck') return s;
  }
  return controls().props.status;
}
async function press(handler) {
  await act(async () => {
    controls().props[handler]();
  });
}
// Level 3 fixtures (W=800, roadY=195, startX=96): solved with test-utils/levelSolver
const y0 = () => roadY() - 4;
const winAllCoins = () => skiJumpStroke(111, y0(), 200, 30, 1); // success, 3/3 coins
const winTwoCoins = () => skiJumpStroke(111, y0(), 200, 40, 2); // success, 2/3 coins
const failStroke = () =>
  resample([
    { x: 111, y: y0() },
    { x: 176, y: y0() },
  ]); // falls into the gap
describe('RampRacerScreen: stars, level session, Retry, achievements (integration)', () => {
  beforeAll(() => {
    // The preset's rAF is setTimeout(0), which never advances time under fake timers
    g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
    g.cancelAnimationFrame = (id) => clearTimeout(id);
  });
  afterAll(() => {
    g.requestAnimationFrame = realRaf;
    g.cancelAnimationFrame = realCaf;
  });
  beforeEach(() => {
    jest.useFakeTimers();
    resetProgress();
  });
  afterEach(async () => {
    await act(async () => {
      renderer.unmount();
    });
    jest.useRealTimers();
  });
  it('first-try win with the coin target -> 3 stars, no-crash, First Victory banner shown', async () => {
    await mount(3);
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().earnedStars).toBe(3);
    expect(reward().noCrash).toBe(true);
    expect(reward().coinsCollected).toBe(3);
    expect(getLevelStars(3)).toBe(3);
    expect(bannerId()).toBe('first_victory');
  });
  it('fail -> Retry -> fail -> Redraw -> win with coin target -> 2 stars (failure survives Retry/Redraw)', async () => {
    await mount(3);
    await draw(failStroke());
    expect(await runUntilFinished()).toBe('stuck');
    await advance(450);
    await press('onRetry');
    expect(await runUntilFinished()).toBe('stuck');
    await advance(450);
    await press('onRedraw');
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().coinsCollected).toBe(3);
    expect(reward().earnedStars).toBe(2);
    expect(reward().noCrash).toBe(false);
    expect(getLevelStars(3)).toBe(2);
  });
  it('win below the coin target -> 1 star', async () => {
    await mount(3);
    await draw(winTwoCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().coinsCollected).toBe(2);
    expect(reward().earnedStars).toBe(1);
  });
  it('abandoning a running attempt with Retry counts as a failed attempt', async () => {
    await mount(3);
    await draw(winAllCoins());
    await advance(450); // auto-start (300ms) + a few frames of driving
    expect(controls().props.status).toBe('running');
    await press('onRetry');
    expect(await runUntilFinished()).toBe('success');
    expect(reward().coinsCollected).toBe(3);
    expect(reward().earnedStars).toBe(2);
  });
  it('a completed session ends the failure state; best stars are never reduced', async () => {
    await mount(3);
    await draw(failStroke());
    expect(await runUntilFinished()).toBe('stuck');
    await advance(450);
    await press('onRedraw');
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().earnedStars).toBe(2);
    await advance(450);
    await press('onRedraw'); // Replay from the completion screen
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().earnedStars).toBe(3);
    expect(getLevelStars(3)).toBe(3);
    await advance(450);
    await press('onRedraw');
    await draw(winTwoCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().earnedStars).toBe(1);
    expect(getLevelStars(3)).toBe(3); // never reduced
  });
  it('re-entering the same level from level select starts a new session', async () => {
    await mount(3);
    await draw(failStroke());
    expect(await runUntilFinished()).toBe('stuck');
    await advance(450);
    await act(async () => {
      root().findByType(LevelSelectModal).props.onSelectLevel(3);
    });
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(reward().earnedStars).toBe(3);
  });
  it('lifetime coins: failures add nothing and are never reset; a win adds its coins once', async () => {
    saveTotalCoins(40);
    await mount(3);
    await draw(failStroke());
    expect(await runUntilFinished()).toBe('stuck');
    expect(getTotalCoins()).toBe(40);
    await advance(450);
    await press('onRetry');
    expect(await runUntilFinished()).toBe('stuck');
    expect(getTotalCoins()).toBe(40);
    await advance(450);
    await press('onRedraw');
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    expect(getTotalCoins()).toBe(43);
    await advance(2000);
    expect(getTotalCoins()).toBe(43);
  });
  it('simultaneous unlocks are queued: each banner is shown in turn', async () => {
    saveTotalCoins(98); // +3 coins on completion crosses Coin Collector (100) together with First Victory
    await mount(3);
    await draw(winAllCoins());
    expect(await runUntilFinished()).toBe('success');
    const first = bannerId();
    expect(['first_victory', 'coin_collector']).toContain(first);
    await advance(3600); // banner auto-dismisses after 3.5s
    const second = bannerId();
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
    expect([first, second].sort()).toEqual(['coin_collector', 'first_victory']);
  });
  it('magnet: Retry restores coins to their original positions and uncollected state (level 5)', async () => {
    await mount(5);
    const base = coins();
    await draw(
      resample([
        { x: 111, y: y0() },
        { x: 176, y: y0() },
      ])
    ); // drives through the magnet, crashes into step 1
    expect(await runUntilFinished()).toBe('stuck');
    const afterRun = coins();
    expect(
      afterRun.some(
        (c, i) => c.collected || c.x !== base[i].x || c.y !== base[i].y
      )
    ).toBe(true);
    await advance(450);
    await press('onRetry');
    expect(coins()).toEqual(base);
    expect(reward().coinsCollected).toBe(0);
  });
});
