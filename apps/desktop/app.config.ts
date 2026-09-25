import { ExpoConfig, ConfigContext } from "@expo/config"
import fs from "node:fs"
import path from "node:path"

/**
 * Use tsx/cjs here so we can use TypeScript for our Config Plugins
 * and not have to compile them to JavaScript.
 *
 * See https://docs.expo.dev/config-plugins/plugins/#add-typescript-support-and-convert-to-dynamic-app-config
 */
import "tsx/cjs"

type FirebaseIosConfig = {
  clientId?: string
  reversedClientId?: string
  apiKey?: string
}

type FirebaseAndroidConfig = {
  webClientId?: string
  apiKey?: string
}

function resolveProjectPath(filePath?: string): string | undefined {
  if (!filePath) return undefined
  const normalized = filePath.trim()
  if (!normalized) return undefined
  return path.isAbsolute(normalized) ? normalized : path.resolve(__dirname, normalized)
}

function readTextFile(filePath?: string): string | undefined {
  const resolvedPath = resolveProjectPath(filePath)
  if (!resolvedPath || !fs.existsSync(resolvedPath)) return undefined
  return fs.readFileSync(resolvedPath, "utf8")
}

function readPlistValue(plist: string, key: string): string | undefined {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = plist.match(
    new RegExp(`<key>\\s*${escapedKey}\\s*<\\/key>\\s*<string>\\s*([^<]+)\\s*<\\/string>`, "i"),
  )
  return match?.[1]?.trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readVocorbitExtraString(extra: unknown, key: string): string | undefined {
  if (!isRecord(extra)) return undefined
  const vocorbit = isRecord(extra.vocorbit) ? extra.vocorbit : undefined
  if (!vocorbit) return undefined
  const value = vocorbit[key]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined
}

function parseFirebaseIosConfig(filePath?: string): FirebaseIosConfig {
  const plist = readTextFile(filePath)
  if (!plist) return {}

  return {
    clientId: readPlistValue(plist, "CLIENT_ID"),
    reversedClientId: readPlistValue(plist, "REVERSED_CLIENT_ID"),
    apiKey: readPlistValue(plist, "API_KEY"),
  }
}

function parseFirebaseAndroidConfig(filePath?: string): FirebaseAndroidConfig {
  const content = readTextFile(filePath)
  if (!content) return {}

  let payload: unknown
  try {
    payload = JSON.parse(content)
  } catch {
    return {}
  }

  if (!isRecord(payload)) return {}

  const clients = Array.isArray(payload.client) ? payload.client : []
  let webClientId: string | undefined
  let apiKey: string | undefined

  for (const clientNode of clients) {
    if (!isRecord(clientNode)) continue

    if (!apiKey) {
      const apiKeys = Array.isArray(clientNode.api_key) ? clientNode.api_key : []
      for (const entry of apiKeys) {
        if (!isRecord(entry)) continue
        const value = entry.current_key
        if (typeof value === "string" && value.trim().length > 0) {
          apiKey = value.trim()
          break
        }
      }
    }

    if (!webClientId) {
      const oauthClients = Array.isArray(clientNode.oauth_client) ? clientNode.oauth_client : []
      for (const oauthClient of oauthClients) {
        if (!isRecord(oauthClient)) continue
        const clientType = oauthClient.client_type
        const clientId = oauthClient.client_id
        if (
          clientType === 3 &&
          typeof clientId === "string" &&
          clientId.trim().length > 0
        ) {
          webClientId = clientId.trim()
          break
        }
      }
    }

    if (webClientId && apiKey) break
  }

  return { webClientId, apiKey }
}

/**
 * @param config ExpoConfig coming from the static config app.json if it exists
 *
 * You can read more about Expo's Configuration Resolution Rules here:
 * https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
 */
module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? []
  const easProjectId =
    typeof config.extra?.eas?.projectId === "string" && config.extra.eas.projectId.trim().length > 0
      ? config.extra.eas.projectId.trim()
      : "588560a3-5d0e-4614-9e42-d95f0cae925c"
  const firebaseIosGoogleServicesFile =
    process.env.FIREBASE_IOS_GOOGLE_SERVICES_FILE?.trim() || "./GoogleService-Info.plist"
  const firebaseAndroidGoogleServicesFile =
    process.env.FIREBASE_ANDROID_GOOGLE_SERVICES_FILE?.trim() || "./google-services.json"
  const envGoogleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME?.trim()
  const envGoogleIosClientId = process.env.GOOGLE_IOS_CLIENT_ID?.trim()
  const envGoogleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID?.trim()
  const envAppleWebClientId =
    process.env.APPLE_WEB_CLIENT_ID?.trim() || readVocorbitExtraString(config.extra, "APPLE_WEB_CLIENT_ID")
  const envAppleWebRedirectUri =
    process.env.APPLE_WEB_REDIRECT_URI?.trim() ||
    readVocorbitExtraString(config.extra, "APPLE_WEB_REDIRECT_URI")
  const envFirebaseProjectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    readVocorbitExtraString(config.extra, "FIREBASE_PROJECT_ID")
  const envFirebaseAuthDomain =
    process.env.FIREBASE_AUTH_DOMAIN?.trim() ||
    readVocorbitExtraString(config.extra, "FIREBASE_AUTH_DOMAIN")
  const envFirebaseWebApiKey = process.env.FIREBASE_WEB_API_KEY?.trim()
  const envBackendApiUrl = process.env.BACKEND_API_URL?.trim()
  const envBackendAuthTestIdToken = process.env.BACKEND_AUTH_TEST_ID_TOKEN?.trim()
  const envReferralShareBaseUrl = process.env.REFERRAL_SHARE_BASE_URL?.trim()

  const iosGoogleServicesPath = resolveProjectPath(firebaseIosGoogleServicesFile)
  const androidGoogleServicesPath = resolveProjectPath(firebaseAndroidGoogleServicesFile)
  const iosFirebase = parseFirebaseIosConfig(firebaseIosGoogleServicesFile)
  const androidFirebase = parseFirebaseAndroidConfig(firebaseAndroidGoogleServicesFile)

  const googleIosUrlScheme = envGoogleIosUrlScheme || iosFirebase.reversedClientId
  const googleIosClientId = envGoogleIosClientId || iosFirebase.clientId || ""
  const googleWebClientId = envGoogleWebClientId || androidFirebase.webClientId || ""
  const firebaseWebApiKey =
    envFirebaseWebApiKey || iosFirebase.apiKey || androidFirebase.apiKey || ""

  const googleSignInPlugin = googleIosUrlScheme
    ? [
        [
          "@react-native-google-signin/google-signin",
          {
            iosUrlScheme: googleIosUrlScheme,
          },
        ] as [string, any],
      ]
    : []

  return {
    ...config,
    ios: {
      ...config.ios,
      ...(iosGoogleServicesPath && fs.existsSync(iosGoogleServicesPath)
        ? { googleServicesFile: firebaseIosGoogleServicesFile }
        : {}),
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
    },
    android: {
      ...config.android,
      ...(androidGoogleServicesPath && fs.existsSync(androidGoogleServicesPath)
        ? { googleServicesFile: firebaseAndroidGoogleServicesFile }
        : {}),
    },
    extra: {
      ...(config.extra ?? {}),
      eas: {
        ...(config.extra?.eas ?? {}),
        projectId: easProjectId,
        build: {
          experimental: {
            ios: {
              appExtensions: [
                {
                  targetName: "ShareExtension",
                  bundleIdentifier: "com.vocorbit.ShareExtension",
                },
              ],
            },
          },
        },
      },
      vocorbit: {
        APPLE_WEB_CLIENT_ID: envAppleWebClientId || "",
        APPLE_WEB_REDIRECT_URI: envAppleWebRedirectUri || "",
        FIREBASE_PROJECT_ID: envFirebaseProjectId || "",
        FIREBASE_AUTH_DOMAIN: envFirebaseAuthDomain || "",
        GOOGLE_IOS_CLIENT_ID: googleIosClientId,
        GOOGLE_WEB_CLIENT_ID: googleWebClientId,
        FIREBASE_WEB_API_KEY: firebaseWebApiKey,
        BACKEND_API_URL: envBackendApiUrl || "",
        BACKEND_AUTH_TEST_ID_TOKEN: envBackendAuthTestIdToken || "",
        REFERRAL_SHARE_BASE_URL: envReferralShareBaseUrl || "",
      },
    },
    plugins: [
      ...existingPlugins,
      ...googleSignInPlugin,
      "./plugins/with-ios-modular-headers",
      "./plugins/with-share-extension-restore",
      "./plugins/with-android-share-intent",
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      "expo-notifications",
      "expo-iap",
    ],
  }
}
