import { createContext } from 'react'
import { defaults } from '../data/defaults'

// Site content shared by every page. Starts with the built-in defaults so nothing waits on the network.
export const LandingDataContext = createContext(defaults)
