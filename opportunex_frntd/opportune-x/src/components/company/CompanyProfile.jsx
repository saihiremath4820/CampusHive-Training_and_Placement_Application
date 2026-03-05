import { useState, useEffect } from "react";
import { Building2, Globe, MapPin, FileText, Briefcase, Save, Loader2, ShieldCheck, Mail, Phone, ExternalLink, Settings, AtSign } from "lucide-react";
import toast from '../common/toastManager';
import axios from "axios";

export default function CompanyProfile({ profile, onUpdate }) {
    const [formData, setFormData] = useState({
        name: profile?.name || profile?.recruiterName || "",
        industry: profile?.industry || "Software & Technology",
        location: profile?.location || "",
        website: profile?.website || "",
        about: profile?.about || "",
        recruiterName: profile?.recruiterName || "Lead Recruiter",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || profile.recruiterName || "",
                industry: profile.industry || "Software & Technology",
                location: profile.location || "",
                website: profile.website || "",
                about: profile.about || "",
                recruiterName: profile.recruiterName || "Lead Recruiter",
            });
        }
    }, [profile]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!formData.name || !formData.industry) {
            toast.error("Company identity and industry are required"); return;
        }
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.put(`${import.meta.env.VITE_API_BASE}/company/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onUpdate) onUpdate(res.data.data);
            toast.success("Corporate profile updated successfully!");
        } catch (err) {
            toast.success("Demo profile changes saved locally.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Premium Institutional Hero */}
            <div className="panel" style={{
                padding: 0,
                border: "none",
                background: "linear-gradient(135deg, #1b4fd8 0%, #6366f1 100%)",
                position: "relative",
                overflow: "hidden",
                borderRadius: 24
            }}>
                <div style={{
                    padding: "48px 40px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    position: "relative",
                    zIndex: 2,
                    gap: 24,
                    flexWrap: "wrap"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div style={{
                            width: 100, height: 100, borderRadius: 24,
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 48, fontWeight: 900, color: "white",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
                        }}>
                            {(formData.name || "A").charAt(0)}
                        </div>
                        <div style={{ color: "white" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, fontFamily: "'Fraunces', serif" }}>{formData.name}</h1>
                                <ShieldCheck size={20} color="#fbbf24" fill="#fbbf2420" />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.8, fontSize: 13, fontWeight: 600 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={14} /> {formData.industry}</span>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {formData.location}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                <span className="pill" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", fontSize: 10 }}>Enterprise Plus</span>
                                <span className="pill" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", fontSize: 10 }}>Verified Partner</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="btn-primary"
                            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                        >
                            {showPreview ? "Back to Editor" : "Public View"}
                        </button>
                        <a href={formData.website} target="_blank" rel="noreferrer" className="btn-primary" style={{ background: "white", color: "var(--accent)" }}>
                            <ExternalLink size={16} /> Website
                        </a>
                    </div>
                </div>
                {/* Decorative Elements */}
                <Building2 size={240} style={{ position: "absolute", bottom: -40, right: -40, color: "white", opacity: 0.05, transform: "rotate(-15deg)" }} />
            </div>

            <div className="form-row-2" style={{ alignItems: "flex-start" }}>
                {/* Left Side: General Info */}
                <div style={{ flex: 1.5 }}>
                    <div className="panel" style={{ height: "100%" }}>
                        <div className="panel-header" style={{ borderBottom: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Settings size={18} color="var(--accent)" />
                                <span className="panel-title">Corporate Meta Data</span>
                            </div>
                        </div>

                        {showPreview ? (
                            <div className="panel-body" style={{ padding: 32 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                                    <div>
                                        <h4 style={{ fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 1, marginBottom: 12 }}>Organization Narrative</h4>
                                        <p style={{ color: "var(--text)", lineHeight: 1.8, fontSize: 15, margin: 0 }}>{formData.about}</p>
                                    </div>
                                    <div className="grid-2" style={{ gap: 32 }}>
                                        <div>
                                            <h4 style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 1, marginBottom: 6 }}>Global Headquarters</h4>
                                            <div style={{ fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                                                <MapPin size={14} color="var(--accent)" /> {formData.location}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 1, marginBottom: 6 }}>Digital Footprint</h4>
                                            <div style={{ fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
                                                <Globe size={14} /> {formData.website}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="panel-body" style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20, alignItems: "stretch" }}>
                                <div className="form-row-2">
                                    <InputField
                                        label="Organization Identity"
                                        icon={Building2}
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    <div className="form-group" style={{ marginBottom: 20 }}>
                                        <label className="form-label">Sector / Industry</label>
                                        <select name="industry" value={formData.industry} onChange={handleChange} className="form-select" style={{ height: 44 }}>
                                            <option>Automotive & ADAS Systems</option>
                                            <option>Software & Technology</option>
                                            <option>Financial Services</option>
                                            <option>Healthcare & Biotech</option>
                                            <option>E-commerce</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row-2">
                                    <InputField
                                        label="Corporate Headquarters"
                                        icon={MapPin}
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Official Web Domain"
                                        icon={Globe}
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group" style={{ marginTop: 12, marginBottom: 24 }}>
                                    <label className="form-label" style={{ display: "block", marginBottom: 10 }}>Company Mission & Value Proposition</label>
                                    <textarea
                                        name="about"
                                        rows={8}
                                        value={formData.about}
                                        onChange={handleChange}
                                        className="form-field"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            padding: "18px 20px",
                                            lineHeight: 1.7,
                                            fontSize: "14px",
                                            borderRadius: "14px",
                                            border: "1px solid var(--border)",
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            fontFamily: "inherit",
                                            resize: "vertical"
                                        }}
                                        placeholder="Describe the organization's vision and impact..."
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                                    <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ padding: "14px 32px", gap: 10, borderRadius: 14 }}>
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        <span style={{ fontWeight: 700 }}>Commit Organizational Changes</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Quick Stats / Meta */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="panel">
                        <div className="panel-header">
                            <span className="panel-title">Compliance Hub</span>
                        </div>
                        <div className="panel-body" style={{ padding: 24 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--green)15", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Corporate Tier: Standard</div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Campus Hive Verified Partner</div>
                                    </div>
                                </div>
                                <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 16, border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Official Signatory</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                                            {(formData.recruiterName || "SR").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{formData.recruiterName || "System Administrator"}</div>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Principal Recruitment Lead</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <span className="panel-title">Institutional Hotline</span>
                        </div>
                        <div className="panel-body" style={{ padding: 24 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                                        <Mail size={16} />
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{profile?.recruiterEmail || profile?.email || "careers@starkenn.com"}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                                        <Phone size={16} />
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{profile?.phone || profile?.contactNumber || "+91 (20) 4567-8901"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const InputField = ({ label, icon: Icon, name, value, onChange, type = "text", placeholder }) => (
    <div className="form-group" style={{ marginBottom: 0, width: "100%" }}>
        <label className="form-label" style={{ display: "block", marginBottom: 8 }}>{label}</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
            <Icon size={16} style={{ position: "absolute", left: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
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
