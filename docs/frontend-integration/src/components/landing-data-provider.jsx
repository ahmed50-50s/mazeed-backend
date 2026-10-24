import { useEffect, useState } from 'react'
import { LandingDataContext } from '../context/landing-data-context'
import { defaults } from '../data/defaults'
import { getLandingData } from '../services/api'

// Fetches the site content once for the whole app. Renders the built-in content straight away and swaps in
// the API data when it arrives; if the API is unreachable the built-in content simply stays.
function LandingDataProvider({ children }) {
  const [data, setData] = useState(defaults)

  useEffect(() => {
    const controller = new AbortController()
    getLandingData({ signal: controller.signal })
      .then((result) => setData(result.data))
      .catch(() => {}) // only aborts reach here
    return () => controller.abort()
  }, [])

  return <LandingDataContext.Provider value={data}>{children}</LandingDataContext.Provider>
}

export default LandingDataProvider
