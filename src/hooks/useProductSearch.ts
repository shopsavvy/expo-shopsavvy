import type { ProductSearchResult } from "@shopsavvy/sdk"
import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync, type AsyncState } from "./useAsync"

/**
 * Search products by keyword. An empty (or whitespace-only) query makes no
 * request and leaves `data` null.
 */
export function useProductSearch(query: string, limit = 20): AsyncState<ProductSearchResult> {
  const client = useShopsavvyClient()
  const enabled = query.trim().length > 0
  return useAsync(() => client.searchProducts(query, { limit }), [client, query, limit], enabled)
}
