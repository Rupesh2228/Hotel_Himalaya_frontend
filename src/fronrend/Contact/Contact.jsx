import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Components from "../componets/componets"
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaClock } from "react-icons/fa";
import "./Contact.css"
import LastComponent from '../componets/LastComponents'
import background from '../../img/background.jpg'
import { getApiUrl } from '../../config/api'

const Contact = () => {
  return (
    <>
      <Components />

      <main className="contact-page">
        <section className="contact-hero">
          <div className="hero-copy">
            <span className="hero-label">Get in touch</span>
            <h1>Let's make your stay unforgettable.</h1>
            <p>
              Whether you have a question about availability, need help planning your trip, or want a special room request,
              our team is ready to help.
            </p>
            <div className="hero-actions">
              <a href="tel:+97715591234" className="contact-primary-action">Call Reception</a>
              <a href="mailto:info@hotelkhokana.com" className="contact-secondary-action">Email Us</a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Hotel Himalaya INN Khona Khona INN Khona">
            <img src={background} alt="Hotel Himalaya INN Khona Khona INN Khona" />
            <div className="hero-visual-card">
              <span>Open all day</span>
              <strong>24/7 Guest Support</strong>
            </div>
          </div>
        </section>

        <section className="contact-grid">
          <div className="contact-info-panel">
            <div className="contact-card">
              <span className="section-kicker">Hotel Himalaya INN Khona Khona INN Khona</span>
              <h2>Contact Details</h2>
              <p>Reach our front desk or reservation team anytime. We are happy to answer your questions and assist with bookings.</p>
            </div>

            <div className="contact-card contact-details">
              <div className="info-group">
                <div className="icon-box"><FaPhoneAlt /></div>
                <div>
                  <h3>Call Us</h3>
                  <p><a href="9841558313">9841558313</a></p>
                </div>
              </div>
              <div className="info-group">
                <div className="icon-box"><FaEnvelope /></div>
                <div>
                  <h3>Email Us</h3>
                  <p><a href="hotelhikhona@gmail.com">hotelhikhona@gmail.com</a></p>
                </div>
              </div>
              <div className="info-group">
                <div className="icon-box"><FaMapMarkerAlt /></div>
                <div>
                  <h3>Location</h3>
                  <p>Khokana, Lalitpur</p>
                  <p>Bagmati Province, Nepal</p>
                </div>
              </div>
              <div className="info-group">
                <div className="icon-box"><FaClock /></div>
                <div>
                  <h3>Reception Hours</h3>
                   <p>24/7 service</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-panel">
            <ContactForm />
          </div>
        </section>

        <section className="contact-footer-cta">
          <div>
            <span className="section-kicker">Ready to arrive?</span>
            <h2>Visit us for warm Nepali hospitality</h2>
            <p>
              Plan your stay at Hotel Himalaya INN Khona and enjoy comfort, culture, and caring service in the heart of Nepal.
            </p>
          </div>
        </section>

        <footer className="contact-footer">
          <LastComponent />
        </footer>
      </main>
    </>
  )
}

export default Contact

const MESSAGES_KEY = 'hotel_messages'

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [messageText, setMessageText] = useState('')
  const [status, setStatus] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  // If user returned from login, prefill form from pending data
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pending_contact')
      if (raw) {
        const pending = JSON.parse(raw)
        if (pending) {
          setName(pending.name || '')
          setEmail(pending.email || '')
          setPhone(pending.phone || '')
          setMessageText(pending.message || '')
        }
        sessionStorage.removeItem('pending_contact')
      }
    } catch (err) {
      console.error('Failed to restore pending contact', err)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !messageText.trim()) {
      setStatus('Please fill in all fields')
      return
    }

    try {
      setStatus('Sending...')
      const API_URL = getApiUrl()
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: messageText.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setStatus('Message sent — thank you!')
      setName('')
      setEmail('')
      setPhone('')
      setMessageText('')
    } catch (err) {
      console.error(err)
      setStatus('Failed to send message')
    }
  }

  return (
    <div className="contact-form">
      <span className="section-kicker">Message us</span>
      <h2>Send Us a Message</h2>
      <p className="form-intro">Tell us what you need and we will get back to you as soon as possible.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} type="text" id="name" name="name" className="input-field" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" id="email" name="email" className="input-field" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" id="phone" name="phone" className="input-field" placeholder="e.g. +977 98XXXXXXXX" />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea value={messageText} onChange={e => setMessageText(e.target.value)} id="message" name="message" rows="5" className="input-field"></textarea>
        </div>
        <button type="submit" className="btn-cta">Send Message</button>
        {status && <div className="form-status">{status}</div>}
      </form>
    </div>
  )
}
