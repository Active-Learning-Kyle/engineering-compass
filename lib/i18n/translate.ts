import { addUiTranslations, normalize, zhHant, type Locale } from './catalog';
import { uiZh } from './ui-zh';
addUiTranslations(uiZh);
export type { Locale };
export function translate(text: string, locale: Locale): string {
  if (locale === 'en' || !text.trim()) return text;
  const key = normalize(text);
  const exact = zhHant[key.toLowerCase()];
  if (exact) return exact;
  let match = key.match(/^Question (\d+) of (\d+)$/);
  if (match) return `第 ${match[1]} 題，共 ${match[2]} 題`;
  match = key.match(/^(\d+) selected$/);
  if (match) return `已選 ${match[1]} 項`;
  match = key.match(/^(\d+) of 5$/);
  if (match) return `${match[1]} 分（共 5 分）`;
  match = key.match(/^Preview (.+)$/);
  if (match) return `預覽${translate(match[1], locale)}`;
  match = key.match(/^(.+) character illustration$/);
  if (match) return `${translate(match[1], locale)}角色插圖`;
  match = key.match(
    /^Your answers point most strongly to (.+?), with (.+?) as a supporting strength\.\s*(?:(.+?) is the clearest area to practise next\.)?$/,
  );
  if (match)
    return `你的答案顯示，「${translate(match[1], locale)}」是最突出的優勢，「${translate(match[2], locale)}」則是另一項支持能力。${match[3] ? `「${translate(match[3], locale)}」是最值得優先練習的領域。` : ''}`;
  return text;
}
