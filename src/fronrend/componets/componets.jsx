import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../../img/logo.png'
import './componets.css'
import { useAuth } from '../../context/AuthContext'

const Components = () => {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((open) => !open)
  const closeMenu = () => setIsMenuOpen(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/amenities', label: 'Amenities' },
    { to: '/about', label: 'About Us' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blogs', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
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
              <span aria-hidden="true">×</span>
            </button>
           </div>

          <ul>
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}
                  end={to === '/'}
                >
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}

            <li>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className="menu__link book-now-btn"
              >
                Book Now
              </NavLink>
            </li>

            {user?.role === 'admin' ? (
              <li>
                <NavLink
                  to="/hh-cp-9f3m2q"
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}
                >
                  <span className="nav-link-emoji" aria-hidden="true">🔒</span>
                  <span>Admin Panel</span>
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/dashboard"
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}
                >
                  <span className="nav-link-emoji" aria-hidden="true">👤</span>
                  <span>Dashboard</span>
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
