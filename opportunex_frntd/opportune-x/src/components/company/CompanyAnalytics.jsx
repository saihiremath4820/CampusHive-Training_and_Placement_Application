import { useState, useEffect } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Layers, TrendingUp, ArrowUpRight, Loader2, Target, PieChart as PieIcon } from "lucide-react";
import { getCompanyAnalytics } from "../../services/companyApi";

const ACCENT_COLORS = ["#1b4fd8", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function CompanyAnalytics() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getCompanyAnalytics();
        setData(res.data.data || res.data || {});
      } catch (err) {
        console.warn("Failed to load analytics.");
        setData({});
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return null; // Parent handles loading

  const {
    statusDistribution = [],
    applicationVelocity = [],
    applicantPoolByRole = []
  } = data || {};

  const tooltipProps = {
    contentStyle: {
      backgroundColor: "var(--surface)",
      borderColor: "var(--border)",
      borderRadius: "10px",
      color: "var(--text)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      fontSize: "11px",
      fontWeight: 600
    },
    itemStyle: { padding: "2px 0" }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div className="form-row-2">
        {/* Status Distribution */}
        <div className="panel" style={{ height: "100%" }}>
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PieIcon size={16} color="var(--accent)" />
              <span className="panel-title">Hiring Channel Health</span>
            </div>
            <span className="pill pill-blue">Distribution</span>
          </div>
          <div className="panel-body" style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: '100%', minHeight: '260px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={90}
                    innerRadius={65}
                    paddingAngle={8}
                    cx="50%"
                    cy="50%"
                  >
                    {statusDistribution.map((_, i) => (
                      <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} stroke="var(--surface)" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ padding: "0 24px 24px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {statusDistribution.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="panel">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={16} color="var(--accent)" />
              <span className="panel-title">Application Velocity</span>
            </div>
            <span className="panel-tag">Last 7 Days</span>
          </div>
          <div className="panel-body" style={{ height: 320, padding: 24 }}>
            <div style={{ width: '100%', minHeight: '280px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={applicationVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipProps} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    fill="url(#velocityGrad)"
                    dot={{ r: 4, fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Pool Volume */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Target size={16} color="var(--accent)" />
            <span className="panel-title">Departmental Interest Mapping</span>
          </div>
          <span className="panel-tag">Role-Based Volume</span>
        </div>
        <div className="panel-body" style={{ height: 320, padding: "24px 32px" }}>
          <div style={{ width: '100%', minHeight: '280px', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={applicantPoolByRole} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis
                  dataKey="role"
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipProps} />
                <Bar
                  dataKey="totalApplicants"
                  fill="var(--accent)"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
