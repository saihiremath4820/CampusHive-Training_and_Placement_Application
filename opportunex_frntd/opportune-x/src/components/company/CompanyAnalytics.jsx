import { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot
} from "recharts";
import { TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";
import {
  getApplicationStats,
  getRecentActivity
} from "../../services/companyApi";

const STATUS_COLORS = {
  applied: "#2563eb",
  shortlisted: "#7c3aed",
  selected: "#16a34a",
  rejected: "#dc2626",
};

const isToday = (d) => {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};
const isYesterday = (d) => {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return d.getDate() === y.getDate() && d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear();
};
const groupByDate = (activities) => {
  const groups = {};
  activities.forEach(a => {
    const date = new Date(a.time);
    const key = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday"
      : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return groups;
};

const ACTIVITY_CONFIG = {
  applied: { icon: "📋", color: "#2563eb", label: "applied to" },
  shortlisted: { icon: "⚡", color: "#7c3aed", label: "shortlisted for" },
  selected: { icon: "🎉", color: "#16a34a", label: "selected for" },
  rejected: { icon: "✗", color: "#dc2626", label: "rejected from" },
};

const tooltipStyle = {
  contentStyle: {
    background: "white", border: "1px solid #E5E7EB",
    borderRadius: 10, fontSize: 12, fontWeight: 600,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }
};

export default function CompanyAnalytics({ refreshTick }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, actRes] = await Promise.all([
        getApplicationStats(),
        getRecentActivity()
      ]);
      setStats(statsRes.data);
      setActivities(actRes.data.activities || []);
    } catch (e) {
      console.warn("Analytics fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshTick]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const dist = stats?.statusDistribution || {};
  const pieData = [
    { name: "Applied", value: dist.applied || 0, color: STATUS_COLORS.applied },
    { name: "Shortlisted", value: dist.shortlisted || 0, color: STATUS_COLORS.shortlisted },
    { name: "Selected", value: dist.selected || 0, color: STATUS_COLORS.selected },
    { name: "Rejected", value: dist.rejected || 0, color: STATUS_COLORS.rejected },
  ].filter(d => d.value > 0);

  const velocityData = stats?.velocityData || [];
  const hasVelocity = velocityData.some(d => d.count > 0);
  const totalApps = stats?.total || 0;

  const grouped = groupByDate(activities);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Row 1: Pie + Line */}
      <div className="form-row-2">

        {/* Hiring Channel Health — Pie */}
        <div className="panel" style={{ height: "100%" }}>
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PieIcon size={16} color="var(--accent)" />
              <span className="panel-title">Hiring Channel Health</span>
            </div>
            <span className="pill pill-blue">{totalApps} Total</span>
          </div>
          <div className="panel-body" style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {pieData.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af" }}>
                <p style={{ fontSize: 14, marginBottom: 4 }}>📭 No applications yet</p>
                <p style={{ fontSize: 12 }}>Data will appear once students apply</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={6}
                    cx="50%"
                    cy="50%"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} applications`, n]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {pieData.length > 0 && (
            <div style={{ padding: "0 24px 20px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
              {pieData.map((item) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>
                    {item.name} <span style={{ color: item.color }}>({item.value})</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Velocity — Line */}
        <div className="panel">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={16} color="var(--accent)" />
              <span className="panel-title">Application Velocity</span>
            </div>
            <span className="panel-tag">Last 7 Days</span>
          </div>
          <div className="panel-body" style={{ height: 320, padding: 24 }}>
            {!hasVelocity ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", textAlign: "center", gap: 8 }}>
                <p style={{ fontSize: 14 }}>📉 No applications in last 7 days</p>
                <p style={{ fontSize: 12 }}>Activity will chart here as students apply</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v} applications`, "Applications"]} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "white", stroke: "#2563eb", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Activity Feed */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={16} color="var(--accent)" />
            <span className="panel-title">Recent Activity</span>
          </div>
          <span style={{ fontSize: 12, color: "#9ca3af", background: "#f3f4f6", padding: "2px 10px", borderRadius: 999 }}>
            {activities.length} events
          </span>
        </div>
        <div className="panel-body" style={{ maxHeight: 340, overflowY: "auto" }}>
          {activities.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: "#9ca3af", textAlign: "center", gap: 8 }}>
              <p style={{ fontSize: 14 }}>📭 No recent activity yet</p>
              <p style={{ fontSize: 12 }}>Applications will appear here as students apply</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 20px 6px" }}>
                  {date}
                </div>
                {items.map((act, i) => {
                  const cfg = ACTIVITY_CONFIG[act.type] || ACTIVITY_CONFIG.applied;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: "1px solid #f9fafb" }}>
                      <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0, color: cfg.color }}>{cfg.icon}</span>
                      <div style={{ flex: 1, fontSize: 13, color: "#374151" }}>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{act.studentName}</span>
                        <span style={{ color: "#6b7280" }}> {cfg.label} </span>
                        <span style={{ fontWeight: 500, color: "#2563eb" }}>{act.jobTitle}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>
                        {new Date(act.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
