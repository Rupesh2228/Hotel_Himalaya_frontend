import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  return score; // 0–5
};

const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

// ── Eye icon ──────────────────────────────────────────────────────────────────
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

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{
    display: "inline-block", width: 18, height: 18,
    border: "2.5px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle", marginRight: 8,
  }} />
);

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = calcStrength(form.password);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [field]: "" }));
    setError("");
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email address";

    if (form.phone && !/^[+]?[\d\s\-().]{7,20}$/.test(form.phone))
      errs.phone = "Invalid phone number";

    if (!form.password) errs.password = "Password is required";
    else if (strength < 4) errs.password = "Password is too weak";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setError("");
    try {
      const data = await signup(
        form.name.trim(), form.email.trim(), form.phone.trim() || undefined,
        form.password, form.confirmPassword
      );
      // Navigate to OTP verification page with email state
      navigate("/verify-otp", { state: { email: data.email || form.email.trim() } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
        .auth-card { width:min(480px,100%); background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; padding:40px 40px 36px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); animation:fadeUp 0.5s ease; }
        .auth-logo { text-align:center; margin-bottom:28px; }
        .auth-logo-badge { display:inline-flex; align-items:center; gap:8px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:999px; padding:6px 14px; color:#4b5563; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        .auth-title { text-align:center; margin:0 0 6px; font-family:'Playfair Display',serif; font-size:28px; color:#111827; }
        .auth-subtitle { text-align:center; margin:0 0 28px; color:#6b7280; font-size:14px; }
        .form-row { display:grid; gap:16px; margin-bottom:16px; }
        .form-group { display:flex; flex-direction:column; gap:6px; }
        .form-label { font-size:13px; font-weight:600; color:#374151; }
        .form-input { background:#ffffff; border:1px solid #d1d5db; border-radius:10px; padding:12px 14px; color:#111827; font-family:inherit; font-size:14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; width:100%; box-sizing:border-box; }
        .form-input::placeholder { color:#9ca3af; }
        .form-input:focus { border-color:#24463c; box-shadow:0 0 0 3px rgba(36,70,60,0.1); }
        .form-input.error { border-color:#ef4444; }
        .input-wrap { position:relative; }
        .input-wrap .form-input { padding-right:44px; }
        .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; }
        .eye-btn:hover svg { stroke: #111827; }
        .field-error { font-size:12px; color:#dc2626; margin-top:2px; }
        .strength-bar-wrap { height:4px; border-radius:99px; background:#e5e7eb; margin-top:6px; overflow:hidden; }
        .strength-bar { height:100%; border-radius:99px; transition:width 0.3s,background 0.3s; }
        .strength-text { font-size:11px; margin-top:4px; font-weight:600; }
        .submit-btn { width:100%; padding:14px; border:none; border-radius:10px; background:linear-gradient(135deg,#24463c,#1a3329); color:#f6d194; font-family:inherit; font-size:15px; font-weight:700; letter-spacing:0.5px; cursor:pointer; margin-top:8px; transition:opacity 0.2s,transform 0.2s; display:flex; align-items:center; justify-content:center; }
        .submit-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 4px 12px rgba(36,70,60,0.2); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .error-box { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 14px; color:#b91c1c; font-size:13px; margin-bottom:16px; }
        .auth-footer { text-align:center; margin-top:20px; font-size:13px; color:#6b7280; }
        .auth-link { color:#24463c; font-weight:600; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-badge">🏔️ Hotel Himalaya INN</span>
          </div>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register to book rooms and manage your stays</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name & Email */}
            <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="signup-name" className={`form-input${fieldErrors.name ? " error" : ""}`} type="text" placeholder="John Doe" value={form.name} onChange={set("name")} autoComplete="name" />
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input id="signup-email" className={`form-input${fieldErrors.email ? " error" : ""}`} type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} autoComplete="email" />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>
            </div>

            {/* Phone */}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                <input id="signup-phone" className={`form-input${fieldErrors.phone ? " error" : ""}`} type="tel" placeholder="+977 9800000000" value={form.phone} onChange={set("phone")} autoComplete="tel" />
                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
              </div>
            </div>

            {/* Password */}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input id="signup-password" className={`form-input${fieldErrors.password ? " error" : ""}`} type={showPw ? "text" : "password"} placeholder="Min 8 chars, A-Z, 0-9, symbol" value={form.password} onChange={set("password")} autoComplete="new-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password"><EyeIcon open={showPw} /></button>
                </div>
                {form.password && (
                  <>
                    <div className="strength-bar-wrap">
                      <div className="strength-bar" style={{ width: `${(strength / 5) * 100}%`, background: strengthColor[strength] }} />
                    </div>
                    <span className="strength-text" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                  </>
                )}
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrap">
                  <input id="signup-confirm-password" className={`form-input${fieldErrors.confirmPassword ? " error" : ""}`} type={showCpw ? "text" : "password"} placeholder="Repeat your password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowCpw((s) => !s)} aria-label="Toggle confirm password"><EyeIcon open={showCpw} /></button>
                </div>
                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
              </div>
            </div>

            <button id="signup-submit" type="submit" className="submit-btn" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
