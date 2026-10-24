import { createContext, useContext } from 'react'

// Provided by AdminLayout once the admin is signed in:
// { api: createAdminApi(secret), logout(message?), handleError(error) → message or null (signs out on 401/403) }
export const AdminSessionContext = createContext(null)

export const useAdminSession = () => useContext(AdminSessionContext)
