import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
// Fonts are bundled locally (public/fonts) so renders never depend on the network.
export const TITLE = 'Cinzel';
export const UI = 'Inter';
for (const w of ['600', '700']) loadFont({family: TITLE, url: staticFile(`fonts/cinzel-latin-${w}-normal.woff2`), weight: w});
loadFont({family: UI, url: staticFile('fonts/inter-latin-700-normal.woff2'), weight: '700'});
