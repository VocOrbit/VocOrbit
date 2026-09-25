import { useMemo, useState } from "react"
import { Pressable, Text, View, type TextStyle, type ViewStyle } from "react-native"

import {
  getDesktopExternalAuthProvider,
  returnFirebaseTokenToDesktop,
} from "@/services/auth/desktopAuthBridge"
import { resolveAppleFirebaseIdToken } from "@/services/auth/appleIdToken"
import { resolveGoogleFirebaseIdToken } from "@/services/auth/googleIdToken"

type Status = "idle" | "loading" | "error"

export function DesktopExternalAuthPage() {
  const provider = useMemo(() => getDesktopExternalAuthProvider(), [])
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const providerLabel = provider === "apple" ? "Apple" : provider === "google" ? "Google" : "Provider"

  const handleContinue = async () => {
    if (!provider) {
      setStatus("error")
      setErrorMessage("Desktop auth request is missing a provider.")
      return
    }

    setStatus("loading")
    setErrorMessage(null)

    try {
      const idToken =
        provider === "apple"
          ? await resolveAppleFirebaseIdToken()
          : await resolveGoogleFirebaseIdToken()

      const redirected = returnFirebaseTokenToDesktop(idToken)
      if (!redirected) {
        throw new Error("Could not hand off sign-in result back to VocOrbit Desktop.")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        error instanceof Error ? error.message : `${providerLabel} sign in could not be completed.`,
      )
      return
    }
  }

  return (
    <View style={$screen}>
      <View style={$card}>
        <Text style={$eyebrow}>VocOrbit Desktop</Text>
        <Text style={$title}>Continue with {providerLabel}</Text>
        <Text style={$body}>
          Complete sign-in here. When it succeeds, VocOrbit Desktop will open automatically.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleContinue()
          }}
          style={({ pressed }) => [
            $button,
            (pressed || status === "loading") && $buttonPressed,
          ]}
        >
          <Text style={$buttonText}>
            {status === "loading" ? `Connecting ${providerLabel}...` : `Continue with ${providerLabel}`}
          </Text>
        </Pressable>

        {errorMessage ? <Text style={$error}>{errorMessage}</Text> : null}
      </View>
    </View>
  )
}

const $screen: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#0B0E16",
  paddingHorizontal: 24,
}

const $card: ViewStyle = {
  width: "100%",
  maxWidth: 460,
  borderRadius: 28,
  paddingHorizontal: 28,
  paddingVertical: 32,
  backgroundColor: "#11161C",
  borderWidth: 1,
  borderColor: "#25303B",
}

const $eyebrow: TextStyle = {
  color: "#8FA38F",
  fontSize: 12,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  marginBottom: 12,
}

const $title: TextStyle = {
  color: "#F5F7F9",
  fontSize: 30,
  lineHeight: 34,
  fontWeight: "700",
  marginBottom: 10,
}

const $body: TextStyle = {
  color: "#A9B3BC",
  fontSize: 16,
  lineHeight: 24,
  marginBottom: 24,
}

const $button: ViewStyle = {
  minHeight: 56,
  borderRadius: 18,
  backgroundColor: "#7E957F",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 20,
}

const $buttonPressed: ViewStyle = {
  opacity: 0.88,
}

const $buttonText: TextStyle = {
  color: "#0B0E16",
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "700",
}

const $error: TextStyle = {
  marginTop: 16,
  color: "#F28B82",
  fontSize: 14,
  lineHeight: 20,
}
