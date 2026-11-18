import {Composition, getInputProps} from 'remotion';
import {Main} from './Main';
import {LieVideo, LIE_TOTAL} from './lie/LieVideo';
import {ReactTest} from './lie/ReactTest';
import {ThreadTest} from './lie/ThreadTest';
import {PromiseVideo, P_TOTAL} from './promise/PromiseVideo';

// 24 on CPU (cloud container); pass --props='{"fps":60}' on a GPU machine. All timing is in seconds/beats.
const LIE_FPS = Number((getInputProps() as {fps?: number}).fps ?? 24);
import {FPS, W, H} from './style/tokens';
export const Root = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={600} fps={FPS} width={W} height={H} />
    {/* 5-minute video. LIE_FPS = 24 for CPU-only renders (cinema rate, ~5s/frame here); use 60 on a GPU machine.
        All timing is in seconds/beats, so changing LIE_FPS changes nothing else. */}
    <Composition id="LieMeter" component={LieVideo} durationInFrames={Math.ceil(LIE_TOTAL * LIE_FPS)} fps={LIE_FPS} width={W} height={H} />
    {/* "What if every promise left a glowing thread?" (prompts/WHAT_IF_PROMISE_THREADS.md) */}
    <Composition id="PromiseThreads" component={PromiseVideo} durationInFrames={Math.ceil(P_TOTAL * LIE_FPS)} fps={LIE_FPS} width={W} height={H} />
    {/* dev: reaction library check (FIX_LIST_V2 #15) */}
    <Composition id="ThreadTest" component={ThreadTest} durationInFrames={90} fps={30} width={W} height={H} />
    <Composition id="ReactTest" component={ReactTest} durationInFrames={60} fps={30} width={W} height={H} />
  </>
);
