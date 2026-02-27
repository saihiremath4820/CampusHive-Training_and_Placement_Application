import { useState, useEffect } from "react";
import axios from "axios";
import { getOpportunities } from "../../services/companyApi";
import Opportunities from "./Opportunities";
import CreateEditOpportunities from "./CreateEditOpportunities";
import CompanyProfile from "./CompanyProfile";
import Applicants from "./Applicants";
import CompanyAnalytics from "./CompanyAnalytics";
import CompanyProfileSetup from "./CompanyProfileSetup";
import PlacementView from "../shared/PlacementView";
import NotificationIcon from "../shared/NotificationIcon";
import { useSocket } from "../../context/SocketContext";

import {
  GraduationCap,
  Briefcase,
  PlusCircle,
  UserCircle,
  LogOut,
  Menu,
  Users,
  Globe,
  Clock,
  GitMerge,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Archive
} from "lucide-react";

const menuItems = [
  { id: "opportunities", label: "Talent Pool", icon: Briefcase, sub: "Manage hiring pipelines" },
  { id: "create", label: "Publish Opening", icon: PlusCircle, sub: "Draft new opportunities" },
  { id: "placement", label: "Placement Desk", icon: GitMerge, sub: "Collaborate with TPOs" },
  { id: "profile", label: "Organization HUB", icon: Building2, sub: "Company visibility" },
];

export default function CompanyDashboard({ onLogout }) {
  const [active, setActive] = useState("opportunities");
  const [view, setView] = useState("opportunities");
  const [selectedOppId, setSelectedOppId] = useState(null);
  const [editingOpp, setEditingOpp] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [profileData, setProfileData] = useState(null);

  const fetchOpportunities = async () => {
    try {
      const res = await getOpportunities();
      setOpportunities(res.data.data || res.data || []);
    } catch (err) {
      console.warn("Failed to fetch opportunities:", err);
      setOpportunities([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { getCompanyAnalytics } = await import("../../services/companyApi");
      const res = await getCompanyAnalytics();
      setAnalytics(res.data || null);
    } catch (err) {
      console.warn("Failed to fetch analytics:", err);
      setAnalytics(null);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/company/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setUser({
        name: data.recruiterName || data.name || "Recruiter",
        email: data.recruiterEmail || data.email || "No Email",
        phone: data.phone || data.contactNumber || "No Phone",
      });
      setProfileData(data);
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOpportunities();
    fetchAnalytics();
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleNewApplication = () => {
      fetchOpportunities();
      fetchAnalytics();
    };
    socket.on('new_application', handleNewApplication);
    return () => socket.off('new_application', handleNewApplication);
  }, [socket]);

  const handleTabChange = (id) => {
    setActive(id);
    setView("opportunities");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  if (profileData && profileData.profileCompleted === false) {
    return <CompanyProfileSetup profile={profileData} onComplete={fetchProfile} onLogout={onLogout} />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, marginRight: 10 }}>
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
            <div>
              <div className="sidebar-brand-name">Campus <span style={{ color: "var(--accent)" }}>Hive</span></div>
              <div className="sidebar-brand-sub" style={{ marginTop: "2px", letterSpacing: "1px" }}>T&amp;P PORTAL</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-group">
              <div className="sidebar-group-label">Recruitment Suite</div>
              {menuItems.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`sidebar-item${isActive ? " active" : ""}`}
                  >
                    <item.icon size={16} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 500 }}>{item.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user.name.charAt(0) || "C"}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <ShieldCheck size={10} color="var(--accent)" />
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: sidebarOpen ? 230 : 0, transition: "margin-left 0.25s" }}>

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
              {profileData?.companyName || profileData?.name || user?.name || "Corporate Dashboard"}
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
        <main style={{ flex: 1, padding: "32px", maxWidth: 1400, width: "100%" }}>

          {/* Stat cards — shown only on opportunities landing */}
          {active === "opportunities" && view === "opportunities" && (
            <div className="grid-3" style={{ marginBottom: 28 }}>
              <StatCard label="Live Vacancies" value={opportunities.length} icon={Briefcase} trend="Active Postings" />
              <StatCard label="Total Applicants" value={analytics?.totalApplicants || 0} icon={Users} trend="Across all openings" />
              <StatCard label="Closed Positions" value={analytics?.closedCount || 0} icon={Archive} trend="Completed" />
            </div>
          )}

          {/* Main views */}
          {active === "opportunities" && view === "opportunities" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <CompanyAnalytics />
              <div className="panel">
                <div className="panel-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LayoutDashboard size={18} color="var(--accent)" />
                    <span className="panel-title">Active Recruitment Records</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="pill pill-green">Live Pipeline</span>
                    <span className="panel-tag">Synced: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  <Opportunities
                    onViewApplicants={(opp) => { setSelectedOppId(opp._id); setView("applicants"); }}
                    onCreateNew={() => { setEditingOpp(null); setActive("create"); }}
                    onEditOpportunity={(opp) => { setEditingOpp(opp); setActive("create"); }}
                  />

                </div>
              </div>
            </div>
          )}

          {view === "applicants" && (
            <Applicants
              opportunityId={selectedOppId}
              onBack={() => setView("opportunities")}
            />
          )}

          {active === "create" && (
            <CreateEditOpportunities
              editOpportunity={editingOpp}
              onSuccess={() => { fetchOpportunities(); setActive("opportunities"); setView("opportunities"); setEditingOpp(null); }}
              onOpportunityCreated={() => { fetchOpportunities(); setActive("opportunities"); setView("opportunities"); setEditingOpp(null); }}
            />
          )}

          {active === "placement" && <PlacementView role="company" />}
          {active === "profile" && (
            <CompanyProfile
              profile={profileData}
              onUpdate={(updatedData) => {
                setProfileData(updatedData);
                setUser({
                  name: updatedData.recruiterName || updatedData.name,
                  email: updatedData.recruiterEmail || updatedData.email,
                  phone: updatedData.phone || updatedData.contactNumber,
                });
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="panel" style={{ transition: "transform 0.2s", cursor: "default" }}>
      <div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "rgba(27,79,216,0.06)", color: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={24} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{value}</div>
            {trend && <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>{trend}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
