import type { APIResponse, ProductWithOffers } from "@shopsavvy/sdk"
import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync, type AsyncState } from "./useAsync"

/**
 * Current offers across retailers for a product. `identifier` can be a
 * barcode/UPC, ASIN, product URL, model number, or ShopSavvy product ID.
 */
export function usePriceComparison(identifier: string): AsyncState<APIResponse<ProductWithOffers[]>> {
  const client = useShopsavvyClient()
  const enabled = identifier.trim().length > 0
  return useAsync(() => client.getCurrentOffers(identifier), [client, identifier], enabled)
}
