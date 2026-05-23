import { Link, NavLink } from 'react-router-dom'
import AuthMenu from './AuthMenu'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center gap-5 px-4 py-2.5 bg-bg border-b border-accent/35 text-ink text-sm">
      <NavLink to="/" className="font-bold tracking-wider text-accent hover:text-ink no-underline">
        CCK
      </NavLink>
      <div className="flex gap-2 flex-wrap">
        <Link
          to="/tools/warmaster-map"
          className="text-ink hover:bg-accent/15 hover:text-accent rounded px-2.5 py-1.5 no-underline"
        >
          Warmaster Maps
        </Link>
        <Link
          to="/tools/greathelm-cards"
          className="text-ink hover:bg-accent/15 hover:text-accent rounded px-2.5 py-1.5 no-underline"
        >
          Greathelm Cards
        </Link>
      </div>
      <div className="ml-auto">
        <AuthMenu />
      </div>
    </nav>
  )
}
