import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
        navigate(user?.role === "admin" ? "/admin" : "/dashboard", { replace: true });
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

  const expiryColor = expiryLeft <= 60 ? "#ef4444" : expiryLeft <= 120 ? "#f97316" : "#22c55e";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.6} }
        .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#0f1a16 0%,#1a2d26 50%,#0f1a16 100%); padding:80px 16px 40px; font-family:'Inter',sans-serif; }
        .auth-card { width:min(440px,100%); background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:40px; backdrop-filter:blur(20px); animation:fadeUp 0.5s ease; }
        .auth-logo { text-align:center; margin-bottom:24px; }
        .auth-logo-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(246,209,148,0.1); border:1px solid rgba(246,209,148,0.25); border-radius:999px; padding:6px 14px; color:#f6d194; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        .auth-title { text-align:center; margin:0 0 6px; font-family:'Playfair Display',serif; font-size:26px; color:#fff; }
        .auth-subtitle { text-align:center; margin:0 0 6px; color:rgba(255,255,255,0.5); font-size:14px; }
        .email-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(36,70,60,0.4); border:1px solid rgba(36,70,60,0.6); border-radius:999px; padding:6px 14px; color:#a7f3d0; font-size:13px; font-weight:600; margin:0 auto 24px; }
        .otp-row { display:flex; gap:10px; justify-content:center; margin:0 0 20px; }
        .otp-digit { width:52px; height:60px; background:rgba(255,255,255,0.06); border:2px solid rgba(255,255,255,0.12); border-radius:12px; color:#fff; font-size:24px; font-weight:700; text-align:center; font-family:'Courier New',monospace; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .otp-digit:focus { border-color:rgba(246,209,148,0.6); box-shadow:0 0 0 3px rgba(246,209,148,0.1); }
        .otp-digit.filled { border-color:rgba(34,197,94,0.5); background:rgba(34,197,94,0.06); }
        .otp-digit.has-error { border-color:#ef4444; }
        .timer { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:20px; font-size:13px; color:rgba(255,255,255,0.5); }
        .timer-value { font-family:'Courier New',monospace; font-size:15px; font-weight:700; }
        .verify-btn { width:100%; padding:14px; border:none; border-radius:10px; background:linear-gradient(135deg,#24463c,#1a3329); color:#f6d194; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; transition:opacity 0.2s,transform 0.2s; display:flex; align-items:center; justify-content:center; }
        .verify-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .verify-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .resend-section { text-align:center; margin-top:20px; }
        .resend-btn { background:none; border:none; font-family:inherit; font-size:13px; cursor:pointer; color:#f6d194; font-weight:600; padding:0; }
        .resend-btn:disabled { color:rgba(255,255,255,0.3); cursor:not-allowed; }
        .resend-info { font-size:12px; color:rgba(255,255,255,0.35); margin-top:4px; }
        .error-box { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:12px 14px; color:#fca5a5; font-size:13px; margin-bottom:16px; }
        .success-box { background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); border-radius:10px; padding:12px 14px; color:#86efac; font-size:13px; margin-bottom:16px; }
        .expired-notice { text-align:center; padding:20px; }
        .auth-footer { text-align:center; margin-top:20px; font-size:13px; color:rgba(255,255,255,0.4); }
        .auth-link { color:#f6d194; font-weight:600; text-decoration:none; }
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
              <p style={{ color: "#fca5a5", fontWeight: 600, marginBottom: 8 }}>⏰ Code Expired</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Request a new code below.</p>
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
              {resending && <Spinner size={14} color="#f6d194" />}
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
