import * as fs from 'node:fs/promises'
import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import {
  spacesMountLocation,
  spacesStoreJson,
} from './fileModels/spacesStore.json'

export const uiPort = 3000

// Spaces' stable contract, mirrored from spaces-startos (startos/utils.ts,
// startos/interfaces.ts, startos/fileModels/storeJson.ts). Not imported: that
// package is not published as an npm dependency.
export const spacesPackageId = 'spaces'
export const spacesRpcHostId = 'spaced-api-multi'
export const spacesRpcPort = 7225
export const spacesVolumeId = 'main'

export function spacedBridgeAddress(effects: T.Effects) {
  return sdk.host.getBridgeAddress(effects, {
    packageId: spacesPackageId,
    hostId: spacesRpcHostId,
    internalPort: spacesRpcPort,
    ssl: false,
  })
}

export type SpacedAuth = { username: string; password: string }

/** Reactive; null when Spaces is absent or has not seeded its credentials. */
export async function readSpacedAuth(
  effects: T.Effects,
): Promise<SpacedAuth | null> {
  const file = `${spacesMountLocation}/store.json`
  try {
    // Mounting again unmounts first, pulling the file out from under a .const() watcher.
    const mounted = await fs.access(file).then(
      () => true,
      () => false,
    )
    if (!mounted) {
      await fs.mkdir(spacesMountLocation, { recursive: true })
      await sdk.mount(effects, {
        location: spacesMountLocation,
        target: {
          packageId: spacesPackageId,
          volumeId: spacesVolumeId,
          subpath: null,
          readonly: true,
          idmap: [],
        },
      })
    }
    return (
      (await spacesStoreJson.read((s) => s.spacedAuth).const(effects)) ?? null
    )
  } catch {
    return null
  }
}
