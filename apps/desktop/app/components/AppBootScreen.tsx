import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native"

type AppBootScreenProps = {
  title?: string
  message?: string
}

export function AppBootScreen({
  title = "VocOrbit Desktop",
  message = "Preparing your workspace...",
}: AppBootScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <View style={styles.panel}>
        <View style={styles.logoWrap}>
          <Image
            source={require("@assets/images/splash-icon-rounded.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.progressRow}>
          <ActivityIndicator size="small" color="#D8E7D7" />
          <Text style={styles.progressLabel}>Loading your library</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E16",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    overflow: "hidden",
  },
  glowPrimary: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#314A37",
    opacity: 0.34,
    top: -80,
    left: -36,
  },
  glowSecondary: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#203845",
    opacity: 0.3,
    bottom: -72,
    right: -28,
  },
  panel: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(216, 231, 215, 0.16)",
    backgroundColor: "rgba(11, 15, 24, 0.9)",
    paddingHorizontal: 30,
    paddingVertical: 34,
    alignItems: "center",
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(216, 231, 215, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logo: {
    width: 68,
    height: 68,
  },
  title: {
    color: "#F4F5F7",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    color: "rgba(244, 245, 247, 0.72)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  progressRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  progressLabel: {
    color: "#D8E7D7",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
})
