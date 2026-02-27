import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CheckCircle, Plus, Loader2, Sparkles, FolderIcon, UserPlus, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function TeamFormation() {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchTeams(); fetchProjects(); }, []);

  const fetchTeams = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/team`, { headers: { Authorization: `Bearer ${token}` } });
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/project/my`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setAvailableStudents([]);
    setSelectedStudents([]);
    if (!projectId) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/team/project/${projectId}/available`, { headers: { Authorization: `Bearer ${token}` } });
      setAvailableStudents(res.data);
    } catch (err) { toast.error("Failed to fetch available students"); }
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName || !selectedProject || selectedStudents.length === 0) {
      toast.error("Please fill all fields and select at least one student"); return;
    }
    setCreating(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_BASE}/team`, { name: teamName, projectId: selectedProject, studentIds: selectedStudents }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Team created successfully!");
      setShowCreateForm(false);
      setTeamName(""); setSelectedProject(""); setSelectedStudents([]);
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create team");
    } finally { setCreating(false); }
  };

  const chartData = teams.map(t => ({ name: t.name, completion: t.status === "Completed" ? 100 : Math.floor(Math.random() * 80) + 10 }));

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header View */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Users size={18} color="var(--accent)" />
            <span className="pill pill-blue">Organization</span>
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            Team Management Hub
          </h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {showCreateForm ? (
            <span>Close Designer</span>
          ) : (
            <>
              <Plus size={16} />
              <span>Assemble New Team</span>
            </>
          )}
        </button>
      </div>

      {/* Create Form Section */}
      {showCreateForm && (
        <div className="panel" style={{ border: "2px solid var(--accent-light)" }}>
          <div className="panel-header">
            <span className="panel-title">Team Composition Designer</span>
            <span className="panel-tag">Draft Mode</span>
          </div>
          <div className="panel-body" style={{ padding: 24 }}>
            <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="form-row-2">
                <div className="form-field">
                  <label>Institutional Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. PICT-AI-CORE"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label>Assign to Research Project</label>
                  <select value={selectedProject} onChange={handleProjectChange} className="form-select">
                    <option value="">-- Select Active Project --</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
              </div>

              {selectedProject && (
                <div style={{ padding: "18px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <UserPlus size={15} color="var(--accent)" />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--text-muted)" }}>
                      Approved Candidates ({availableStudents.length})
                    </span>
                  </div>

                  {availableStudents.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Info size={24} style={{ color: "var(--accent)", opacity: 0.3, marginBottom: 8 }} />
                      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No approved students available for this project yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                      {availableStudents.map(student => (
                        <label key={student._id} className="role-chip" style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          textAlign: "left",
                          cursor: "pointer",
                          height: "auto",
                          background: selectedStudents.includes(student._id) ? "rgba(27, 79, 216, 0.05)" : "var(--surface)",
                          borderColor: selectedStudents.includes(student._id) ? "var(--accent)" : "var(--border)"
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleCheckboxChange(student._id)}
                            style={{ margin: 0, width: 16, height: 16, accentColor: "var(--accent)" }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13.5 }}>{student.name}</div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{student.branch} • {student.year}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={creating} className="btn-primary" style={{ minWidth: 160 }}>
                  {creating ? <div className="spinner" /> : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={16} />
                      <span>Form Team</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Display Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {teams.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "60px 0", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12 }}>
            <Users size={32} style={{ color: "var(--border)", marginBottom: 12 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No research teams have been formalized yet.</p>
          </div>
        ) : (
          teams.map(t => (
            <div key={t._id} className="panel" style={{ display: "flex", flexDirection: "column" }}>
              <div className="panel-header" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(27, 79, 216, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                    <Users size={16} />
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", margin: 0 }}>{t.name}</h4>
                </div>
                <span className={`pill ${t.status === 'Completed' ? 'pill-green' : 'pill-yellow'}`}>{t.status || 'Active'}</span>
              </div>
              <div className="panel-body" style={{ flex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Linked Research</label>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <FolderIcon size={14} color="var(--accent)" />
                    {t.project?.title || "Independent Research"}
                  </div>
                </div>

                <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Active Members</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {t.members.map(m => (
                    <div key={m._id} style={{
                      fontSize: 12, padding: "5px 12px", borderRadius: 20,
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      color: "var(--text)", fontWeight: 500
                    }}>
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analytical View */}
      {teams.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Operational Progress Metrics</span>
            <span className="panel-tag">Simulated Data</span>
          </div>
          <div className="panel-body" style={{ height: 320, padding: 32 }}>
            <div style={{ width: '100%', height: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }}
                  />
                  <Bar dataKey="completion" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} label={{ position: 'top', fill: 'var(--text-muted)', fontSize: 11, formatter: (v) => `${v}%` }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

