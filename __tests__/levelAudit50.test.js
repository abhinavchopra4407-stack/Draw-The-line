import {
  LEVELS,
  TOTAL_LEVELS,
  getLevelConfig,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
import { CAR_HALF_WIDTH } from '../src/games/rampracer/physics/physicsEngine';
describe('Comprehensive 50-Level Quality & Bug Audit', () => {
  const areaWidth = 400;
  const roadY = 400;
  const worldWidth = Math.max(Math.round(areaWidth * 1.55), 620); // 620px
  it('audits all 50 levels individually for geometry, obstacles, gaps, coins, and finish positions', () => {
    expect(TOTAL_LEVELS).toBe(50);
    expect(LEVELS.length).toBe(50);
    const levelReports = [];
    const testConfigurations = [
      { areaWidth: 360, roadY: 420 },
      { areaWidth: 400, roadY: 400 },
      { areaWidth: 480, roadY: 450 },
      { areaWidth: 600, roadY: 500 },
      { areaWidth: 800, roadY: 600 },
    ];
    for (const { areaWidth, roadY } of testConfigurations) {
      const worldWidth = Math.max(Math.round(areaWidth * 1.55), 620);
      for (let lvl = 1; lvl <= 50; lvl++) {
        const config = getLevelConfig(lvl);
        const issues = [];
        const geom = resolveLevelGeometry(
          config,
          areaWidth,
          roadY,
          0,
          worldWidth
        );
        // 1. Car starting position
        if (geom.carStartX < CAR_HALF_WIDTH) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): carStartX (${geom.carStartX}) is too close to left edge`
          );
        }
        if (geom.carStartX > areaWidth * 0.3) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): carStartX (${geom.carStartX}) is placed too far forward`
          );
        }
        // 2. Finish flag position
        if (geom.finishX <= areaWidth * 0.8) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): finishX (${geom.finishX}) is not positioned near the end of track`
          );
        }
        if (geom.finishX > worldWidth - 40) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): finishX (${geom.finishX}) has insufficient highway runout in worldWidth (${worldWidth})`
          );
        }
        // 3. Clear threshold
        if (geom.clearThresholdX <= geom.carStartX) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): clearThresholdX (${geom.clearThresholdX}) is behind car start`
          );
        }
        if (geom.clearThresholdX > geom.finishX) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): clearThresholdX (${geom.clearThresholdX}) is past the finish line`
          );
        }
        // 4. Obstacles
        for (const obs of geom.obstacles) {
          if (obs.height > 200) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Obstacle ${obs.id} height (${obs.height}) is excessively high/unfair`
            );
          }
          if (obs.height <= 0) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Obstacle ${obs.id} height (${obs.height}) is non-positive`
            );
          }
          if (obs.x < geom.carStartX + 20) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Obstacle ${obs.id} x (${obs.x}) overlaps car starting position (${geom.carStartX})`
            );
          }
          if (obs.x + obs.width > geom.finishX - 20) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Obstacle ${obs.id} (${
                obs.x + obs.width
              }) encroaches into finish line (${geom.finishX})`
            );
          }
          if (obs.y < 30) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Obstacle ${obs.id} y (${obs.y}) breaches top screen boundary`
            );
          }
          if (obs.y > roadY) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Obstacle ${obs.id} y (${obs.y}) is below road surface (${roadY})`
            );
          }
        }
        // 5. Road Gaps
        for (const gap of geom.roadGaps) {
          if (gap.x <= geom.carStartX + 10) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Road gap at ${gap.x} starts under or before car`
            );
          }
          if (gap.x + gap.width >= geom.finishX) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Road gap (${gap.x}..${
                gap.x + gap.width
              }) overlaps finish line (${geom.finishX})`
            );
          }
          if (gap.width > 240) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Road gap width (${gap.width}) is excessively wide/impossible`
            );
          }
          if (gap.width < 15) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Road gap width (${gap.width}) is too narrow to be meaningful`
            );
          }
        }
        // 6. Coins
        if (geom.coins.length < 3) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): Coin count (${geom.coins.length}) is less than minimum 3`
          );
        }
        if (
          geom.coinTarget !== (config.coinTarget ?? geom.coins.length) ||
          geom.coinTarget > geom.coins.length
        ) {
          issues.push(
            `Level ${lvl} (${areaWidth}px): Coin target (${geom.coinTarget}) does not match configured target / coin count (${geom.coins.length})`
          );
        }
        for (const coin of geom.coins) {
          if (coin.x <= geom.carStartX) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Coin ${coin.id} x (${coin.x}) is placed before car start`
            );
          }
          if (coin.x >= geom.finishX) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Coin ${coin.id} x (${coin.x}) is placed past finish flag`
            );
          }
          if (coin.y < 30) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Coin ${coin.id} y (${coin.y}) is above screen ceiling`
            );
          }
          if (coin.y > roadY - 20) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Coin ${coin.id} y (${coin.y}) is embedded below road`
            );
          }
          for (const obs of geom.obstacles) {
            const insideX =
              coin.x > obs.x + 4 && coin.x < obs.x + obs.width - 4;
            const insideY =
              coin.y > obs.y + 4 && coin.y < obs.y + obs.height - 4;
            if (insideX && insideY) {
              issues.push(
                `Level ${lvl} (${areaWidth}px): Coin ${coin.id} is placed INSIDE obstacle ${obs.id}`
              );
            }
          }
        }
        // 7. Power-ups
        for (const pu of geom.powerUps) {
          if (pu.x <= geom.carStartX) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Power-up ${pu.id} x (${pu.x}) is placed before car start`
            );
          }
          if (pu.x >= geom.finishX) {
            issues.push(
              `Level ${lvl} (${areaWidth}px): Power-up ${pu.id} x (${pu.x}) is placed past finish flag`
            );
          }
          for (const obs of geom.obstacles) {
            const insideX = pu.x > obs.x + 4 && pu.x < obs.x + obs.width - 4;
            const insideY = pu.y > obs.y + 4 && pu.y < obs.y + obs.height - 4;
            if (insideX && insideY) {
              issues.push(
                `Level ${lvl} (${areaWidth}px): Power-up ${pu.id} is placed INSIDE obstacle ${obs.id}`
              );
            }
          }
        }
        if (areaWidth === 400) {
          levelReports.push({
            level: lvl,
            name: config.name,
            issues,
          });
        }
        expect(issues).toEqual([]);
      }
    }
    expect(levelReports.length).toBe(50);
  });
});
