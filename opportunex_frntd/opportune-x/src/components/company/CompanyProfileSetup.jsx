import { useState } from "react";
import { Building2, Globe, MapPin, Briefcase, Save, Loader2, Mail, Phone, User, Image as ImageIcon } from "lucide-react";
import toast from '../common/toastManager';
import axios from "axios";

export default function CompanyProfileSetup({ profile, onComplete, onLogout }) {
    const [formData, setFormData] = useState({
        companyName: profile?.name || profile?.recruiterName || "",
        industry: "Automotive & ADAS Systems",
        location: profile?.location || "",
        website: profile?.website || "",
        about: profile?.about || "",
        contactNumber: profile?.contactNumber || profile?.phone || "",
        recruiterName: profile?.recruiterName || profile?.name || ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!formData.companyName || !formData.industry || !formData.website || !formData.location || !formData.about || !formData.contactNumber || !formData.recruiterName) {
            toast.error("Please fill in all mandatory fields.");
            return;
        }
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_BASE}/company/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Profile Setup Complete!");
            if (onComplete) onComplete();
        } catch (err) {
            toast.error("Failed to setup profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>

            {/* Top Bar for Logout just in case */}
            <div style={{ width: "100%", maxWidth: 800, display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                <button onClick={onLogout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Log Out</button>
            </div>

            <div className="panel" style={{ width: "100%", maxWidth: 800, padding: "40px 48px", borderRadius: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "var(--surface-2)", borderRadius: 30, fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 16 }}>
                        Step 1 of 1 — Complete your company profile to get started
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 8px 0", fontFamily: "'Fraunces', serif" }}>
                        Organization Setup
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                        Welcome to Campus Hive. Let's get your corporate identity configured.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="form-row-2">
                        <InputField label="Company Official Name" icon={Building2} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Starkenn Technologies" />
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ display: "block", marginBottom: 8 }}>Industry Type</label>
                            <select name="industry" value={formData.industry} onChange={handleChange} className="form-select" style={{ height: 46 }}>
                                <option>Automotive & ADAS Systems</option>
                                <option>Software & Technology</option>
                                <option>Financial Services</option>
                                <option>Healthcare & Biotech</option>
                                <option>E-commerce</option>
                                <option>Manufacturing</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row-2">
                        <InputField label="Company Website URL" icon={Globe} name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" />
                        <InputField label="Office Location" icon={MapPin} name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
                    </div>

                    <div className="form-row-2">
                        <InputField label="HR Contact Name" icon={User} name="recruiterName" value={formData.recruiterName} onChange={handleChange} placeholder="John Doe" />
                        <InputField label="HR Contact Phone" icon={Phone} name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ display: "block", marginBottom: 8 }}>Company Description</label>
                        <textarea
                            name="about"
                            rows={4}
                            value={formData.about}
                            onChange={handleChange}
                            className="form-field"
                            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", resize: "vertical", fontSize: 14 }}
                            placeholder="Describe your company's mission and culture..."
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ display: "block", marginBottom: 8 }}>Company Logo (Optional)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                <ImageIcon size={20} />
                            </div>
                            <input type="file" accept="image/*" style={{ fontSize: 13 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "block" }}>Max size 2MB, square format recommended.</span>
                    </div>
                </div>

                <div style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ padding: "14px 32px", fontSize: 14, fontWeight: 700, borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Complete Setup & Launch Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

const InputField = ({ label, icon: Icon, name, value, onChange, type = "text", placeholder }) => (
    <div className="form-group" style={{ marginBottom: 0, width: "100%" }}>
        <label className="form-label" style={{ display: "block", marginBottom: 8 }}>{label}</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
            <Icon size={16} strokeWidth={2.5} style={{ position: "absolute", left: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="form-field"
                style={{ paddingLeft: 42, height: 46, width: "100%", borderRadius: 12 }}
            />
        </div>
    </div>
);
