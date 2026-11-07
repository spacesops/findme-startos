import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'findme',
  title: 'FindMe',
  license: 'MIT',
  packageRepo: 'https://github.com/spacesops/findme-startos',
  upstreamRepo: 'https://github.com/spacesops/atfindme',
  marketingUrl: 'https://github.com/spacesops/atfindme',
  donationUrl: null,
  description: { short, long },
  // `dep-mounts` holds Spaces' read-only volume mount and is never backed up.
  volumes: ['startos', 'dep-mounts'],
  images: {
    findme: {
      source: { dockerTag: 'spacesops/findme:v0.1.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
