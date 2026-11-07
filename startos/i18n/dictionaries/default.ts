export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts / interfaces.ts
  'Web Interface': 0,
  'The web interface is ready': 1,
  'The web interface is not ready': 2,
  'Search Spaces handles in the browser; the same paths return JSON to API clients': 3,

  // actions/configureCertrelays.ts
  'Configure Certrelays': 4,
  'Choose which certrelay servers FindMe queries for handle records': 5,
  Certrelays: 6,
  'Certrelay URLs to query for handle records. Leave the list empty to use the public relays.': 7,
  'Must be an https:// URL without spaces or commas': 8,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
