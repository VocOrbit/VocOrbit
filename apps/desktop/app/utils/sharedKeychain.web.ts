export type SharedAuthSession = {
  accessToken: string
  refreshToken?: string
  userId?: string
  l1Language?: string
  l2Language?: string
  homeRegion?: string
  backendBaseUrl?: string
}

export async function syncAuthSessionToKeychain(_session?: SharedAuthSession) {}

export async function syncLanguagePreferencesToKeychain(_preferences?: {
  l1Language?: string
  l2Language?: string
}) {}

export async function syncRegionConfigToKeychain(_config?: {
  homeRegion?: string
  backendBaseUrl?: string
}) {}

export async function readAuthSessionFromKeychain(): Promise<SharedAuthSession | undefined> {
  return undefined
}
