import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Components from "../componets/componets";

// ── Password strength calculator ──────────────────────────────────────────────
const calcStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[\W_]/.test(pw)) score++;
  return score;
};

const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.04-2.28 2.8-4.18 4.88-5.32"/>
      <path d="M1 1l22 22"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/>
      <circle cx="12" cy="12" r="2.3"/>
    </svg>
  );

const Spinner = ({ size = 18, color = "#fff" }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    border: `2.5px solid rgba(255,255,255,0.25)`,
    borderTopColor: color, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle", marginRight: 8,
  }} />
);

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = calcStrength(form.password);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (strength < 4) {
      setError("Please choose a stronger password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const user = await resetPassword(token, form.password, form.confirmPassword);
      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => {
        navigate(user?.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

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
        .auth-subtitle { text-align:center; margin:0 0 28px; color:#6b7280; font-size:14px; line-height:1.6; }
        .form-group { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .form-label { display:flex; justify-content:space-between; font-size:13px; font-weight:600; color:#374151; }
        .form-input { background:#ffffff; border:1px solid #d1d5db; border-radius:10px; padding:12px 14px; color:#111827; font-family:inherit; font-size:14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; box-sizing:border-box; }
        .form-input::placeholder { color:#9ca3af; }
        .form-input:focus { border-color:#24463c; box-shadow:0 0 0 3px rgba(36,70,60,0.1); }
        .input-wrap { position:relative; }
        .input-wrap .form-input { padding-right:44px; }
        .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; }
        .eye-btn:hover svg { stroke: #111827; }
        .strength-bar-wrap { height:4px; border-radius:99px; background:#e5e7eb; margin-top:6px; overflow:hidden; }
        .strength-bar { height:100%; border-radius:99px; transition:width 0.3s,background 0.3s; }
        .strength-text { font-size:11px; margin-top:4px; font-weight:600; }
        .submit-btn { width:100%; padding:14px; border:none; border-radius:10px; background:linear-gradient(135deg,#24463c,#1a3329); color:#f6d194; font-family:inherit; font-size:15px; font-weight:700; letter-spacing:0.5px; cursor:pointer; margin-top:8px; transition:opacity 0.2s,transform 0.2s; display:flex; align-items:center; justify-content:center; }
        .submit-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 4px 12px rgba(36,70,60,0.2); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .error-box { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 14px; color:#b91c1c; font-size:13px; margin-bottom:16px; }
        .success-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 14px; color:#15803d; font-size:13px; margin-bottom:16px; }
        .auth-footer { text-align:center; margin-top:24px; font-size:13px; color:#6b7280; }
        .auth-link { color:#24463c; font-weight:600; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-badge">🏔️ Hotel Himalaya INN</span>
          </div>

          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">Your new password must be different from previous used passwords.</p>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrap">
                <input 
                  className="form-input" 
                  type={showPw ? "text" : "password"} 
                  placeholder="Min 8 chars, A-Z, 0-9, symbol" 
                  value={form.password} 
                  onChange={set("password")} 
                  required 
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password">
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {form.password && (
                <>
                  <div className="strength-bar-wrap">
                    <div className="strength-bar" style={{ width: `${(strength / 5) * 100}%`, background: strengthColor[strength] }} />
                  </div>
                  <span className="strength-text" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-wrap">
                <input 
                  className="form-input" 
                  type={showCpw ? "text" : "password"} 
                  placeholder="Repeat new password" 
                  value={form.confirmPassword} 
                  onChange={set("confirmPassword")} 
                  required 
                />
                <button type="button" className="eye-btn" onClick={() => setShowCpw((s) => !s)} aria-label="Toggle confirm password">
                  <EyeIcon open={showCpw} />
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || success}>
              {loading && <Spinner />}
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
