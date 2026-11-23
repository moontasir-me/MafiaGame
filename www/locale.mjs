// App language is a device preference, independent of a Mafia universe or room.
export const LANGUAGE_KEY = 'shitolpati.language';
export function getLanguage(storage = globalThis.localStorage) {
  try { return storage?.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'bn'; } catch { return 'bn'; }
}
export function saveLanguage(value, storage = globalThis.localStorage) {
  if (!['en', 'bn'].includes(value)) throw Error('LANGUAGE');
  storage?.setItem(LANGUAGE_KEY, value);
  return value;
}
export const t = (bn, en) => pageLanguage() === 'en' ? en : bn;
export const number = value => Number(value).toLocaleString(pageLanguage() === 'en' ? 'en-US' : 'bn-BD');
export const pageLanguage = () => typeof location !== 'undefined' && /\/rush\.html$/.test(location.pathname) ? 'en' : getLanguage();
