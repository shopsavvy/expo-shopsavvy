import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  ShopsavvyProvider,
  useDeals,
  usePriceComparison,
  usePriceHistory,
  useProductSearch,
  useShopsavvyClient,
} from '../src/index'
import { FIXTURE_API_KEY, startDataApiServer } from './test-fixture-data-api-server'

let api: ReturnType<typeof startDataApiServer>

beforeAll(() => {
  api = startDataApiServer()
})

afterAll(() => {
  api.stop()
})

function wrapperFor(apiKey: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <ShopsavvyProvider apiKey={apiKey} baseUrl={api.baseUrl}>
      {children}
    </ShopsavvyProvider>
  )
}

const wrapper = wrapperFor(FIXTURE_API_KEY)

function requestsTo(path: string) {
  return api.requests.filter((r) => r.path === path)
}

function lastRequestTo(path: string) {
  const matches = requestsTo(path)
  return matches[matches.length - 1]
}

describe('ShopsavvyProvider', () => {
  test('hooks used outside the provider throw a helpful error', () => {
    const originalError = console.error
    console.error = () => {}
    try {
      expect(() => renderHook(() => useShopsavvyClient())).toThrow(/must be used inside <ShopsavvyProvider>/)
    } finally {
      console.error = originalError
    }
  })
})

describe('useProductSearch', () => {
  test('searches with q and limit, authenticated', async () => {
    const { result } = renderHook(() => useProductSearch('airpods pro', 5), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.data?.data[0].title).toBe('Apple AirPods Pro (2nd Generation)')
    const req = lastRequestTo('/v1/products/search')
    expect(req.authorization).toBe(`Bearer ${FIXTURE_API_KEY}`)
    expect(req.params).toMatchObject({ q: 'airpods pro', limit: '5' })
  })

  test('an empty query makes no request', async () => {
    const before = api.requests.length
    const { result } = renderHook(() => useProductSearch(''), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(api.requests.length).toBe(before)
  })
})

describe('usePriceComparison', () => {
  test('requests offers with the ids param the API reads', async () => {
    const { result } = renderHook(() => usePriceComparison('0194253397137'), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.data?.data[0].offers.map((o) => o.price)).toEqual([189.99, 199.99])
    expect(lastRequestTo('/v1/products/offers').params).toMatchObject({ ids: '0194253397137' })
  })

  test('an API error is surfaced on error', async () => {
    const { result } = renderHook(() => usePriceComparison('0194253397137'), { wrapper: wrapperFor('ss_live_wrongkey456') })
    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.data).toBeNull()
  })
})

describe('usePriceHistory', () => {
  test('hits /products/offers/history with start/end spanning `days`, ending today', async () => {
    const { result } = renderHook(() => usePriceHistory('0194253397137', 30), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.data?.data[0].history.map((h) => h.price)).toEqual([249.0, 189.99])
    const { params } = lastRequestTo('/v1/products/offers/history')
    expect(params.ids).toBe('0194253397137')
    expect(params.end).toBe(new Date().toISOString().split('T')[0])
    expect((Date.parse(params.end) - Date.parse(params.start)) / 86_400_000).toBe(30)
  })
})

describe('useDeals', () => {
  test('passes filters through and returns the deals payload', async () => {
    const { result } = renderHook(() => useDeals({ sort: 'new', limit: 8, category: 'electronics' }), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.data?.deals[0].title).toBe('AirPods Pro 2 at a record low')
    expect(lastRequestTo('/v1/deals').params).toMatchObject({ sort: 'new', limit: '8', category: 'electronics' })
  })

  test('an inline options object does not refetch on re-render; refetch does', async () => {
    const { result, rerender } = renderHook(() => useDeals({ sort: 'hot' }), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    const count = requestsTo('/v1/deals').length
    rerender()
    rerender()
    await new Promise((r) => setTimeout(r, 50))
    expect(requestsTo('/v1/deals').length).toBe(count)
    act(() => result.current.refetch())
    await waitFor(() => expect(requestsTo('/v1/deals').length).toBe(count + 1))
  })
})
