import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCurrencies, getRate, getHistoricalRates } from './api'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getCurrencies', () => {
  it('fetches currencies from /currencies endpoint', async () => {
    const mockData = { USD: 'United States Dollar', EUR: 'Euro' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await getCurrencies()

    expect(mockFetch).toHaveBeenCalledOnce()
    expect(mockFetch).toHaveBeenCalledWith('https://api.frankfurter.dev/v2/currencies')
    expect(result).toEqual(mockData)
  })

  it('converts array response to object map', async () => {
    const mockArray = [
      { iso_code: 'USD', name: 'United States Dollar' },
      { iso_code: 'EUR', name: 'Euro' },
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockArray),
    })

    const result = await getCurrencies()

    expect(result).toEqual({ USD: 'United States Dollar', EUR: 'Euro' })
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    await expect(getCurrencies()).rejects.toThrow('API error')
  })
})

describe('getRate', () => {
  it('fetches rate from /latest endpoint with query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ rates: { EUR: 0.91 } }),
    })

    const result = await getRate('USD', 'EUR')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v2/latest?from=USD&to=EUR'
    )
    expect(result).toBe(0.91)
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    await expect(getRate('USD', 'EUR')).rejects.toThrow('API error')
  })
})

describe('getHistoricalRates', () => {
  it('fetches historical rates from date range endpoint', async () => {
    const mockResponse = {
      rates: { '2024-01-01': { EUR: 0.91 }, '2024-01-02': { EUR: 0.92 } },
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await getHistoricalRates('USD', '2024-01-01', '2024-01-02')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v2/2024-01-01..2024-01-02?from=USD'
    )
    expect(result).toEqual(mockResponse)
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    await expect(getHistoricalRates('USD', '2024-01-01', '2024-01-02')).rejects.toThrow(
      'API error'
    )
  })
})
