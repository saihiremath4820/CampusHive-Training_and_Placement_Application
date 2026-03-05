import { useState, useEffect } from "react";
import {
  Briefcase, MapPin, ChevronRight, X,
  Users, ChevronDown, Loader2, Archive, Calendar, Clock, Filter
} from "lucide-react";
import toast from '../common/toastManager';
import { getCompanyOpportunities, closeOpportunity, deleteOpportunity } from "../../services/companyApi";


const STATUS_TABS = ["Active", "Closed", "Archived"];
const TYPE_OPTS = ["Full Time", "Part Time", "Internship", "Contract"];

export default function CompanyOpportunities({ onRefresh, onViewApplicants, onCreateNew, onEditOpportunity }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => { fetchOpportunities(); }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await getCompanyOpportunities();
      setOpportunities(res.data.data || res.data || []);
    } catch (err) {
      console.warn("Failed to fetch opportunities.", err);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (opp) => {
    if (!window.confirm("Close this job listing?")) return;
    try {
      await closeOpportunity(opp._id);
      setOpportunities(prev => prev.map(o => o._id === opp._id ? { ...o, status: "Closed" } : o));
      toast.success("Opening retired from talent pool.");
      if (onRefresh) onRefresh();
    } catch { toast.error("Communication failure with recruiter API."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this hiring record?")) return;
    try {
      await deleteOpportunity(id);
      setOpportunities(prev => prev.filter(o => o._id !== id));
      toast.success("Record cleared from database.");
      if (onRefresh) onRefresh();
    } catch { toast.error("Failed to delete record."); }
  };

  const filtered = opportunities.filter(o => {
    const statusMatch = activeTab === "Active" ? o.status !== "Closed" && o.status !== "Archived"
      : o.status?.toLowerCase() === activeTab.toLowerCase();
    const typeMatch = filterType === "All" || o.type === filterType;
    return statusMatch && typeMatch;
  });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Search & Filter Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", background: "var(--surface-2)", padding: "4px", borderRadius: 8, border: "1px solid var(--border)" }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === tab ? "var(--surface)" : "transparent",
                  color: activeTab === tab ? "var(--text)" : "var(--text-muted)",
                  boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="form-select"
              style={{ padding: "4px 12px", height: 30, fontSize: 12, width: 140 }}
            >
              <option value="All">All Types</option>
              {TYPE_OPTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="btn-primary"
          style={{ padding: "8px 16px", fontSize: 13, gap: 8 }}
        >
          <PlusCircle size={15} />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* Grid of Jobs */}
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "60px 0", textAlign: "center" }}>
            <Archive size={40} style={{ color: "var(--border)", marginBottom: 16 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No hiring records found matching these criteria.</p>
          </div>
        ) : (
          filtered.map((op) => {
            const isSeed = op._id.startsWith("hc-");
            return (
              <div key={op._id} className="panel" style={{
                padding: 0,
                display: "flex",
                flexDirection: "column",
                border: isSeed ? "1px solid var(--accent-light)" : "1px solid var(--border)"
              }}>
                <div style={{ padding: 20, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <div className={`pill ${op.status === 'Active' ? 'pill-green' : 'pill-yellow'}`} style={{ fontSize: 9 }}>
                        {op.status || 'Active'}
                      </div>
                      {/* Approval status badge */}
                      {op.approvalStatus && (
                        <div className={`pill ${op.approvalStatus === 'approved' ? 'pill-green' : op.approvalStatus === 'rejected' ? 'pill-red' : 'pill-yellow'}`} style={{ fontSize: 9 }}>
                          {op.approvalStatus === 'approved' ? '✓ Approved' : op.approvalStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
                        </div>
                      )}
                    </div>
                    {isSeed && <span className="pill pill-blue" style={{ fontSize: 8 }}>Seed Data</span>}
                  </div>
                  {op.approvalStatus === 'rejected' && op.rejectionReason && (
                    <div style={{ fontSize: 11, color: "var(--red)", background: "rgba(200,75,49,0.06)", border: "1px solid rgba(200,75,49,0.15)", borderRadius: 6, padding: "6px 10px", marginBottom: 8 }}>
                      ✗ Admin rejection reason: {op.rejectionReason}
                    </div>
                  )}

                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>{op.title}</h4>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                      <MapPin size={12} />
                      {op.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                      <Clock size={12} />
                      {op.type}
                    </div>
                  </div>

                  {op.requiredSkills && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                      {op.requiredSkills.slice(0, 3).map(skill => (
                        <span key={skill} style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          background: "var(--surface-2)",
                          borderRadius: 4,
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)"
                        }}>
                          {skill}
                        </span>
                      ))}
                      {op.requiredSkills.length > 3 && (
                        <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700 }}>+{op.requiredSkills.length - 3}</span>
                      )}

                      {op.minTenth > 0 && (
                        <span className="pill pill-yellow" style={{ fontSize: 10 }}>10th: {op.minTenth}%+</span>
                      )}
                      {op.minTwelfth > 0 && (
                        <span className="pill pill-yellow" style={{ fontSize: 10 }}>12th: {op.minTwelfth}%+</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 0", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(27,79,216,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                        <Users size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{op.applicantsCount || 0}</div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Applicants</div>
                      </div>
                    </div>

                    <button
                      onClick={() => onViewApplicants(op)}
                      className="btn-primary"
                      style={{ padding: "6px 12px", fontSize: 11, height: 30 }}
                    >
                      Management Hub
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "8px 20px", background: "var(--surface-2)", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTop: "1px solid var(--border)" }}>
                  {!isSeed && onEditOpportunity && (
                    <button
                      onClick={() => onEditOpportunity(op)}
                      style={{ background: "none", border: "none", fontSize: 11, color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(op)}
                    style={{ background: "none", border: "none", fontSize: 11, color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}
                  >
                    Retire Listing
                  </button>
                  <button
                    onClick={() => handleDelete(op._id)}
                    style={{ background: "none", border: "none", fontSize: 11, color: "var(--red)", cursor: "pointer", fontWeight: 600, opacity: 0.8 }}
                  >
                    Delete record
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const PlusCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
