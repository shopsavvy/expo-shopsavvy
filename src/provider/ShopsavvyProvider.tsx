import React, { createContext, useContext, useMemo } from "react"
import { ShopsavvyClient } from "../client"

interface ShopsavvyContextValue {
  client: ShopsavvyClient
}

const ShopsavvyContext = createContext<ShopsavvyContextValue | null>(null)

export interface ShopsavvyProviderProps {
  apiKey: string
  baseUrl?: string
  children: React.ReactNode
}

export function ShopsavvyProvider({ apiKey, baseUrl, children }: ShopsavvyProviderProps): JSX.Element {
  const value = useMemo(() => ({ client: new ShopsavvyClient({ apiKey, baseUrl }) }), [apiKey, baseUrl])
  return <ShopsavvyContext.Provider value={value}>{children}</ShopsavvyContext.Provider>
}

export function useShopsavvyClient(): ShopsavvyClient {
  const ctx = useContext(ShopsavvyContext)
  if (!ctx) throw new Error("useShopsavvyClient must be used inside <ShopsavvyProvider>")
  return ctx.client
}
