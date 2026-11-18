import {Config} from '@remotion/cli/config';
// GL backend: 'swangle' (software, cloud container, default) · 'angle' (Windows/Mac with a GPU) · 'egl'/'vulkan' (Linux GPU).
// Override with REMOTION_GL=angle — on a GPU machine this alone makes rendering 30–60× faster.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'swangle' | 'angle' | 'egl' | 'vulkan') ?? 'swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(16);
