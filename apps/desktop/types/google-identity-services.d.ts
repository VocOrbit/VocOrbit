type GoogleOAuthTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type GoogleOAuthErrorResponse = {
  type: string
  message?: string
}

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: {
    prompt?: string
    hint?: string
  }) => void
}

type GoogleTokenClientConfig = {
  client_id: string
  scope: string
  callback: (response: GoogleOAuthTokenResponse) => void
  error_callback?: (error: GoogleOAuthErrorResponse) => void
}

type GoogleOauth2Api = {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient
}

type GoogleAccountsApi = {
  oauth2: GoogleOauth2Api
}

type GoogleApi = {
  accounts: GoogleAccountsApi
}

declare global {
  interface Window {
    google?: GoogleApi
  }
}

export {}
