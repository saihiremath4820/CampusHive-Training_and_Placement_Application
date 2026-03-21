import { useEffect, useState, useMemo } from "react";
import { LogOut, Bell, Settings, Users, Building2, GraduationCap, Briefcase, Menu } from "lucide-react";

import { getCounts, getPendingCounts } from "../../services/adminService";
import {
  getPlacementStats,
  getPlacementObjectives,
  getPlacementProcess,
} from "../../services/adminPlacementService";

import AdminSidebar from "./AdminSidebar";
import Approvals from "./Approvals";
import NotificationIcon from "../shared/NotificationIcon";
import { useSocket } from "../../context/SocketContext";

import PlacementLayout from "./placement/PlacementLayout";
import TrainingActivitiesSummary from "./dashboard/TrainingActivitiesSummary";
import PlacementRecruitersSummary from "./dashboard/PlacementRecruitersSummary";
import IndustryCollaborationsSummary from "./dashboard/IndustryCollaborationsSummary";
import TpoContactsSummary from "./dashboard/TpoContactsSummary";

import OpportunitiesAdmin from "./OpportunitiesAdmin";
import UsersAdmin from "./UsersAdmin";
import RecruitersAdmin from "./RecruitersAdmin";
import SettingsAdmin from "./SettingsAdmin";
import ApplicationsAdmin from "./ApplicationsAdmin";
import DriveApprovalsAdmin from "./DriveApprovalsAdmin";

import PlacementPieChart from "./charts/PlacementPieChart";
import PlacementDeptBarChart from "./charts/PlacementDeptBarChart";
import PlacementTrendLineChart from "./charts/PlacementTrendLineChart";

const sortByAcademicYear = (stats) =>
  [...stats].sort(
    (a, b) =>
      parseInt(a.academicYear.split("-")[0]) -
      parseInt(b.academicYear.split("-")[0])
  );

const PAGE_LABELS = {
  dashboard: "Dashboard",
  placement: "Placement",
  opportunities: "Opportunities",
  recruiters: "Recruiters",
  approvals: "Approvals",
  users: "Users",
  settings: "Settings",
};

