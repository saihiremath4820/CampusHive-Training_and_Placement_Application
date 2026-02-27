import { useState, useEffect } from "react";
import {
  BarChart2, Target, GitMerge, PieChart, BookOpen, FileText, Users, Globe, Phone
} from "lucide-react";

import PlacementOverviewAdmin from "../PlacementOverviewAdmin";
import PlacementObjectivesAdmin from "../PlacementObjectivesAdmin";
import PlacementProcessAdmin from "../PlacementProcessAdmin";
import PlacementStatsAdmin from "../PlacementStatsAdmin";
import TrainingActivitiesAdmin from "../TrainingActivitiesAdmin";
import PlacementReportsAdmin from "../PlacementReportsAdmin";
import RecruitersAdmin from "../RecruitersAdmin";
import IndustryCollaborationAdmin from "../IndustryCollaborationAdmin";
import TpoContactsAdmin from "../TpoContactsAdmin";

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart2 },
  { key: "stats", label: "Statistics", icon: PieChart },
  { key: "objectives", label: "Objectives", icon: Target },
  { key: "process", label: "Process", icon: GitMerge },
  { key: "training", label: "Training & Activities", icon: BookOpen },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "recruiters", label: "Recruiters", icon: Users },
  { key: "industry", label: "Industry Collaboration", icon: Globe },
  { key: "tpo", label: "TPO Contacts", icon: Phone },
];

export default function PlacementLayout({ theme, isDark }) {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const handleSwitch = (e) => setActive(e.detail);
    window.addEventListener("switchPlacementTab", handleSwitch);
    return () => window.removeEventListener("switchPlacementTab", handleSwitch);
  }, []);

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* ── Sub-navigation ────────────────────────── */}
      <aside style={{ width: 200, flexShrink: 0, position: "sticky", top: 78 }}>
        <div className="panel" style={{ overflow: "visible" }}>
          <div className="panel-header" style={{ padding: "10px 16px" }}>
            <span className="panel-tag" style={{ display: "block" }}>Modules</span>
          </div>
          <div style={{ padding: "6px 0" }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 16px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12.5,
                    color: isActive ? "var(--text)" : "var(--text-muted)",
                    background: isActive ? "rgba(27,79,216,0.06)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    borderRight: "none",
                    borderTop: "none",
                    borderBottom: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "color 0.12s, background 0.12s",
                  }}
                >
                  <Icon size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Tab Content ───────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {active === "overview" && <PlacementOverviewAdmin />}
        {active === "stats" && <PlacementStatsAdmin />}
        {active === "objectives" && <PlacementObjectivesAdmin isDark={isDark} />}
        {active === "process" && <PlacementProcessAdmin />}
        {active === "training" && <TrainingActivitiesAdmin />}
        {active === "reports" && <PlacementReportsAdmin />}
        {active === "recruiters" && <RecruitersAdmin />}
        {active === "industry" && <IndustryCollaborationAdmin />}
        {active === "tpo" && <TpoContactsAdmin />}
      </div>
    </div>
  );
}
