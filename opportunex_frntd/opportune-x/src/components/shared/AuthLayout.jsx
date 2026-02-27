import React from "react";
import { GraduationCap, Sparkles, ShieldCheck, Rocket, BookOpen, Target, Shield, BarChart3, Quote } from "lucide-react";

const AuthLayout = ({ children, title, subtitle, illustrationIcon: Icon }) => {
    return (
        <div className="login-page">
            {/* ── LEFT PANEL ─────────────────────────────────────────── */}
            <div className="login-left">
                {/* Brand */}
                <div className="login-left-brand">
                    <div className="login-left-brand-icon">
                        <GraduationCap size={20} color="white" />
                    </div>
                    <span className="login-left-brand-name">OpportuneX</span>
                </div>

                {/* Mid content */}
                <div className="login-left-middle">
                    <h1 className="login-left-title">
                        Empowering the next<br />
                        <em>engineering</em> leaders
                    </h1>
                    <p className="login-left-desc">
                        Access premium placements, industry-led training, and global
                        internships through the official technology portal of PICT.
                    </p>

                    {/* Motivational Quote Card */}
                    <div className="login-feature-card" style={{
                        marginTop: 32,
                        padding: "24px",
                        background: "rgba(255,255,255,0.03)",
                        borderLeft: "4px solid var(--accent)",
                        position: "relative"
                    }}>
                        <Quote size={24} style={{ color: "var(--accent)", opacity: 0.6, marginBottom: 14 }} />
                        <p style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 17,
                            fontStyle: "italic",
                            color: "var(--sidebar-txt)",
                            lineHeight: 1.6,
                            margin: 0
                        }}>
                            "Dreams is not what you see in sleep, <br />
                            is the thing which doesn't let you sleep."
                        </p>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 2,
                            color: "var(--sidebar-mut)",
                            marginTop: 16,
                            fontWeight: 600
                        }}>
                            — Dr. APJ Abdul Kalam
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="login-left-footer">
                    © 2026 OpportuneX · TechFiesta Ecosystem
                </div>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
            <div className="login-right">
                <div className="login-form-box">
                    <h2 className="login-form-title">{title}</h2>
                    <p className="login-form-subtitle">{subtitle}</p>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
