type AppleAuthorizationPayload = {
  code?: string
  id_token?: string
  state?: string
}

type AppleSignInSuccessPayload = {
  authorization?: AppleAuthorizationPayload
}

type AppleSignInFailurePayload = {
  error?: string
}

type AppleSignInInitConfig = {
  clientId: string
  scope?: string
  redirectURI: string
  state?: string
  nonce?: string
  usePopup?: boolean
}

type AppleAuthApi = {
  init: (config: AppleSignInInitConfig) => void
  signIn: () => Promise<AppleSignInSuccessPayload>
}

type AppleIdentityApi = {
  auth: AppleAuthApi
}

declare global {
  interface Window {
    AppleID?: AppleIdentityApi
  }

  interface DocumentEventMap {
    AppleIDSignInOnSuccess: CustomEvent<{ data?: AppleSignInSuccessPayload }>
    AppleIDSignInOnFailure: CustomEvent<{ error?: string }>
  }
}

export {}
