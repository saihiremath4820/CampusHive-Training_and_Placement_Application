import { useState, useEffect, useMemo } from "react";
import { Search, Filter, User, GraduationCap, Zap, Clock, Loader2, Download, Briefcase, Mail, CheckCircle2, XCircle, ArrowRight, Star } from "lucide-react";
import toast from "react-hot-toast";
import { getApplicants, updateApplicantStatus } from "../../services/companyApi";

export default function Applicants({ opportunityId, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!opportunityId) return;
    fetchApplicants();
  }, [opportunityId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await getApplicants(opportunityId);
      const apiData = res.data.applications || [];

      // Transform API data to match UI expectations
      const formattedApiData = apiData.map(app => {
        let previewUrl = null;
        if (app.studentProfile?.resumePath) {
          const p = app.studentProfile.resumePath;
          if (p.startsWith("http://") || p.startsWith("https://")) {
            previewUrl = p;
          } else {
            const filename = p.replace(/\\/g, "/").split("/").pop();
            previewUrl = `${import.meta.env.VITE_API_BASE}/uploads/resumes/${filename}`;
          }
        }

        return {
          _id: app._id,
          name: app.studentId?.name || "Student",
          email: app.studentId?.email || "student@pict.edu",
          branch: app.studentProfile?.branch || "Engineering",
          year: app.studentProfile?.year || "4th Year",
          status: app.status === "Applied" ? "Pending" : app.status,
          skills: app.studentProfile?.skills?.length ? app.studentProfile.skills : ["Java", "SQL"],
          resumeUrl: previewUrl
        };
      });

      setApplicants(formattedApiData);
    } catch {
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicantId, status) => {
    setProcessing(applicantId);
    try {
      // Map UI "Pending" back to backend "Applied" if needed
      const backendStatus = status === "Pending" ? "Applied" : status;

      await updateApplicantStatus(applicantId, backendStatus);

      setApplicants(prev => prev.map(a => a._id === applicantId ? { ...a, status } : a));
      toast.success(`Pipeline updated: ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = useMemo(() => {
    let data = [...applicants];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.branch?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "All") data = data.filter(a => a.status === filterStatus);
    return data;
  }, [applicants, searchQuery, filterStatus]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header with Back Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface)", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: "var(--text-muted)"
            }}
          >
            <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
          </button>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Vetting Dashboard</h3>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Reviewing applications for <span style={{ color: "var(--accent)", fontWeight: 600 }}>#{opportunityId}</span></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search talent..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-field"
              style={{ paddingLeft: 36, width: 220, height: 38 }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="form-select"
            style={{ width: 140, height: 38 }}
          >
            <option value="All">All Statuses</option>
            {["Pending", "Shortlisted", "Selected", "Rejected"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid-4">
        {[
          { label: "Total Applications", value: applicants.length, icon: User, color: "var(--accent)" },
          { label: "Pipeline Shortlist", value: applicants.filter(a => a.status === 'Shortlisted').length, icon: Zap, color: "var(--purple)" },
          { label: "Awaiting Review", value: applicants.filter(a => a.status === 'Pending').length, icon: Clock, color: "var(--yellow)" },
          { label: "Success Rate", value: "24%", icon: CheckCircle2, color: "var(--green)" },
        ].map((stat, i) => (
          <div key={i} className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${stat.color}15`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Data Table */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Applicant Identity</th>
              <th>Academic Credentials</th>
              <th>Skills & Tech Stack</th>
              <th>Pipeline Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                  Zero talent matches found in current filters.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{app.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={10} /> {app.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{app.branch}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{app.year}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {app.skills?.slice(0, 3).map(skill => (
                        <span key={skill} className="pill" style={{ fontSize: 9, padding: "2px 6px" }}>{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${app.status === 'Shortlisted' ? 'pill-purple' : app.status === 'Rejected' ? 'pill-red' : 'pill-yellow'}`} style={{ fontSize: 10 }}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {/* Shortlist */}
                      <button
                        onClick={() => handleStatusUpdate(app._id, "Shortlisted")}
                        className="btn-primary"
                        style={{ width: 30, height: 30, padding: 0, borderRadius: 6, background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", color: "var(--purple)", opacity: app.status === "Shortlisted" || app.status === "Selected" ? 0.4 : 1 }}
                        title="Shortlist"
                        disabled={app.status === "Shortlisted" || app.status === "Selected"}
                      >
                        <Zap size={14} />
                      </button>
                      {/* Selected — only when shortlisted */}
                      {(app.status === "Shortlisted" || app.status === "Selected") && (
                        <button
                          onClick={() => handleStatusUpdate(app._id, "Selected")}
                          style={{ width: 30, height: 30, padding: 0, borderRadius: 6, background: app.status === "Selected" ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)", cursor: app.status === "Selected" ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Mark as Selected"
                          disabled={app.status === "Selected"}
                        >
                          <Star size={14} />
                        </button>
                      )}
                      {/* Reject */}
                      <button
                        onClick={() => handleStatusUpdate(app._id, "Rejected")}
                        className="btn-primary"
                        style={{ width: 30, height: 30, padding: 0, borderRadius: 6, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--red)", opacity: app.status === "Rejected" ? 0.4 : 1 }}
                        title="Reject"
                        disabled={app.status === "Rejected"}
                      >
                        <XCircle size={14} />
                      </button>
                      {/* Resume */}
                      <button
                        onClick={() => {
                          if (app.resumeUrl) window.open(app.resumeUrl, "_blank");
                          else toast.error("No resume uploaded");
                        }}
                        className="btn-primary"
                        style={{ width: 30, height: 30, padding: 0, borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)", color: app.resumeUrl ? "var(--text-muted)" : "rgba(100,100,100,0.2)", cursor: app.resumeUrl ? "pointer" : "not-allowed" }}
                        title="View Resume"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

