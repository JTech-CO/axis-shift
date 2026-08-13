import { en } from './en';
import { ko, type MessageKey } from './ko';

export { en, ko };
export type { MessageKey };

export const messages = { en, ko } as const;
export type Locale = keyof typeof messages;

export const DEFAULT_LOCALE: Locale = 'ko';

export function t(key: MessageKey, locale: Locale = DEFAULT_LOCALE): string {
  return messages[locale][key];
}
