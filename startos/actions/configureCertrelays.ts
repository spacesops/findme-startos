import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, List } = sdk

const inputSpec = InputSpec.of({
  certrelays: Value.list(
    List.text(
      {
        name: i18n('Certrelays'),
        description: i18n(
          'Certrelay URLs to query for handle records. Leave the list empty to use the public relays.',
        ),
        default: [],
      },
      {
        placeholder: 'https://relay-atlas.spacesprotocol.org',
        patterns: [
          {
            regex: '^https://[^\\s,]+$',
            description: i18n(
              'Must be an https:// URL without spaces or commas',
            ),
          },
        ],
      },
    ),
  ),
})

export const configureCertrelays = sdk.Action.withInput(
  'configure-certrelays',
  {
    name: i18n('Configure Certrelays'),
    description: i18n(
      'Choose which certrelay servers FindMe queries for handle records',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async ({ effects }) => ({
    certrelays: (await storeJson.read((s) => s.certrelays).once()) ?? [],
  }),
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      certrelays: input.certrelays.map((u) => u.trim()).filter(Boolean),
    })
  },
)
