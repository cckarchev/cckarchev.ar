import { useLayoutEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './routes/Home'
import Members from './routes/Members'
import Privacy from './routes/Privacy'
import Terms from './routes/Terms'
import GreathelmCards from './routes/tools/GreathelmCards'
import WarmasterMap from './routes/tools/WarmasterMap'
import { AuthProvider } from './context/AuthContext'
import { DEFAULT_TITLE, formatTitle } from './hooks/useDocumentTitle'

// Resets the tab title to the site default on every navigation. This runs in a
// layout effect, and React fires all layout effects before any passive effect
// in the same commit, so a route's own useDocumentTitle (a passive effect) runs
// afterwards and overrides this. The net effect: routes that set a title get
// it, and a route that forgets to falls back to the default instead of keeping
// the previous page's title.
function ResetDocumentTitle() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    document.title = formatTitle(DEFAULT_TITLE)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ResetDocumentTitle />
        <div className="flex flex-col min-h-dvh">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/tools/greathelm-cards" element={<GreathelmCards />} />
              <Route path="/tools/warmaster-map" element={<WarmasterMap />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
