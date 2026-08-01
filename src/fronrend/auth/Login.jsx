import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

const VIEWS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  VERIFY_OTP: 'verify_otp',
  FORGOT: 'forgot',
  FORGOT_SENT: 'forgot_sent',
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, signup, verifyOTP, resendOTP, forgotPassword, extractError, googleLogin, logout } = useAuth()

  const [view, setView] = useState(VIEWS.LOGIN)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [showSignupPwd, setShowSignupPwd] = useState(false)

  // OTP
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')

  const isAdminPage = location.pathname.includes('hh-secure-portal')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdminPage && user.role === 'pending_admin') return // wait on login page
      const from = location.state?.from || (user.role === 'admin' ? '/hh-cp-9f3m2q' : '/dashboard')
      navigate(from, { replace: true })
    }
  }, [user, navigate, location.state, isAdminPage])

  // OTP resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const clearMessages = () => { setError(''); setSuccess('') }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault()
    clearMessages()
    setLoading(true)
    try {
      const result = await login(loginEmail.trim(), loginPassword)
      if (result?.unverified) {
        setOtpEmail(result.email)
        setView(VIEWS.VERIFY_OTP)
        setResendCooldown(60)
        return
      }
      const dest = result?.role === 'admin' ? '/hh-cp-9f3m2q' : '/dashboard'
      navigate(location.state?.from || dest, { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    clearMessages()
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const data = await signup(signupName.trim(), signupEmail.trim(), signupPhone.trim(), signupPassword, signupConfirm)
      setOtpEmail(data.email || signupEmail.trim())
      setView(VIEWS.VERIFY_OTP)
      setResendCooldown(60)
      setSuccess('Account created! Please check your email for the verification code.')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    clearMessages()
    setLoading(true)
    try {
      const user = await verifyOTP(otpEmail, otp.trim())
      const dest = user?.role === 'admin' ? '/hh-cp-9f3m2q' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    clearMessages()
    setLoading(true)
    try {
      await resendOTP(otpEmail)
      setSuccess('A new code has been sent to your email.')
      setResendCooldown(60)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    clearMessages()
    setLoading(true)
    try {
      await forgotPassword(forgotEmail.trim())
      setView(VIEWS.FORGOT_SENT)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (view === VIEWS.LOGIN && isAdminPage) {
      let interval;
      const initGoogle = () => {
        if (window.google) {
          if (interval) clearInterval(interval);
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
              clearMessages()
              setLoading(true)
              try {
                const result = await googleLogin(response.credential, true)
                if (result?.role !== 'pending_admin') {
                  const dest = result?.role === 'admin' ? '/hh-cp-9f3m2q' : '/dashboard'
                  navigate(location.state?.from || dest, { replace: true })
                }
              } catch (err) {
                setError(extractError(err))
              } finally {
                setLoading(false)
              }
            },
          })
          const btnContainer = document.getElementById('google-signin-btn')
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, { theme: 'outline', size: 'large', text: 'signin_with' })
          }
        }
      }
      initGoogle()
      if (!window.google) {
        interval = setInterval(initGoogle, 100)
      }
      return () => { if (interval) clearInterval(interval) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isAdminPage])

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderLogin = () => {
    if (isAdminPage) {
      if (user && user.role === 'pending_admin') {
        return (
          <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
            <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#b91c1c', lineHeight: '1.5', fontWeight: 'bold' }}>
              Your admin access is pending approval by a main admin. Please wait.
            </p>
            <button type="button" className="auth-submit-btn" onClick={() => logout()}>
              Sign Out
            </button>
          </div>
        )
      }

      return (
        <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
          <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#666', lineHeight: '1.5' }}>
            Please sign in with your authorized Google account to access the admin portal.
          </p>
          <div id="google-signin-btn" style={{ minHeight: '44px' }}></div>
          {loading && <span className="btn-spinner" style={{ marginTop: '1.5rem' }} />}
        </div>
      )
    }

    return (
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="your@email.com"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <div className="input-password-wrap">
            <input
              id="login-password"
              type={showLoginPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowLoginPwd(v => !v)} aria-label="Toggle password">
              {showLoginPwd ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button type="button" className="link-btn forgot-link" onClick={() => { clearMessages(); setView(VIEWS.FORGOT) }}>
          Forgot password?
        </button>
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Sign In'}
        </button>
        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <button type="button" className="link-btn" onClick={() => { clearMessages(); setView(VIEWS.SIGNUP) }}>
            Create one
          </button>
        </p>
      </form>
    )
  }

  const renderSignup = () => (
    <form className="auth-form" onSubmit={handleSignup} noValidate>
      <div className="form-group">
        <label htmlFor="signup-name">Full Name</label>
        <input id="signup-name" type="text" placeholder="Your full name" value={signupName} onChange={e => setSignupName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="signup-email">Email Address</label>
        <input id="signup-email" type="email" placeholder="your@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="form-group">
        <label htmlFor="signup-phone">Phone Number</label>
        <input id="signup-phone" type="tel" placeholder="+977 98XXXXXXXX" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="signup-password">Password</label>
        <div className="input-password-wrap">
          <input
            id="signup-password"
            type={showSignupPwd ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={signupPassword}
            onChange={e => setSignupPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button type="button" className="pwd-toggle" onClick={() => setShowSignupPwd(v => !v)} aria-label="Toggle password">
            {showSignupPwd ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="signup-confirm">Confirm Password</label>
        <input id="signup-confirm" type="password" placeholder="Repeat password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} required autoComplete="new-password" />
      </div>
      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Create Account'}
      </button>
      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={() => { clearMessages(); setView(VIEWS.LOGIN) }}>
          Sign In
        </button>
      </p>
    </form>
  )

  const renderOTP = () => (
    <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
      <p className="otp-description">
        We sent a 6-digit code to <strong>{otpEmail}</strong>. Enter it below to verify your account.
      </p>
      <div className="form-group">
        <label htmlFor="otp-code">Verification Code</label>
        <input
          id="otp-code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="123456"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          required
          autoComplete="one-time-code"
          className="otp-input"
        />
      </div>
      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Verify & Continue'}
      </button>
      <p className="auth-switch">
        Didn&apos;t receive it?{' '}
        <button type="button" className="link-btn" onClick={handleResendOTP} disabled={resendCooldown > 0 || loading}>
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </p>
      <p className="auth-switch">
        <button type="button" className="link-btn" onClick={() => { clearMessages(); setView(VIEWS.LOGIN) }}>
          ← Back to Sign In
        </button>
      </p>
    </form>
  )

  const renderForgot = () => (
    <form className="auth-form" onSubmit={handleForgotPassword} noValidate>
      <p className="otp-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <div className="form-group">
        <label htmlFor="forgot-email">Email Address</label>
        <input id="forgot-email" type="email" placeholder="your@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoComplete="email" />
      </div>
      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Send Reset Link'}
      </button>
      <p className="auth-switch">
        <button type="button" className="link-btn" onClick={() => { clearMessages(); setView(VIEWS.LOGIN) }}>
          ← Back to Sign In
        </button>
      </p>
    </form>
  )

  const renderForgotSent = () => (
    <div className="auth-form">
      <div className="success-icon">✉️</div>
      <p className="otp-description">
        If an account with <strong>{forgotEmail}</strong> exists, you'll receive a password reset link shortly. Please check your inbox and spam folder.
      </p>
      <button type="button" className="auth-submit-btn" onClick={() => { clearMessages(); setView(VIEWS.LOGIN) }}>
        Back to Sign In
      </button>
    </div>
  )

  // ── View titles / subtitles ──────────────────────────────────────────────────
  const titles = {
    [VIEWS.LOGIN]: { title: isAdminPage ? 'Admin Portal' : 'Welcome Back', sub: isAdminPage ? 'Restricted access — authorised personnel only.' : 'Sign in to your account to continue.' },
    [VIEWS.SIGNUP]: { title: 'Create Account', sub: 'Join us and enjoy exclusive benefits.' },
    [VIEWS.VERIFY_OTP]: { title: 'Verify Email', sub: 'Check your inbox for the verification code.' },
    [VIEWS.FORGOT]: { title: 'Reset Password', sub: 'We\'ll email you a reset link.' },
    [VIEWS.FORGOT_SENT]: { title: 'Email Sent', sub: 'Check your inbox.' },
  }
  const { title, sub } = titles[view]

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg-shape shape-1" />
        <div className="login-bg-shape shape-2" />
        <div className="login-bg-shape shape-3" />
      </div>

      <div className="login-card">
        {/* Branding */}
        <div className="login-branding">
          <div className="brand-emblem">
            <span>🏔</span>
          </div>
          <h2 className="brand-name">Hotel Himalaya INN Khona</h2>
          <div className="gold-divider" />
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{sub}</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success" role="status">
            <span>✅</span> {success}
          </div>
        )}

        {/* Forms */}
        {view === VIEWS.LOGIN && renderLogin()}
        {view === VIEWS.SIGNUP && renderSignup()}
        {view === VIEWS.VERIFY_OTP && renderOTP()}
        {view === VIEWS.FORGOT && renderForgot()}
        {view === VIEWS.FORGOT_SENT && renderForgotSent()}

        {/* Back to site */}
        <div className="back-to-site">
          <a href="/">← Back to website</a>
        </div>
      </div>
    </div>
  )
}