export default function AdminDashboard({ onLogout, user }) {
  const [counts, setCounts] = useState({});
  const [pendingCounts, setPendingCounts] = useState({ pendingDrives: 0, pendingAccounts: 0, newApplications: 0 });
  const [placementStats, setPlacementStats] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchAllData = () => {
      getCounts().then((res) => {
        if (isMounted) setCounts(res.data);
      }).catch(console.error);

      getPendingCounts().then((res) => {
        if (isMounted) setPendingCounts(res.data);
      }).catch(console.error);

      getPlacementStats().then((res) => {
        if (isMounted) setPlacementStats(res.data || []);
      }).catch(console.error);

      getPlacementObjectives().then((res) => {
        if (isMounted) setObjectives(res.data.data || []);
      }).catch(console.error);

      getPlacementProcess().then((res) => {
        if (isMounted) {
          setProcessSteps(
            [...(res.data.data || [])].sort((a, b) => a.stepNumber - b.stepNumber)
          );
        }
      }).catch(console.error);

      // Fetch settings to respect UI toggles
      import("../../services/authService").then(({ getPublicSettings }) => {
        getPublicSettings().then(res => {
          if (isMounted && res.data) setSettings(res.data);
        }).catch(console.error);
      }).catch(console.error);
    };

    fetchAllData();
    intervalId = setInterval(fetchAllData, 10000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Re-fetch stats when new application arrives
    socket.on('application_update', () => {
      // Re-trigger the getCounts / fetchAllData if needed, but since we rely on setInterval, this accelerates it natively
      getCounts().then(res => setCounts(res.data)).catch(console.error);
      getPendingCounts().then(res => setPendingCounts(res.data)).catch(console.error);
    });

    socket.on('student_profile_updated', () => {
      getCounts().then(res => setCounts(res.data)).catch(console.error);
      getPendingCounts().then(res => setPendingCounts(res.data)).catch(console.error);
    });

    return () => {
      socket.off('application_update');
      socket.off('student_profile_updated');
    };
  }, [socket]);

  useEffect(() => {
    const handleTabSwitch = (e) => setActiveTab(e.detail);
    const handleRefreshPending = () => {
      getPendingCounts().then(res => setPendingCounts(res.data)).catch(console.error);
    };
    window.addEventListener('switchTab', handleTabSwitch);
    window.addEventListener('refreshPendingCounts', handleRefreshPending);
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch);
      window.removeEventListener('refreshPendingCounts', handleRefreshPending);
    };
  }, []);

  const sortedStats = useMemo(() => sortByAcademicYear(placementStats), [placementStats]);
  const latestStat = sortedStats.length > 0 ? sortedStats[sortedStats.length - 1] : null;

  const currentPageLabel = PAGE_LABELS[activeTab] || activeTab;

  return (
    <div className="app-layout">
      {/* ── Sidebar ───────────────────────────────── */}
      {sidebarOpen && (
        <AdminSidebar
          active={activeTab}
          setActive={setActiveTab}
          darkMode={false}
          user={user}
        />
      )}

      {/* ── Main Content ──────────────────────────── */}
      <div className={sidebarOpen ? "main-content" : "main-content-full"}>

        {/* ── Header ────────────────────────────── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 28px",
          display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
            >
              <Menu size={18} />
            </button>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
              Admin Dashboard
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationIcon darkMode={false} />
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

        {/* ── Page Body ─────────────────────────── */}
        <main className="page-body">

          {/* ═══════ DASHBOARD ═══════ */}
          {activeTab === "dashboard" && (
            <div>
              <div className="page-title-block">
                <h1 className="page-title">Dashboard <em>Overview</em></h1>
                <p className="page-subtitle">Manage your institution's placement activities and users.</p>
              </div>

              {/* ── Pending Actions Summary Card ──────────────────── */}
              {(() => {
                const totalPending = (pendingCounts.pendingDrives || 0) + (pendingCounts.pendingAccounts || 0) + (pendingCounts.newApplications || 0);
                if (totalPending === 0) {
                  return (
                    <div className="panel" style={{ marginBottom: 28, background: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.2)" }}>
                      <div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--green)", padding: "16px 20px" }}>
                        <span style={{ fontSize: 18 }}>✅</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>All caught up! No pending actions.</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="panel" style={{ marginBottom: 28, background: "rgba(224,155,61,0.05)", borderColor: "rgba(224,155,61,0.2)" }}>
                    <div className="panel-body" style={{ padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--yellow)", marginBottom: 12 }}>
                        <span style={{ fontSize: 18 }}>🔔</span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>You have {totalPending} pending actions</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
                        {pendingCounts.pendingDrives > 0 && (
                          <div style={{ fontSize: 13, color: "var(--text)" }}>→ <strong>[{pendingCounts.pendingDrives}]</strong> Drive Approvals pending</div>
                        )}
                        {pendingCounts.pendingAccounts > 0 && (
                          <div style={{ fontSize: 13, color: "var(--text)" }}>→ <strong>[{pendingCounts.pendingAccounts}]</strong> Account Approvals pending</div>
                        )}
                        {pendingCounts.newApplications > 0 && (
                          <div style={{ fontSize: 13, color: "var(--text)" }}>→ <strong>[{pendingCounts.newApplications}]</strong> New Applications to review</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Live Stat Cards ──────────────────── */}
              <div className="grid-4" style={{ marginBottom: 28 }}>
                <StatCard
                  label="Total Students"
                  value={counts.students ?? "—"}
                  icon={GraduationCap}
                  color="var(--accent)"
                  trend="Registered"
                />
                <StatCard
                  label="Companies"
                  value={counts.companies ?? "—"}
                  icon={Building2}
                  color="var(--purple)"
                  trend="Partner Orgs"
                />
                <StatCard
                  label="Placement Drives"
                  value={counts.opportunities ?? "—"}
                  icon={Briefcase}
                  color="var(--yellow)"
                  trend="All Submissions"
                />
                <StatCard
                  label="Applications"
                  value={counts.applications ?? "—"}
                  icon={Users}
                  color="var(--green)"
                  trend="Total Submissions"
                />
              </div>
              {latestStat && (
                <>
                  {/* Analytics Charts */}
                  {settings?.showAnalytics !== false && (
                    <>
                      <div className="panel-title" style={{ marginBottom: 12, fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)" }}>
                        Placement Analytics
                      </div>
                      <div className="grid-3" style={{ marginBottom: 24 }}>
                        <PlacementPieChart />
                        <PlacementDeptBarChart />
                        <PlacementTrendLineChart />
                      </div>
                    </>
                  )}

                  {/* Summary Cards */}
                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    <TrainingActivitiesSummary />
                    <PlacementRecruitersSummary theme={{}} />
                  </div>
                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    <IndustryCollaborationsSummary theme={{}} />
                    <TpoContactsSummary theme={{}} />
                  </div>

                  {/* Objectives */}
                  <div className="panel" style={{ marginBottom: 18 }}>
                    <div className="panel-header">
                      <span className="panel-title">Placement Objectives</span>
                      <span className="panel-tag">{objectives.length} goals</span>
                    </div>
                    <div className="panel-body">
                      {objectives.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No objectives added yet.</p>
                      ) : (
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                          {objectives.map((o) => (
                            <li key={o._id} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text)" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 6 }} />
                              {o.objective}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Process */}
                  <div className="panel">
                    <div className="panel-header">
                      <span className="panel-title">Placement Process</span>
                      <span className="panel-tag">{processSteps.length} steps</span>
                    </div>
                    <div className="panel-body">
                      {processSteps.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No placement process defined yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {processSteps.map((step) => (
                            <div key={step._id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--surface-2)" }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 6,
                                background: "rgba(27,79,216,0.08)",
                                color: "var(--accent)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
                                flexShrink: 0
                              }}>
                                {step.stepNumber}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>
                                  {step.title}
                                </div>
                                {step.description && (
                                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
                                    {step.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════ APPROVALS ═══════ */}
          {activeTab === "approvals" && <Approvals />}

          {/* ═══════ DRIVE APPROVALS ═══════ */}
          {activeTab === "driveApprovals" && <DriveApprovalsAdmin />}

          {/* ═══════ ALL APPLICATIONS ═══════ */}
          {activeTab === "applications" && <ApplicationsAdmin />}

          {/* ═══════ OPPORTUNITIES ═══════ */}
          {activeTab === "opportunities" && <OpportunitiesAdmin />}

          {/* ═══════ RECRUITERS ═══════ */}
          {activeTab === "recruiters" && <RecruitersAdmin />}

          {/* ═══════ USERS ═══════ */}
          {activeTab === "users" && <UsersAdmin />}

          {/* ═══════ PLACEMENT ═══════ */}
          {activeTab === "placement" && <PlacementLayout theme={{}} isDark={false} />}

          {/* ═══════ SETTINGS ═══════ */}
          {activeTab === "settings" && <SettingsAdmin settings={settings} setSettings={setSettings} />}

        </main>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, trend }) {
  return (
    <div className="panel">
      <div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: `${color}18`, color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={22} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{value}</div>
          {trend && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{trend}</div>}
        </div>
      </div>
    </div>
  );
}

