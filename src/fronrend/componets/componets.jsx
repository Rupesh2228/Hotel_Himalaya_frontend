import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  GalleryHorizontalEnd,
  Home,
  Hotel,
  LockKeyhole,
  Map,
  Menu,
  Phone,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import logo from '../../img/logo.png'
import './componets.css'
import { useAuth } from '../../context/AuthContext'

const Components = () => {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((open) => !open)
  const closeMenu = () => setIsMenuOpen(false)

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About Us', icon: Hotel },
    { to: '/services', label: 'Services', icon: Sparkles },
    { to: '/tours', label: 'Tours', icon: Map },
    { to: '/gallery', label: 'Gallery', icon: GalleryHorizontalEnd },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/contact', label: 'Contact', icon: Phone },
  ]

  return (
    <>
      <div
        className={isMenuOpen ? 'nav-backdrop open' : 'nav-backdrop'}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header className="site-header">
        <div className="nav-header">
          <h1 className="logo">
            <NavLink to="/" onClick={closeMenu} aria-label="Hotel Himalaya INN Khona ">
              <img src={logo} alt="Hotel Himalaya INN Khona" />
              <span className="logo-wordmark">Hotel Himalaya INN Khona </span>
            </NavLink>
          </h1>

          <button
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
          >
            <Menu className="menu-toggle-icon" aria-hidden="true" />
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
          </button>
        </div>

        <nav className={isMenuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
          <div className="nav-drawer-header">
            <img src={logo} alt="Hotel Himalaya INN Khona Khona INN Khona" className="drawer-logo" />
            <div className="drawer-hotel-name">
              <span className="drawer-title">Hotel Himalaya INN Khona </span>
              <span className="drawer-subtitle">Luxury & Comfort</span>
            </div>
            <button className="drawer-close-btn" onClick={closeMenu} aria-label="Close menu">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <ul>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}
                  end={to === '/'}
                >
                  <Icon className="nav-link-icon" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}

            {user ? (
              <li
                className="profile-nav-item"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <NavLink
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link profile-link active' : 'menu__link profile-link'}
                >
                  <UserRound className="nav-link-icon" aria-hidden="true" />
                  <span>{user.name || 'Profile'}</span>
                </NavLink>
                {isProfileOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="profile-user-info">
                      Logged in as:<br />
                      <strong>{user.name}</strong>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link login-link active' : 'menu__link login-link'}
                >
                  <LockKeyhole className="nav-link-icon" aria-hidden="true" />
                  <span>Login / Book Now</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  )
}

export default Components
