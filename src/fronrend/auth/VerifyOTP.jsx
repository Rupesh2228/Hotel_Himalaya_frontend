import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Components from "../componets/componets";

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 5;

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ size = 18, color = "#fff" }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    border: `2.5px solid rgba(255,255,255,0.25)`,
    borderTopColor: color, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle", marginRight: 8,
  }} />
);

// ── Format mm:ss ──────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();

  // Email comes from signup navigation state
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown for OTP expiry (5 min)
  const [expiryLeft, setExpiryLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  // Resend cooldown (60 sec)
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  const inputRefs = useRef([]);

  // ── OTP expiry timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (expiryLeft <= 0) { setIsExpired(true); return; }
    const t = setInterval(() => {
      setExpiryLeft((p) => { if (p <= 1) { setIsExpired(true); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [expiryLeft]);

  // ── Resend cooldown timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // If no email in state, redirect to signup
  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  // ── OTP digit input handler ───────────────────────────────────────────────
  const handleOTPChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return; // only digits
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError("");
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOTPKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Verify ────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async (e) => {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the full 6-digit code."); return; }

    setLoading(true);
    setError("");
    try {
      const user = await verifyOTP(email, code);
      setSuccess("Email verified! Redirecting to your dashboard…");
      setTimeout(() => {
        navigate(user?.role === "admin" ? "/hh-cp-9f3m2q" : "/dashboard", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  }, [otp, email, verifyOTP, navigate]);

  // ── Resend ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS) return;
    setResending(true);
    setError("");
    setSuccess("");
    try {
      const data = await resendOTP(email);
      setSuccess(data.message || "A new code has been sent to your email.");
      setResendAttempts((a) => a + 1);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setExpiryLeft(OTP_EXPIRY_SECONDS);
      setIsExpired(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const expiryColor = expiryLeft <= 60 ? "#dc2626" : expiryLeft <= 120 ? "#ea580c" : "#16a34a";

  return (
    <>
      <Components />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.6} }
        .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f9fafb; padding:120px 16px 40px; font-family:'Inter',sans-serif; }
        .auth-card { width:min(440px,100%); background:#ffffff; border:1px solid #e5e7eb; border-radius:20px; padding:40px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); animation:fadeUp 0.5s ease; }
        .auth-logo { text-align:center; margin-bottom:24px; }
        .auth-logo-badge { display:inline-flex; align-items:center; gap:8px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:999px; padding:6px 14px; color:#4b5563; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        .auth-title { text-align:center; margin:0 0 6px; font-family:'Playfair Display',serif; font-size:26px; color:#111827; }
        .auth-subtitle { text-align:center; margin:0 0 6px; color:#6b7280; font-size:14px; }
        .email-badge { display:inline-flex; align-items:center; gap:6px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:999px; padding:6px 14px; color:#065f46; font-size:13px; font-weight:600; margin:0 auto 24px; }
        .otp-row { display:flex; gap:10px; justify-content:center; margin:0 0 20px; }
        .otp-digit { width:52px; height:60px; background:#ffffff; border:2px solid #d1d5db; border-radius:12px; color:#111827; font-size:24px; font-weight:700; text-align:center; font-family:'Courier New',monospace; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .otp-digit:focus { border-color:#24463c; box-shadow:0 0 0 3px rgba(36,70,60,0.1); }
        .otp-digit.filled { border-color:#22c55e; background:#f0fdf4; }
        .otp-digit.has-error { border-color:#ef4444; }
        .timer { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:20px; font-size:13px; color:#6b7280; }
        .timer-value { font-family:'Courier New',monospace; font-size:15px; font-weight:700; }
        .verify-btn { width:100%; padding:14px; border:none; border-radius:10px; background:linear-gradient(135deg,#24463c,#1a3329); color:#f6d194; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; transition:opacity 0.2s,transform 0.2s; display:flex; align-items:center; justify-content:center; }
        .verify-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 4px 12px rgba(36,70,60,0.2); }
        .verify-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .resend-section { text-align:center; margin-top:20px; }
        .resend-btn { background:none; border:none; font-family:inherit; font-size:13px; cursor:pointer; color:#24463c; font-weight:600; padding:0; }
        .resend-btn:disabled { color:#9ca3af; cursor:not-allowed; }
        .resend-info { font-size:12px; color:#9ca3af; margin-top:4px; }
        .error-box { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 14px; color:#b91c1c; font-size:13px; margin-bottom:16px; }
        .success-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 14px; color:#15803d; font-size:13px; margin-bottom:16px; }
        .expired-notice { text-align:center; padding:20px; }
        .auth-footer { text-align:center; margin-top:20px; font-size:13px; color:#6b7280; }
        .auth-link { color:#24463c; font-weight:600; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-badge">🏔️ Hotel Himalaya INN</span>
          </div>
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">We sent a 6-digit code to</p>
          <div style={{ textAlign: "center" }}>
            <span className="email-badge">✉ {email}</span>
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {!isExpired ? (
            <form onSubmit={handleVerify}>
              {/* OTP digit inputs */}
              <div className="otp-row" onPaste={handleOTPPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    id={`otp-digit-${idx}`}
                    className={`otp-digit${error ? " has-error" : ""}${digit ? " filled" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Expiry countdown */}
              <div className="timer">
                <span>Code expires in</span>
                <span className="timer-value" style={{ color: expiryColor }}>{fmt(expiryLeft)}</span>
              </div>

              <button id="verify-otp-submit" type="submit" className="verify-btn" disabled={loading || success}>
                {loading && <Spinner />}
                {loading ? "Verifying…" : "Verify Email"}
              </button>
            </form>
          ) : (
            <div className="expired-notice">
              <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 8 }}>⏰ Code Expired</p>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Request a new code below.</p>
            </div>
          )}

          {/* Resend section */}
          <div className="resend-section">
            <button
              id="resend-otp-btn"
              className="resend-btn"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS || resending}
            >
              {resending && <Spinner size={14} color="#24463c" />}
              {resending
                ? "Sending…"
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resendAttempts >= MAX_RESEND_ATTEMPTS
                ? "Max resends reached"
                : "Didn't receive a code? Resend"}
            </button>
            {resendAttempts > 0 && resendAttempts < MAX_RESEND_ATTEMPTS && (
              <p className="resend-info">{MAX_RESEND_ATTEMPTS - resendAttempts} resend{MAX_RESEND_ATTEMPTS - resendAttempts !== 1 ? "s" : ""} remaining</p>
            )}
          </div>

          <div className="auth-footer">
            Wrong email?{" "}
            <Link to="/signup" className="auth-link">Go back</Link>
          </div>
        </div>
      </div>
    </>
  );
}
