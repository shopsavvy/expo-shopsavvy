import type { DealsResponse } from "@shopsavvy/sdk"
import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync, type AsyncState } from "./useAsync"

export interface DealsOptions {
  sort?: "hot" | "new" | "top-hour" | "top-day" | "top-week"
  limit?: number
  offset?: number
  category?: string
  retailer?: string
  tag?: string
  min_price?: number
  max_price?: number
  grade?: string
}

/**
 * Current shopping deals with expert grades and community votes.
 * An inline options object is fine — it is compared by value, not identity.
 */
export function useDeals(options: DealsOptions = {}): AsyncState<DealsResponse> {
  const client = useShopsavvyClient()
  const key = JSON.stringify(options)
  return useAsync(() => client.getDeals(JSON.parse(key) as DealsOptions), [client, key])
}
