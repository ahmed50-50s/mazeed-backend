import { api } from './api'

// Admin endpoints (x-admin-secret). Errors are the same ApiError as the public client:
// { message, status, details: [{ field, message }] }; 401/403 mean the secret is missing or wrong.
export function createAdminApi(secret) {
  const auth = { headers: { 'x-admin-secret': secret } }
  const data = (response) => response.data.data

  return {
    // Collections (/services, /pricing-plans, /showcase, /testimonials), hidden items included
    list: (path) => api.get(path, { ...auth, params: { includeInactive: true } }).then(data),
    create: (path, body) => api.post(path, body, auth).then(data),
    update: (path, id, body) => api.patch(`${path}/${id}`, body, auth).then(data),
    remove: (path, id) => api.delete(`${path}/${id}`, auth).then(data),

    // Site settings: PATCH deep-merges objects and replaces arrays
    getSettings: () => api.get('/settings', auth).then(data),
    updateSettings: (body) => api.patch('/settings', body, auth).then(data),

    analyticsSummary: ({ signal } = {}) => api.get('/analytics/summary', { ...auth, signal }).then(data),
  }
}

export const isUnauthorized = (error) => error?.status === 401 || error?.status === 403
