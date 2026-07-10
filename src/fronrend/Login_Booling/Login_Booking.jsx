import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import "./Login_Booking.css";
import Components from "../componets/componets";
import { useAuth } from "../../context/AuthContext";
import background from '../../img/background.jpg';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();
let globalGoogleInitialized = false;

const Login_Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, signup, googleLogin, error, setError, verifySignupOTP, requestPasswordReset, verifyPasswordReset } = useAuth();

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [signupStep, setSignupStep] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);
  const [signupOTP, setSignupOTP] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(0);
  const [forgotOTP, setForgotOTP] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  // Booking states
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const selectedRoom = rooms.find((room) => room._id === selectedRoomId);
  const recommendedRooms = selectedRoomId
    ? rooms.filter((room) => Number(room.totalMembers || 0) >= memberCount)
    : [];

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rooms`);
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (err) {
        console.error('Failed to load rooms', err);
      }
    };

    loadRooms();
  }, []);

  useEffect(() => {
    const checkGoogleSdk = () => {
      const ready = Boolean(window.google?.accounts?.id);
      setGoogleReady(ready);
      return ready;
    };

    if (checkGoogleSdk()) return undefined;

    const timer = window.setTimeout(checkGoogleSdk, 800);
    const handleLoad = () => checkGoogleSdk();
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.clearTimeout(timer);
    };
  }, []);

  // Handle Google OAuth initialization
  useEffect(() => {
    if (!user && googleReady && !globalGoogleInitialized) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1043554381692-qdp5juu0prcha8n1ajc7bgtk2peu2uud.apps.googleusercontent.com";
      if (!clientId || clientId.includes('your_google_client_id_here')) {
        setLocalError('Google sign-in is not configured yet.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLocalError("");
              const loggedInUser = await googleLogin(response.credential);
              setLocalSuccess("Logged in successfully with Google!");
              const dest = loggedInUser?.role === 'admin' ? '/admin' : (location.state?.from || '/dashboard');
              navigate(dest);
            } catch (err) {
              setLocalError(err.message || "Google Login failed");
            }
          },
        });
        globalGoogleInitialized = true;

        const btnContainer = document.getElementById("google-btn-container");
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            width: Math.max(btnContainer.offsetWidth || 280, 280),
          });
        }
      } catch (error) {
        console.error('Google login button initialization failed:', error);
        setLocalError('Google sign-in is currently unavailable.');
      }
    }
  }, [user, googleReady, googleLogin, navigate, location]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");
    if (!loginEmail || !loginPassword) {
      setLocalError("Please enter all fields");
      return;
    }
    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      setLocalSuccess("Logged in successfully!");
      const dest = loggedInUser?.role === 'admin' ? '/admin' : (location.state?.from || '/dashboard');
      navigate(dest);
    } catch (err) {
      setLocalError(err.message || "Login failed");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");
    if (!signupName || !signupEmail || !signupPassword) {
      setLocalError("Please enter all fields");
      return;
    }
    if (signupPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    try {
      const resp = await signup(signupName, signupEmail, signupPassword);
      setLocalSuccess(resp.message || "Verification OTP sent to your email");
      setSignupStep(1);
    } catch (err) {
      setLocalError(err.message || "Signup failed");
    }
  };

  const handleVerifySignupOTP = async (e) => {
    e.preventDefault();
    setLocalError("");
    try {
      const user = await verifySignupOTP(signupEmail, signupOTP);
      setLocalSuccess("Account verified and logged in");
      const dest = user?.role === 'admin' ? '/admin' : (location.state?.from || '/dashboard');
      navigate(dest);
    } catch (err) {
      setLocalError(err.message || "Verification failed");
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");
    try {
      const resp = await requestPasswordReset(forgotEmail || loginEmail);
      setLocalSuccess(resp.message || 'If that email exists, an OTP was sent');
      setForgotStep(1);
    } catch (err) {
      setLocalError(err.message || 'Request failed');
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    setLocalError("");
    try {
      const resp = await verifyPasswordReset(forgotEmail || loginEmail, forgotOTP, forgotNewPassword);
      setLocalSuccess(resp.message || 'Password reset successful');
      setForgotMode(false);
      setForgotStep(0);
    } catch (err) {
      setLocalError(err.message || 'Reset failed');
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoomId || !checkIn || !checkOut) {
      alert("Please fill in all booking details.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedCheckIn = new Date(checkIn);
    parsedCheckIn.setHours(0, 0, 0, 0);
    if (parsedCheckIn < today) {
      alert('Check-in date cannot be in the past.');
      return;
    }
    const parsedCheckOut = new Date(checkOut);
    parsedCheckOut.setHours(0, 0, 0, 0);
    if (parsedCheckOut <= parsedCheckIn) {
      alert('Check-out date must be after the check-in date.');
      return;
    }

    if (!selectedRoom) {
      alert('Please choose a valid room.');
      return;
    }

    if (memberCount > Number(selectedRoom.totalMembers || 0)) {
      const recommendedRooms = rooms.filter((room) => Number(room.totalMembers || 0) >= memberCount);
      const recommendations = recommendedRooms.length
        ? `\n\nRecommended rooms:\n${recommendedRooms.map((room) => `- ${room.title} (${room.totalMembers || 1} members)`).join('\n')}`
        : '\n\nNo available room matches this member count right now.';

      alert(`Selected room only allows ${selectedRoom.totalMembers || 1} members. Please choose another room.${recommendations}`);
      return;
    }

    alert(`Booking Confirmed!\nRoom: ${selectedRoom.title}\nMembers: ${memberCount}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`);
  };


  return (
    <>
      <Components />
      <div className="container">
        <div className="card">
          <div className="left">
            <img src={background} alt="Hotel himalaya landscape" className="auth-panel-image" />
            <div className="auth-panel-overlay" />
            <div className="auth-panel-content">
              <span className="left-badge">Hotel himalaya Inn</span>
              <h1>Luxury stay starts here.</h1>
              <p>Sign in to manage bookings, reserve rooms, and enjoy a smoother guest experience.</p>
            </div>
            <div className="left-decor">
              <div className="pill">24/7 Guest Support</div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right">
            {!user ? (
              <>
                {/* Toggle */}
                <div className="toggle">
                  <button
                    className={isLogin ? "active" : ""}
                    onClick={() => {
                      setIsLogin(true);
                      setLocalError("");
                      setLocalSuccess("");
                      setError(null);
                    }}
                  >
                    Login
                  </button>
                  <button
                    className={!isLogin ? "active" : ""}
                    onClick={() => {
                      setIsLogin(false);
                      setLocalError("");
                      setLocalSuccess("");
                      setError(null);
                    }}
                  >
                    Signup
                  </button>
                </div>

                {/* Display Errors */}
                {(localError || error) && (
                  <div className="auth-message auth-error-message">
                    {localError || error}
                  </div>
                )}

                {/* Display Success */}
                {localSuccess && (
                  <div className="auth-message auth-success-message">
                    {localSuccess}
                  </div>
                )}

                {/* FORM */}
                {isLogin ? (
                  forgotMode ? (
                    <div>
                      <h2>Reset Password</h2>
                      <p className="form-subtitle">Enter your email to receive a reset OTP.</p>
                      <div className="form-group">
                        <label>Email address</label>
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@example.com" />
                      </div>
                      {forgotStep === 0 && (
                        <div className="form-actions">
                          <button className="btn" onClick={handleRequestReset}>Send OTP</button>
                          <button className="btn" onClick={() => { setForgotMode(false); setForgotStep(0); }}>Cancel</button>
                        </div>
                      )}
                      {forgotStep === 1 && (
                        <form onSubmit={handleVerifyReset}>
                          <div className="form-group">
                            <label>OTP</label>
                            <input value={forgotOTP} onChange={(e) => setForgotOTP(e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>New password</label>
                            <input type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} required />
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="btn">Reset Password</button>
                            <button type="button" className="btn" onClick={() => { setForgotMode(false); setForgotStep(0); }}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleLoginSubmit}>
                      <h2>Welcome Back</h2>
                      <p className="form-subtitle">Sign in to manage bookings and keep your profile up to date.</p>

                      <div className="form-group">
                        <label htmlFor="login-email">Email address</label>
                        <input
                          id="login-email"
                          type="email"
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group input-with-icon">
                        <label htmlFor="login-password">Password</label>
                        <input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <button type="button" aria-label="Toggle password visibility" className="pwd-toggle" onClick={() => setShowLoginPassword((s) => !s)}>
                          {showLoginPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.04-2.28 2.8-4.18 4.88-5.32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                              <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                              <circle cx="12" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.4" opacity="0.95"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="login-action-row">
                        <div className="form-actions">
                          <button type="submit" className="btn">Login</button>
                        </div>
                        <div>
                          <button type="button" className="link-like" onClick={() => { setForgotMode(true); setForgotEmail(loginEmail); }}>Forgot password?</button>
                        </div>
                      </div>

                      <div className="auth-social-section">
                        <div className="auth-divider"><span>Or continue with</span></div>
                        <div className="google-card google-card-simple">
                          <div className="google">
                            <div id="google-btn-container"></div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )
                ) : (
                  signupStep === 0 ? (
                    <form onSubmit={handleSignupSubmit}>
                      <h2>Create Account</h2>
                      <p className="form-subtitle">Register now to book rooms and manage your reservations.</p>

                      <div className="form-group">
                        <label htmlFor="signup-name">Full Name</label>
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="Your full name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="signup-email">Email address</label>
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group input-with-icon">
                        <label htmlFor="signup-password">Password</label>
                        <input
                          id="signup-password"
                          type={showSignupPassword ? 'text' : 'password'}
                          placeholder="Choose a password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                        <button type="button" aria-label="Toggle password visibility" className="pwd-toggle" onClick={() => setShowSignupPassword((s) => !s)}>
                          {showSignupPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.04-2.28 2.8-4.18 4.88-5.32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                              <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                              <circle cx="12" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.4" opacity="0.95"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn">Signup</button>
                      </div>
                      <div className="auth-social-section">
                        <div className="auth-divider"><span>Or continue with</span></div>
                        <div className="google-card">
                          <div className="google-copy">
                            <span>No extra password</span>
                            <p>Create your account with Google in one step.</p>
                          </div>
                          <div className="google">
                            <div id="google-btn-container"></div>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifySignupOTP}>
                      <h2>Verify your email</h2>
                      <p className="form-subtitle">Enter the OTP sent to {signupEmail}</p>
                      <div className="form-group">
                        <label>OTP</label>
                        <input type="text" value={signupOTP} onChange={(e) => setSignupOTP(e.target.value)} required />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn">Verify</button>
                        <button type="button" className="btn" onClick={() => { setSignupStep(0); }}>Back</button>
                      </div>
                    </form>
                  )
                )}
              </>
            ) : (
              <>
                {/* User is logged in - show Booking & Payment details */}
                <div className="welcome-user-card">
                  <span className="form-kicker">Signed in</span>
                  <h2>Welcome, {user.name}!</h2>
                  <p>You are signed in as {user.email}. Ready to reserve your stay?</p>
                </div>

                {/* BOOKING SECTION */}
                <form onSubmit={handleBookingSubmit} className="booking">
                  <h2>Book Your Stay</h2>

                  <div className="form-group">
                    <label htmlFor="room-select">Select Room</label>
                    <select
                      id="room-select"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      required
                    >
                      <option value="">Choose a room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.title} - up to {room.totalMembers || 1} members
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRoom && memberCount > Number(selectedRoom.totalMembers || 0) && (
                    <div className="capacity-alert">
                      <strong>Selected room capacity is {selectedRoom.totalMembers || 1} members.</strong>
                      <div className="capacity-suggestions">
                        Suggested rooms:
                        <ul>
                          {recommendedRooms.length > 0 ? (
                            recommendedRooms.map((room) => (
                              <li key={room._id}>{room.title} - up to {room.totalMembers || 1} members</li>
                            ))
                          ) : (
                            <li>No room fits this number of members right now.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="member-count">Number of Members</label>
                    <input
                      id="member-count"
                      type="number"
                      min="1"
                      value={memberCount}
                      onChange={(e) => setMemberCount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="date-row">
                    <div className="form-group">
                      <label>Check-in</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Check-out</label>
                      <input
                        type="date"
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn gold">Confirm Booking</button>
                </form>

                {/* payment removed - bookings only */}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login_Booking;
