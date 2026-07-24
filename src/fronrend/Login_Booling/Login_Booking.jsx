import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import "./Login_Booking.css";
import Components from "../componets/componets";
import { useAuth } from "../../context/AuthContext";
import background from '../../img/background.jpg';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();

const Login_Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, googleLogin, error, setError } = useAuth();

  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const handleGoogleResponseRef = useRef(null);

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

  // Update the ref to the latest callback function every render
  useEffect(() => {
    handleGoogleResponseRef.current = async (response) => {
      try {
        setLocalError("");
        const loggedInUser = await googleLogin(response.credential);
        setLocalSuccess("Logged in successfully with Google!");
        const dest = loggedInUser?.role === 'admin' ? '/hh-cp-9f3m2q' : (location.state?.from || '/dashboard');
        navigate(dest);
      } catch (err) {
        setLocalError(err.message || "Google Login failed");
      }
    };
  });

  // Handle Google OAuth initialization
  useEffect(() => {
    if (!user && googleReady) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "39198121017-ksa12cpsjaqv5mbsub25b6nonfnisp6u.apps.googleusercontent.com";
      if (!clientId || clientId.includes('your_google_client_id_here')) {
        setLocalError('Google sign-in is not configured yet.');
        return;
      }

      try {
        if (!window.isGoogleInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (handleGoogleResponseRef.current) {
                handleGoogleResponseRef.current(response);
              }
            },
          });
          window.isGoogleInitialized = true;
        }

        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            width: Math.max(btnContainer.offsetWidth || 280, 280),
          });
        }
      } catch (err) {
        console.error('Google login button initialization failed:', err);
        setLocalError('Google sign-in is currently unavailable.');
      }
    }
  }, [user, googleReady, googleLogin, navigate, location]);

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
            <img src={background} alt="Hotel Himalaya INN Khona landscape" className="auth-panel-image" />
            <div className="auth-panel-overlay" />
            <div className="auth-panel-content">
              <span className="left-badge">Hotel Himalaya INN Khona</span>
              <h1>Luxury stay starts here.</h1>
              <p>Sign in with Google to manage bookings, reserve rooms, and enjoy a smoother guest experience.</p>
            </div>
            <div className="left-decor">
              <div className="pill">24/7 Guest Support</div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right">
            {!user ? (
              <>
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

                {/* Google-Only Sign In */}
                <div className="google-only-signin">
                  <h2>Welcome</h2>
                  <p className="form-subtitle">Sign in with your Google account to continue.</p>

                  <div className="google-signin-card">
                    <div className="google-signin-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M43.611 20.083H42V20H24v8h11.303C33.973 32.23 29.423 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                        <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                        <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 35c-5.402 0-9.944-3.477-11.613-8.304l-6.524 5.026C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                        <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                      </svg>
                    </div>
                    <h3>Continue with Google</h3>
                    <p>Use your Google account to securely sign in. No separate password needed.</p>
                    <div className="google-btn-wrapper">
                      <div id="google-btn-container"></div>
                      {!googleReady && (
                        <div className="google-loading">
                          <div className="google-loading-spinner"></div>
                          <span>Loading Google Sign-In...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
