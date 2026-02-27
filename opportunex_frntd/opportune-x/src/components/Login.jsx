import React, { useState } from "react";
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLayout from "./shared/AuthLayout";
import { loginUser } from "../services/authService";
import { toast } from "react-hot-toast";

const Login = ({ onLoginSuccess, onSwitch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [collegeId, setCollegeId] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || !collegeId) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await loginUser({ email, password, collegeId });
            const { token, role, collegeId: returnedCollegeId } = res.data;

            if (token && role && returnedCollegeId) {
                toast.success("Welcome back! Syncing your dashboard...");
                if (typeof onLoginSuccess === "function") {
                    onLoginSuccess(token, role, returnedCollegeId);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your credentials to access your academic portal."
        >
            <form onSubmit={handleSubmit}>

                {/* Institution ID */}
                <div className="form-field" style={{ marginBottom: 14 }}>
                    <label>Institution ID</label>
                    <div style={{ position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 10, top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)", display: "flex", alignItems: "center"
                        }}>
                            <Building2 size={15} />
                        </span>
                        <input
                            type="text"
                            placeholder="e.g. PICT-2025-CS"
                            value={collegeId}
                            onChange={(e) => setCollegeId(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: 34 }}
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="form-field" style={{ marginBottom: 14 }}>
                    <label>Email Address</label>
                    <div style={{ position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 10, top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)", display: "flex", alignItems: "center"
                        }}>
                            <Mail size={15} />
                        </span>
                        <input
                            type="email"
                            placeholder="arjun.mehra@pict.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: 34 }}
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="form-field" style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <label style={{ marginBottom: 0 }}>Password</label>
                        <button
                            type="button"
                            onClick={() => onSwitch("forgot")}
                            className="btn-text"
                            style={{ fontSize: 11.5, padding: "2px 0" }}
                        >
                            Forgot password?
                        </button>
                    </div>
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

                {/* Remember me */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                    <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        style={{ accentColor: "var(--accent)", width: 15, height: 15, cursor: "pointer" }}
                    />
                    <label htmlFor="remember-me" style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: "var(--text-muted)",
                        cursor: "pointer"
                    }}>
                        Remember this device
                    </label>
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
                            <span>Sign In to Dashboard</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="login-divider" />

                {/* Register link */}
                <div className="login-register-row">
                    New to the ecosystem?{" "}
                    <button type="button" onClick={() => onSwitch("register")}>
                        Create an Account
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
