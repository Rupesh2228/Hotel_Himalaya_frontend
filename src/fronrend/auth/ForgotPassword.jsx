import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Spinner = ({ size = 18, color = "#fff" }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    border: `2.5px solid rgba(255,255,255,0.25)`,
    borderTopColor: color, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle", marginRight: 8,
  }} />
);

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message || "A reset link has been sent to your email.");
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#0f1a16 0%,#1a2d26 50%,#0f1a16 100%); padding:80px 16px 40px; font-family:'Inter',sans-serif; }
        .auth-card { width:min(440px,100%); background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:40px; backdrop-filter:blur(20px); animation:fadeUp 0.5s ease; }
        .auth-logo { text-align:center; margin-bottom:24px; }
        .auth-logo-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(246,209,148,0.1); border:1px solid rgba(246,209,148,0.25); border-radius:999px; padding:6px 14px; color:#f6d194; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        .auth-title { text-align:center; margin:0 0 6px; font-family:'Playfair Display',serif; font-size:28px; color:#fff; }
        .auth-subtitle { text-align:center; margin:0 0 28px; color:rgba(255,255,255,0.5); font-size:14px; line-height:1.6; }
        .form-group { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .form-label { display:flex; justify-content:space-between; font-size:13px; font-weight:600; color:rgba(255,255,255,0.75); }
        .form-input { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:12px 14px; color:#fff; font-family:inherit; font-size:14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; box-sizing:border-box; }
        .form-input::placeholder { color:rgba(255,255,255,0.3); }
        .form-input:focus { border-color:rgba(246,209,148,0.5); box-shadow:0 0 0 3px rgba(246,209,148,0.08); }
        .submit-btn { width:100%; padding:14px; border:none; border-radius:10px; background:linear-gradient(135deg,#24463c,#1a3329); color:#f6d194; font-family:inherit; font-size:15px; font-weight:700; letter-spacing:0.5px; cursor:pointer; margin-top:8px; transition:opacity 0.2s,transform 0.2s; display:flex; align-items:center; justify-content:center; }
        .submit-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .error-box { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:12px 14px; color:#fca5a5; font-size:13px; margin-bottom:16px; }
        .success-box { background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); border-radius:10px; padding:12px 14px; color:#86efac; font-size:13px; margin-bottom:16px; line-height:1.5; }
        .auth-footer { text-align:center; margin-top:24px; font-size:13px; color:rgba(255,255,255,0.4); }
        .auth-link { color:#f6d194; font-weight:600; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-badge">🏔️ Hotel Himalaya INN</span>
          </div>

          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>

          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="you@email.com" 
                value={email} 
                onChange={(e) => { setEmail(e.target.value); setError(""); setMessage(""); }} 
                required 
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Sending Link…" : "Send Reset Link"}
            </button>
          </form>

          <div className="auth-footer">
            Remembered your password?{" "}
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
