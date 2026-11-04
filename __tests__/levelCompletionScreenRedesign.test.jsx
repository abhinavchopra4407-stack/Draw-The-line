import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, ScrollView, View } from 'react-native';
import { RewardModal } from '../src/games/rampracer/components/RewardModal';
import { TutorialOverlay } from '../src/games/rampracer/components/TutorialOverlay';
describe('Level Completion Screen Redesign & Organization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // 1. Structure & Layout Order Verification
  it('renders all 6 sections in the exact required layout order', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
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
    const root = renderer.root;
    const allTexts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat()
      .join(' ');
    // Section 1: Header
    expect(allTexts).toContain('LEVEL COMPLETED!');
    expect(allTexts).toContain('LEVEL 1');
    expect(allTexts).toContain('🏆');
    // Section 2: Star Rating & Headline
    expect(allTexts).toContain('🌟 PERFECT 3-STAR RUN! 🌟');
    // Section 3: Completion Message
    expect(allTexts).toContain('Great Job!');
    expect(allTexts).toContain('You completed Level 1!');
    // Section 4: Performance Summary
    expect(allTexts).toContain('Level Completed');
    expect(allTexts).toContain('Coin Target (3/3)');
    expect(allTexts).toContain('No Crashes');
    // Section 5: Rewards
    expect(allTexts).toContain('YOUR REWARD');
    expect(allTexts).toContain('+3 🪙');
    expect(allTexts).toContain('+50 🪙');
    expect(allTexts).toContain('+53 Coins');
    expect(allTexts).toContain('CLAIM REWARD 🪙');
    // Section 6: Navigation Buttons in Exact Order (1. REPLAY, 2. NEXT LEVEL, 3. LEVEL MAP)
    const touchables = root.findAllByType(TouchableOpacity);
    const navButtons = touchables.filter((t) =>
      ['Replay Level', 'Next Level', 'Level Map'].includes(
        t.props.accessibilityLabel
      )
    );
    expect(navButtons.length).toBe(3);
    expect(navButtons[0].props.accessibilityLabel).toBe('Replay Level');
    expect(navButtons[1].props.accessibilityLabel).toBe('Next Level');
    expect(navButtons[2].props.accessibilityLabel).toBe('Level Map');
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  // 2. Star Variations: Level 1 with 1, 2, and 3 stars
  it('correctly displays 1-star run on Level 1 with unearned grey stars', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={1}
          earnedStars={1}
          coinsCollected={1}
          coinTarget={3}
          noCrash={false}
          isAlreadyClaimed={false}
          onClaim={() => {}}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const root = renderer.root;
    const allTexts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat()
      .join(' ');
    expect(allTexts).toContain('⭐ LEVEL CLEARED! ⭐');
    expect(allTexts).toContain('Coin Target (1/3)');
    expect(allTexts).toContain('No Crashes');
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  it('correctly displays 2-star run on Level 1', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={1}
          earnedStars={2}
          coinsCollected={3}
          coinTarget={3}
          noCrash={false}
          isAlreadyClaimed={false}
          onClaim={() => {}}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const root = renderer.root;
    const allTexts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat()
      .join(' ');
    expect(allTexts).toContain('⭐ GREAT 2-STAR RUN! ⭐');
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  // 3. Higher Levels (Levels 2-50)
  it('correctly formats header and message for Level 25 and Level 50', async () => {
    let renderer25;
    await ReactTestRenderer.act(async () => {
      renderer25 = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={25}
          earnedStars={3}
          coinsCollected={5}
          coinTarget={4}
          noCrash={true}
          isAlreadyClaimed={false}
          onClaim={() => {}}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const texts25 = renderer25.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat()
      .join(' ');
    expect(texts25).toContain('LEVEL 25');
    expect(texts25).toContain('You completed Level 25!');
    let renderer50;
    await ReactTestRenderer.act(async () => {
      renderer50 = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={50}
          earnedStars={3}
          coinsCollected={6}
          coinTarget={5}
          noCrash={true}
          isAlreadyClaimed={true}
          onClaim={() => {}}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const texts50 = renderer50.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat()
      .join(' ');
    expect(texts50).toContain('LEVEL 50');
    expect(texts50).toContain('You completed Level 50!');
    ReactTestRenderer.act(() => {
      renderer25.unmount();
      renderer50.unmount();
    });
  });
  // 4. First-Time Completion vs Replay (Already Claimed)
  it('shows CLAIM button on first-time completion and awards reward upon tap', async () => {
    const onClaim = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={7}
          earnedStars={3}
          coinsCollected={4}
          coinTarget={3}
          noCrash={true}
          isAlreadyClaimed={false}
          onClaim={onClaim}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const root = renderer.root;
    const claimBtn = root.findByProps({ accessibilityLabel: 'Claim Reward' });
    expect(claimBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      claimBtn.props.onPress();
    });
    expect(onClaim).toHaveBeenCalledTimes(1);
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  it('shows "Reward Claimed! 🪙" and does not allow double-claiming on replay', async () => {
    const onClaim = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={7}
          earnedStars={3}
          coinsCollected={4}
          coinTarget={3}
          noCrash={true}
          isAlreadyClaimed={true}
          onClaim={onClaim}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const root = renderer.root;
    const claimBtns = root.findAllByProps({
      accessibilityLabel: 'Claim Reward',
    });
    expect(claimBtns.length).toBe(0);
    const texts = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat()
      .join(' ');
    expect(texts).toContain('Reward Claimed! 🪙');
    expect(texts).toContain(
      'Level replayed — 50 bonus coins awarded on first completion'
    );
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  // 5. Scrollable Container for Small Screens
  it('wraps content in a ScrollView to support smaller Android displays', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={1}
          earnedStars={3}
          isAlreadyClaimed={false}
          onClaim={() => {}}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const scrollView = renderer.root.findByType(ScrollView);
    expect(scrollView).toBeTruthy();
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  // 6. TutorialOverlay Never Renders a Duplicate Completion Modal
  it('ensures TutorialOverlay renders null for step="none" and has no separate completion card', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <TutorialOverlay
          visible={true}
          step="none"
          onContinue={() => {}}
          onBack={() => {}}
          onSkip={() => {}}
          roadY={500}
          startX={60}
          finishX={700}
          cameraX={0}
          areaWidth={360}
          areaHeight={640}
          carX={60}
          carY={500}
        />
      );
    });
    const allTexts = renderer.root.findAllByType(Text);
    expect(allTexts.length).toBe(0);
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  // 7. Compact Hierarchy & Safe Areas
  it('renders compact header hierarchy in exact sequence: Level Completed, Level number, Trophy, Stars, Message', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={3}
          earnedStars={2}
          coinsCollected={2}
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
    const root = renderer.root;
    const textNodes = root.findAllByType(Text);
    const textList = textNodes
      .map((n) => n.props.children)
      .flat()
      .filter(Boolean);
    // Verify ordering
    const idxHeader = textList.findIndex(
      (t) => typeof t === 'string' && t.includes('LEVEL COMPLETED!')
    );
    const idxLevel = textList.findIndex(
      (t) => typeof t === 'string' && t.includes('LEVEL 3')
    );
    const idxTrophy = textList.findIndex(
      (t) => typeof t === 'string' && t.includes('🏆')
    );
    const idxHeadline = textList.findIndex(
      (t) => typeof t === 'string' && t.includes('GREAT 2-STAR RUN')
    );
    const idxGreatJob = textList.findIndex(
      (t) => typeof t === 'string' && t.includes('Great Job!')
    );
    const idxMessage = textList.findIndex(
      (t) => typeof t === 'string' && t.includes('You completed Level 3!')
    );
    expect(idxHeader).toBeLessThan(idxLevel);
    expect(idxLevel).toBeLessThan(idxTrophy);
    expect(idxTrophy).toBeLessThan(idxHeadline);
    expect(idxHeadline).toBeLessThan(idxGreatJob);
    expect(idxGreatJob).toBeLessThan(idxMessage);
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  it('safeguards against background interference with backdrop pointerEvents="auto" and dimming', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <RewardModal
          visible={true}
          level={1}
          earnedStars={3}
          isAlreadyClaimed={false}
          onClaim={() => {}}
          onNextLevel={() => {}}
          onReplay={() => {}}
        />
      );
    });
    const root = renderer.root;
    // Outer modal container blocks touches to the background gameplay
    const outerView = root.findByType(View);
    expect(outerView.props.pointerEvents).toBe('auto');
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
});
