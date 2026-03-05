import { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  MessageSquare,
  UserCircle,
  Menu,
  LogOut,
  GraduationCap,
  GitMerge,
  FolderGit2,
} from "lucide-react";

import ProjectPostForm from "./ProjectPostForm";
import StudentApplications from "./StudentApplications";
import TeamFormation from "./TeamFormation";
import FeedbackCompletion from "./FeedbackCompletion";
import FacultyProfile from "./FacultyProfile";
import MyProjects from "./MyProjects";
import PlacementView from "../shared/PlacementView";
import NotificationIcon from "../shared/NotificationIcon";

const menuItems = [
  { id: "applications", label: "Applications", icon: LayoutDashboard },
  { id: "my-projects", label: "My Projects", icon: FolderGit2 },
  { id: "post", label: "New Project", icon: PlusCircle },
  { id: "teams", label: "Teams", icon: Users },
  { id: "placement", label: "T&P Updates", icon: GitMerge },
  { id: "feedback", label: "Evaluations", icon: MessageSquare },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const pageLabels = {
  applications: "Applications",
  "my-projects": "My Projects",
  post: "New Project",
  teams: "Teams",
  placement: "T&P Updates",
  feedback: "Evaluations",
  profile: "Profile",
};

export default function FacultyDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("applications");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState({ name: "", position: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/faculty/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setProfile({
          name: res.data.name || "Faculty",
          position: res.data.position || "Faculty",
          email: res.data.email,
          department: res.data.department || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleProfileUpdate = (newProfile) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g fill="var(--accent)">
                  {/* Top Left */}
                  <path d="M 30 16 L 42.12 23 L 42.12 37 L 30 44 L 17.88 37 L 17.88 23 Z" />
                  <circle cx="30" cy="30" r="4.5" fill="white" />
                  {/* Top Right */}
                  <path d="M 58 16 L 70.12 23 L 70.12 37 L 58 44 L 45.88 37 L 45.88 23 Z" />
                  <circle cx="58" cy="30" r="4.5" fill="white" />
                  {/* Bottom Center */}
                  <path d="M 44 40 L 56.12 47 L 56.12 61 L 44 68 L 31.88 61 L 31.88 47 Z" />
                  <circle cx="44" cy="54" r="4.5" fill="white" />
                </g>
              </svg>
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-brand-name">Campus <span style={{ color: "var(--accent)" }}>Hive</span></div>
              <div className="sidebar-brand-sub" style={{ marginTop: "2px", letterSpacing: "1px" }}>T&amp;P PORTAL</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-group">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`sidebar-item${isActive ? " active" : ""}`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {profile.name.charAt(0)}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{profile.name}</div>
                <div className="sidebar-user-role">{profile.position}</div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div className={sidebarOpen ? "main-content" : "main-content-full"}>

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
            >
              <Menu size={18} />
            </button>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
              Faculty Dashboard
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationIcon />
            <div style={{ width: 1, height: 22, background: "var(--border)" }} />
            <button
              onClick={onLogout}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(200,75,49,0.06)", border: "1px solid rgba(200,75,49,0.15)", borderRadius: 6, color: "var(--red)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1400, width: "100%" }}>

          {/* Applications landing hero */}
          {activeTab === "applications" && (
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="panel-body">
                <span className="pill pill-blue" style={{ marginBottom: 10, display: "inline-block" }}>Overview</span>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                  Department Management
                </h2>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.7 }}>
                  Review student project applications and manage academic performance.
                </p>
                <button
                  onClick={() => setActiveTab("post")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  New Project <PlusCircle size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "my-projects" && <MyProjects />}
          {activeTab === "post" && <ProjectPostForm />}
          {activeTab === "applications" && <StudentApplications />}
          {activeTab === "teams" && <TeamFormation />}
          {activeTab === "placement" && <PlacementView role="faculty" />}
          {activeTab === "feedback" && <FeedbackCompletion />}
          {activeTab === "profile" && (
            <FacultyProfile profile={profile} onProfileUpdate={handleProfileUpdate} />
          )}
        </main>
      </div>
    </div>
  );
}
