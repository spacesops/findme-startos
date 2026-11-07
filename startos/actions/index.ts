import { sdk } from '../sdk'
import { configureCertrelays } from './configureCertrelays'

export const actions = sdk.Actions.of().addAction(configureCertrelays)
