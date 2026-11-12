import {C} from '../style/tokens';
import {UI} from '../style/fonts';
/** Word-timed captions. words: [{text, start, end}] in SECONDS (from public/vo/words.json). */
export type Word = {text: string; start: number; end: number};
export const Captions = ({words, seconds, maxWords = 5, bottom = 150}: {words: Word[]; seconds: number; maxWords?: number; bottom?: number}) => {
  const i = words.findIndex((w) => seconds < w.end);
  if (i < 0 || seconds < words[0].start - 0.1) return null;
  const startIdx = Math.floor(i / maxWords) * maxWords;
  const chunk = words.slice(startIdx, startIdx + maxWords);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom, textAlign: 'center'}}>
      <span style={{display: 'inline-block', padding: '10px 22px', borderRadius: 14, background: 'rgba(12,8,18,.62)', backdropFilter: 'blur(6px)'}}>
        {chunk.map((w, k) => {
          const active = seconds >= w.start && seconds < w.end;
          return (<span key={k} style={{fontFamily: UI, fontWeight: 700, fontSize: 40, margin: '0 7px',
            color: active ? C.gold : C.cream, opacity: seconds >= w.start ? 1 : 0.45,
            textShadow: active ? '0 0 14px rgba(242,196,107,.6)' : 'none'}}>{w.text}</span>);
        })}
      </span>
    </div>
  );
};
