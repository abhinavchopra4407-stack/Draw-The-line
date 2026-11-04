import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateLevelStars } from './utils/starRating';
import { WorldBackground } from './components/WorldBackground';
import { Road } from './components/Road';
import { Obstacle } from './components/Obstacle';
import { Car } from './components/Car';
import { FinishFlag } from './components/FinishFlag';
import { LevelHeader } from './components/LevelHeader';
import { RestartButton } from './components/RestartButton';
import { SettingsButton } from './components/SettingsButton';
import { GarageButton } from './components/GarageButton';
import { SettingsModal } from './components/SettingsModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { GarageModal } from './components/GarageModal';
import { WorldUnlockModal } from './components/WorldUnlockModal';
import { DailyRewardButton } from './components/DailyRewardButton';
import { DailyRewardModal } from './components/DailyRewardModal';
import { CoinItem } from './components/CoinItem';
import { PowerUpItem } from './components/PowerUpItem';
import { PowerUpIndicator } from './components/PowerUpIndicator';
import { LoadingScreen } from './components/LoadingScreen';
import { RampCanvas } from './components/RampCanvas';
import { GameControls } from './components/GameControls';
import { HomeScreen } from './components/HomeScreen';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementUnlockBanner } from './components/AchievementUnlockBanner';
import { TutorialOverlay } from './components/TutorialOverlay';
import {
  POWER_UP_CONFIGS,
  DEFAULT_VEHICLE_ID,
  getVehicleById,
  getAchievementById,
} from './types';
import {
  buildRampSegments,
  stepCarPhysics,
  smoothRampPoints,
  validateRampDrawing,
  checkCoinCarCollision,
  checkPowerUpCarCollision,
  CAR_HALF_WIDTH,
  FIXED_DT,
} from './physics/physicsEngine';
import {
  getLevelConfig,
  resolveLevelGeometry,
  TOTAL_LEVELS,
} from './data/levels';
import {
  getUnlockedLevel,
  getLastPlayedLevel,
  saveLastPlayedLevel,
  markLevelCompleted,
  getCompletedLevels,
  getTotalCoins,
  saveTotalCoins,
  isRewardClaimed,
  claimLevelReward,
  getClaimedLevels,
  setSoundPreferences,
  resetProgress,
  initStorage,
  getAllLevelStars,
  getTotalStars,
  saveLevelStars,
  getUnlockedVehicles,
  getSelectedVehicle,
  selectVehicle,
  unlockVehicle,
  checkNewWorldUnlock,
  markWorldUnlockSeen,
  getDailyRewardsStatus,
  claimDailyReward,
  getAchievementsProgress,
  collectNewlyUnlockedAchievements,
  claimAchievementReward,
  recordPowerUpUsage,
  consumePowerUp,
  isPowerUpConsumed,
  setTutorialCompleted,
} from './utils/levelStorage';
import { getWorldForLevel } from './types/worlds';
import { soundManager } from './audio/soundManager';
const MIN_POINT_DISTANCE = 8;
const MAX_DRAWING_POINTS = 75;
const MAX_DRAWING_LENGTH = 1400;
const MIN_VALID_DRAWING_LENGTH = 35;
const MIN_VALID_DRAWING_POINTS = 3;
const AUTO_START_DELAY_MS = 300;
export const RampRacerScreen = ({
  onRestart,
  level = 1,
  onLevelComplete,
  initialScreen = 'home',
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;
  const roadHeight = isLandscape ? 70 : 85;
  const flagHeight = isLandscape ? 90 : 105;
  // Hydration state: show branded loading screen while restoring saved progress
  const [isHydrated, setIsHydrated] = useState(false);
  // Active top-level screen ('home' or 'game')
  const [activeScreen, setActiveScreen] = useState(initialScreen);
  // Camera scroll tracking along extended highway
  const [cameraX, setCameraX] = useState(0);
  const cameraXRef = useRef(0);
  // Active level state (resumes from last played unlocked level or explicit level prop)
  const [currentLevel, setCurrentLevel] = useState(() => {
    if (level && level >= 1 && level <= TOTAL_LEVELS) {
      return level;
    }
    const lastPlayed = getLastPlayedLevel();
    const unlocked = getUnlockedLevel();
    return Math.max(1, Math.min(TOTAL_LEVELS, Math.min(lastPlayed, unlocked)));
  });
  // Persistent stats & settings state
  const [highestUnlocked, setHighestUnlocked] = useState(() =>
    getUnlockedLevel()
  );
  const [completedLevelsList, setCompletedLevelsList] = useState(() =>
    getCompletedLevels()
  );
  const [totalCoins, setTotalCoins] = useState(() => getTotalCoins());
  const [claimedRewards, setClaimedRewards] = useState(() =>
    getClaimedLevels()
  );
  const [totalStars, setTotalStars] = useState(() => getTotalStars());
  const [levelStarsMap, setLevelStarsMap] = useState(() => getAllLevelStars());
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isLevelSelectVisible, setIsLevelSelectVisible] = useState(false);
  const [isGarageVisible, setIsGarageVisible] = useState(false);
  const [isDailyRewardsVisible, setIsDailyRewardsVisible] = useState(false);
  const [dailyRewardsStatus, setDailyRewardsStatus] = useState(() =>
    getDailyRewardsStatus()
  );
  const [isAchievementsVisible, setIsAchievementsVisible] = useState(false);
  const [unlockedAchievementToast, setUnlockedAchievementToast] =
    useState(null);
  const [achievementsList, setAchievementsList] = useState(() =>
    getAchievementsProgress()
  );
  const [unlockedWorldModalData, setUnlockedWorldModalData] = useState(null);
  const pendingWorldUnlockRef = useRef(null);
  // Track previous screen and level to detect fresh entry into Level 1
  const prevActiveScreenRef = useRef(initialScreen);
  const prevLevelRef = useRef(currentLevel);
  // Level 1 Interactive Beginner Tutorial state (appears every time Level 1 is entered)
  const [isTutorialActive, setIsTutorialActive] = useState(() => {
    return currentLevel === 1;
  });
  const [tutorialStep, setTutorialStep] = useState(() => {
    return currentLevel === 1 ? 'intro' : 'none';
  });
  const isTutorialActiveRef = useRef(currentLevel === 1);
  const tutorialStepRef = useRef(currentLevel === 1 ? 'intro' : 'none');
  useEffect(() => {
    isTutorialActiveRef.current = isTutorialActive;
    tutorialStepRef.current = tutorialStep;
  }, [isTutorialActive, tutorialStep]);
  useEffect(() => {
    const wasHome = prevActiveScreenRef.current === 'home';
    const isNowGame = activeScreen === 'game';
    const prevLevel = prevLevelRef.current;
    // Fresh entry into Level 1:
    // - Transitioned from HomeScreen to game screen while on Level 1
    // - Transitioned from another level (2-50) into Level 1
    if (currentLevel === 1 && ((wasHome && isNowGame) || prevLevel !== 1)) {
      setIsTutorialActive(true);
      setTutorialStep('intro');
    } else if (currentLevel !== 1) {
      setIsTutorialActive(false);
      setTutorialStep('none');
    }
    prevActiveScreenRef.current = activeScreen;
    prevLevelRef.current = currentLevel;
  }, [activeScreen, currentLevel]);
  // Active world configuration based on current level
  const currentWorldConfig = useMemo(
    () => getWorldForLevel(currentLevel),
    [currentLevel]
  );
  // Vehicle Garage & Customization state
  const [unlockedVehicles, setUnlockedVehicles] = useState(() =>
    getUnlockedVehicles()
  );
  const [selectedVehicle, setSelectedVehicle] = useState(() =>
    getSelectedVehicle()
  );
  const selectedVehicleRef = useRef(getSelectedVehicle());
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);
  // In-level coins and rating state
  const [coins, setCoins] = useState([]);
  const [coinsCollectedCount, setCoinsCollectedCount] = useState(0);
  const [earnedStarsForLevel, setEarnedStarsForLevel] = useState(1);
  const [noCrashState, setNoCrashState] = useState(true);
  // In-level power-ups and active state
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const activePowerUpRef = useRef(null);
  const powerUpsRef = useRef([]);
  // Audio trigger refs to avoid repeating sounds
  const lastDrawSoundRef = useRef(0);
  const hasPlayedObstacleHitRef = useRef(false);
  const hasPlayedRampSoundRef = useRef(false);
  // In-flight refs for zero-latency game loop
  const coinsRef = useRef([]);
  const coinsCollectedRef = useRef(0);
  // True once any attempt fails (or is abandoned mid-run) since the level was entered.
  // Survives Retry / Redraw / new drawings; reset only on level entry or after a completion.
  const hasFailedInLevelSessionRef = useRef(false);
  // Restore saved progress when the game is opened
  useEffect(() => {
    let mounted = true;
    initStorage().then((data) => {
      if (!mounted) return;
      setTotalCoins(data.totalCoins);
      setClaimedRewards(data.claimedRewards);
      setHighestUnlocked(data.highestUnlockedLevel);
      setCompletedLevelsList(data.completedLevels);
      setTotalStars(data.totalStars);
      setLevelStarsMap(data.levelStars);
      setUnlockedVehicles(data.unlockedVehicles);
      setSelectedVehicle(data.selectedVehicle);
      selectedVehicleRef.current = data.selectedVehicle;
      setSfxEnabled(data.soundEnabled);
      setMusicEnabled(data.musicEnabled);
      soundManager.init(data.soundEnabled, data.musicEnabled);
      if (data.musicEnabled) {
        soundManager.startMusic();
      }
      // Resume from explicit level prop or last played unlocked level
      const targetLevel =
        level && level >= 1 && level <= TOTAL_LEVELS
          ? level
          : Math.max(
              1,
              Math.min(
                TOTAL_LEVELS,
                Math.min(data.lastPlayedLevel, data.highestUnlockedLevel)
              )
            );
      setCurrentLevel(targetLevel);
      if (targetLevel === 1) {
        setIsTutorialActive(true);
        setTutorialStep('intro');
      } else {
        setIsTutorialActive(false);
        setTutorialStep('none');
      }
      setDailyRewardsStatus(getDailyRewardsStatus());
      setAchievementsList(getAchievementsProgress());
      setIsHydrated(true);
    });
    return () => {
      mounted = false;
      soundManager.cleanup();
    };
  }, [level]);
  // Layout dimensions of the gameplay area
  const [areaSize, setAreaSize] = useState({
    width: windowWidth,
    height: Math.max(200, windowHeight - 80),
  });
  // Road Y position in area coordinates
  const roadY = areaSize.height - roadHeight;
  // Extended world track width for camera scrolling and satisfaction driving runout
  const worldWidth = Math.max(Math.round(areaSize.width * 1.55), 620);
  // Active level configuration from data-driven levels
  const levelConfig = useMemo(
    () => getLevelConfig(currentLevel),
    [currentLevel]
  );
  // Animated time for dynamic/moving obstacles
  const [animTime, setAnimTime] = useState(0);
  const animTimeRef = useRef(0);
  // Resolved dynamic obstacle layout and road gaps for current level
  const levelGeometry = useMemo(
    () =>
      resolveLevelGeometry(
        levelConfig,
        areaSize.width,
        roadY,
        animTime,
        worldWidth
      ),
    [levelConfig, areaSize.width, roadY, animTime, worldWidth]
  );
  const startX = Math.max(CAR_HALF_WIDTH + 15, levelGeometry.carStartX);
  const startY = roadY - 20;
  const finishX = levelGeometry.finishX;
  // Initialize and reset level coins & power-ups when level changes or layout dimensions update
  useEffect(() => {
    const baseGeom = resolveLevelGeometry(
      levelConfig,
      areaSize.width,
      roadY,
      0,
      worldWidth
    );
    const freshCoins = baseGeom.coins.map((c) => ({ ...c, collected: false }));
    coinsRef.current = freshCoins;
    setCoins(freshCoins);
    coinsCollectedRef.current = 0;
    setCoinsCollectedCount(0);
    const freshPowerUps = baseGeom.powerUps.map((p) => ({
      ...p,
      collected: isPowerUpConsumed(currentLevel, p.id),
    }));
    powerUpsRef.current = freshPowerUps;
    setPowerUps(freshPowerUps);
    activePowerUpRef.current = null;
    setActivePowerUp(null);
  }, [currentLevel, areaSize.width, roadY, levelConfig, worldWidth]);
  // Entering a different level starts a new level session (layout changes do not).
  useEffect(() => {
    hasFailedInLevelSessionRef.current = false;
  }, [currentLevel]);
  // Game state
  const [status, setStatus] = useState('drawing');
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  const [invalidDrawingMessage, setInvalidDrawingMessage] = useState(null);
  // Car physics state
  const [carState, setCarState] = useState({
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    angle: 0,
    wheelRotation: 0,
    isGrounded: true,
    hasClearedObstacle: false,
    stuckTimer: 0,
    lastProgressX: startX,
    lastProgressY: startY,
  });
  // Refs for zero-latency game loop access
  const rawPointsRef = useRef([]);
  const totalLengthRef = useRef(0);
  const carStateRef = useRef(carState);
  const statusRef = useRef('drawing');
  const animFrameRef = useRef(null);
  const idleAnimRef = useRef(null);
  const autoStartTimerRef = useRef(null);
  const invalidMessageTimerRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const isRetryingRef = useRef(false);
  const areaOffsetRef = useRef({ x: 0, y: 0 });
  // Keep the parked car on the road when the gameplay area is measured or rotated.
  // The initial start position comes from an estimated area size; without this the car could
  // start far below the real road (instant "stuck") or off-screen after a rotation.
  useEffect(() => {
    if (statusRef.current !== 'drawing') return;
    const parked = {
      ...carStateRef.current,
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      angle: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
      lastProgressX: startX,
      lastProgressY: startY,
    };
    carStateRef.current = parked;
    setCarState(parked);
  }, [startX, startY]);
  const gameplayAreaRef = useRef(null);
  // Measure area offset for coordinate translation
  const updateAreaOffset = useCallback(() => {
    if (
      gameplayAreaRef.current &&
      typeof gameplayAreaRef.current.measure === 'function'
    ) {
      gameplayAreaRef.current.measure((_x, _y, _w, _h, pageX, pageY) => {
        if (pageX !== undefined && pageY !== undefined) {
          areaOffsetRef.current = { x: pageX, y: pageY };
        }
      });
    }
  }, []);
  const stopPhysicsLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);
  // Achievement banners are queued so simultaneous unlocks are each shown once, in order.
  const achievementToastQueueRef = useRef([]);
  const isAchievementToastVisibleRef = useRef(false);
  const showNextAchievementToast = useCallback(() => {
    const next = achievementToastQueueRef.current.shift() ?? null;
    isAchievementToastVisibleRef.current = next !== null;
    setUnlockedAchievementToast(next);
    if (next) {
      soundManager.playSfx('achievement_unlock');
    }
  }, []);
  const triggerNewlyUnlockedAchievements = useCallback(
    (newIds) => {
      if (newIds && newIds.length > 0) {
        for (const id of newIds) {
          const def = getAchievementById(id);
          if (def) achievementToastQueueRef.current.push(def);
        }
        if (!isAchievementToastVisibleRef.current) {
          showNextAchievementToast();
        }
        setAchievementsList(getAchievementsProgress());
      }
    },
    [showNextAchievementToast]
  );
  // Stable handlers: AchievementUnlockBanner restarts its animation/timer whenever onDismiss changes.
  const handleAchievementToastDismiss = useCallback(() => {
    showNextAchievementToast();
  }, [showNextAchievementToast]);
  const handleAchievementToastPress = useCallback(() => {
    achievementToastQueueRef.current = [];
    isAchievementToastVisibleRef.current = false;
    setUnlockedAchievementToast(null);
    setAchievementsList(getAchievementsProgress());
    setIsAchievementsVisible(true);
  }, []);
  // Run 60Hz fixed timestep car physics simulation loop
  const runPhysicsLoop = useCallback(() => {
    stopPhysicsLoop();
    lastTimeRef.current = Date.now();
    accumulatorRef.current = 0;
    const segments = buildRampSegments(
      drawnPoints,
      roadY,
      levelGeometry.obstacles
    );
    const tick = () => {
      if (statusRef.current !== 'running') {
        return;
      }
      const now = Date.now();
      let dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      if (dt > 0.1) dt = 0.1;
      accumulatorRef.current += dt;
      animTimeRef.current += dt;
      setAnimTime(animTimeRef.current);
      const dynamicGeometry = resolveLevelGeometry(
        levelConfig,
        areaSize.width,
        roadY,
        animTimeRef.current,
        worldWidth
      );
      const currentObstacles = dynamicGeometry.obstacles;
      const currentGaps = dynamicGeometry.roadGaps;
      let currentState = carStateRef.current;
      let currentStatus = 'running';
      while (accumulatorRef.current >= FIXED_DT) {
        accumulatorRef.current -= FIXED_DT;
        const isBoost = activePowerUpRef.current?.type === 'boost';
        const isShield =
          activePowerUpRef.current?.type === 'shield' &&
          (activePowerUpRef.current.shieldHitsRemaining ?? 0) > 0;
        const result = stepCarPhysics({
          state: currentState,
          segments,
          obstacles: currentObstacles,
          roadGaps: currentGaps,
          roadY,
          finishX,
          clearThresholdX: levelGeometry.clearThresholdX,
          dt: FIXED_DT,
          handling: getVehicleById(selectedVehicleRef.current).handling,
          isSpeedBoostActive: isBoost,
          hasShield: isShield,
        });
        currentState = result.state;
        currentStatus = result.status;
        // If shield absorbed an obstacle collision
        if (result.shieldAbsorbed) {
          soundManager.playSfx('shield_break', 0.95);
          activePowerUpRef.current = null;
          setActivePowerUp(null);
        }
        // Active Power-Up Countdown (for boost & magnet)
        if (activePowerUpRef.current) {
          if (activePowerUpRef.current.type !== 'shield') {
            activePowerUpRef.current.remainingSeconds -= FIXED_DT;
            if (activePowerUpRef.current.remainingSeconds <= 0) {
              activePowerUpRef.current = null;
              setActivePowerUp(null);
            }
          }
        }
        // Check Power-Up item collection
        for (let i = 0; i < powerUpsRef.current.length; i++) {
          const pu = powerUpsRef.current[i];
          if (!pu.collected) {
            if (
              checkPowerUpCarCollision(
                pu,
                currentState.x,
                currentState.y,
                currentState.angle
              )
            ) {
              pu.collected = true;
              consumePowerUp(currentLevel, pu.id);
              setPowerUps([...powerUpsRef.current]);
              soundManager.playSfx('powerup_collect', 0.95);
              const cfg = POWER_UP_CONFIGS[pu.type];
              const newActive = {
                type: pu.type,
                remainingSeconds: cfg.duration,
                totalDuration: cfg.duration,
                shieldHitsRemaining: pu.type === 'shield' ? 1 : undefined,
              };
              activePowerUpRef.current = newActive;
              setActivePowerUp({ ...newActive });
              if (pu.type === 'boost') {
                soundManager.playSfx('speed_boost', 0.9);
                currentState.vx = Math.max(currentState.vx + 140, 520);
              } else if (pu.type === 'magnet') {
                soundManager.playSfx('magnet_pull', 0.6);
              }
              // Track power-up usage for Power-Up Master achievement
              const newlyUnlocked = recordPowerUpUsage(pu.type);
              if (newlyUnlocked.length > 0) {
                triggerNewlyUnlockedAchievements(newlyUnlocked);
              }
            }
          }
        }
        // MAGNET: attract nearby uncollected coins towards the car
        if (activePowerUpRef.current?.type === 'magnet') {
          const MAGNET_RADIUS = 200;
          const MAGNET_SPEED = 340;
          let anyMagnetMove = false;
          for (let i = 0; i < coinsRef.current.length; i++) {
            const coin = coinsRef.current[i];
            if (!coin.collected) {
              const dx = currentState.x - coin.x;
              const dy = currentState.y - 10 - coin.y;
              const dist = Math.hypot(dx, dy);
              if (dist < MAGNET_RADIUS && dist > 4) {
                const stepDist = Math.min(dist, MAGNET_SPEED * FIXED_DT);
                coin.x += (dx / dist) * stepDist;
                coin.y += (dy / dist) * stepDist;
                anyMagnetMove = true;
              }
            }
          }
          if (anyMagnetMove) {
            setCoins([...coinsRef.current]);
          }
        }
        // Check collectible coin pickups when any part of the car touches the coin
        let newlyCollected = false;
        for (let i = 0; i < coinsRef.current.length; i++) {
          const coin = coinsRef.current[i];
          if (!coin.collected) {
            if (
              checkCoinCarCollision(
                coin,
                currentState.x,
                currentState.y,
                currentState.angle
              )
            ) {
              coin.collected = true;
              coinsCollectedRef.current += 1;
              newlyCollected = true;
              soundManager.playSfx('coin_collect', 0.9);
            }
          }
        }
        if (newlyCollected) {
          const currentCount = coinsCollectedRef.current;
          setCoins([...coinsRef.current]);
          setCoinsCollectedCount(currentCount);
        }
        // Check wheel-on-ramp contact sound
        if (
          result.state.isGrounded &&
          segments.length > 0 &&
          !hasPlayedRampSoundRef.current
        ) {
          const onRampX =
            drawnPoints.length > 0 &&
            result.state.x >= drawnPoints[0].x - 10 &&
            result.state.x <= drawnPoints[drawnPoints.length - 1].x + 10;
          if (onRampX) {
            hasPlayedRampSoundRef.current = true;
            soundManager.playSfx('wheel_ramp', 0.6);
          }
        }
        // Check obstacle collision sound
        if (
          !result.state.hasClearedObstacle &&
          !hasPlayedObstacleHitRef.current
        ) {
          const hitObs = currentObstacles.some((obs) => {
            const margin = 5;
            return (
              result.state.x + CAR_HALF_WIDTH >= obs.x - margin &&
              result.state.x - CAR_HALF_WIDTH <= obs.x + obs.width + margin &&
              result.state.y >= obs.y - margin &&
              result.state.y - 20 <= obs.y + obs.height + margin
            );
          });
          if (hitObs) {
            hasPlayedObstacleHitRef.current = true;
            soundManager.playSfx('obstacle_hit', 0.8);
          }
        }
        if (currentStatus !== 'running') {
          break;
        }
      }
      carStateRef.current = currentState;
      setCarState(currentState);
      if (activePowerUpRef.current) {
        setActivePowerUp({ ...activePowerUpRef.current });
      }
      // Smooth camera scrolling along extended level track
      const maxScroll = Math.max(
        0,
        dynamicGeometry.worldWidth - areaSize.width
      );
      const targetCamX = Math.max(
        0,
        Math.min(currentState.x - areaSize.width * 0.35, maxScroll)
      );
      const curCamX = cameraXRef.current;
      const smoothCamX =
        curCamX + (targetCamX - curCamX) * Math.min(1, 12 * dt);
      cameraXRef.current = smoothCamX;
      setCameraX(smoothCamX);
      // Level 1 Tutorial checkpoints during driving
      if (isTutorialActiveRef.current) {
        if (
          tutorialStepRef.current === 'driving' &&
          currentState.x > startX + 40
        ) {
          setTutorialStep('coins');
        } else if (
          tutorialStepRef.current === 'coins' &&
          (currentState.x > finishX - 160 || coinsCollectedRef.current > 0)
        ) {
          setTutorialStep('finish');
        }
      }
      if (currentStatus !== 'running') {
        setStatus(currentStatus);
        statusRef.current = currentStatus;
        activePowerUpRef.current = null;
        setActivePowerUp(null);
        if (currentStatus === 'success') {
          if (currentLevel === 1) {
            setIsTutorialActive(false);
            setTutorialStep('none');
            setTutorialCompleted(true);
          }
          // Stars: 1 = valid completion, 2 = + coin target, 3 = + zero failed attempts this session
          const target = levelGeometry.coinTarget ?? 3;
          const collected = coinsCollectedRef.current;
          const noCrash = !hasFailedInLevelSessionRef.current;
          const stars = calculateLevelStars({
            coinsCollected: collected,
            coinTarget: target,
            hasFailedThisSession: !noCrash,
          });
          // A completed level session ends here; a Replay starts a fresh session.
          hasFailedInLevelSessionRef.current = false;
          // Persist progress. saveTotalCoins/saveLevelStars unlock achievements internally,
          // so collect every unlock produced by this completion for the banner.
          let res = { nextLevel: currentLevel, unlockedNew: false };
          const attemptCoins = coinsCollectedRef.current;
          const newlyUnlocked = collectNewlyUnlockedAchievements(() => {
            res = markLevelCompleted(currentLevel);
            // Award attempt coins permanently only upon successful completion!
            if (attemptCoins > 0) {
              saveTotalCoins(getTotalCoins() + attemptCoins);
            }
            // Save highest star rating achieved permanently (enforces never reducing)
            saveLevelStars(currentLevel, stars);
          });
          setHighestUnlocked(res.nextLevel);
          setCompletedLevelsList(getCompletedLevels());
          setTotalCoins(getTotalCoins());
          // Check if advancing unlocked a brand new world
          const newlyUnlockedWorld = checkNewWorldUnlock(res.nextLevel);
          if (newlyUnlockedWorld) {
            pendingWorldUnlockRef.current = newlyUnlockedWorld;
          }
          setCoinsCollectedCount(collected);
          setEarnedStarsForLevel(stars);
          setNoCrashState(noCrash);
          setTotalStars(getTotalStars());
          setLevelStarsMap(getAllLevelStars());
          if (newlyUnlocked.length > 0) {
            triggerNewlyUnlockedAchievements(newlyUnlocked);
          }
          soundManager.playSfx('level_win');
          if (onLevelComplete) {
            onLevelComplete(currentLevel);
          }
        } else if (currentStatus === 'stuck') {
          hasFailedInLevelSessionRef.current = true;
          soundManager.playSfx('car_fail');
        }
        stopPhysicsLoop();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    stopPhysicsLoop();
    animFrameRef.current = requestAnimationFrame(tick);
  }, [
    drawnPoints,
    levelConfig,
    areaSize.width,
    roadY,
    finishX,
    levelGeometry.clearThresholdX,
    levelGeometry.coinTarget,
    levelGeometry.obstacles,
    startX,
    triggerNewlyUnlockedAchievements,
    worldWidth,
    currentLevel,
    onLevelComplete,
    stopPhysicsLoop,
  ]);
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopPhysicsLoop();
      if (idleAnimRef.current !== null) {
        cancelAnimationFrame(idleAnimRef.current);
      }
      if (autoStartTimerRef.current) {
        clearTimeout(autoStartTimerRef.current);
      }
      if (invalidMessageTimerRef.current) {
        clearTimeout(invalidMessageTimerRef.current);
      }
    };
  }, [stopPhysicsLoop]);
  // Idle animation loop for moving obstacles in drawing mode
  useEffect(() => {
    const hasMoving = levelConfig.obstacles.some((o) => o.movement);
    if (!hasMoving || status !== 'drawing') return;
    let active = true;
    let last = Date.now();
    const idleTick = () => {
      if (!active) return;
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      animTimeRef.current += Math.min(dt, 0.05);
      setAnimTime(animTimeRef.current);
      idleAnimRef.current = requestAnimationFrame(idleTick);
    };
    idleAnimRef.current = requestAnimationFrame(idleTick);
    return () => {
      active = false;
      if (idleAnimRef.current !== null) {
        cancelAnimationFrame(idleAnimRef.current);
      }
    };
  }, [levelConfig, status]);
  // Convert screen coordinates to local gameplay coordinates and clamp to playable sky
  const extractGameCoords = useCallback(
    (screenX, screenY) => {
      const relX = screenX - areaOffsetRef.current.x;
      const relY = screenY - areaOffsetRef.current.y;
      const clampedX = Math.max(10, Math.min(relX, areaSize.width - 10));
      const clampedY = Math.max(15, Math.min(relY, roadY - 4));
      return { x: clampedX, y: clampedY };
    },
    [areaSize.width, roadY]
  );
  // PanResponder to handle touch ramp drawing
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          if (statusRef.current !== 'drawing') return false;
          if (
            isTutorialActiveRef.current &&
            (tutorialStepRef.current === 'intro' ||
              tutorialStepRef.current === 'goal')
          ) {
            return false;
          }
          return true;
        },
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: () => {
          if (statusRef.current !== 'drawing') return false;
          if (
            isTutorialActiveRef.current &&
            (tutorialStepRef.current === 'intro' ||
              tutorialStepRef.current === 'goal')
          ) {
            return false;
          }
          return true;
        },
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
          if (statusRef.current !== 'drawing') return;
          // Clear any pending auto-start or invalid message
          if (autoStartTimerRef.current) {
            clearTimeout(autoStartTimerRef.current);
            autoStartTimerRef.current = null;
          }
          setIsAutoStarting(false);
          setInvalidDrawingMessage(null);
          cameraXRef.current = 0;
          setCameraX(0);
          // Reset coins and attempt tracking for the new drawing attempt
          const baseGeom = resolveLevelGeometry(
            levelConfig,
            areaSize.width,
            roadY,
            0,
            worldWidth
          );
          const freshCoins = baseGeom.coins.map((c) => ({
            ...c,
            collected: false,
          }));
          coinsRef.current = freshCoins;
          setCoins(freshCoins);
          coinsCollectedRef.current = 0;
          setCoinsCollectedCount(0);
          const freshPowerUps = baseGeom.powerUps.map((p) => ({
            ...p,
            collected: isPowerUpConsumed(currentLevel, p.id),
          }));
          powerUpsRef.current = freshPowerUps;
          setPowerUps(freshPowerUps);
          activePowerUpRef.current = null;
          setActivePowerUp(null);
          const screenX = gestureState.x0 || evt.nativeEvent.pageX;
          const screenY = gestureState.y0 || evt.nativeEvent.pageY;
          const pt = extractGameCoords(screenX, screenY);
          rawPointsRef.current = [pt];
          totalLengthRef.current = 0;
          setIsDrawing(true);
          setDrawnPoints([pt]);
          // Advance tutorial step when player begins drawing
          if (
            isTutorialActiveRef.current &&
            (tutorialStepRef.current === 'intro' ||
              tutorialStepRef.current === 'goal' ||
              tutorialStepRef.current === 'draw')
          ) {
            setTutorialStep('connected');
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          if (statusRef.current !== 'drawing') return;
          const screenX =
            gestureState.moveX !== 0
              ? gestureState.moveX
              : evt.nativeEvent.pageX;
          const screenY =
            gestureState.moveY !== 0
              ? gestureState.moveY
              : evt.nativeEvent.pageY;
          const pt = extractGameCoords(screenX, screenY);
          const raw = rawPointsRef.current;
          if (raw.length === 0) {
            rawPointsRef.current = [pt];
            setDrawnPoints([pt]);
            return;
          }
          const last = raw[raw.length - 1];
          const dx = pt.x - last.x;
          const dy = pt.y - last.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_POINT_DISTANCE) {
            return;
          }
          if (
            raw.length >= MAX_DRAWING_POINTS ||
            totalLengthRef.current + dist > MAX_DRAWING_LENGTH
          ) {
            return;
          }
          // Play throttled drawing sound
          const now = Date.now();
          if (now - lastDrawSoundRef.current > 80) {
            lastDrawSoundRef.current = now;
            soundManager.playSfx('draw_ramp', 0.5);
          }
          const stepSize = 14;
          if (dist > stepSize * 1.5) {
            const steps = Math.min(6, Math.floor(dist / stepSize));
            for (let s = 1; s <= steps; s++) {
              const fraction = s / (steps + 1);
              raw.push({
                x: last.x + dx * fraction,
                y: last.y + dy * fraction,
              });
            }
          }
          totalLengthRef.current += dist;
          raw.push(pt);
          const smoothed = smoothRampPoints(raw);
          setDrawnPoints(smoothed);
        },
        onPanResponderRelease: () => {
          setIsDrawing(false);
          const raw = rawPointsRef.current;
          // Validate ramp connection to road, launch zone, and forward progression
          const firstHurdleX =
            levelGeometry.obstacles.length > 0
              ? Math.min(...levelGeometry.obstacles.map((o) => o.x))
              : levelGeometry.roadGaps.length > 0
              ? Math.min(...levelGeometry.roadGaps.map((g) => g.x))
              : startX + 260;
          const maxLaunchX = Math.max(firstHurdleX + 60, areaSize.width * 0.65);
          const validation = validateRampDrawing(
            raw,
            roadY,
            startX,
            maxLaunchX,
            levelGeometry.obstacles
          );
          if (!validation.isValid) {
            rawPointsRef.current = [];
            totalLengthRef.current = 0;
            setDrawnPoints([]);
            const errorMsg =
              isTutorialActiveRef.current &&
              tutorialStepRef.current === 'connected'
                ? 'Try connecting your line to the road! 🛣️'
                : validation.reason || 'Draw a valid ramp to launch! ✏️';
            setInvalidDrawingMessage(errorMsg);
            if (invalidMessageTimerRef.current) {
              clearTimeout(invalidMessageTimerRef.current);
            }
            invalidMessageTimerRef.current = setTimeout(() => {
              setInvalidDrawingMessage(null);
            }, 1800);
            return;
          }
          // Advance tutorial to driving step when valid ramp is drawn
          if (isTutorialActiveRef.current) {
            setTutorialStep('driving');
          }
          // Valid ramp: smooth and automatically launch after short 300ms transition
          const finalSmoothed = validation.sanitizedPoints;
          setDrawnPoints(finalSmoothed);
          setIsAutoStarting(true);
          if (autoStartTimerRef.current) {
            clearTimeout(autoStartTimerRef.current);
          }
          autoStartTimerRef.current = setTimeout(() => {
            setIsAutoStarting(false);
            setStatus('running');
            statusRef.current = 'running';
            soundManager.playSfx('car_engine');
            hasPlayedObstacleHitRef.current = false;
            hasPlayedRampSoundRef.current = false;
            runPhysicsLoop();
          }, AUTO_START_DELAY_MS);
        },
        onPanResponderTerminate: () => {
          setIsDrawing(false);
        },
      }),
    [
      extractGameCoords,
      runPhysicsLoop,
      levelGeometry,
      roadY,
      startX,
      areaSize.width,
      currentLevel,
      levelConfig,
      worldWidth,
    ]
  );
  // Controls Handlers
  const handleClear = useCallback(() => {
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }
    setIsAutoStarting(false);
    cameraXRef.current = 0;
    setCameraX(0);
    rawPointsRef.current = [];
    totalLengthRef.current = 0;
    setDrawnPoints([]);
  }, []);
  // Replay attempt with existing ramp
  const handleRetry = useCallback(() => {
    if (isRetryingRef.current) return;
    isRetryingRef.current = true;
    setTimeout(() => {
      isRetryingRef.current = false;
    }, 400);
    // Abandoning a run in progress counts as a failed attempt for this level session
    if (statusRef.current === 'running') {
      hasFailedInLevelSessionRef.current = true;
    }
    stopPhysicsLoop();
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
    }
    // Reset attempt coins to their original positions (the magnet moves coins during a run)
    cameraXRef.current = 0;
    setCameraX(0);
    const baseGeom = resolveLevelGeometry(
      levelConfig,
      areaSize.width,
      roadY,
      0,
      worldWidth
    );
    const freshCoins = baseGeom.coins.map((c) => ({ ...c, collected: false }));
    coinsRef.current = freshCoins;
    setCoins(freshCoins);
    coinsCollectedRef.current = 0;
    setCoinsCollectedCount(0);
    powerUpsRef.current = powerUpsRef.current.map((p) => ({
      ...p,
      collected: isPowerUpConsumed(currentLevel, p.id),
    }));
    setPowerUps([...powerUpsRef.current]);
    activePowerUpRef.current = null;
    setActivePowerUp(null);
    const freshState = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
      lastProgressX: startX,
      lastProgressY: startY,
    };
    carStateRef.current = freshState;
    setCarState(freshState);
    setStatus('drawing');
    statusRef.current = 'drawing';
    // Auto-launch on existing ramp
    if (drawnPoints.length >= MIN_VALID_DRAWING_POINTS) {
      setIsAutoStarting(true);
      autoStartTimerRef.current = setTimeout(() => {
        setIsAutoStarting(false);
        setStatus('running');
        statusRef.current = 'running';
        soundManager.playSfx('car_engine');
        hasPlayedObstacleHitRef.current = false;
        hasPlayedRampSoundRef.current = false;
        runPhysicsLoop();
      }, AUTO_START_DELAY_MS);
    }
  }, [
    startX,
    startY,
    currentLevel,
    levelConfig,
    areaSize.width,
    roadY,
    worldWidth,
    drawnPoints.length,
    stopPhysicsLoop,
    runPhysicsLoop,
  ]);
  // Clear ramp and allow redrawing
  const handleRedraw = useCallback(() => {
    if (isRetryingRef.current) return;
    isRetryingRef.current = true;
    setTimeout(() => {
      isRetryingRef.current = false;
    }, 400);
    // Abandoning a run in progress counts as a failed attempt for this level session
    if (statusRef.current === 'running') {
      hasFailedInLevelSessionRef.current = true;
    }
    stopPhysicsLoop();
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }
    setIsAutoStarting(false);
    cameraXRef.current = 0;
    setCameraX(0);
    rawPointsRef.current = [];
    totalLengthRef.current = 0;
    // Reset attempt coins (level-session failure status is intentionally kept)
    const baseGeom = resolveLevelGeometry(
      levelConfig,
      areaSize.width,
      roadY,
      0,
      worldWidth
    );
    const freshCoins = baseGeom.coins.map((c) => ({ ...c, collected: false }));
    coinsRef.current = freshCoins;
    setCoins(freshCoins);
    coinsCollectedRef.current = 0;
    setCoinsCollectedCount(0);
    const freshPowerUps = baseGeom.powerUps.map((p) => ({
      ...p,
      collected: isPowerUpConsumed(currentLevel, p.id),
    }));
    powerUpsRef.current = freshPowerUps;
    setPowerUps(freshPowerUps);
    activePowerUpRef.current = null;
    setActivePowerUp(null);
    const freshState = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
      lastProgressX: startX,
      lastProgressY: startY,
    };
    carStateRef.current = freshState;
    statusRef.current = 'drawing';
    setDrawnPoints([]);
    setCarState(freshState);
    setStatus('drawing');
  }, [
    startX,
    startY,
    currentLevel,
    levelConfig,
    areaSize.width,
    roadY,
    worldWidth,
    stopPhysicsLoop,
  ]);
  const handleRestart = useCallback(() => {
    soundManager.playSfx('btn_click');
    handleRedraw();
    if (onRestart) {
      onRestart();
    }
  }, [handleRedraw, onRestart]);
  const handleNextLevel = useCallback(() => {
    // If advancing unlocks a brand-new world, show celebratory unlock modal first
    if (pendingWorldUnlockRef.current) {
      const pendingWorld = pendingWorldUnlockRef.current;
      pendingWorldUnlockRef.current = null;
      setUnlockedWorldModalData(pendingWorld);
      return;
    }
    const nextLvl = Math.min(TOTAL_LEVELS, currentLevel + 1);
    saveLastPlayedLevel(nextLvl);
    setCurrentLevel(nextLvl);
    handleRedraw();
  }, [currentLevel, handleRedraw]);
  const handleWorldUnlockContinue = useCallback(() => {
    if (unlockedWorldModalData) {
      markWorldUnlockSeen(unlockedWorldModalData.id);
      const targetLvl = unlockedWorldModalData.startLevel;
      saveLastPlayedLevel(targetLvl);
      setCurrentLevel(targetLvl);
      setUnlockedWorldModalData(null);
      handleRedraw();
    }
  }, [unlockedWorldModalData, handleRedraw]);
  const handleClaimReward = useCallback(() => {
    let res = { awarded: false, newTotal: getTotalCoins() };
    // claimLevelReward -> saveTotalCoins can unlock coin achievements internally
    const newlyUnlocked = collectNewlyUnlockedAchievements(() => {
      res = claimLevelReward(currentLevel);
    });
    if (res.awarded) {
      setTotalCoins(res.newTotal);
      setClaimedRewards(getClaimedLevels());
    }
    triggerNewlyUnlockedAchievements(newlyUnlocked);
  }, [currentLevel, triggerNewlyUnlockedAchievements]);
  // Interactive Tutorial Navigation & Actions
  const handleStartTutorial = useCallback(() => {
    saveLastPlayedLevel(1);
    setCurrentLevel(1);
    setIsTutorialActive(true);
    setTutorialStep('intro');
    handleRedraw();
    hasFailedInLevelSessionRef.current = false; // entering the level starts a new session
    if (activeScreen === 'home') {
      setActiveScreen('game');
    }
  }, [handleRedraw, activeScreen]);
  const handleTutorialContinue = useCallback(() => {
    const curStep = tutorialStepRef.current;
    if (curStep === 'intro') {
      setTutorialStep('goal');
    } else if (curStep === 'goal') {
      setTutorialStep('draw');
    } else if (curStep === 'draw') {
      setTutorialStep('connected');
    } else if (curStep === 'connected') {
      setTutorialStep('driving');
    } else if (curStep === 'driving') {
      setTutorialStep('coins');
    } else if (curStep === 'coins') {
      setTutorialStep('finish');
    } else if (curStep === 'finish') {
      setTutorialStep('none');
    } else if (curStep === 'completed') {
      setTutorialCompleted(true);
      setIsTutorialActive(false);
      setTutorialStep('none');
      handleNextLevel();
    }
  }, [handleNextLevel]);
  const handleTutorialBack = useCallback(() => {
    const curStep = tutorialStepRef.current;
    if (curStep === 'goal') {
      setTutorialStep('intro');
    } else if (curStep === 'draw') {
      setTutorialStep('goal');
    } else if (curStep === 'connected') {
      setTutorialStep('draw');
    } else if (curStep === 'coins') {
      setTutorialStep('driving');
    } else if (curStep === 'finish') {
      setTutorialStep('coins');
    }
  }, []);
  const handleTutorialSkip = useCallback(() => {
    setTutorialCompleted(true);
    setIsTutorialActive(false);
    setTutorialStep('none');
  }, []);
  const handleClaimDailyReward = useCallback(() => {
    const result = claimDailyReward();
    if (result.success && result.newTotalCoins !== undefined) {
      setTotalCoins(result.newTotalCoins);
      setDailyRewardsStatus(getDailyRewardsStatus());
    }
    return result;
  }, []);
  const handleClaimAchievementReward = useCallback((id) => {
    const res = claimAchievementReward(id);
    if (res.success) {
      if (res.newTotalCoins !== undefined) {
        setTotalCoins(res.newTotalCoins);
      }
      setAchievementsList(getAchievementsProgress());
    }
  }, []);
  const handleToggleSfx = useCallback(
    (enabled) => {
      setSfxEnabled(enabled);
      setSoundPreferences(enabled, musicEnabled);
      soundManager.setSfxEnabled(enabled);
    },
    [musicEnabled]
  );
  const handleToggleMusic = useCallback(
    (enabled) => {
      setMusicEnabled(enabled);
      setSoundPreferences(sfxEnabled, enabled);
      soundManager.setMusicEnabled(enabled);
    },
    [sfxEnabled]
  );
  const handleSelectVehicle = useCallback((id) => {
    selectVehicle(id);
    setSelectedVehicle(id);
    selectedVehicleRef.current = id;
  }, []);
  const handleUnlockVehicle = useCallback((id) => {
    const res = unlockVehicle(id);
    if (res.success) {
      setTotalCoins(res.remainingCoins);
      setUnlockedVehicles(getUnlockedVehicles());
      setSelectedVehicle(getSelectedVehicle());
      selectedVehicleRef.current = getSelectedVehicle();
    }
    return res;
  }, []);
  const handleResetProgress = useCallback(() => {
    resetProgress();
    setCurrentLevel(1);
    setTotalCoins(0);
    setClaimedRewards([]);
    setHighestUnlocked(1);
    setCompletedLevelsList([]);
    setTotalStars(0);
    setLevelStarsMap({});
    setUnlockedVehicles([DEFAULT_VEHICLE_ID]);
    setSelectedVehicle(DEFAULT_VEHICLE_ID);
    selectedVehicleRef.current = DEFAULT_VEHICLE_ID;
    setDailyRewardsStatus(getDailyRewardsStatus());
    setAchievementsList(getAchievementsProgress());
    handleRedraw();
  }, [handleRedraw]);
  const onAreaLayout = useCallback(
    (e) => {
      const { width, height } = e.nativeEvent.layout;
      if (width > 0 && height > 0) {
        setAreaSize({ width, height });
      }
      updateAreaOffset();
    },
    [updateAreaOffset]
  );
  // If storage is not yet hydrated, show branded loading screen to avoid Level 1 flash
  if (!isHydrated) {
    return <LoadingScreen />;
  }
  return (
    <View style={styles.screenRoot}>
      {activeScreen === 'home' ? (
        <HomeScreen
          currentLevel={currentLevel}
          highestUnlocked={highestUnlocked}
          totalCoins={totalCoins}
          totalStars={totalStars}
          selectedVehicle={selectedVehicle}
          hasDailyRewardAvailable={dailyRewardsStatus.canClaimToday}
          onStartGame={() => {
            handleRedraw();
            if (currentLevel === 1) {
              setIsTutorialActive(true);
              setTutorialStep('intro');
            }
            setActiveScreen('game');
          }}
          onOpenGarage={() => {
            soundManager.playSfx('btn_click');
            setIsGarageVisible(true);
          }}
          onOpenDailyRewards={() => {
            soundManager.playSfx('btn_click');
            setDailyRewardsStatus(getDailyRewardsStatus());
            setIsDailyRewardsVisible(true);
          }}
          onOpenAchievements={() => {
            soundManager.playSfx('btn_click');
            setAchievementsList(getAchievementsProgress());
            setIsAchievementsVisible(true);
          }}
          onOpenLevelSelect={() => {
            soundManager.playSfx('btn_click');
            setIsLevelSelectVisible(true);
          }}
          onOpenSettings={() => {
            soundManager.playSfx('btn_click');
            setIsSettingsVisible(true);
          }}
          onStartTutorial={handleStartTutorial}
        />
      ) : (
        <WorldBackground world={currentWorldConfig} level={currentLevel}>
          {/* Top Header */}
          <View
            style={[
              styles.headerContainer,
              {
                paddingTop: Math.max(insets.top, 12),
                paddingLeft: Math.max(insets.left, 16),
                paddingRight: Math.max(insets.right, 16),
              },
            ]}
          >
            <View style={styles.headerBadgesRow}>
              {/* Home button to return to dedicated Home screen */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Return to Home Screen"
                activeOpacity={0.8}
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  handleRedraw();
                  setActiveScreen('home');
                }}
                style={styles.homeBtn}
              >
                <Text style={styles.homeBtnText}>🏠</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Total Stars: ${totalStars}. Tap to select level.`}
                activeOpacity={0.8}
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  setIsLevelSelectVisible(true);
                }}
                style={styles.starsBadge}
              >
                <Text style={styles.starsIcon}>⭐</Text>
                <Text style={styles.starsText}>{totalStars}</Text>
              </TouchableOpacity>

              {/* Total Saved Coins */}
              <View style={styles.coinsBadge}>
                <Text style={styles.coinsIcon}>💰</Text>
                <Text style={styles.coinsText}>
                  {totalCoins.toLocaleString()}
                </Text>
              </View>

              {/* Real-time Current Attempt Coin Progress HUD */}
              <View style={styles.attemptCoinBadge}>
                <Text style={styles.attemptCoinIcon}>🪙</Text>
                <Text style={styles.attemptCoinText}>
                  {coinsCollectedCount}/{levelGeometry.coinTarget}
                </Text>
              </View>
            </View>

            <LevelHeader
              level={currentLevel}
              worldName={currentWorldConfig.name}
              worldIcon={currentWorldConfig.icon}
              worldColor={currentWorldConfig.accentColor}
              stars={levelStarsMap[currentLevel] ?? 0}
              onPress={() => {
                soundManager.playSfx('btn_click');
                setIsLevelSelectVisible(true);
              }}
            />

            <View style={styles.headerRightActions}>
              <DailyRewardButton
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  setDailyRewardsStatus(getDailyRewardsStatus());
                  setIsDailyRewardsVisible(true);
                }}
                hasAvailableReward={dailyRewardsStatus.canClaimToday}
                style={styles.settingsBtnSpacing}
              />
              <GarageButton
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  setIsGarageVisible(true);
                }}
                style={styles.settingsBtnSpacing}
              />
              <SettingsButton
                onPress={() => {
                  soundManager.playSfx('btn_click');
                  setIsSettingsVisible(true);
                }}
                style={styles.settingsBtnSpacing}
              />
              <RestartButton onPress={handleRestart} />
            </View>
          </View>

          {/* Floating Active Power-Up HUD Indicator */}
          <PowerUpIndicator activePowerUp={activePowerUp} />

          {/* Main 2D Gameplay Area with Touch Ramp Drawing */}
          <View
            ref={gameplayAreaRef}
            collapsable={false}
            style={styles.gameplayArea}
            onLayout={onAreaLayout}
            {...panResponder.panHandlers}
          >
            {/* World Track Container (translated smoothly by -cameraX) */}
            <View
              pointerEvents="box-none"
              style={[
                styles.worldTrackContainer,
                {
                  width: levelGeometry.worldWidth + 400,
                  transform: [{ translateX: -cameraX }],
                },
              ]}
            >
              {/* Render all level obstacles */}
              {levelGeometry.obstacles.map((obs) => (
                <View
                  key={`level-obstacle-${obs.id}`}
                  pointerEvents="none"
                  style={[
                    styles.obstaclePlacement,
                    {
                      left: obs.x,
                      top: obs.y,
                      width: obs.width,
                      height: obs.height,
                    },
                  ]}
                >
                  <Obstacle
                    width={obs.width}
                    height={obs.height}
                    theme={currentWorldConfig.obstacleTheme}
                  />
                </View>
              ))}

              {/* Collectible 3D Golden Coins */}
              {coins.map((coin) => (
                <CoinItem
                  key={coin.id}
                  x={coin.x}
                  y={coin.y}
                  collected={coin.collected}
                />
              ))}

              {/* Collectible Power-Up Capsules */}
              {powerUps.map((pu) => (
                <PowerUpItem
                  key={pu.id}
                  type={pu.type}
                  x={pu.x}
                  y={pu.y}
                  collected={pu.collected}
                />
              ))}

              {/* White Finish Pole with Red Triangular Flag on the right */}
              <View
                pointerEvents="none"
                style={[
                  styles.flagPlacement,
                  {
                    left: finishX - 10,
                    top: roadY - flagHeight,
                  },
                ]}
              >
                <FinishFlag height={flagHeight} />
              </View>

              {/* Grey Brick Road with dynamic gaps */}
              <View
                pointerEvents="none"
                style={[
                  styles.roadWrapper,
                  {
                    top: roadY,
                    height: roadHeight,
                    width: levelGeometry.worldWidth + 400,
                  },
                ]}
              >
                <Road
                  width={levelGeometry.worldWidth + 400}
                  height={roadHeight}
                  gaps={levelGeometry.roadGaps}
                  theme={currentWorldConfig.roadTheme}
                />
              </View>

              {/* Smooth User-Drawn Ramp Line */}
              <RampCanvas
                points={drawnPoints}
                roadY={roadY}
                isDrawing={isDrawing}
              />

              {/* Small Cartoon Car with Power-Up FX */}
              <View
                pointerEvents="none"
                style={[
                  styles.carContainer,
                  status === 'success' && styles.dimmedBehindModal,
                  {
                    left: carState.x - CAR_HALF_WIDTH - 6,
                    top: carState.y - 20,
                    transform: [{ rotate: `${carState.angle}deg` }],
                  },
                ]}
              >
                <Car
                  vehicleId={selectedVehicle}
                  wheelRotation={carState.wheelRotation}
                  hasMagnet={activePowerUp?.type === 'magnet'}
                  hasShield={activePowerUp?.type === 'shield'}
                  hasSpeedBoost={activePowerUp?.type === 'boost'}
                />
              </View>
            </View>

            {/* Finish Flag Distance Indicator when drawing and flag is scrolled off-screen */}
            {cameraX < finishX - areaSize.width && status === 'drawing' && (
              <View pointerEvents="none" style={styles.finishHint}>
                <Text style={styles.finishHintText}>FINISH 🏁 ➔</Text>
              </View>
            )}

            {/* Game Controls, Retry Modal, and Level Complete Reward Modal */}
            <GameControls
              status={status}
              hasDrawnPoints={drawnPoints.length >= MIN_VALID_DRAWING_POINTS}
              onClear={handleClear}
              onRetry={handleRetry}
              onRedraw={handleRedraw}
              onNextLevel={handleNextLevel}
              invalidDrawingMessage={invalidDrawingMessage}
              isAutoStarting={isAutoStarting}
              level={currentLevel}
              earnedStars={earnedStarsForLevel}
              bestStars={levelStarsMap[currentLevel] ?? earnedStarsForLevel}
              coinsCollected={coinsCollectedCount}
              coinTarget={levelGeometry.coinTarget ?? 3}
              noCrash={noCrashState}
              isAlreadyClaimed={isRewardClaimed(currentLevel)}
              onClaimReward={handleClaimReward}
              onOpenLevelSelect={() => setIsLevelSelectVisible(true)}
            />

            {/* Level 1 Interactive Beginner Tutorial Overlay */}
            <TutorialOverlay
              visible={
                activeScreen === 'game' &&
                currentLevel === 1 &&
                (isTutorialActive || tutorialStep !== 'none')
              }
              step={tutorialStep}
              onContinue={handleTutorialContinue}
              onBack={handleTutorialBack}
              onSkip={handleTutorialSkip}
              startX={startX}
              roadY={roadY}
              finishX={finishX}
              cameraX={cameraX}
              areaWidth={areaSize.width}
              areaHeight={areaSize.height}
              carX={carState.x}
              carY={carState.y}
              coins={coins}
              coinsCollected={coinsCollectedCount}
              earnedStars={earnedStarsForLevel}
              hasDrawnPoints={drawnPoints.length >= MIN_VALID_DRAWING_POINTS}
              invalidDrawingMessage={invalidDrawingMessage}
            />
          </View>
        </WorldBackground>
      )}

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        sfxEnabled={sfxEnabled}
        musicEnabled={musicEnabled}
        onToggleSfx={handleToggleSfx}
        onToggleMusic={handleToggleMusic}
        highestUnlockedLevel={highestUnlocked}
        completedCount={completedLevelsList.length}
        totalCoins={totalCoins}
        totalStars={totalStars}
        unlockedAchievementsCount={
          achievementsList.filter((a) => a.isUnlocked).length
        }
        onReplayTutorial={handleStartTutorial}
        onOpenAchievements={() => {
          setAchievementsList(getAchievementsProgress());
          setIsSettingsVisible(false);
          setIsAchievementsVisible(true);
        }}
        onResetProgress={handleResetProgress}
        onOpenLevelSelect={() => {
          setIsSettingsVisible(false);
          setIsLevelSelectVisible(true);
        }}
        onOpenGarage={() => {
          setIsSettingsVisible(false);
          setIsGarageVisible(true);
        }}
      />

      {/* Car Garage Modal */}
      <GarageModal
        visible={isGarageVisible}
        onClose={() => setIsGarageVisible(false)}
        totalCoins={totalCoins}
        unlockedVehicles={unlockedVehicles}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={handleSelectVehicle}
        onUnlockVehicle={handleUnlockVehicle}
      />

      {/* Daily Rewards 7-Day Cycle Modal */}
      <DailyRewardModal
        visible={isDailyRewardsVisible}
        onClose={() => setIsDailyRewardsVisible(false)}
        totalCoins={totalCoins}
        status={dailyRewardsStatus}
        onClaimReward={handleClaimDailyReward}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        visible={isLevelSelectVisible}
        onClose={() => setIsLevelSelectVisible(false)}
        currentLevel={currentLevel}
        highestUnlockedLevel={highestUnlocked}
        levelStars={levelStarsMap}
        totalStars={totalStars}
        totalCoins={totalCoins}
        completedLevels={completedLevelsList}
        onSelectLevel={(selectedLevel) => {
          setIsLevelSelectVisible(false);
          saveLastPlayedLevel(selectedLevel);
          setCurrentLevel(selectedLevel);
          handleRedraw();
          hasFailedInLevelSessionRef.current = false; // re-entering (even the same level) = new session
          if (selectedLevel === 1) {
            setIsTutorialActive(true);
            setTutorialStep('intro');
          } else {
            setIsTutorialActive(false);
            setTutorialStep('none');
          }
          if (activeScreen === 'home') {
            setActiveScreen('game');
          }
        }}
      />

      {/* World Unlock Celebration Modal */}
      <WorldUnlockModal
        visible={unlockedWorldModalData !== null}
        world={unlockedWorldModalData}
        onContinue={handleWorldUnlockContinue}
      />

      {/* Achievements & Badges Modal */}
      <AchievementsModal
        visible={isAchievementsVisible}
        onClose={() => setIsAchievementsVisible(false)}
        totalCoins={totalCoins}
        achievements={achievementsList}
        onClaimReward={handleClaimAchievementReward}
      />

      {/* Achievement Unlock In-Game Banner */}
      <AchievementUnlockBanner
        achievement={unlockedAchievementToast}
        onDismiss={handleAchievementToastDismiss}
        onPress={handleAchievementToastPress}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 10,
  },
  headerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  homeBtnText: {
    fontSize: 16,
  },
  starsBadge: {
    minWidth: 50,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 25, 45, 0.55)',
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    marginRight: 6,
  },
  starsIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  starsText: {
    color: '#FFEA00',
    fontSize: 15,
    fontWeight: '900',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coinsBadge: {
    minWidth: 50,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 25, 45, 0.45)',
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFE082',
    marginRight: 6,
  },
  coinsIcon: {
    fontSize: 15,
    marginRight: 4,
  },
  coinsText: {
    color: '#FFF9C4',
    fontSize: 14,
    fontWeight: '900',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  attemptCoinBadge: {
    minWidth: 54,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.25)',
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FACC15',
  },
  attemptCoinIcon: {
    fontSize: 14,
    marginRight: 3,
  },
  attemptCoinText: {
    color: '#FEF08A',
    fontSize: 13,
    fontWeight: '900',
  },
  garageBadge: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 25, 45, 0.65)',
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    marginLeft: 6,
  },
  garageIcon: {
    fontSize: 15,
    marginRight: 4,
  },
  garageText: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsBtnSpacing: {
    marginRight: 5,
  },
  gameplayArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  worldTrackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  roadWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
  },
  obstaclePlacement: {
    position: 'absolute',
    zIndex: 4,
  },
  flagPlacement: {
    position: 'absolute',
    zIndex: 4,
  },
  finishHint: {
    position: 'absolute',
    right: 14,
    top: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    zIndex: 12,
  },
  finishHintText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  carContainer: {
    position: 'absolute',
    width: 82,
    height: 48,
    zIndex: 10,
  },
  dimmedBehindModal: {
    opacity: 0.25,
  },
});
export default RampRacerScreen;
