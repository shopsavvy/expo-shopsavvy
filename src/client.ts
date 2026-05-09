const DEFAULT_BASE_URL = "https://api.shopsavvy.com/v1"

export interface ShopsavvyClientOptions {
  apiKey: string
  baseUrl?: string
}

export class ShopsavvyClient {
  private apiKey: string
  private baseUrl: string

  constructor(options: ShopsavvyClientOptions) {
    if (!options.apiKey) throw new Error("ShopSavvy: apiKey is required")
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
  }

  private async get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) usp.append(k, String(v))
    }
    const url = `${this.baseUrl}${path}${usp.toString() ? `?${usp}` : ""}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "User-Agent": "expo-shopsavvy/0.1.0",
      },
    })
    if (!res.ok) throw new Error(`ShopSavvy: ${res.status} ${res.statusText}`)
    return (await res.json()) as T
  }

  searchProducts(query: string, limit = 20) {
    return this.get<{ data: Array<Record<string, unknown>> }>("/products/search", { q: query, limit })
  }

  productDetails(identifier: string) {
    return this.get<{ data: Array<Record<string, unknown>> }>("/products/details", { id: identifier })
  }

  currentOffers(identifier: string) {
    return this.get<{ data: Array<Record<string, unknown>> }>("/products/offers", { id: identifier })
  }

  priceHistory(identifier: string, days = 90) {
    return this.get<{ data: Array<{ date: string; price: number }> }>("/products/history", { id: identifier, days })
  }

  deals(opts: { category?: string; limit?: number; sort?: string } = {}) {
    return this.get<{ data: Array<Record<string, unknown>> }>("/deals", {
      limit: opts.limit ?? 20,
      sort: opts.sort ?? "trending",
      category: opts.category,
    })
  }
}
