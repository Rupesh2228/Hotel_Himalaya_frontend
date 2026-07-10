import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../../img/logo.png'
import './componets.css'
import { useAuth } from '../../context/AuthContext'

const Components = () => {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((open) => !open)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      <div className={isMenuOpen ? 'nav-backdrop open' : 'nav-backdrop'} onClick={closeMenu} />
      <header>
        <div className="nav-header">
          <h1 className="logo">
            <NavLink to="/" onClick={closeMenu}>
              <img src={logo} alt="Hotel himalaya" />
            </NavLink>
          </h1>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
            Menu
          </button>
        </div>

        <nav className={isMenuOpen ? 'nav open' : 'nav'}>
          <ul>
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Home</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>About Us</NavLink></li>
            <li><NavLink to="/services" className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Services</NavLink></li>
            <li><NavLink to="/tours" className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Tours</NavLink></li>
            <li><NavLink to="/gallery" className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Gallery</NavLink></li>
            <li><NavLink to="/events" className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Events</NavLink></li>
            <li><NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Contact</NavLink></li>
            {user ? (
              <li
                className="profile-nav-item"
                style={{ position: 'relative' }}
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <NavLink
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={closeMenu}
                  className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Profile
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
              <li><NavLink to="/login" onClick={closeMenu} className={({ isActive }) => isActive ? 'menu__link active' : 'menu__link'}>Login/Booking</NavLink></li>
            )}
          </ul>
        </nav>
      </header>
    </>
  )
}

export default Components
