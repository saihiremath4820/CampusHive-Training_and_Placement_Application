import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";
import {
  getOpportunities,
  getDashboardStats,
  getDeadlineAlerts,
} from "../../services/companyApi";
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
  Briefcase,
  PlusCircle,
  LogOut,
  Menu,
  GitMerge,
  LayoutDashboard,
  ShieldCheck,
  Building2
} from "lucide-react";

const menuItems = [
  { id: "opportunities", label: "Talent Pool", icon: Briefcase, sub: "Manage hiring pipelines" },
  { id: "create", label: "Publish Opening", icon: PlusCircle, sub: "Draft new opportunities" },
  { id: "placement", label: "Placement Desk", icon: GitMerge, sub: "Collaborate with TPOs" },
  { id: "profile", label: "Organization HUB", icon: Building2, sub: "Company visibility" },
];

const StatCard = ({ label, value, hint, accentColor }) => {
  return (
    <div className="ch-stat-card-h"
      style={{ borderTop: `3px solid ${accentColor}` }}>
      <div className="ch-stat-card-h__value">{value}</div>
      <div className="ch-stat-card-h__label">{label}</div>
      <div className="ch-stat-card-h__hint">{hint}</div>
    </div>
  );
};

const STAT_CARDS_DATA = (dashboardStats) => [
  {
    label: 'Active Jobs',
    value: dashboardStats.activeJobs ?? 0,
    hint: 'Live and approved',
    accentColor: '#2563eb'
  },
  {
    label: 'Pending Approval',
    value: dashboardStats.pendingApproval ?? 0,
    hint: 'Awaiting admin review',
    accentColor: '#d97706'
  },
  {
    label: 'Total Applicants',
    value: dashboardStats.totalApplicants ?? 0,
    hint: 'Across all drives',
    accentColor: '#7c3aed'
  },
  {
    label: 'Shortlisted',
    value: dashboardStats.shortlisted ?? 0,
    hint: 'In pipeline',
    accentColor: '#0891b2'
  },
  {
    label: 'Selected',
    value: dashboardStats.selected ?? 0,
    hint: 'Positions filled',
    accentColor: '#16a34a'
  },
  {
    label: 'Closed Drives',
    value: dashboardStats.closedJobs ?? 0,
    hint: 'Completed hiring',
    accentColor: '#4b5563'
  }
];

const STAT_CARDS = STAT_CARDS_DATA;


