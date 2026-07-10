import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
    { to: '/', label: 'Home', emoji: '🏠' },
    { to: '/about', label: 'About Us', emoji: '🏨' },
    { to: '/services', label: 'Services', emoji: '🛎️' },
    { to: '/tours', label: 'Tours', emoji: '🗺️' },
    { to: '/gallery', label: 'Gallery', emoji: '📸' },
    { to: '/events', label: 'Events', emoji: '🎉' },
    { to: '/contact', label: 'Contact', emoji: '📞' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={isMenuOpen ? 'nav-backdrop open' : 'nav-backdrop'}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header>
        <div className="nav-header">
          <h1 className="logo">
            <NavLink to="/" onClick={closeMenu}>
              <img src={logo} alt="Hotel Himalayan" />
            </NavLink>
          </h1>

          {/* Animated hamburger toggle */}
          <button
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
          >
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
          </button>
        </div>

        {/* Slide-out mobile drawer */}
        <nav className={isMenuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">

          {/* Drawer header */}
          <div className="nav-drawer-header">
            <img src={logo} alt="Hotel Himalayan" className="drawer-logo" />
            <div className="drawer-hotel-name">
              <span className="drawer-title">Hotel Himalayan</span>
              <span className="drawer-subtitle">Luxury & Comfort</span>
            </div>
            <button className="drawer-close-btn" onClick={closeMenu} aria-label="Close menu">
              ✕
            </button>
          </div>

          <ul>
            {navLinks.map(({ to, label, emoji }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}
                  end={to === '/'}
                >
                  <span className="nav-link-emoji">{emoji}</span>
                  {label}
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
                  <span className="nav-link-emoji">👤</span>
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
                  <span className="nav-link-emoji">🔐</span>
                  Login / Book Now
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
