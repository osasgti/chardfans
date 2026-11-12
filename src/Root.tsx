import {Composition} from 'remotion';
import {Main} from './Main';
import {LieVideo, LIE_TOTAL} from './lie/LieVideo';

const LIE_FPS = 24;
import {FPS, W, H} from './style/tokens';
export const Root = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={600} fps={FPS} width={W} height={H} />
    {/* 5-minute video. LIE_FPS = 24 for CPU-only renders (cinema rate, ~5s/frame here); use 60 on a GPU machine.
        All timing is in seconds/beats, so changing LIE_FPS changes nothing else. */}
    <Composition id="LieMeter" component={LieVideo} durationInFrames={Math.ceil(LIE_TOTAL * LIE_FPS)} fps={LIE_FPS} width={W} height={H} />
  </>
);
