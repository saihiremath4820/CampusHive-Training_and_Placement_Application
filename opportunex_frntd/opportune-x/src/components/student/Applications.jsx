import { useState, useMemo } from "react";
import { useStudent } from "../../context/StudentContext";
import {
  Building2, Clock, CheckCircle2, XCircle, ArrowUpRight, AlertCircle, FileText, History, Inbox, ExternalLink
} from "lucide-react";
import CompanyProfileModal from "./CompanyProfileModal";

const STATUS_CONFIG = {
  Applied: { color: "var(--accent)", bg: "rgba(27,79,216,0.1)", label: "Applied", icon: FileText },
  Shortlisted: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", label: "Shortlisted", icon: AlertCircle },
  Selected: { color: "var(--green)", bg: "rgba(16,185,129,0.12)", label: "Selected 🎉", icon: CheckCircle2 },
  Rejected: { color: "var(--red)", bg: "rgba(200,75,49,0.1)", label: "Rejected", icon: XCircle },
};

const ACTIVE_STATUSES = ["Applied", "Shortlisted"];
const PAST_STATUSES = ["Selected", "Rejected"];

export default function Applications() {
  const studentContext = useStudent();
  const { applications = [] } = studentContext || {};
  const [activeTab, setActiveTab] = useState("active");

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const handleCompanyClick = (companyId) => {
    if (!companyId) return;
    setSelectedCompanyId(companyId);
    setShowCompanyModal(true);
  };

  const activeApps = useMemo(() =>
    (applications || []).filter(a => ACTIVE_STATUSES.includes(a.status || "Applied")),
    [applications]
  );

  const pastApps = useMemo(() =>
    (applications || [])
      .filter(a => PAST_STATUSES.includes(a.status))
      .sort((x, y) => new Date(y.createdAt || y.appliedAt) - new Date(x.createdAt || x.appliedAt)),
    [applications]
  );

  const displayList = activeTab === "active" ? activeApps : pastApps;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "2.5rem", maxWidth: "64rem", margin: "0 auto" }}>
      {/* Header */}
      <div>
        <span className="pill pill-blue" style={{ marginBottom: "0.5rem", display: "inline-block" }}>Application Tracker</span>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem", letterSpacing: "-0.03em" }}>
          My Applications
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
          Track your placement process and interview statuses.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border)", marginBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "0.75rem 0", background: "none", border: "none",
            color: activeTab === "active" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: activeTab === "active" ? 700 : 600,
            borderBottom: activeTab === "active" ? "2px solid var(--accent)" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.9rem"
          }}
        >
          <Clock size={16} /> Active Process <span style={{ background: activeTab === "active" ? "rgba(27,79,216,0.1)" : "var(--surface)", color: activeTab === "active" ? "var(--accent)" : "inherit", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{activeApps.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("past")}
          style={{
            padding: "0.75rem 0", background: "none", border: "none",
            color: activeTab === "past" ? "var(--text)" : "var(--text-muted)",
            fontWeight: activeTab === "past" ? 700 : 600,
            borderBottom: activeTab === "past" ? "2px solid var(--text)" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.9rem"
          }}
        >
          <History size={16} /> Past Applications <span style={{ background: "var(--surface)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem" }}>{pastApps.length}</span>
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayList.length === 0 && (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "1rem", border: "1px dashed var(--border)" }}>
            <Inbox size={48} style={{ opacity: 0.2, margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>No {activeTab} applications</h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>When you apply to placement drives, tracking will appear here.</p>
          </div>
        )}

        {displayList.map((app) => {
          const statusKey = app.status || "Applied";
          const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Applied;
          const StatusIcon = cfg.icon;

          const isSelected = statusKey === "Selected";
          const isRejected = statusKey === "Rejected";
          const appliedDate = app.appliedAt || app.createdAt;

          return (
            <div
              key={app._id}
              className="panel"
              style={{
                position: "relative",
                padding: "1.5rem",
                paddingLeft: "2rem",
                overflow: "hidden",
                border: isSelected ? "1px solid rgba(16,185,129,0.3)" : isRejected ? "1px solid rgba(200,75,49,0.15)" : "1px solid var(--border)",
                background: isSelected ? "rgba(16,185,129,0.02)" : "var(--surface)",
              }}
            >
              {/* Status Color Strip */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: cfg.color }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                {/* Left: Job info */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 250px", minWidth: 0 }}>
                  <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color }}>
                    <StatusIcon size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {app.title || "Placement Drive"}
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.6rem", marginTop: "0.25rem" }}>
                      <span
                        className="company-name-link"
                        onClick={() => handleCompanyClick(app.companyProfileId)}
                        title="View corporate profile"
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", cursor: "pointer" }}
                      >
                        <Building2 size={12} style={{ flexShrink: 0 }} /> {app.company || "Corporate Partner"}
                        <ExternalLink size={10} style={{ marginLeft: "2px", opacity: 0.8, color: "#1d4ed8" }} />
                      </span>
                      {appliedDate && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          <Clock size={12} /> Applied {new Date(appliedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <div style={{ padding: "0.5rem 1rem", borderRadius: "1rem", background: cfg.bg, color: cfg.color, fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {cfg.label}
                  </div>
                </div>
              </div>

              {/* Special messages */}
              {isSelected && (
                <div style={{ marginTop: "1rem", padding: "1rem", background: "white", borderRadius: "0.75rem", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.2rem" }}>Congratulations! 🎉</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>You have been selected for this role. HR will contact you shortly with further details.</div>
                  </div>
                  <button style={{ padding: "0.5rem 1rem", background: "var(--green)", color: "white", borderRadius: "0.5rem", border: "none", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>View Offer Details</button>
                </div>
              )}

              {isRejected && (
                <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(200,75,49,0.05)", borderRadius: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Unfortunately, you were not selected for this role. Don't worry, many more opportunities are coming up!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCompanyModal && selectedCompanyId && (
        <CompanyProfileModal
          companyId={selectedCompanyId}
          onClose={() => {
            setShowCompanyModal(false);
            setSelectedCompanyId(null);
          }}
        />
      )}
    </div>
  );
}