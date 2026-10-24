import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import Navbar from './navbar'
import Footer from './footer'
import LandingDataProvider from './landing-data-provider'
import { trackPageView } from '../services/api'

// Shared shell for every page (inside the site content provider): navbar on top, the current route in the middle, footer at the bottom
function Layout() {
  const { pathname, hash } = useLocation()
  // Routes marked `handle: { skipPageView: true }` (the catch-all redirect) are not real pages
  const skipPageView = useMatches().some((match) => match.handle?.skipPageView)
  const lastTrackedPath = useRef(null)

  // New page starts at the top; links like /#courses scroll to their section once the page is rendered
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  // One page view per route change: re-renders, #section jumps and StrictMode's double effect don't count again
  useEffect(() => {
    if (skipPageView || lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname
    trackPageView(pathname)
  }, [pathname, skipPageView])

  return (
    <LandingDataProvider>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </LandingDataProvider>
  )
}

export default Layout
