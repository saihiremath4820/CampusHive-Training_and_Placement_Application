import { useEffect, useState } from "react";
import { getPendingCounts } from "../../services/adminService";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  GraduationCap,
  Building2,
  CheckSquare,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Placement",
    items: [
      { id: "placement", icon: FileText, label: "Placement (T&P)" },
      { id: "opportunities", icon: Briefcase, label: "All Drives" },
      { id: "driveApprovals", icon: ShieldCheck, label: "Drive Approvals" },
      { id: "applications", icon: ClipboardList, label: "All Applications" },
      { id: "recruiters", icon: Building2, label: "Recruiters" },
    ],
  },
  {
    label: "Users",
    items: [
      { id: "approvals", icon: CheckSquare, label: "Account Approvals" },
      { id: "users", icon: Users, label: "Users" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "auditLog", icon: FileText, label: "Audit Log" },
      { id: "settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminSidebar({ active, setActive, darkMode, user }) {
  const adminName = user?.name || "Admin";
  const initial = adminName.charAt(0).toUpperCase();

  const [pendingCounts, setPendingCounts] = useState({
    pendingDrives: 0,
    pendingAccounts: 0,
    newApplications: 0
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCounts = async () => {
      try {
        const res = await getPendingCounts();
        if (isMounted) setPendingCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch pending counts", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);

    const handleRefresh = () => fetchCounts();
    window.addEventListener("refreshPendingCounts", handleRefresh);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("refreshPendingCounts", handleRefresh);
    };
  }, []);

  return (
    <aside className="sidebar">
      {/* ── Brand ────────────────────────────────────── */}
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

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <span className="sidebar-section-label">{group.label}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`sidebar-item${isActive ? " active" : ""}`}
                >
                  <Icon size={15} className="sidebar-icon" />
                  <span>{item.label}</span>
                  {item.id === "driveApprovals" && pendingCounts.pendingDrives > 0 && (
                    <span style={{
                      marginLeft: "auto", background: "var(--red)", color: "white", fontSize: 10,
                      fontWeight: 700, borderRadius: 20, padding: "1px 6px",
                      minWidth: 18, textAlign: "center", lineHeight: 1.2
                    }}>
                      {pendingCounts.pendingDrives > 99 ? '99+' : pendingCounts.pendingDrives}
                    </span>
                  )}
                  {item.id === "approvals" && pendingCounts.pendingAccounts > 0 && (
                    <span style={{
                      marginLeft: "auto", background: "var(--red)", color: "white", fontSize: 10,
                      fontWeight: 700, borderRadius: 20, padding: "1px 6px",
                      minWidth: 18, textAlign: "center", lineHeight: 1.2
                    }}>
                      {pendingCounts.pendingAccounts > 99 ? '99+' : pendingCounts.pendingAccounts}
                    </span>
                  )}
                  {item.id === "applications" && pendingCounts.newApplications > 0 && (
                    <span style={{
                      marginLeft: "auto", background: "var(--red)", color: "white", fontSize: 10,
                      fontWeight: 700, borderRadius: 20, padding: "1px 6px",
                      minWidth: 18, textAlign: "center", lineHeight: 1.2
                    }}>
                      {pendingCounts.newApplications > 99 ? '99+' : pendingCounts.newApplications}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User Chip ─────────────────────────────── */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Administrator</div>
          <div className="sidebar-user-role">T&amp;P Control Panel</div>
        </div>
      </div>
    </aside>
  );
}
