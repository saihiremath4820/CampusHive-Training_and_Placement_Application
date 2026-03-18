import { useState, useEffect, useMemo, Fragment } from "react";
import { Search, User, Zap, Clock, Download, Mail, CheckCircle2, XCircle, ArrowRight, Star, Bot, FileText } from "lucide-react";
import api from "../../services/api";
import toast from '../common/toastManager';
import { getApplicants, updateApplicantStatus } from "../../services/companyApi";
import ATSResultModal from "./ATSResultModal";

export default function Applicants({ opportunityId, opportunity, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  // ATS state
  const [atsResults, setAtsResults] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [activeAtsResult, setActiveAtsResult] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!opportunityId) return;
    fetchApplicants();
  }, [opportunityId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await getApplicants(opportunityId);
      const apiData = res.data.applications || [];

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
          studentId: app.studentId,       // preserve full object including _id for ATS call
          name: app.studentId?.name || "Student",
          email: app.studentId?.email || "student@pict.edu",
          branch: app.studentProfile?.branch || "Engineering",
          year: app.studentProfile?.year || "4th Year",
          status: app.status === "Applied" ? "Pending" : app.status,
          skills: app.studentProfile?.skills?.length ? app.studentProfile.skills : ["Java", "SQL"],
          resumeUrl: previewUrl,
          submittedData: app.submittedData || null
        };
      });

      setApplicants(formattedApiData);
    } catch {
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (app) => {
    const appId = app._id;
    // Return cached result instantly if available
    if (atsResults[appId]) {
      setActiveAtsResult({ ...atsResults[appId], studentName: app.name });
      setShowAtsModal(true);
      return;
    }
    if (!opportunity) {
      toast.error("Opportunity data not available — please go back and re-open.");
      return;
    }
    setAnalyzingId(appId);
    try {
      const res = await api.post(
        "/ai/company-ats-score",
        { studentId: app.studentId?._id, opportunityId: opportunity._id },
        { timeout: 65000 }
      );
      const result = res.data;
      setAtsResults(prev => ({ ...prev, [appId]: result }));
      setActiveAtsResult({ ...result, studentName: app.name });
      setShowAtsModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Analysis failed";
      toast.error(msg);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleStatusUpdate = async (applicantId, status) => {
    setProcessing(applicantId);
    try {
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
    <>
      <div className="applications-review-page" style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "inherit" }}>

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
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Applications Review</h3>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                {opportunity ? <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{opportunity.title}</span> : <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Loading...</span>}
              </div>
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
            { label: "Total Applied", value: applicants.length, icon: User, color: "var(--blue)" },
            { label: "Shortlisted", value: applicants.filter(a => a.status === 'Shortlisted').length, icon: Zap, color: "var(--purple)" },
            { label: "Selected", value: applicants.filter(a => a.status === 'Selected').length, icon: CheckCircle2, color: "var(--green)" },
            { label: "Rejected", value: applicants.filter(a => a.status === 'Rejected').length, icon: XCircle, color: "var(--red)" },
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
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#4B5563", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", width: "30%" }}>Candidate</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#4B5563", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", width: "20%" }}>Skills</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#4B5563", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", width: "15%" }}>ATS Score</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#4B5563", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", width: "10%" }}>Status</th>
                <th style={{ textAlign: "right", padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#4B5563", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", width: "25%" }}>Actions</th>
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
                  <Fragment key={app._id}>
                    <tr style={{ transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ textAlign: "left", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, textTransform: "uppercase", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                            {app.name.charAt(0)}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, textTransform: "capitalize", marginBottom: 3 }}>
                              {app.name}
                            </div>
                            <div style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
                              {app.email}
                            </div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                              {app.branch} • {app.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "left", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {app.skills?.slice(0, 2).map((skill, i) => (
                            <span key={i} style={{ padding: "4px 8px", background: "#F3F4F6", borderRadius: "6px", fontSize: 12, fontWeight: 500, color: "#4B5563" }}>{skill}</span>
                          ))}
                          {app.skills?.length > 2 && (
                            <span style={{ padding: "4px 8px", background: "#E5E7EB", borderRadius: "6px", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                              +{app.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "left", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
                        {atsResults[app._id] ? (
                          <span style={{
                            padding: "6px 12px", borderRadius: "999px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
                            background: atsResults[app._id].overallScore >= 75 ? "#D1FAE5" : atsResults[app._id].overallScore >= 50 ? "#FEF3C7" : "#FEE2E2",
                            color: atsResults[app._id].overallScore >= 75 ? "#065F46" : atsResults[app._id].overallScore >= 50 ? "#92400E" : "#991B1B"
                          }}>
                            {atsResults[app._id].overallScore}% 🤖
                          </span>
                        ) : (
                          <span style={{ color: "#9CA3AF" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "left", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
                        <span style={{
                          padding: "6px 14px", borderRadius: "999px", fontSize: 12, fontWeight: 600, display: "inline-block",
                          background: app.status === 'Shortlisted' ? '#F3E8FF' : app.status === 'Rejected' ? '#FEE2E2' : app.status === 'Selected' ? '#D1FAE5' : '#FEF3C7',
                          color: app.status === 'Shortlisted' ? '#6B21A8' : app.status === 'Rejected' ? '#991B1B' : app.status === 'Selected' ? '#065F46' : '#92400E'
                        }}>
                          {app.status === 'Pending' ? '● Pending' : app.status === 'Shortlisted' ? '⚡ Shortlisted' : app.status === 'Selected' ? '⭐ Selected' : '✕ Rejected'}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, position: "relative" }}>
                          {/* AI Analyze Button */}
                          {!atsResults[app._id] && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAnalyze(app); }}
                              disabled={analyzingId === app._id}
                              style={{ padding: "6px 12px", borderRadius: 6, background: "white", color: "#374151", border: "1px solid #D1D5DB", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, cursor: analyzingId === app._id ? "default" : "pointer" }}
                            >
                              {analyzingId === app._id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <><Bot size={12} /> Analyze</>}
                            </button>
                          )}
                          {/* Resume */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (app.resumeUrl) window.open(app.resumeUrl, "_blank");
                              else toast.error("No resume uploaded");
                            }}
                            style={{ padding: "6px 12px", borderRadius: 6, background: "white", color: app.resumeUrl ? "#374151" : "#9CA3AF", border: "1px solid #D1D5DB", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, cursor: app.resumeUrl ? "pointer" : "not-allowed" }}
                          >
                            <Download size={12} /> Resume
                          </button>

                          {/* View Data */}
                          {app.submittedData && Object.keys(app.submittedData).some(k => app.submittedData[k] !== null) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === app._id ? null : app._id); }}
                              style={{ padding: "6px 12px", borderRadius: 6, background: "white", color: expandedRow === app._id ? "var(--accent)" : "#374151", border: expandedRow === app._id ? "1px solid var(--accent)" : "1px solid #D1D5DB", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                            >
                              <FileText size={12} /> {expandedRow === app._id ? "Hide Data" : "View Data"}
                            </button>
                          )}

                          {/* Dropdown Actions */}
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === app._id ? null : app._id); }}
                              style={{ padding: "6px 10px", borderRadius: 6, background: "white", color: "#374151", border: "1px solid #D1D5DB", cursor: "pointer", fontWeight: 700 }}
                            >
                              •••
                            </button>
                            {dropdownOpen === app._id && (
                              <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "white", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 10, minWidth: 140, overflow: "hidden", textAlign: "left" }}>
                                {app.status === 'Pending' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Shortlisted"); }} style={{ width: "100%", padding: "10px 16px", textAlign: "left", background: "none", border: "none", fontSize: 13, fontWeight: 500, color: "#4B5563", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                                    ⚡ Shortlist
                                  </button>
                                )}
                                {app.status === 'Shortlisted' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Selected"); }} style={{ width: "100%", padding: "10px 16px", textAlign: "left", background: "none", border: "none", fontSize: 13, fontWeight: 500, color: "#065F46", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                                    ⭐ Mark Selected
                                  </button>
                                )}
                                {app.status !== 'Rejected' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Rejected"); }} style={{ width: "100%", padding: "10px 16px", textAlign: "left", background: "none", border: "none", fontSize: 13, fontWeight: 500, color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderTop: app.status !== "Pending" ? "1px solid #E5E7EB" : "none" }}>
                                    ✕ Reject
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {expandedRow === app._id && app.submittedData && (
                      <tr>
                        <td colSpan="5" style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #E5E7EB" }}>
                          <div className="submitted-data-section" style={{ background: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                            <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>📋 Additional Submitted Information</h4>

                            {app.submittedData.githubUrl && (
                              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-muted)", width: "120px" }}>GitHub / Portfolio:</span>
                                <a href={app.submittedData.githubUrl}
                                  target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                                  {app.submittedData.githubUrl}
                                </a>
                              </div>
                            )}

                            {app.submittedData.linkedinUrl && (
                              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-muted)", width: "120px" }}>LinkedIn Profile:</span>
                                <a href={app.submittedData.linkedinUrl}
                                  target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                                  {app.submittedData.linkedinUrl}
                                </a>
                              </div>
                            )}

                            {app.submittedData.hasBacklog !== null && (
                              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-muted)", width: "120px" }}>Active Backlogs:</span>
                                <span style={{
                                  padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700,
                                  background: app.submittedData.hasBacklog ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                                  color: app.submittedData.hasBacklog ? "var(--red)" : "var(--green)"
                                }}>
                                  {app.submittedData.hasBacklog ? '⚠️ Yes, has backlogs' : '✅ No backlogs'}
                                </span>
                              </div>
                            )}

                            {app.submittedData.statementOfPurpose && (
                              <div style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Statement of Purpose:</span>
                                <p style={{ margin: 0, padding: "1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                  {app.submittedData.statementOfPurpose}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATS Result Modal */}
      {showAtsModal && activeAtsResult && (
        <ATSResultModal
          result={activeAtsResult}
          onClose={() => setShowAtsModal(false)}
        />
      )}
    </>
  );
}
