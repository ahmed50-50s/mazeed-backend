import axios from 'axios'
import { API_URL } from '../config'
import { defaults } from '../data/defaults'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// Every failure becomes an ApiError: { message, status, details: [{ field, message }] }.
// status 0 = network error / timeout (API unreachable).
export class ApiError extends Error {
  constructor(message, status = 0, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const { response } = error
    const message =
      response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'انتهت مهلة الاتصال، حاول مرة أخرى' : 'تعذر الاتصال بالخادم')
    return Promise.reject(new ApiError(message, response?.status ?? 0, response?.data?.details ?? []))
  },
)

// ---------- Fallback merging ----------

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// API values win; anything missing, empty ('' / []) or of the wrong type keeps the built-in default.
// Arrays are taken whole (never merged item by item), so the admin's order and count are respected.
export function withDefaults(data, fallback) {
  if (Array.isArray(fallback)) return Array.isArray(data) && data.length ? data : fallback
  if (isPlainObject(fallback)) {
    if (!isPlainObject(data)) return fallback
    const merged = { ...data }
    for (const key of Object.keys(fallback)) merged[key] = withDefaults(data[key], fallback[key])
    return merged
  }
  if (typeof fallback === 'string') return typeof data === 'string' && data !== '' ? data : fallback
  return data ?? fallback
}

// ---------- Content ----------

// Everything the home + about pages render, in one request. Never throws: falls back to the built-in content.
export async function getLandingData({ signal } = {}) {
  try {
    const { data } = await api.get('/landing-data', { signal })
    return { data: withDefaults(data.data, defaults), error: null }
  } catch (error) {
    if (axios.isCancel(error)) throw error
    if (import.meta.env.DEV) console.warn('[api] landing-data unavailable, using built-in content:', error.message)
    return { data: defaults, error }
  }
}

// Modular getters, for pages that need one collection (e.g. a future /courses page). Fall back like above.
async function getList(path, fallback, { signal, params } = {}) {
  try {
    const { data } = await api.get(path, { signal, params })
    return withDefaults(data.data, fallback)
  } catch (error) {
    if (axios.isCancel(error)) throw error
    return fallback
  }
}

export const getServices = (options) => getList('/services', defaults.services, options)
export const getPricingPlans = (options) => getList('/pricing-plans', defaults.plans, options)
export const getTestimonials = (options) => getList('/testimonials', defaults.testimonials, options)
export const getShowcaseItems = (tab, options) =>
  getList('/showcase', defaults.showcase.tabs.find((t) => t.id === tab)?.items ?? [], {
    ...options,
    params: { tab },
  })

// ---------- Analytics ----------

// Sends an anonymous event without waiting for it and without ever throwing. sendBeacon posts JSON as text/plain
// (no CORS preflight) and is delivered even if the page goes to the background as WhatsApp opens.
function sendEvent(event) {
  try {
    const url = `${API_URL}/analytics/events`
    const body = JSON.stringify(event)
    if (navigator.sendBeacon?.(url, body)) return
    fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {})
  } catch {
    // Stats must never get in the visitor's way
  }
}

export const trackPageView = (pagePath) => sendEvent({ eventType: 'page_view', pagePath })

// serviceType: 'service' | 'plan'
export const trackServiceWhatsappClick = (serviceType, serviceId) =>
  sendEvent({ eventType: 'service_whatsapp_click', serviceType, serviceId, pagePath: window.location.pathname })

// placement: where a general WhatsApp button sits (navbar, footer, whyUs, ...); see components/whatsapp-link.jsx
export const trackGeneralWhatsappClick = (placement) =>
  sendEvent({ eventType: 'general_whatsapp_click', placement, pagePath: window.location.pathname })
