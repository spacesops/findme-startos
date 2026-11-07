import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const spacesMountLocation =
  sdk.volumes['dep-mounts'].subpath('spaces-main')

const shape = z.looseObject({
  spacedAuth: z
    .looseObject({ username: z.string(), password: z.string() })
    .nullable()
    .optional()
    .catch(undefined),
})

export const spacesStoreJson = FileHelper.json(
  `${spacesMountLocation}/store.json`,
  shape,
)
