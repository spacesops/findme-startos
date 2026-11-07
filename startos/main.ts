import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { readSpacedAuth, spacedBridgeAddress, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const spacedAddr = await spacedBridgeAddress(effects).const()
  const spacedAuth = spacedAddr ? await readSpacedAuth(effects) : null
  const certrelays =
    (await storeJson.read((s) => s.certrelays).const(effects)) ?? []

  const env: Record<string, string> = {
    HOST: '0.0.0.0',
    PORT: String(uiPort),
    SPACED_CHAIN: 'mainnet',
    SPACED_ENABLED: 'false',
  }
  if (spacedAddr && spacedAuth) {
    env.SPACED_ENABLED = 'true'
    env.SPACED_RPC_URL = `http://${spacedAddr}`
    env.SPACED_RPC_USER = spacedAuth.username
    env.SPACED_RPC_PASSWORD = spacedAuth.password
  }
  if (certrelays.length > 0) env.FABRIC_SEEDS = certrelays.join(',')

  return sdk.Daemons.of(effects).addDaemon('findme', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'findme' },
      null,
      'findme',
    ),
    exec: { command: sdk.useEntrypoint(), env },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(effects, `http://127.0.0.1:${uiPort}/`, {
          timeout: 5_000,
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
