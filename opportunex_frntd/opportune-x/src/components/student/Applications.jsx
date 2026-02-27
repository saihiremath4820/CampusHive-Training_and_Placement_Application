import { useState, useMemo } from "react";
import { useStudent } from "../../context/StudentContext";
import {
  Building2, Clock, CheckCircle2, XCircle, ArrowUpRight, AlertCircle, FileText, History, Inbox
} from "lucide-react";

const STATUS_CONFIG = {
  Applied: { color: "var(--accent)", bg: "rgba(27,79,216,0.1)", label: "Applied", icon: FileText },
  Shortlisted: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", label: "Shortlisted", icon: AlertCircle },
  Selected: { color: "var(--green)", bg: "rgba(16,185,129,0.12)", label: "Selected 🎉", icon: CheckCircle2 },
  Rejected: { color: "var(--red)", bg: "rgba(200,75,49,0.1)", label: "Rejected", icon: XCircle },
};

const ACTIVE_STATUSES = ["Applied", "Shortlisted"];
const PAST_STATUSES = ["Selected", "Rejected"];

export default function Applications() {
  const { applications } = useStudent();
  const [activeTab, setActiveTab] = useState("active");

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
        <p style={{ color: "var(--text)", opacity: 0.55, fontWeight: 500, margin: 0 }}>
          Track all your placement drive applications in one place.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "8px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            border: `1px solid ${activeTab === "active" ? "var(--accent)" : "var(--border)"}`,
            background: activeTab === "active" ? "rgba(27,79,216,0.08)" : "var(--surface)",
            color: activeTab === "active" ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Inbox size={13} /> Active Applications
          <span style={{ background: activeTab === "active" ? "var(--accent)" : "var(--border)", color: activeTab === "active" ? "#fff" : "var(--text-muted)", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>
            {activeApps.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "8px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            border: `1px solid ${activeTab === "history" ? "var(--purple)" : "var(--border)"}`,
            background: activeTab === "history" ? "rgba(139,92,246,0.08)" : "var(--surface)",
            color: activeTab === "history" ? "var(--purple)" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <History size={13} /> Past History
          <span style={{ background: activeTab === "history" ? "var(--purple)" : "var(--border)", color: activeTab === "history" ? "#fff" : "var(--text-muted)", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>
            {pastApps.length}
          </span>
        </button>
      </div>

      {/* Empty States */}
      {displayList.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
          {activeTab === "active" ? (
            <>
              <Inbox size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600 }}>No active applications</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Browse the Jobs & Internships tab and apply to get started!</p>
            </>
          ) : (
            <>
              <History size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ fontSize: 15, fontWeight: 600 }}>No placement history yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Your completed applications (Selected / Rejected) will appear here.</p>
            </>
          )}
        </div>
      )}

      {/* Applications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", opacity: 0.6 }}>
                        <Building2 size={12} style={{ flexShrink: 0 }} /> {app.company || "Corporate Partner"}
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
                <div style={{ marginTop: "1rem", padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
                  🎉 Congratulations! You have been selected for this role. The company will reach out to you soon.
                </div>
              )}
              {isRejected && (
                <div style={{ marginTop: "1rem", padding: "10px 14px", background: "rgba(200,75,49,0.05)", border: "1px solid rgba(200,75,49,0.15)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>
                  💪 Keep applying! Every rejection is one step closer to the right opportunity.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
