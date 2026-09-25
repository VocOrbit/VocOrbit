import fs from "node:fs"
import path from "node:path"
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins"

const ASSET_ROOT = "plugins/share-extension-assets"

const FILES_TO_RESTORE: Array<{ source: string; target: string }> = [
  {
    source: "VocOrbit.xcodeproj/project.pbxproj",
    target: "VocOrbit.xcodeproj/project.pbxproj",
  },
  {
    source: "VocOrbit.xcodeproj/xcshareddata/xcschemes/VocOrbit.xcscheme",
    target: "VocOrbit.xcodeproj/xcshareddata/xcschemes/VocOrbit.xcscheme",
  },
  {
    source: "VocOrbit/VocOrbit.entitlements",
    target: "VocOrbit/VocOrbit.entitlements",
  },
]

const DIRECTORIES_TO_RESTORE: Array<{ source: string; target: string }> = [
  {
    source: "ShareExtension",
    target: "ShareExtension",
  },
]

function copyDirectory(sourceDir: string, targetDir: string) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Share extension asset directory not found: ${sourceDir}`)
  }

  fs.mkdirSync(targetDir, { recursive: true })
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
      continue
    }

    if (entry.isFile()) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true })
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

const withShareExtensionRestore: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot
      const iosRoot = modConfig.modRequest.platformProjectRoot
      const assetsRoot = path.join(projectRoot, ASSET_ROOT)

      for (const file of FILES_TO_RESTORE) {
        const sourcePath = path.join(assetsRoot, file.source)
        const targetPath = path.join(iosRoot, file.target)

        if (!fs.existsSync(sourcePath)) {
          throw new Error(`Share extension asset file not found: ${sourcePath}`)
        }

        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        fs.copyFileSync(sourcePath, targetPath)
      }

      for (const directory of DIRECTORIES_TO_RESTORE) {
        copyDirectory(
          path.join(assetsRoot, directory.source),
          path.join(iosRoot, directory.target),
        )
      }

      return modConfig
    },
  ])

export default withShareExtensionRestore
