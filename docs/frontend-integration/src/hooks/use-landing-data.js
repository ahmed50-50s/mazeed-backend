import { useContext } from 'react'
import { LandingDataContext } from '../context/landing-data-context'

// Site content (GET /api/v1/landing-data merged over the built-in defaults). Always defined, never loading.
export const useLandingData = () => useContext(LandingDataContext)
