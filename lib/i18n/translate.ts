import { en as baseEn, zhHant as baseZh } from './messages';
import { refinementMessages } from './refinement-messages';
import { scenarioMessages } from './scenario-messages';
export type Locale = 'en' | 'zh-Hant';
export type MessageParams = Record<string, string | number>;
export const messages: Record<Locale, Record<string, string>> = {
  en: { ...baseEn },
  'zh-Hant': { ...baseZh },
};
function register(key: string, en: string, zh: string) {
  if (Object.hasOwn(messages.en, key))
    throw new Error(`Duplicate message key: ${key}`);
  messages.en[key] = en;
  messages['zh-Hant'][key] = zh;
}
for (const [key, [en, zh]] of Object.entries(refinementMessages))
  register(key, en, zh);
for (const [id, copy] of Object.entries(scenarioMessages)) {
  register(`question.${id}.prompt`, copy.prompt[0], copy.prompt[1]);
  for (const option of ['a', 'b'] as const) {
    const [en, zh, feedbackEn, feedbackZh] = copy[option];
    register(`question.${id}.option.${option}.label`, en, zh);
    register(
      `question.${id}.option.${option}.feedback`,
      feedbackEn,
      feedbackZh,
    );
  }
}
export function isMessageReference(value: string) {
  return /^(brand|home|common|result|pro|evidence|assessment|scale|question|role|scope|year|projectCount|responsibility|interest|growth|growthAction|toolkit|competency)\./.test(
    value,
  );
}
export function translate(
  key: string,
  locale: Locale,
  params: MessageParams = {},
) {
  if (!Object.hasOwn(messages[locale], key))
    throw new Error(`Missing ${locale} message: ${key}`);
  return messages[locale][key].replace(
    /\{([A-Za-z]+)\}/g,
    (_, name: string) => {
      if (!(name in params))
        throw new Error(`Missing parameter ${name} in ${key}`);
      return String(params[name]);
    },
  );
}
