import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Components from "../componets/componets";





export default function Login() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const [error, setError] = useState("");

  
  const [googleReady, setGoogleReady] = useState(false);
  const handleGoogleResponseRef = useRef(null);



  // Google setup
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

  useEffect(() => {
    handleGoogleResponseRef.current = async (response) => {
      try {
        setError("");
        const loggedInUser = await googleLogin(response.credential);
        if (loggedInUser?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setError("Your account is pending admin approval.");
        }
      } catch (err) {
        setError(err.message || "Google Login failed");
      }
    };
  });

  useEffect(() => {
    if (googleReady) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "39198121017-ksa12cpsjaqv5mbsub25b6nonfnisp6u.apps.googleusercontent.com";
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
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: Math.max(btnContainer.offsetWidth || 280, 280),
          });
        }
      } catch (err) {
        console.error('Google login button init failed:', err);
      }
    }
  }, [googleReady]);

  return (
    <>
      <Components />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f9fafb; padding:120px 16px 40px; font-family:'Inter',sans-serif; }
        .auth-card { width:min(440px,100%); background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; padding:40px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); animation:fadeUp 0.5s ease; }
        .auth-logo { text-align:center; margin-bottom:24px; }
        .auth-logo-badge { display:inline-flex; align-items:center; gap:8px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:999px; padding:6px 14px; color:#4b5563; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        .auth-title { text-align:center; margin:0 0 6px; font-family:'Playfair Display',serif; font-size:28px; color:#111827; }
        .auth-subtitle { text-align:center; margin:0 0 28px; color:#6b7280; font-size:14px; }
        .form-group { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .form-label { display:flex; justify-content:space-between; font-size:13px; font-weight:600; color:#374151; }
        .form-input { background:#ffffff; border:1px solid #d1d5db; border-radius:10px; padding:12px 14px; color:#111827; font-family:inherit; font-size:14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; box-sizing:border-box; }
        .form-input::placeholder { color:#9ca3af; }
        .form-input:focus { border-color:#24463c; box-shadow:0 0 0 3px rgba(36,70,60,0.1); }
        .input-wrap { position:relative; }
        .input-wrap .form-input { padding-right:44px; }
        .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; }
        .eye-btn:hover svg { stroke: #111827; }
        .submit-btn { width:100%; padding:14px; border:none; border-radius:10px; background:linear-gradient(135deg,#24463c,#1a3329); color:#f6d194; font-family:inherit; font-size:15px; font-weight:700; letter-spacing:0.5px; cursor:pointer; margin-top:8px; transition:opacity 0.2s,transform 0.2s; display:flex; align-items:center; justify-content:center; }
        .submit-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 4px 12px rgba(36,70,60,0.2); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        
        .error-box { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 14px; color:#b91c1c; font-size:13px; margin-bottom:16px; display:flex; flex-direction:column; gap:8px; }
        .resend-btn-small { align-self:flex-start; background:#fee2e2; border:1px solid #fca5a5; color:#b91c1c; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s; }
        .resend-btn-small:hover { background:#fecaca; }

        .auth-footer { text-align:center; margin-top:20px; font-size:13px; color:#6b7280; }
        .auth-link { color:#24463c; font-weight:600; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
        .divider { display:flex; align-items:center; gap:12px; margin:24px 0; color:#9ca3af; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:#e5e7eb; }
        .google-wrap { display:flex; justify-content:center; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
                     </div>

          <h1 className="auth-title">Admin Portal</h1>
          <p className="auth-subtitle">Sign in to manage the hotel</p>

          {error && (
            <div className="error-box">
              <span>{error}</span>
            </div>
          )}

          <div className="google-wrap">
            <div id="google-btn-container" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              {!googleReady && <span style={{ color: "#6b7280", fontSize: 13 }}>Loading Google...</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
