import React, { createContext, useContext, useMemo } from "react"
import { ShopSavvyDataAPI, type ShopSavvyConfig } from "@shopsavvy/sdk"

interface ShopsavvyContextValue {
  client: ShopSavvyDataAPI
}

const ShopsavvyContext = createContext<ShopsavvyContextValue | null>(null)

export interface ShopsavvyProviderProps {
  /** Your ShopSavvy Data API key (get one at https://shopsavvy.com/data) */
  apiKey: string
  /** Optional API base URL override, e.g. your own proxy */
  baseUrl?: string
  /** Optional request timeout in milliseconds */
  timeout?: number
  children: React.ReactNode
}

export function ShopsavvyProvider({ apiKey, baseUrl, timeout, children }: ShopsavvyProviderProps): React.JSX.Element {
  const value = useMemo(() => {
    const config: ShopSavvyConfig = { apiKey }
    if (baseUrl) config.baseUrl = baseUrl
    if (timeout) config.timeout = timeout
    return { client: new ShopSavvyDataAPI(config) }
  }, [apiKey, baseUrl, timeout])
  return <ShopsavvyContext.Provider value={value}>{children}</ShopsavvyContext.Provider>
}

/** The underlying @shopsavvy/sdk client, for endpoints the hooks don't cover. */
export function useShopsavvyClient(): ShopSavvyDataAPI {
  const ctx = useContext(ShopsavvyContext)
  if (!ctx) throw new Error("useShopsavvyClient must be used inside <ShopsavvyProvider>")
  return ctx.client
}