export default function CompanyDashboard({ onLogout, user: authUser }) {
  const [active, setActive] = useState("opportunities");
  const [view, setView] = useState("opportunities");
  const [selectedOppId, setSelectedOppId] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [editingOpp, setEditingOpp] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ 
    name: authUser?.name || "", 
    email: authUser?.email || "", 
    phone: "" 
  });
  const [profileData, setProfileData] = useState(null);

  // New state for 4 features
  const [dashboardStats, setDashboardStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0); // increments to trigger analytics refresh

  const { socket } = useSocket();
  const intervalRef = useRef(null);

  // ── Fetch functions ──────────────────────────────────────────
  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await getOpportunities();
      setOpportunities(res.data.data || res.data || []);
    } catch { setOpportunities([]); }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setDashboardStats(res.data || {});
    } catch { /* silently fail */ }
  }, []);

  const fetchDeadlineAlerts = useCallback(async () => {
    try {
      const res = await getDeadlineAlerts();
      setAlerts(res.data.alerts || []);
    } catch { /* silently fail */ }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/company/profile");
      const data = res.data;
      setUser({
        name: data.recruiterName || data.name || "Recruiter",
        email: data.recruiterEmail || data.email || "No Email",
        phone: data.phone || data.contactNumber || "No Phone",
      });
      setProfileData(data);
    } catch { /* silently fail */ }
  }, []);

  const refreshAll = useCallback(() => {
    fetchDashboardStats();
    fetchDeadlineAlerts();
    fetchOpportunities();
    setRefreshTick(t => t + 1); // triggers analytics re-fetch
  }, [fetchDashboardStats, fetchDeadlineAlerts, fetchOpportunities]);

  // ── Initial load + 30s auto-refresh ─────────────────────────
  useEffect(() => {
    fetchProfile();
    refreshAll();
    intervalRef.current = setInterval(refreshAll, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchProfile, refreshAll]);

  // ── Socket.IO live refresh ────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handle = () => refreshAll();
    socket.on("new_application", handle);
    socket.on("application_status_update", handle);
    return () => {
      socket.off("new_application", handle);
      socket.off("application_status_update", handle);
    };
  }, [socket, refreshAll]);

  const handleTabChange = (id) => {
    setActive(id);
    setView("opportunities");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const dismissAlert = (i) => setAlerts(prev => prev.filter((_, idx) => idx !== i));

  if (profileData && profileData.profileCompleted === false) {
    return <CompanyProfileSetup profile={profileData} onComplete={fetchProfile} onLogout={onLogout} />;
  }

  const stats = STAT_CARDS_DATA(dashboardStats);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── SIDEBAR ───────────────────────────────────── */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g fill="var(--accent)">
                  <path d="M 30 16 L 42.12 23 L 42.12 37 L 30 44 L 17.88 37 L 17.88 23 Z" />
                  <circle cx="30" cy="30" r="4.5" fill="white" />
                  <path d="M 58 16 L 70.12 23 L 70.12 37 L 58 44 L 45.88 37 L 45.88 23 Z" />
                  <circle cx="58" cy="30" r="4.5" fill="white" />
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
              <span className="sidebar-section-label">Recruitment Suite</span>
              {menuItems.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
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
              <div className="sidebar-avatar">{user.name.charAt(0) || "C"}</div>
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

      {/* ── MAIN AREA ─────────────────────────────────── */}
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
              Company Dashboard
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

          {/* ── Deadline Alert Banner ── */}
          {active === "opportunities" && view === "opportunities" && alerts.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {alerts.map((alert, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  background: alert.color === "red" ? "#fee2e2" : "#fff7ed",
                  color: alert.color === "red" ? "#dc2626" : "#ea580c",
                  borderLeft: `4px solid ${alert.color === "red" ? "#dc2626" : "#ea580c"}`,
                  animation: "slideDown 0.3s ease"
                }}>
                  <span>{alert.color === "red" ? "🔴" : "⚠️"}</span>
                  <span style={{ flex: 1 }}>{alert.message}</span>
                  <button
                    onClick={() => dismissAlert(i)}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, fontSize: 16, lineHeight: 1 }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.6}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* ── 6 Stat Cards ── */}
          {active === "opportunities" && view === "opportunities" && (
            <div className="ch-stat-cards-row">
              {stats.map((card, i) => (
                <StatCard key={i} {...card} />
              ))}
            </div>
          )}

          {/* ── Main views ── */}
          {active === "opportunities" && view === "opportunities" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <CompanyAnalytics refreshTick={refreshTick} />
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
                    onRefresh={() => { fetchOpportunities(); fetchDashboardStats(); fetchDeadlineAlerts(); setRefreshTick(t => t + 1); }}
                    onViewApplicants={(opp) => { setSelectedOppId(opp._id); setSelectedOpp(opp); setView("applicants"); }}
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
              opportunity={selectedOpp}
              onBack={() => setView("opportunities")}
            />
          )}

          {active === "create" && (
            <CreateEditOpportunities
              editOpportunity={editingOpp}
              onSuccess={() => { fetchOpportunities(); fetchDashboardStats(); fetchDeadlineAlerts(); setActive("opportunities"); setView("opportunities"); setEditingOpp(null); }}
              onOpportunityCreated={() => { fetchOpportunities(); fetchDashboardStats(); fetchDeadlineAlerts(); setActive("opportunities"); setView("opportunities"); setEditingOpp(null); }}
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

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}
