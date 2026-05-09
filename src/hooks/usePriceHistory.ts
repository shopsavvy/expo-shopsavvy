import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync } from "./useAsync"

export function usePriceHistory(identifier: string, days = 90) {
  const client = useShopsavvyClient()
  return useAsync(() => client.priceHistory(identifier, days), [identifier, days])
}
