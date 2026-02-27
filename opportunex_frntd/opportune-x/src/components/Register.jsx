import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Building2, UserCircle, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, Circle, Rocket } from "lucide-react";
import AuthLayout from "./shared/AuthLayout";
import { registerUser, getPublicSettings } from "../services/authService";
import { toast } from "react-hot-toast";

const Register = ({ onSwitch, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        collegeId: "",
        role: "student",
        agreedToTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(null);

    React.useEffect(() => {
        getPublicSettings().then(res => {
            if (res.data) setSettings(res.data);
        }).catch(err => {
            console.error("Failed to fetch public settings", err);
        });
    }, []);

    // Filter roles available for registration based on live settings
    // NOTE: Faculty accounts are admin-only — not allowed in public registration
    const rawRoles = [
        { id: "student", label: "Student", icon: UserCircle, key: "studentRegistration" },
        { id: "company", label: "Company Partner", icon: Building2, key: "companyRegistration" }
    ];


    const roles = rawRoles.filter(r => !settings || settings[r.key] !== false);

    // Auto-select first available role if current is disabled
    React.useEffect(() => {
        if (settings && settings[`${formData.role}Registration`] === false) {
            if (roles.length > 0) {
                setFormData(prev => ({ ...prev, role: roles[0].id }));
            }
        }
    }, [settings, formData.role, roles]);

    const passwordValidation = useMemo(() => {
        const p = formData.password;
        return {
            length: p.length >= 8,
            uppercase: /[A-Z]/.test(p),
            number: /[0-9]/.test(p),
            special: /[@$!%*?&]/.test(p)
        };
    }, [formData.password]);

    const passwordStrength = Object.values(passwordValidation).filter(Boolean).length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(passwordValidation).filter(Boolean).length < 4) {
            toast.error("Password does not meet security requirements.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (!formData.agreedToTerms) {
            toast.error("You must agree to the Terms & Conditions.");
            return;
        }

        setLoading(true);
        try {
            const res = await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                collegeId: formData.collegeId
            });

            const { token, role: returnedRole, collegeId: returnedCollegeId, message } = res.data;

            if (token) {
                toast.success("Account created successfully!");
                if (onRegisterSuccess) {
                    onRegisterSuccess(token, returnedRole, returnedCollegeId);
                }
            } else {
                toast.success(message || "Registration successful! Pending admin approval.");
                if (onSwitch) {
                    onSwitch("login");
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    const getStrengthMeta = () => {
        if (passwordStrength === 0) return { label: "Very Weak", color: "bg-gray-200" };
        if (passwordStrength <= 2) return { label: "Weak", color: "bg-red-400" };
        if (passwordStrength === 3) return { label: "Moderate", color: "bg-yellow-400" };
        return { label: "Strong", color: "bg-green-500" };
    };

    return (
        <AuthLayout
            title="Join OpportuneX"
            subtitle="Create your academic profile and start exploring global opportunities."
            illustrationIcon={Rocket}
        >
            <form onSubmit={handleSubmit}>

                {/* Role Selector */}
                {roles.length === 0 ? (
                    <div className="form-field" style={{ marginBottom: 24, padding: "20px", background: "rgba(200,75,49,0.06)", border: "1px solid rgba(200,75,49,0.15)", borderRadius: 12, color: "var(--red)", textAlign: "center", fontSize: 13, fontWeight: 500 }}>
                        Registrations are currently disabled by the administrator.
                    </div>
                ) : (
                    <div className="role-chips" style={{ marginBottom: 24 }}>
                        {roles.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => setFormData({ ...formData, role: r.id })}
                                className={`role-chip ${formData.role === r.id ? "selected" : ""}`}
                            >
                                <r.icon size={15} style={{ marginBottom: 4 }} />
                                <span>{r.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    {/* Full Name */}
                    <div className="form-field">
                        <label>Full Name</label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute", left: 10, top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)", display: "flex", alignItems: "center"
                            }}>
                                <User size={15} />
                            </span>
                            <input
                                type="text"
                                placeholder="Arjun Mehra"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="form-input"
                                style={{ paddingLeft: 34 }}
                                required
                            />
                        </div>
                    </div>

                    {/* College ID */}
                    <div className="form-field">
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
                                placeholder="PICT-2024-IT"
                                value={formData.collegeId}
                                onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                                className="form-input"
                                style={{ paddingLeft: 34 }}
                                required
                            />
                        </div>
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
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-input"
                            style={{ paddingLeft: 34 }}
                            required
                        />
                    </div>
                </div>

                {/* Password Row */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="form-field">
                        <label>Password</label>
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
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="form-input"
                                style={{ paddingLeft: 34, paddingRight: 38 }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="pw-eye-btn"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Confirm</label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute", left: 10, top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)", display: "flex", alignItems: "center"
                            }}>
                                <ShieldCheck size={15} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="form-input"
                                style={{ paddingLeft: 34 }}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Password Strength Indicator */}
                <AnimatePresence>
                    {formData.password && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ marginBottom: 14, overflow: "hidden" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)" }}>Security Level</span>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, color: passwordStrength === 4 ? "var(--green)" : "var(--text)" }}>{getStrengthMeta().label}</span>
                            </div>
                            <div style={{ display: "flex", gap: 4, height: 4, marginBottom: 10 }}>
                                {[1, 2, 3, 4].map((step) => (
                                    <div
                                        key={step}
                                        style={{
                                            flex: 1,
                                            borderRadius: 2,
                                            background: step <= passwordStrength
                                                ? (passwordStrength <= 2 ? "var(--red)" : passwordStrength === 3 ? "var(--yellow)" : "var(--green)")
                                                : "var(--surface-2)",
                                            transition: "all 0.4s"
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: passwordValidation.length ? "var(--green)" : "var(--text-muted)" }}>
                                    {passwordValidation.length ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                                    <span>8+ Characters</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: passwordValidation.uppercase ? "var(--green)" : "var(--text-muted)" }}>
                                    {passwordValidation.uppercase ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                                    <span>Uppercase Letter</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: passwordValidation.number ? "var(--green)" : "var(--text-muted)" }}>
                                    {passwordValidation.number ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                                    <span>One Number</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: passwordValidation.special ? "var(--green)" : "var(--text-muted)" }}>
                                    {passwordValidation.special ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                                    <span>Special Character</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Terms Checkbox */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "20px 0 24px" }}>
                    <input
                        type="checkbox"
                        checked={formData.agreedToTerms}
                        onChange={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                        style={{ accentColor: "var(--accent)", width: 16, height: 16, marginTop: 1, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        I agree to the <span style={{ color: "var(--accent)", fontWeight: 500 }}>Terms of Service</span> and <span style={{ color: "var(--accent)", fontWeight: 500 }}>Privacy Protocol</span> of OpportuneX Hub.
                    </span>
                </div>

                {/* Action Button */}
                <button
                    type="submit"
                    disabled={loading || roles.length === 0}
                    className="login-submit-btn"
                >
                    {loading ? (
                        <div className="spinner" />
                    ) : (
                        <>
                            <span>Initialize My Account</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                <div className="login-divider" />

                <div className="login-register-row">
                    Already verified?{" "}
                    <button type="button" onClick={() => onSwitch("login")}>
                        Sign In Here
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Register;
