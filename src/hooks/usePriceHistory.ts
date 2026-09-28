import type { APIResponse, ProductWithOfferHistory } from "@shopsavvy/sdk"
import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync, type AsyncState } from "./useAsync"

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

/**
 * Price history for the last `days` days (ending today). `data` has one entry per
 * product, each with its `offers`, and each offer carries its own `history` (newest first).
 */
export function usePriceHistory(identifier: string, days = 90): AsyncState<APIResponse<ProductWithOfferHistory[]>> {
  const client = useShopsavvyClient()
  const enabled = identifier.trim().length > 0
  return useAsync(
    () => {
      const end = new Date()
      const start = new Date(end.getTime() - days * 86_400_000)
      return client.getPriceHistory(identifier, isoDate(start), isoDate(end))
    },
    [client, identifier, days],
    enabled,
  )
}
