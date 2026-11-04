import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { TutorialOverlay } from '../src/games/rampracer/components/TutorialOverlay';
import {
  isTutorialCompleted,
  setTutorialCompleted,
  resetTutorialProgress,
  resetProgress,
  initStorage,
  STORAGE_KEY_TUTORIAL_COMPLETED,
} from '../src/games/rampracer/utils/levelStorage';
import { SettingsModal } from '../src/games/rampracer/components/SettingsModal';
import { HomeScreen } from '../src/games/rampracer/components/HomeScreen';
import { RewardModal } from '../src/games/rampracer/components/RewardModal';
import { RampRacerScreen } from '../src/games/rampracer/RampRacerScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
const initialMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
describe('Level 1 Interactive Tutorial System', () => {
  beforeEach(() => {
    resetProgress();
    resetTutorialProgress();
    jest.clearAllMocks();
  });
  // 1. Storage & Persistence Verification
  describe('Tutorial Storage & Persistence', () => {
    it('initializes tutorial as uncompleted for a new player', () => {
      expect(isTutorialCompleted()).toBe(false);
    });
    it('saves tutorial completion persistently', () => {
      setTutorialCompleted(true);
      expect(isTutorialCompleted()).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY_TUTORIAL_COMPLETED,
        'true'
      );
    });
    it('restores tutorial completion state on initStorage()', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEY_TUTORIAL_COMPLETED) {
          return Promise.resolve('true');
        }
        return Promise.resolve(null);
      });
      const data = await initStorage();
      expect(data.tutorialCompleted).toBe(true);
      expect(isTutorialCompleted()).toBe(true);
    });
    it('resets tutorial state during full game reset', () => {
      setTutorialCompleted(true);
      expect(isTutorialCompleted()).toBe(true);
      resetProgress();
      expect(isTutorialCompleted()).toBe(false);
    });
  });
  // 2. TutorialOverlay Component Steps Verification
  describe('TutorialOverlay Visual Steps', () => {
    const defaultProps = {
      visible: true,
      step: 'intro',
      onContinue: jest.fn(),
      onBack: jest.fn(),
      onSkip: jest.fn(),
      startX: 45,
      roadY: 400,
      finishX: 520,
      cameraX: 0,
      areaWidth: 360,
      areaHeight: 600,
      carX: 45,
      carY: 380,
      coins: [{ id: 'c1', x: 120, y: 320, collected: false }],
      coinsCollected: 0,
      earnedStars: 3,
    };
    it('renders Step 0: Welcome Introduction message & Continue button', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay {...defaultProps} step="intro" />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Welcome to Ramp Racer!');
      expect(textContent).toContain("Let's learn how to play!");
      expect(textContent).toContain('CONTINUE ➔');
      expect(textContent).toContain('SKIP ⏩');
    });
    it('renders Step 1: Understand Goal & Finish Flag pointer', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay {...defaultProps} step="goal" />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Your Goal: Reach The Finish Flag!');
      expect(textContent).toContain(
        'reach the finish flag at the end of the road'
      );
      expect(textContent).toContain('FINISH FLAG 🏁 ➔');
      expect(textContent).toContain('CONTINUE ➔');
    });
    it('renders Step 2: Learn to Draw & Hand/Finger gesture animation', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay {...defaultProps} step="draw" />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Use Your Finger To Draw');
      expect(textContent).toContain(
        'Use your finger to draw a road for your car'
      );
      expect(textContent).toContain('DRAWING AREA');
      expect(textContent).toContain('👆');
    });
    it('renders Step 3: Draw a Connected Ramp with Start indicator and error feedback', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay
            {...defaultProps}
            step="connected"
            invalidDrawingMessage="Try connecting your line to the road!"
          />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Connect Your Ramp To The Road');
      expect(textContent).toContain('🟢 START HERE');
      expect(textContent).toContain('Try connecting your line to the road!');
    });
    it('renders Step 4: Start Driving instruction', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay {...defaultProps} step="driving" />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Release Finger & Drive!');
      expect(textContent).toContain(
        'Release your finger and watch your car drive!'
      );
      expect(textContent).toContain('wheels on the road');
    });
    it('renders Step 5: Collect Coins with target coin sparkle highlight', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay {...defaultProps} step="coins" />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Collect Coins For Rewards!');
      expect(textContent).toContain('COLLECT COINS');
    });
    it('renders Step 6: Reach the Finish Safely', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay {...defaultProps} step="finish" />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      const textContent = textNodes
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(textContent).toContain('Drive Safely To The Finish!');
      expect(textContent).toContain('Ground contact is required');
      expect(textContent).toContain('FINISH LINE');
    });
    it('unifies completion into RewardModal without duplicate overlay on TutorialOverlay', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay
            {...defaultProps}
            step="none"
            coinsCollected={3}
            earnedStars={3}
          />
        );
      });
      const textNodes = renderer.root.findAllByType(Text);
      expect(textNodes.length).toBe(0);
      // Verify RewardModal contains the single unified completion screen
      let rewardRenderer;
      await ReactTestRenderer.act(async () => {
        rewardRenderer = ReactTestRenderer.create(
          <RewardModal
            visible={true}
            level={1}
            earnedStars={3}
            bestStars={3}
            coinsCollected={3}
            coinTarget={3}
            noCrash={true}
            isAlreadyClaimed={false}
            onClaim={() => {}}
            onNextLevel={() => {}}
            onReplay={() => {}}
            onOpenLevelSelect={() => {}}
          />
        );
      });
      const rewardTexts = rewardRenderer.root
        .findAllByType(Text)
        .map((n) => n.props.children)
        .flat()
        .join(' ');
      expect(rewardTexts).toContain('LEVEL COMPLETED!');
      expect(rewardTexts).toContain('Great Job!');
      expect(rewardTexts).toContain('You completed Level 1!');
      expect(rewardTexts).toContain('Level Completed');
      expect(rewardTexts).toContain('Coin Target');
      expect(rewardTexts).toContain('No Crashes');
      expect(rewardTexts).toContain('YOUR REWARD');
      // Buttons in exact order: 1. REPLAY, 2. NEXT LEVEL, 3. LEVEL MAP
      const replayBtn = rewardRenderer.root.findByProps({
        accessibilityLabel: 'Replay Level',
      });
      const nextBtn = rewardRenderer.root.findByProps({
        accessibilityLabel: 'Next Level',
      });
      const mapBtn = rewardRenderer.root.findByProps({
        accessibilityLabel: 'Level Map',
      });
      expect(replayBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
      expect(mapBtn).toBeTruthy();
    });
    it('triggers continue, back, and skip callbacks correctly', async () => {
      const onContinue = jest.fn();
      const onBack = jest.fn();
      const onSkip = jest.fn();
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <TutorialOverlay
            {...defaultProps}
            step="goal"
            onContinue={onContinue}
            onBack={onBack}
            onSkip={onSkip}
          />
        );
      });
      const skipBtn = renderer.root.findByProps({
        accessibilityLabel: 'Skip Tutorial Step',
      });
      const backBtn = renderer.root.findByProps({
        accessibilityLabel: 'Previous Tutorial Step',
      });
      const continueBtn = renderer.root.findByProps({
        accessibilityLabel: 'Next Tutorial Step',
      });
      // Skip
      await ReactTestRenderer.act(async () => {
        skipBtn.props.onPress();
      });
      expect(onSkip).toHaveBeenCalledTimes(1);
      // Back
      await ReactTestRenderer.act(async () => {
        backBtn.props.onPress();
      });
      expect(onBack).toHaveBeenCalledTimes(1);
      // Continue
      await ReactTestRenderer.act(async () => {
        continueBtn.props.onPress();
      });
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });
  // 3. Menu & Replay Integration
  describe('Menu Replay & Accessibility', () => {
    it('renders "How to Play" button in SettingsModal and triggers replay callback', async () => {
      const onReplayTutorial = jest.fn();
      const onClose = jest.fn();
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SettingsModal
            visible={true}
            onClose={onClose}
            sfxEnabled={true}
            musicEnabled={true}
            onToggleSfx={() => {}}
            onToggleMusic={() => {}}
            highestUnlockedLevel={5}
            completedCount={4}
            totalCoins={250}
            onResetProgress={() => {}}
            onReplayTutorial={onReplayTutorial}
          />
        );
      });
      const tutorialBtn = renderer.root.findByProps({
        accessibilityLabel: 'How to Play Tutorial',
      });
      expect(tutorialBtn).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        tutorialBtn.props.onPress();
      });
      expect(onReplayTutorial).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    it('renders "TUTORIAL" button on HomeScreen and triggers start tutorial callback', async () => {
      const onStartTutorial = jest.fn();
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <HomeScreen
              currentLevel={1}
              highestUnlocked={1}
              totalCoins={0}
              totalStars={0}
              selectedVehicle="sports_car"
              onStartGame={() => {}}
              onOpenGarage={() => {}}
              onOpenDailyRewards={() => {}}
              onOpenAchievements={() => {}}
              onOpenLevelSelect={() => {}}
              onOpenSettings={() => {}}
              onStartTutorial={onStartTutorial}
            />
          </SafeAreaProvider>
        );
      });
      const tutorialBtn = renderer.root.findByProps({
        accessibilityLabel: 'How to Play Tutorial',
      });
      expect(tutorialBtn).toBeTruthy();
      await ReactTestRenderer.act(async () => {
        tutorialBtn.props.onPress();
      });
      expect(onStartTutorial).toHaveBeenCalledTimes(1);
    });
  });
  // 4. RampRacerScreen Level 1 Tutorial Integration
  describe('RampRacerScreen Level 1 Play Integration', () => {
    it('automatically launches Level 1 tutorial for a new player', async () => {
      expect(isTutorialCompleted()).toBe(false);
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RampRacerScreen initialScreen="game" level={1} />
          </SafeAreaProvider>
        );
      });
      // TutorialOverlay should be present with step="intro"
      const tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay).toBeTruthy();
      expect(tutorialOverlay.props.visible).toBe(true);
      expect(tutorialOverlay.props.step).toBe('intro');
    });
    it('always launches Level 1 tutorial upon entry even if previously marked completed', async () => {
      setTutorialCompleted(true);
      expect(isTutorialCompleted()).toBe(true);
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RampRacerScreen initialScreen="game" level={1} />
          </SafeAreaProvider>
        );
      });
      const tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay).toBeTruthy();
      expect(tutorialOverlay.props.visible).toBe(true);
      expect(tutorialOverlay.props.step).toBe('intro');
    });
    it('shows tutorial again when player exits Level 1 to HomeScreen and re-enters Level 1', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RampRacerScreen initialScreen="game" level={1} />
          </SafeAreaProvider>
        );
      });
      let tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay.props.visible).toBe(true);
      // Player skips tutorial
      const skipBtn = renderer.root.findByProps({
        accessibilityLabel: 'Skip Tutorial',
      });
      await ReactTestRenderer.act(async () => {
        skipBtn.props.onPress();
      });
      tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay.props.visible).toBe(false);
      // Player exits to Home screen
      const homeBtn = renderer.root.findByProps({
        accessibilityLabel: 'Return to Home Screen',
      });
      await ReactTestRenderer.act(async () => {
        homeBtn.props.onPress();
      });
      // Player taps PLAY GAME on Home screen to re-enter Level 1
      const playBtn = renderer.root.findByProps({
        accessibilityLabel: 'Start Playing Game',
      });
      await ReactTestRenderer.act(async () => {
        playBtn.props.onPress();
      });
      // Tutorial appears again from the beginning!
      tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay.props.visible).toBe(true);
      expect(tutorialOverlay.props.step).toBe('intro');
    });
    it('allows normal gameplay after skipping and does not repeatedly restart while playing Level 1', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RampRacerScreen initialScreen="game" level={1} />
          </SafeAreaProvider>
        );
      });
      // Skip tutorial
      const skipBtn = renderer.root.findByProps({
        accessibilityLabel: 'Skip Tutorial',
      });
      await ReactTestRenderer.act(async () => {
        skipBtn.props.onPress();
      });
      let tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay.props.visible).toBe(false);
      // Player taps Restart/Retry button while playing Level 1
      const restartBtn = renderer.root.findByProps({
        accessibilityLabel: 'Restart Level',
      });
      await ReactTestRenderer.act(async () => {
        restartBtn.props.onPress();
      });
      // Tutorial must NOT restart while player is already in Level 1 session
      tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay.props.visible).toBe(false);
    });
    it('does not display tutorial on Level 2 or higher levels', async () => {
      let renderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <RampRacerScreen initialScreen="game" level={2} />
          </SafeAreaProvider>
        );
      });
      const tutorialOverlay = renderer.root.findByType(TutorialOverlay);
      expect(tutorialOverlay.props.visible).toBe(false);
    });
  });
});
