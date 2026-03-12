import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert, Building2 } from "lucide-react";
import AuthLayout from "./shared/AuthLayout";
import toast from './common/toastManager';

const ForgotPassword = ({ onSwitch }) => {
    const [email, setEmail] = useState("");
    const [collegeId, setCollegeId] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !collegeId) {
            toast.error("Please enter your registered email and Institution ID.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, collegeId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to initiate reset");

            setIsSubmitted(true);
            toast.success("Security token dispatched successfully!");
        } catch (err) {
            toast.error(err.message || "System error. Please verify your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout
                title="Sync Successful"
                subtitle="A recovery link has been dispatched to your inbox."
                illustrationIcon={CheckCircle2}
            >
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            width: 80, height: 80,
                            background: "rgba(34,197,94,0.1)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px"
                        }}
                    >
                        <CheckCircle2 size={40} style={{ color: "var(--green)" }} />
                    </motion.div>

                    <div style={{ marginBottom: 32 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                            We've sent a secure reset link to <br />
                            <strong style={{ color: "var(--text)" }}>{email}</strong>
                        </p>
                    </div>

                    <div className="panel" style={{ background: "rgba(27, 79, 216, 0.05)", border: "1px solid rgba(27, 79, 216, 0.1)", padding: 16, marginBottom: 32, textAlign: "left" }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <ShieldAlert style={{ color: "var(--accent)", flexShrink: 0 }} size={18} />
                            <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                                If you don't see the email within 5 minutes, please check your spam folder or ensure the email address provided is correct.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onSwitch("login")}
                        className="login-submit-btn"
                        style={{ background: "var(--text)" }}
                    >
                        <ArrowLeft size={18} />
                        <span>Return to Login</span>
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Identity Recovery"
            subtitle="Lost your access? No problem. We'll send you a secure restore link."
            illustrationIcon={ShieldAlert}
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
                <div className="form-field" style={{ marginBottom: 24 }}>
                    <label>Registered Email Address</label>
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

                <button
                    type="submit"
                    disabled={loading}
                    className="login-submit-btn"
                >
                    {loading ? (
                        <div className="spinner" />
                    ) : (
                        <>
                            <span>Dispatch Recovery Link</span>
                            <Send size={15} />
                        </>
                    )}
                </button>

                <div className="login-divider" />

                <div className="login-register-row">
                    Remembered your password?{" "}
                    <button type="button" onClick={() => onSwitch("login")}>
                        Go Back
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;
