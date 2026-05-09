# expo-shopsavvy

Expo config plugin and React hooks for **product search, price comparison, price history, and barcode scanning** powered by the [ShopSavvy Data API](https://shopsavvy.com/data). Drop it into a managed Expo app and you get camera permission wiring, an SDK provider, and four ready-made hooks.

[Documentation](https://shopsavvy.com/integrations/expo) · [Get an API key](https://shopsavvy.com/data) · [Other integrations](https://shopsavvy.com/integrations)

## Install

```bash
npx expo install expo-shopsavvy expo-barcode-scanner expo-constants
```

## Configure

```json
// app.json
{
  "expo": {
    "plugins": [
      ["expo-shopsavvy", {
        "apiKey": "ss_live_…",
        "cameraPermission": "We need camera access to scan barcodes for instant price comparison."
      }]
    ]
  }
}
```

The plugin:

- Injects `apiKey` into `Constants.expoConfig.extra.shopsavvyApiKey`.
- Adds `NSCameraUsageDescription` to iOS Info.plist.
- Adds `android.permission.CAMERA` to AndroidManifest.
- Pulls in `expo-barcode-scanner` with the same camera permission string.

> Treat `apiKey` as the developer's own ShopSavvy key — it ships in your built app. For production, prefer proxying ShopSavvy calls through your own backend so the key never leaves the server.

## Hooks

```tsx
import { ShopsavvyProvider, useProductSearch, useDeals } from "expo-shopsavvy"
import Constants from "expo-constants"

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
  // ...
}
```

| Hook                          | Args                                            | Returns                                  |
|-------------------------------|--------------------------------------------------|-------------------------------------------|
| `useProductSearch(q, limit?)` | query string, optional limit                     | `{ data, loading, error, refetch }`       |
| `usePriceComparison(id)`      | UPC, ASIN, URL, or product id                    | offers across retailers                    |
| `usePriceHistory(id, days?)`  | identifier + days (default 90)                   | time-series price points                   |
| `useDeals({ category?, … })`  | optional filters                                 | trending deals list                        |

## Barcode scanning

```tsx
import { BarCodeScanner } from "expo-barcode-scanner"
// Use the granted camera permission to scan a UPC, then pass to usePriceComparison.
```

## Test

```bash
./test.sh
```

## License

MIT — see [LICENSE](./LICENSE).
