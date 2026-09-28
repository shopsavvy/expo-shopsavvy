export { ShopsavvyProvider, useShopsavvyClient } from "./provider/ShopsavvyProvider"
export type { ShopsavvyProviderProps } from "./provider/ShopsavvyProvider"
export { useProductSearch } from "./hooks/useProductSearch"
export { usePriceComparison } from "./hooks/usePriceComparison"
export { usePriceHistory } from "./hooks/usePriceHistory"
export { useDeals } from "./hooks/useDeals"
export type { DealsOptions } from "./hooks/useDeals"
export type { AsyncState } from "./hooks/useAsync"

// Re-export SDK types for convenience
export type {
  ShopSavvyConfig,
  ProductDetails,
  ProductWithOffers,
  Offer,
  OfferWithHistory,
  PriceHistoryEntry,
  ProductSearchResult,
  APIResponse,
  APIMeta,
  PaginationInfo,
  Deal,
  DealsResponse,
} from "@shopsavvy/sdk"
