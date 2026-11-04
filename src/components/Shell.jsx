import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import { Wordmark } from './Wordmark'
import { useToast } from '../toast'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/stores', label: 'Stores' },
  { to: '/owners', label: 'Store Owners' },
  { to: '/content', label: 'Content' },
  { to: '/users', label: 'Creators' },
]

export function Shell() {
  const { session, signOut } = useAuth()
  const toast = useToast()

  return (
    <div className="shell">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <aside className="rail">
        <NavLink to="/" className="rail__brand" end aria-label="Hunt, overview">
          <Wordmark />
          <span className="rail__role">Superadmin</span>
        </NavLink>
        <nav className="rail__nav" aria-label="Desk">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'rail__link is-active' : 'rail__link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="rail__foot">
          <span className="rail__email" title={session?.user?.email}>
            {session?.user?.email}
          </span>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => {
              toast('Signed out')
              signOut()
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main id="content" className="main">
        <Outlet />
      </main>
    </div>
  )
}
