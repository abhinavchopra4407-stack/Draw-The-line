import {
  getLevelConfig,
  resolveLevelGeometry,
} from '../src/games/rampracer/data/levels';
describe('Level 17 Detailed Audit', () => {
  const areaWidth = 400;
  const roadY = 400;
  const worldWidth = 620;
  it('inspects Level 17 resolved geometry', () => {
    const config = getLevelConfig(17);
    const geom = resolveLevelGeometry(config, areaWidth, roadY, 0, worldWidth);
    console.log('Level 17 config:', config);
    console.log('Level 17 obstacles:', geom.obstacles);
    console.log('Level 17 roadGaps:', geom.roadGaps);
    console.log('Level 17 coins:', geom.coins);
    console.log('Level 17 finishX:', geom.finishX);
  });
});
