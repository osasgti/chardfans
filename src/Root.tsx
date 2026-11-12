import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, W, H} from './style/tokens';
export const Root = () => (
  <Composition id="Main" component={Main} durationInFrames={600} fps={FPS} width={W} height={H} />
);
