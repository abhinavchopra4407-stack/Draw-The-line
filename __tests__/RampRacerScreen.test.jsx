import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  RampRacerScreen,
  Car,
  Road,
  Obstacle,
  FinishFlag,
  LevelHeader,
  RestartButton,
  RampCanvas,
  GameControls,
  buildRampSegments,
  stepCarPhysics,
} from '../src/games/rampracer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const initialMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
describe('Ramp Racer Components & Controls', () => {
  it('renders all separate reusable components without crashing', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Car wheelRotation={45} angle={10} />);
      ReactTestRenderer.create(<Road />);
      ReactTestRenderer.create(<Obstacle />);
      ReactTestRenderer.create(<FinishFlag />);
      ReactTestRenderer.create(<LevelHeader level={1} />);
      ReactTestRenderer.create(<RestartButton onPress={() => {}} />);
      ReactTestRenderer.create(
        <RampCanvas
          points={[
            { x: 10, y: 10 },
            { x: 50, y: 40 },
          ]}
        />
      );
      ReactTestRenderer.create(
        <GameControls
          status="drawing"
          hasDrawnPoints={true}
          onClear={() => {}}
          onRetry={() => {}}
          onRedraw={() => {}}
        />
      );
    });
  });
  it('handles game controls Redraw and has no Start button', async () => {
    const onClear = jest.fn();
    const onRetry = jest.fn();
    const onRedraw = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GameControls
          status="drawing"
          hasDrawnPoints={true}
          onClear={onClear}
          onRetry={onRetry}
          onRedraw={onRedraw}
        />
      );
    });
    // Start button must be completely removed
    const startBtn = renderer.root.findAllByProps({
      accessibilityLabel: 'Start Car',
    });
    expect(startBtn.length).toBe(0);
    const clearBtn = renderer.root.findByProps({
      accessibilityLabel: 'Clear Drawing',
    });
    expect(clearBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      clearBtn.props.onPress();
    });
    expect(onClear).toHaveBeenCalledTimes(1);
  });
  it('renders stuck modal with RETRY and REDRAW options', async () => {
    const onRetry = jest.fn();
    const onRedraw = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GameControls
          status="stuck"
          hasDrawnPoints={true}
          onClear={() => {}}
          onRetry={onRetry}
          onRedraw={onRedraw}
        />
      );
    });
    const retryBtn = renderer.root.findByProps({
      accessibilityLabel: 'Retry Attempt',
    });
    const redrawBtn = renderer.root.findByProps({
      accessibilityLabel: 'Redraw Ramp',
    });
    expect(retryBtn).toBeTruthy();
    expect(redrawBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      retryBtn.props.onPress();
      redrawBtn.props.onPress();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRedraw).toHaveBeenCalledTimes(1);
  });
  it('renders success modal with NEXT LEVEL and REPLAY options', async () => {
    const onNextLevel = jest.fn();
    const onRedraw = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GameControls
          status="success"
          hasDrawnPoints={true}
          onClear={() => {}}
          onRetry={() => {}}
          onRedraw={onRedraw}
          onNextLevel={onNextLevel}
          isAlreadyClaimed={true}
        />
      );
    });
    const nextBtn = renderer.root.findByProps({
      accessibilityLabel: 'Next Level',
    });
    expect(nextBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      nextBtn.props.onPress();
    });
    expect(onNextLevel).toHaveBeenCalledTimes(1);
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  it('renders RampRacerScreen and restarts state on top restart button press', async () => {
    const onRestartMock = jest.fn();
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <RampRacerScreen onRestart={onRestartMock} initialScreen="game" />
        </SafeAreaProvider>
      );
    });
    const restartBtn = renderer.root.findByProps({
      accessibilityLabel: 'Restart Level',
    });
    expect(restartBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      restartBtn.props.onPress();
    });
    expect(onRestartMock).toHaveBeenCalledTimes(1);
    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
  it('allows car to climb an upward curved ramp, clear the obstacle, and finish', () => {
    const obstacle = { x: 180, y: 350, width: 80, height: 100 };
    const roadY = 450;
    const finishX = 380;
    const rampPoints = [
      { x: 50, y: 430 },
      { x: 100, y: 390 },
      { x: 160, y: 340 },
      { x: 220, y: 320 },
      { x: 280, y: 330 },
      { x: 340, y: 430 },
    ];
    const segments = buildRampSegments(rampPoints, roadY);
    let state = {
      x: 50,
      y: 404,
      vx: 180,
      vy: 0,
      angle: 0,
      wheelRotation: 0,
      isGrounded: true,
      hasClearedObstacle: false,
      stuckTimer: 0,
    };
    let finalStatus = 'running';
    for (let frame = 0; frame < 150; frame++) {
      const res = stepCarPhysics({
        state,
        segments,
        obstacles: [obstacle],
        roadY,
        finishX,
        dt: 0.016,
      });
      state = res.state;
      if (res.status !== 'running') {
        finalStatus = res.status;
        break;
      }
    }
    expect(state.x).toBeGreaterThan(obstacle.x + obstacle.width);
    expect(finalStatus).toBe('success');
  });
});
