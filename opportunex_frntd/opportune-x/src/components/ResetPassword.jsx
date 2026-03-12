import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import AuthLayout from "./shared/AuthLayout";
import toast from './common/toastManager';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setIsSuccess(true);
      toast.success("Password reset! You can now sign in.");
    } catch (err) {
      toast.error(err.message || "System error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Access Restored"
        subtitle="Your password has been successfully updated."
        illustrationIcon={CheckCircle2}
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{
            width: 72, height: 72,
            background: "rgba(34,197,94,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <CheckCircle2 size={36} style={{ color: "var(--green, #22c55e)" }} />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Your identity has been restored. Sign in with your new password.
          </p>
          <button
            onClick={() => navigate("/")}
            className="login-submit-btn"
          >
            <span>Go to Sign In</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Secure Reset"
      subtitle="Define a new high-strength password for your OpportuneX identity."
      illustrationIcon={ShieldCheck}
    >
      <form onSubmit={handleSubmit}>

        {/* New Password */}
        <div className="form-field" style={{ marginBottom: 14 }}>
          <label>New Secure Password</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)", display: "flex", alignItems: "center"
            }}>
              <Lock size={15} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 34, paddingRight: 38 }}
              required
            />
            <button
              type="button"
              className="pw-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-field" style={{ marginBottom: 24 }}>
          <label>Confirm Password</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)", display: "flex", alignItems: "center"
            }}>
              <Lock size={15} />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 34, paddingRight: 38 }}
              required
            />
            <button
              type="button"
              className="pw-eye-btn"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="login-submit-btn"
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            <>
              <span>Restore My Access</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="login-divider" />

        <div className="login-register-row">
          Remember your password?{" "}
          <button type="button" onClick={() => navigate("/")}>
            Return to Sign In
          </button>
        </div>

      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
