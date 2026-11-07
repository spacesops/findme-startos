import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'ui')
  const origin = await multi.bindPort(uiPort, { protocol: 'http' })

  const ui = sdk.createInterface(effects, {
    name: i18n('Web Interface'),
    id: 'ui',
    description: i18n(
      'Search Spaces handles in the browser; the same paths return JSON to API clients',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await origin.export([ui])]
})
