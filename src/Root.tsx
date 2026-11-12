import {Composition} from 'remotion';
import {Main} from './Main';
import {LieVideo, LIE_TOTAL} from './lie/LieVideo';
import {FPS, W, H} from './style/tokens';
export const Root = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={600} fps={FPS} width={W} height={H} />
    {/* 5-minute video. 30fps here (CPU render budget); set fps={60} on a GPU machine — timing is in seconds/beats so nothing else changes. */}
    <Composition id="LieMeter" component={LieVideo} durationInFrames={Math.ceil(LIE_TOTAL * 30)} fps={30} width={W} height={H} />
  </>
);
