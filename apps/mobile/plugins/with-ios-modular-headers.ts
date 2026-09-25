import fs from "node:fs"
import path from "node:path"
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins"

const withIosModularHeaders: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, "Podfile")
      if (!fs.existsSync(podfilePath)) return modConfig

      const source = fs.readFileSync(podfilePath, "utf8")
      if (source.includes("use_modular_headers!")) return modConfig

      const anchor = "prepare_react_native_project!"
      const patched = source.includes(anchor)
        ? source.replace(anchor, `${anchor}\nuse_modular_headers!`)
        : source

      if (patched !== source) {
        fs.writeFileSync(podfilePath, patched)
      }

      return modConfig
    },
  ])

export default withIosModularHeaders
