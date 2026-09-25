import fs from "node:fs"
import path from "node:path"
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins"

const ASSET_ROOT = "plugins/android-share-assets"
const KOTLIN_ASSET_FILES = [
  "QuickLookupActivity.kt",
  "QuickLookupApiClient.kt",
  "QuickLookupOverlayService.kt",
  "QuickLookupSessionStore.kt",
  "QuickLookupTextSupport.kt",
  "QuickLookupWordPickerView.kt",
  "ShareIntentModule.kt",
  "ShareIntentPackage.kt",
  "SharePayloadStore.kt",
  "ShareReceiverActivity.kt",
] as const

const SHARE_ACTIVITY_BLOCK = `    <activity android:name=".ShareReceiverActivity" android:exported="true" android:excludeFromRecents="true" android:theme="@style/Theme.VocOrbit.ShareBridge">
      <intent-filter>
        <action android:name="android.intent.action.SEND"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:mimeType="text/plain"/>
      </intent-filter>
      <intent-filter>
        <action android:name="android.intent.action.PROCESS_TEXT"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:mimeType="text/plain"/>
      </intent-filter>
    </activity>
    <activity android:name=".QuickLookupActivity" android:exported="false" android:excludeFromRecents="true" android:theme="@style/Theme.VocOrbit.QuickLookupPopup"/>
    <service android:name=".QuickLookupOverlayService" android:exported="false"/>`

const SYSTEM_ALERT_WINDOW_PERMISSION =
  `  <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>`

function ensureFileCopied(sourcePath: string, targetPath: string) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Android share asset file not found: ${sourcePath}`)
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.copyFileSync(sourcePath, targetPath)
}

function ensureShareActivityInManifest(manifestPath: string) {
  const manifest = fs.readFileSync(manifestPath, "utf8")
  const cleanedManifest = manifest
    .replace(
      /\s*<activity android:name="\.ShareReceiverActivity"[\s\S]*?<\/activity>\n?/g,
      "\n",
    )
    .replace(
      /\s*<activity android:name="\.QuickLookupPermissionActivity"[\s\S]*?\/>\n?/g,
      "\n",
    )
    .replace(
      /\s*<activity android:name="\.QuickLookupActivity"[\s\S]*?\/>\n?/g,
      "\n",
    )
    .replace(
      /\s*<service android:name="\.QuickLookupOverlayService"[\s\S]*?\/>\n?/g,
      "\n",
    )

  const anchor = `    <activity android:name=".MainActivity"`
  if (!cleanedManifest.includes(anchor)) {
    throw new Error(`MainActivity declaration not found in AndroidManifest: ${manifestPath}`)
  }

  const updatedManifest = cleanedManifest.replace(
    anchor,
    `${SHARE_ACTIVITY_BLOCK}\n${anchor}`,
  )
  fs.writeFileSync(manifestPath, updatedManifest)
}

function ensureSystemAlertWindowPermission(manifestPath: string) {
  const manifest = fs.readFileSync(manifestPath, "utf8")
  if (manifest.includes(`android.permission.SYSTEM_ALERT_WINDOW`)) {
    return
  }

  const manifestTagMatch = manifest.match(/<manifest[\s\S]*?>/)
  if (!manifestTagMatch) {
    throw new Error(`Manifest root tag not found: ${manifestPath}`)
  }

  const updatedManifest = manifest.replace(
    manifestTagMatch[0],
    `${manifestTagMatch[0]}\n${SYSTEM_ALERT_WINDOW_PERMISSION}`,
  )
  fs.writeFileSync(manifestPath, updatedManifest)
}

function ensureQuickLookupStyles(stylesPath: string) {
  const styles = fs.readFileSync(stylesPath, "utf8")
  const stylesToAppend: string[] = []

  if (!styles.includes(`name="Theme.VocOrbit.ShareBridge"`)) {
    stylesToAppend.push(`  <style name="Theme.VocOrbit.ShareBridge" parent="@android:style/Theme.NoDisplay" />`)
  }

  if (!styles.includes(`name="Theme.VocOrbit.QuickLookupPopup"`)) {
    stylesToAppend.push(`  <style name="Theme.VocOrbit.QuickLookupPopup" parent="@android:style/Theme.Material.Light.Dialog.NoActionBar">
    <item name="android:windowIsFloating">true</item>
    <item name="android:windowIsTranslucent">true</item>
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:windowCloseOnTouchOutside">true</item>
    <item name="android:backgroundDimEnabled">true</item>
    <item name="android:windowAnimationStyle">@android:style/Animation.Dialog</item>
  </style>`)
  }

  if (stylesToAppend.length === 0) {
    return
  }

  const updatedStyles = styles.replace("</resources>", `\n${stylesToAppend.join("\n")}\n</resources>`)
  fs.writeFileSync(stylesPath, updatedStyles)
}

function ensureSharePackageRegistered(mainApplicationPath: string) {
  const mainApplication = fs.readFileSync(mainApplicationPath, "utf8")
  if (mainApplication.includes("add(ShareIntentPackage())")) {
    return
  }

  const anchor = "PackageList(this).packages.apply {"
  if (!mainApplication.includes(anchor)) {
    throw new Error(`PackageList anchor not found in MainApplication: ${mainApplicationPath}`)
  }

  const updatedMainApplication = mainApplication.replace(
    anchor,
    `${anchor}\n              add(ShareIntentPackage())`,
  )
  fs.writeFileSync(mainApplicationPath, updatedMainApplication)
}

const withAndroidShareIntent: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot
      const androidRoot = modConfig.modRequest.platformProjectRoot
      const assetsRoot = path.join(projectRoot, ASSET_ROOT)
      const mainJavaRoot = path.join(androidRoot, "app/src/main/java/com/vocorbit")

      for (const assetFile of KOTLIN_ASSET_FILES) {
        ensureFileCopied(
          path.join(assetsRoot, assetFile),
          path.join(mainJavaRoot, assetFile),
        )
      }

      const manifestPath = path.join(androidRoot, "app/src/main/AndroidManifest.xml")
      ensureSystemAlertWindowPermission(manifestPath)
      ensureShareActivityInManifest(manifestPath)
      ensureQuickLookupStyles(path.join(androidRoot, "app/src/main/res/values/styles.xml"))
      ensureSharePackageRegistered(path.join(mainJavaRoot, "MainApplication.kt"))

      return modConfig
    },
  ])

export default withAndroidShareIntent
