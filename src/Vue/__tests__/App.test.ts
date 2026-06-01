import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

vi.mock('../../domain/api', () => ({
  getCurrencies: vi.fn().mockResolvedValue({ USD: 'US Dollar', EUR: 'Euro' }),
  getRate: vi.fn().mockResolvedValue(0.91),
}))

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and description', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('MoneyExchange')
    expect(wrapper.text()).toContain('Frankfurter API')
    expect(wrapper.text()).toContain('Elige dos monedas')
  })

  it('renders amount input and converted input', () => {
    const wrapper = mount(App)
    const inputs = wrapper.findAll('input')

    expect(inputs.length).toBe(2)
  })

  it('renders from and to currency selects', () => {
    const wrapper = mount(App)
    const selects = wrapper.findAll('select')

    expect(selects.length).toBe(2)
  })

  it('renders swap button', () => {
    const wrapper = mount(App)

    expect(wrapper.find('button.swap').exists()).toBe(true)
    expect(wrapper.find('button.swap').attributes('aria-label')).toBe('Swap currencies')
  })

  it('renders refresh rate button', () => {
    const wrapper = mount(App)

    expect(wrapper.find('button.refresh').exists()).toBe(true)
    expect(wrapper.find('button.refresh').text()).toBe('Refresh rate')
  })

  it('shows loading state on mount', () => {
    const wrapper = mount(App)

    expect(wrapper.find('.status-row').text()).toContain('Loading currencies...')
  })
})
