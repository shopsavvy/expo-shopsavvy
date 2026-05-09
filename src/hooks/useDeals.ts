import { useShopsavvyClient } from "../provider/ShopsavvyProvider"
import { useAsync } from "./useAsync"

export function useDeals(opts: { category?: string; limit?: number; sort?: string } = {}) {
  const client = useShopsavvyClient()
  return useAsync(() => client.deals(opts), [opts.category, opts.limit, opts.sort])
}
