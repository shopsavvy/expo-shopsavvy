import type { ConfigPlugin } from "@expo/config-plugins"
import type { ExpoConfig } from "@expo/config-types"

interface ShopsavvyPluginProps {
  apiKey?: string
  cameraPermission?: string
}

const withShopsavvy: ConfigPlugin<ShopsavvyPluginProps | void> = (config, props) => {
  const options = (props ?? {}) as ShopsavvyPluginProps
  const cameraPermission =
    options.cameraPermission ||
    "$(PRODUCT_NAME) needs camera access to scan barcodes for instant price comparison."

  const next: ExpoConfig = { ...config }

  if (options.apiKey) {
    next.extra = { ...(next.extra ?? {}), shopsavvyApiKey: options.apiKey }
  }

  next.ios = {
    ...(next.ios ?? {}),
    infoPlist: {
      ...((next.ios as any)?.infoPlist ?? {}),
      NSCameraUsageDescription: cameraPermission,
    },
  } as ExpoConfig["ios"]

  const existingAndroidPermissions = (next.android?.permissions as string[] | undefined) ?? []
  next.android = {
    ...(next.android ?? {}),
    permissions: Array.from(new Set([...existingAndroidPermissions, "android.permission.CAMERA"])),
  } as ExpoConfig["android"]

  next.plugins = [...(next.plugins ?? []), ["expo-barcode-scanner", { cameraPermission }]]

  return next
}

export default withShopsavvy
module.exports = withShopsavvy
