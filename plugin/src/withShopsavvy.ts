import { AndroidConfig, withInfoPlist, type ConfigPlugin } from "expo/config-plugins"

export interface ShopsavvyPluginProps {
  /**
   * Your ShopSavvy Data API key. Exposed to the app at runtime as
   * `Constants.expoConfig.extra.shopsavvyApiKey` (via expo-constants).
   */
  apiKey?: string
  /**
   * iOS camera usage string, shown when the app asks for camera access to
   * scan barcodes. Pass `false` to leave camera permissions untouched (e.g.
   * if the app never scans).
   */
  cameraPermission?: string | false
}

export const DEFAULT_CAMERA_PERMISSION =
  "Allow $(PRODUCT_NAME) to use the camera to scan barcodes for instant price comparison."

const withShopsavvy: ConfigPlugin<ShopsavvyPluginProps | void> = (config, props) => {
  const options: ShopsavvyPluginProps = props ?? {}

  if (options.apiKey) {
    config.extra = { ...(config.extra ?? {}), shopsavvyApiKey: options.apiKey }
  }

  if (options.cameraPermission === false) {
    return config
  }

  const cameraPermission = options.cameraPermission || DEFAULT_CAMERA_PERMISSION

  config = withInfoPlist(config, (cfg) => {
    // Don't clobber a usage string the app (or another plugin, e.g.
    // expo-camera) already set unless the developer passed one explicitly.
    if (options.cameraPermission || !cfg.modResults.NSCameraUsageDescription) {
      cfg.modResults.NSCameraUsageDescription = cameraPermission
    }
    return cfg
  })

  config = AndroidConfig.Permissions.withPermissions(config, ["android.permission.CAMERA"])

  return config
}

export default withShopsavvy
