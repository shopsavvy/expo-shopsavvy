import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync } from "./useAsync"

export function useProductSearch(query: string, limit = 20) {
  const client = useShopsavvyClient()
  return useAsync(() => client.searchProducts(query, limit), [query, limit])
}
