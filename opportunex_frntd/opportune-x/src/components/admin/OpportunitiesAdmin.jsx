import { useEffect, useState, useMemo } from "react";
import { Briefcase, CheckCircle, Ban, Search, Building2, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";
import { getAllOpportunities, disableOpportunity, approveDrive, rejectDrive } from "../../services/adminService";
import LoadingSpinner from "./shared/LoadingSpinner";

const APPROVAL_FILTERS = ["All", "pending", "approved", "rejected"];
const STATUS_FILTERS = ["All", "Active", "Closed"];

export default function OpportunitiesAdmin() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchOpportunities() {
    try {
      setLoading(true);
      const res = await getAllOpportunities();
      setOpportunities(res.data || []);
    } catch (err) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOpportunities(); }, []);

  async function handleToggle(id) {
    setActionLoading(id + "_toggle");
    try {
      await disableOpportunity(id);
      await fetchOpportunities();
      toast.success("Drive status updated");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApprove(id, title) {
    setActionLoading(id + "_approve");
    try {
      await approveDrive(id);
      toast.success(`"${title}" approved!`);
      fetchOpportunities();
    } catch {
      toast.error("Approval failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id, title) {
    const reason = prompt(`Reason for rejecting "${title}" (optional):`);
    if (reason === null) return; // cancelled
    setActionLoading(id + "_reject");
    try {
      await rejectDrive(id, reason);
      toast.success(`"${title}" rejected`);
      fetchOpportunities();
    } catch {
      toast.error("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = useMemo(() => {
    return opportunities.filter(op => {
      const matchApproval = approvalFilter === "All" || op.approvalStatus === approvalFilter;
      const matchStatus = statusFilter === "All" || op.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        op.title?.toLowerCase().includes(q) ||
        op.createdBy?.name?.toLowerCase().includes(q);
      return matchApproval && matchStatus && matchSearch;
    });
  }, [opportunities, approvalFilter, statusFilter, searchTerm]);

  const approvalColor = {
    pending: { bg: "rgba(224,155,61,0.1)", color: "var(--yellow)" },
    approved: { bg: "rgba(16,185,129,0.1)", color: "var(--green)" },
    rejected: { bg: "rgba(200,75,49,0.1)", color: "var(--red)" },
  };

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading opportunities..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">All <em>Drives</em></h1>
        <p className="page-subtitle">Oversee and manage all placement drives. Approve or reject company submissions.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by title or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ paddingLeft: 32, width: 240, height: 36 }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {APPROVAL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setApprovalFilter(f)}
              style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                border: `1px solid ${approvalFilter === f ? (approvalColor[f]?.color || "var(--accent)") : "var(--border)"}`,
                background: approvalFilter === f ? (approvalColor[f]?.bg || "rgba(27,79,216,0.1)") : "var(--surface)",
                color: approvalFilter === f ? (approvalColor[f]?.color || "var(--accent)") : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ height: 36, fontSize: 12, width: 120 }}
        >
          {STATUS_FILTERS.map(f => <option key={f}>{f}</option>)}
        </select>

        <span className="panel-tag" style={{ marginLeft: "auto" }}>{filtered.length} drives</span>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <Briefcase size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>No drives found matching filters</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Title</th>
                  <th>Company</th>
                  <th>Posted</th>
                  <th>Applicants</th>
                  <th>Approval</th>
                  <th>Active</th>
                  <th style={{ textAlign: "right", paddingRight: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((op) => {
                  const cfg = approvalColor[op.approvalStatus] || {};
                  return (
                    <tr key={op._id}>
                      <td style={{ paddingLeft: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{op.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{op.type}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                          <Building2 size={11} />
                          {op.createdBy?.name || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {op.createdAt ? new Date(op.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                          <Users size={11} />
                          {op.applicantCount ?? 0}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                          background: cfg.bg, color: cfg.color,
                        }}>
                          {op.approvalStatus}
                        </span>
                        {op.rejectionReason && (
                          <div style={{ fontSize: 10, color: "var(--red)", marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={op.rejectionReason}
                          >
                            {op.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`pill ${op.status === "Active" ? "pill-green" : "pill-red"}`} style={{ fontSize: 10 }}>
                          {op.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: 20 }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                          {op.approvalStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(op._id, op.title)}
                                disabled={!!actionLoading}
                                className="btn-primary"
                                style={{ padding: "5px 10px", fontSize: 11 }}
                              >
                                {actionLoading === op._id + "_approve" ? "..." : "✓ Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(op._id, op.title)}
                                disabled={!!actionLoading}
                                style={{ padding: "5px 10px", fontSize: 11, background: "rgba(200,75,49,0.1)", border: "1px solid rgba(200,75,49,0.2)", borderRadius: 6, color: "var(--red)", cursor: "pointer" }}
                              >
                                {actionLoading === op._id + "_reject" ? "..." : "Reject"}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggle(op._id)}
                            disabled={!!actionLoading}
                            className={op.status === "Active" ? "btn-danger" : "btn-text"}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", fontSize: 11 }}
                          >
                            {actionLoading === op._id + "_toggle" ? "..." : op.status === "Active" ? <><Ban size={11} /> Disable</> : <><CheckCircle size={11} /> Enable</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
