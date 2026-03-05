import { useState, useEffect } from "react";
import { Save, Shield, Layout, Settings } from "lucide-react";
import toast from '../common/toastManager';
import axios from "axios";
import api from "../../services/api";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    studentRegistration: true,
    companyRegistration: true,
    facultyRegistration: true,
    placementEnabled: true,
    trainingEnabled: true,
    recruitersVisible: true,
    showAnalytics: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post("/admin/settings", settings);
      toast.success("Settings updated successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  function toggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <div className="page-title-block" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Platform <em>Settings</em></h1>
          <p className="page-subtitle">Manage global platform configurations and feature toggles.</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Save size={14} />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid-2">
        {/* Registration Settings */}
        <SettingSection title="Registration" icon={<Shield size={14} style={{ color: "var(--accent)" }} />}>
          <ToggleRow
            label="Enable Student Registration"
            description="Allow new students to sign up"
            value={settings.studentRegistration}
            onChange={() => toggle("studentRegistration")}
          />
          <ToggleRow
            label="Enable Company Registration"
            description="Allow companies to create accounts"
            value={settings.companyRegistration}
            onChange={() => toggle("companyRegistration")}
          />
          <ToggleRow
            label="Enable Faculty Registration"
            description="Allow faculty members to join"
            value={settings.facultyRegistration}
            onChange={() => toggle("facultyRegistration")}
          />
        </SettingSection>

        {/* Placement Settings */}
        <SettingSection title="Placement Module" icon={<Layout size={14} style={{ color: "var(--green)" }} />}>
          <ToggleRow
            label="Enable Placement Module"
            description="Activate placement features for all users"
            value={settings.placementEnabled}
            onChange={() => toggle("placementEnabled")}
          />
          <ToggleRow
            label="Enable Training Activities"
            description="Show training programs and workshops"
            value={settings.trainingEnabled}
            onChange={() => toggle("trainingEnabled")}
          />
          <ToggleRow
            label="Show Recruiters on Dashboard"
            description="Display visiting companies to students"
            value={settings.recruitersVisible}
            onChange={() => toggle("recruitersVisible")}
          />
        </SettingSection>

        {/* UI Preferences */}
        <SettingSection title="UI Preferences" icon={<Settings size={14} style={{ color: "var(--text-muted)" }} />}>
          <ToggleRow
            label="Show Analytics on Dashboard"
            description="Display charts and trends on home"
            value={settings.showAnalytics}
            onChange={() => toggle("showAnalytics")}
          />
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, icon, children }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {icon}
          <span className="panel-title">{title}</span>
        </span>
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
          {label}
        </div>
        {description && (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      {/* Toggle switch */}
      <button
        onClick={onChange}
        style={{
          position: "relative",
          width: 44,
          height: 24,
          borderRadius: 12,
          background: value ? "var(--accent)" : "var(--surface-2)",
          border: "1px solid " + (value ? "var(--accent)" : "var(--border)"),
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          flexShrink: 0,
          padding: 0,
        }}
        aria-checked={value}
        role="switch"
      >
        <span style={{
          position: "absolute",
          top: 2,
          left: value ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.15s",
          display: "block",
        }} />
      </button>
    </div>
  );
}
