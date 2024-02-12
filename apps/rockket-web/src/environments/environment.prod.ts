import { baseEnvironment } from './env.transformed'
import { AppEnvironment } from './env.types'

export const environment: AppEnvironment = {
    ...baseEnvironment,
    isProductionBuild: true,
}
