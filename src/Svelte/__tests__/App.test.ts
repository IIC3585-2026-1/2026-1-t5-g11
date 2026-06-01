import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../domain/api', () => ({
  getCurrencies: vi.fn().mockResolvedValue({ USD: 'US Dollar', EUR: 'Euro' }),
  getRate: vi.fn().mockResolvedValue(0.91),
}))

import { render, screen } from '@testing-library/svelte'
import App from '../App.svelte'

describe('App.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and description', () => {
    render(App)

    expect(screen.getByText('MoneyExchange')).toBeTruthy()
    expect(screen.getByText('Frankfurter API')).toBeTruthy()
    expect(screen.getByText(/Elige dos monedas/)).toBeTruthy()
  })

  it('renders amount input and converted input', () => {
    render(App)
    const inputs = screen.getAllByRole('textbox')

    expect(inputs.length).toBe(2)
  })

  it('renders from and to currency selects', () => {
    render(App)
    const combos = screen.getAllByRole('combobox')

    expect(combos.length).toBe(2)
  })

  it('renders swap button', () => {
    render(App)

    expect(screen.getByLabelText('Swap currencies')).toBeTruthy()
  })

  it('renders refresh rate button', () => {
    render(App)

    expect(screen.getByText('Refresh rate')).toBeTruthy()
  })

  it('shows loading state on mount', () => {
    render(App)

    expect(screen.getByText('Loading currencies...')).toBeTruthy()
  })
})
