import { useState, useMemo, useEffect } from "react";
import api from "../../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import { Filter, Search, Check, X, AlertCircle, Loader2, ClipboardList, TrendingUp, Bot } from "lucide-react";
import toast from '../common/toastManager';
import FacultyATSModal from "./FacultyATSModal";

export default function StudentApplications() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, dir: null });
  // ATS state
  const [atsResults, setAtsResults] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [activeAtsResult, setActiveAtsResult] = useState(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/project/applications");
      const formatted = res.data.map(app => ({
        id: `${app.projectId}-${app.studentId}`,
        originalProjectId: app.projectId,
        originalStudentId: app.studentId,
        project: app.projectTitle,
        name: app.name, branch: app.branch, year: app.year,
        status: app.status, rejectionReason: app.rejectionReason,
        isHardcoded: false
      }));
      setStudents(formatted);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = null) => {
    const previous = [...students];
    const target = students.find(s => s.id === id);
    if (!target) return;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status, rejectionReason: reason } : s));
    try {
      await api.put("/project/application/status", {
        projectId: target.originalProjectId, studentId: target.originalStudentId, status, rejectionReason: reason
      });
      toast.success(`Application ${status}`);
    } catch (err) {
      setStudents(previous);
      toast.error("Failed to update status");
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason !== null) updateStatus(id, "Rejected", reason || "No reason provided");
  };

  const handleFacultyAnalyze = async (s) => {
    const rowId = s.id;
    // Return cached result instantly
    if (atsResults[rowId]) {
      setActiveAtsResult({ ...atsResults[rowId], studentName: s.name });
      setShowAtsModal(true);
      return;
    }
    setAnalyzingId(rowId);
    try {
      const res = await api.post(
        "/ai/faculty-ats-score",
        { studentId: s.originalStudentId, projectId: s.originalProjectId },
        { timeout: 65000 }
      );
      const result = res.data;
      setAtsResults(prev => ({ ...prev, [rowId]: result }));
      setActiveAtsResult({ ...result, studentName: s.name });
      setShowAtsModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Analysis failed";
      toast.error(msg);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const processedStudents = useMemo(() => {
    let data = students.filter(s => s.originalProjectId);
    if (statusFilter !== "All") data = data.filter(s => s.status === statusFilter);
    if (branchFilter !== "All") data = data.filter(s => s.branch === branchFilter);
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.dir === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [students, statusFilter, branchFilter, sortConfig]);

  const statuses = ["Pending", "Approved", "Rejected"];
  const branches = ["CSE", "ENTC", "IT", "AIDS", "ECE"];
  const statusData = statuses.map(s => ({ name: s, value: processedStudents.filter(st => st.status === s).length }));
  const branchData = branches.map(b => ({ branch: b, count: processedStudents.filter(st => st.branch === b).length }));
  const COLORS = ["#eab308", "var(--green)", "var(--red)"];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Dynamic Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ClipboardList size={18} color="var(--accent)" />
              <span className="pill pill-blue">Intake Management</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              Student Applications
            </h2>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status:</span>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select" style={{ width: 130, height: 34 }}>
                <option>All</option>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Branch:</span>
              <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="form-select" style={{ width: 130, height: 34 }}>
                <option>All</option>
                {branches.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Panels */}
        <div className="form-row-2">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Fulfillment Ratio</span>
              <TrendingUp size={14} color="var(--accent)" />
            </div>
            <div className="panel-body" style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: '100%', minHeight: '230px', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} cx="50%" cy="45%" paddingAngle={8} innerRadius={50}>
                      {statusData.map((_, i) => (<Cell key={i} fill={COLORS[i]} stroke="var(--surface)" strokeWidth={3} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Departmental Interest</span>
              <span className="panel-tag">Live Metrics</span>
            </div>
            <div className="panel-body" style={{ height: 280, padding: 24 }}>
              <div style={{ width: '100%', minHeight: '230px', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={branchData} margin={{ top: 20 }}>
                    <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={34} label={{ position: 'top', fill: 'var(--text-muted)', fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Main Data Panel */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Applications ({processedStudents.length})</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>#</th>
                  <th onClick={() => handleSort("project")} style={{ cursor: "pointer" }}>
                    Project {sortConfig.key === "project" && (sortConfig.dir === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                    Student Name {sortConfig.key === "name" && (sortConfig.dir === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Academic Track</th>
                  <th>Status</th>
                  <th style={{ paddingRight: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedStudents.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ paddingLeft: 20 }} className="mono">{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.project}</td>
                    <td style={{ fontWeight: 600, textTransform: "capitalize" }}>{s.name}</td>
                    <td className="mono" style={{ color: "var(--text-muted)", fontSize: 13 }}>{s.branch} • Year {s.year}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={`pill ${s.status === "Approved" ? "pill-green" :
                          s.status === "Rejected" ? "pill-red" : "pill-yellow"
                          }`}>
                          {s.status}
                        </span>
                        {s.rejectionReason && (
                          <div style={{ position: "relative" }} title={s.rejectionReason}>
                            <AlertCircle size={13} color="var(--red)" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ paddingRight: 20 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        {s.status === "Pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(s.id, "Approved")}
                              className="btn-primary"
                              style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(34,197,94,0.06)", color: "var(--green)", border: "1px solid rgba(34,197,94,0.15)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600 }}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(s.id)}
                              className="btn-primary"
                              style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(239,68,68,0.06)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600 }}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                        {s.status !== "Pending" && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, padding: "4px 0" }}>Locked</span>
                        )}
                        {/* AI Evaluate button — always visible */}
                        <button
                          onClick={() => handleFacultyAnalyze(s)}
                          disabled={analyzingId === s.id}
                          style={{
                            padding: "4px 10px", borderRadius: 6,
                            background: atsResults[s.id] ? "rgba(27,79,216,0.15)" : "rgba(27,79,216,0.06)",
                            color: "var(--accent)",
                            border: `1px solid ${atsResults[s.id] ? "var(--accent)" : "var(--border)"}`,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            fontSize: 11, fontWeight: 600
                          }}
                          title="AI Academic Fit Evaluation"
                        >
                          {analyzingId === s.id ? (
                            <div className="spinner" style={{ width: 12, height: 12 }} />
                          ) : atsResults[s.id] ? (
                            <><Bot size={13} /> {atsResults[s.id].fitScore}% Match</>
                          ) : (
                            <><Bot size={13} /> Analyze</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {processedStudents.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: 60, textAlign: "center" }}>
                      <Search size={32} style={{ color: "var(--border)", marginBottom: 12 }} />
                      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No applications found matching your current filter criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Faculty ATS Modal */}
      {showAtsModal && activeAtsResult && (
        <FacultyATSModal
          result={activeAtsResult}
          onClose={() => setShowAtsModal(false)}
        />
      )}
    </>
  );
}
