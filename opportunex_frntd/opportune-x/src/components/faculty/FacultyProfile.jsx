import { useState, useEffect } from "react";
import axios from "axios";
import { UserCircle, Save, Loader2, Mail, Briefcase, Building } from "lucide-react";
import toast from "react-hot-toast";

export default function FacultyProfile({ profile, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    position: profile?.position || "",
    email: profile?.email || "",
    department: profile?.department || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.name || "", position: profile.position || "", email: profile.email || "", department: profile.department || "" });
    }
  }, [profile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_BASE}/faculty/profile`,
        { name: formData.name, position: formData.position, department: formData.department },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onProfileUpdate(formData);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Profile Header Card */}
      <div className="panel" style={{ marginBottom: 24, padding: "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{
            width: 84, height: 84, borderRadius: "50%",
            background: "var(--surface-2)", border: "2px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent)", fontSize: 32, fontWeight: 700
          }}>
            {formData.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              {formData.name || "Faculty Member"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="pill pill-blue">{formData.position || "Faculty Member"}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <Building size={14} /> {formData.department || "No Department Set"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Institutional Identity</span>
          <span className="panel-tag">PICT Official Profile</span>
        </div>

        <div className="panel-body" style={{ padding: "32px 40px" }}>
          <div className="form-row-2">
            {/* Full Name */}
            <div className="form-field">
              <label>Full Name</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <UserCircle size={15} />
                </span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g. Dr. Satish Patil"
                />
              </div>
            </div>

            {/* Designation */}
            <div className="form-field">
              <label>Designation / Position</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <Briefcase size={14} />
                </span>
                <input
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g. Associate Professor"
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            {/* Email (Read Only) */}
            <div className="form-field">
              <label>Official Email (System Locked)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <Mail size={14} />
                </span>
                <input
                  value={formData.email}
                  readOnly
                  className="form-input"
                  style={{ paddingLeft: 36, opacity: 0.6, background: "var(--surface-2)" }}
                />
              </div>
            </div>

            {/* Department */}
            <div className="form-field">
              <label>Affiliated Department</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <Building size={14} />
                </span>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g. Computer Science & IT"
                />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end"
          }}>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={loading}
              style={{ padding: "10px 24px" }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Synchronize Profile Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

