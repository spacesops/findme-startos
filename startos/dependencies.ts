import { depSpacesDescription } from './manifest/i18n'
import { sdk } from './sdk'
import { spacedBridgeAddress } from './utils'

// Enabled only while Spaces is installed, so its absence raises no warning.
const spaces = sdk.Dependency.optional('spaces', {
  description: depSpacesDescription,
  metadata: { title: { en_US: 'Spaces' }, icon: 'assets/spaces-icon.png' },
  versionRange: '>=0.5.0:2',
  kind: 'running',
  healthChecks: ['spaced'],
  enabled: async ({ effects }) =>
    (await spacedBridgeAddress(effects).const()) !== null,
})

export const dependencies = sdk.Dependencies.of().addDependency(spaces)
