import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync } from "./useAsync"

export function usePriceComparison(identifier: string) {
  const client = useShopsavvyClient()
  return useAsync(() => client.currentOffers(identifier), [identifier])
}
