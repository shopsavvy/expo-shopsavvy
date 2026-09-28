# expo-shopsavvy

Expo config plugin and React hooks for **product search, price comparison, price history, and deals** powered by the [ShopSavvy Data API](https://shopsavvy.com/data). Add it to a managed Expo app and you get camera-permission wiring for barcode scanning, an SDK provider, and four ready-made hooks.

[Documentation](https://shopsavvy.com/integrations/expo) · [Get an API key](https://shopsavvy.com/data) · [Other integrations](https://shopsavvy.com/integrations)

## Install

```bash
npx expo install expo-shopsavvy expo-constants
```

The hooks are pure JavaScript and work in Expo Go. The config plugin only affects native builds (`npx expo prebuild`, EAS Build).

## Configure

```json
// app.json
{
  "expo": {
    "plugins": [
      ["expo-shopsavvy", {
        "apiKey": "ss_live_…",
        "cameraPermission": "Scan barcodes to compare prices instantly."
      }]
    ]
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `apiKey` | — | Written to `Constants.expoConfig.extra.shopsavvyApiKey` so the app can read it at runtime. |
| `cameraPermission` | `"Allow $(PRODUCT_NAME) to use the camera to scan barcodes for instant price comparison."` | iOS `NSCameraUsageDescription`. If you don't pass one, an existing description (e.g. from `expo-camera`) is kept. Pass `false` to skip camera permissions entirely. |

The plugin also adds `android.permission.CAMERA` to the Android manifest (unless `cameraPermission` is `false`).

> Treat `apiKey` as your own ShopSavvy key: it ships in your built app. For production, consider proxying ShopSavvy calls through your own backend and passing its URL as `baseUrl`.

## Hooks

```tsx
import Constants from "expo-constants"
import { ShopsavvyProvider, useProductSearch } from "expo-shopsavvy"

const API_KEY = Constants.expoConfig?.extra?.shopsavvyApiKey ?? ""

export default function App() {
  return (
    <ShopsavvyProvider apiKey={API_KEY}>
      <Search />
    </ShopsavvyProvider>
  )
}

function Search() {
  const { data, loading, error, refetch } = useProductSearch("AirPods Pro")
  // data?.data => [{ title, shopsavvy, brand, barcode, ... }, ...]
}
```

| Hook | Args | `data` |
|------|------|--------|
| `useProductSearch(query, limit?)` | keyword, optional limit (default 20); an empty query makes no request | `{ data: Product[], pagination }` |
| `usePriceComparison(identifier)` | barcode/UPC, ASIN, URL, model number, or ShopSavvy ID | `{ data: [{ title, offers: [{ retailer, price, URL, ... }] }] }` |
| `usePriceHistory(identifier, days?)` | identifier + days back from today (default 90) | `{ data: [{ retailer, history: [{ timestamp, price }] }] }` |
| `useDeals(options?)` | `sort` (`hot`, `new`, `top-hour`, `top-day`, `top-week`), `limit`, `offset`, `category`, `retailer`, `tag`, `min_price`, `max_price`, `grade` | `{ deals: [{ title, grade, pricing, retailer, url, votes }] }` |

Every hook returns `{ data, loading, error, refetch }`.

`ShopsavvyProvider` props: `apiKey` (required), `baseUrl`, `timeout`. `useShopsavvyClient()` returns the underlying [`@shopsavvy/sdk`](https://www.npmjs.com/package/@shopsavvy/sdk) client.

## Barcode scanning

Scan with [`expo-camera`](https://docs.expo.dev/versions/latest/sdk/camera/) and pass the code to `usePriceComparison`:

```tsx
import { useState } from "react"
import { Button } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { usePriceComparison } from "expo-shopsavvy"

function Scanner() {
  const [permission, requestPermission] = useCameraPermissions()
  const [code, setCode] = useState("")
  const { data } = usePriceComparison(code)

  if (!permission?.granted) return <Button title="Allow camera" onPress={requestPermission} />
  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
      onBarcodeScanned={(result) => setCode(result.data)}
    />
  )
}
```

## Development

```bash
bun install
bun run typecheck
bun run build
bun test
```

## License

MIT — see [LICENSE](./LICENSE).
