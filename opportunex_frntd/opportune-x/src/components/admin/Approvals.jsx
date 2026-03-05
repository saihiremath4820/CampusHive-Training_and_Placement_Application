import { useEffect, useState } from "react";
import { Building2, GraduationCap } from "lucide-react";
import toast from '../common/toastManager';
import {
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getPendingFaculty,
  approveFaculty,
  rejectFaculty,
} from "../../services/adminService";
import LoadingSpinner from "./shared/LoadingSpinner";

export default function Approvals() {
  const [companies, setCompanies] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function fetchData() {
    try {
      setLoading(true);
      const [compRes, facRes] = await Promise.all([
        getPendingCompanies(),
        getPendingFaculty(),
      ]);
      setCompanies(compRes.data || []);
      setFaculty(facRes.data || []);
    } catch (err) {
      console.error("Failed to load approvals", err.response?.data || err.message);
      toast.error("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAction(id, type, action) {
    setActionLoading(id);
    try {
      if (type === 'company') {
        if (action === 'approve') await approveCompany(id);
        else await rejectCompany(id);
      } else {
        if (action === 'approve') await approveFaculty(id);
        else await rejectFaculty(id);
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} ${action === 'approve' ? 'approved' : 'rejected'}`);
      await fetchData();
      window.dispatchEvent(new Event('refreshPendingCounts'));
    } catch (err) {
      toast.error(`Action failed: ${err.response?.data?.message || 'Server error'}`);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading pending requests..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">Registration <em>Approvals</em></h1>
        <p className="page-subtitle">Review and manage registration requests from companies and faculty members.</p>
      </div>

      <div className="grid-2">
        {/* ── Companies ──────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Building2 size={15} style={{ color: "var(--accent)" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              Pending Companies
            </span>
            <span className="pill pill-blue" style={{ marginLeft: "auto" }}>{companies.length}</span>
          </div>

          {companies.length === 0 ? (
            <div style={{
              border: "1px solid var(--border)", borderRadius: 8,
              padding: "40px 20px", textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
              background: "var(--surface)"
            }}>
              No pending company registrations
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {companies.map((c) => (
                <ApprovalCard
                  key={c._id}
                  item={c}
                  type="company"
                  actionLoading={actionLoading}
                  onApprove={() => handleAction(c._id, 'company', 'approve')}
                  onReject={() => handleAction(c._id, 'company', 'reject')}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Faculty ──────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <GraduationCap size={15} style={{ color: "var(--green)" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              Pending Faculty
            </span>
            <span className="pill pill-green" style={{ marginLeft: "auto" }}>{faculty.length}</span>
          </div>

          {faculty.length === 0 ? (
            <div style={{
              border: "1px solid var(--border)", borderRadius: 8,
              padding: "40px 20px", textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
              background: "var(--surface)"
            }}>
              No pending faculty registrations
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {faculty.map((f) => (
                <ApprovalCard
                  key={f._id}
                  item={f}
                  type="faculty"
                  actionLoading={actionLoading}
                  onApprove={() => handleAction(f._id, 'faculty', 'approve')}
                  onReject={() => handleAction(f._id, 'faculty', 'reject')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ item, type, actionLoading, onApprove, onReject }) {
  const isLoading = actionLoading === item._id;

  return (
    <div className="panel" style={{ padding: 0 }}>
      <div className="panel-body">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 6,
              background: "var(--surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15,
              color: "var(--text)", flexShrink: 0
            }}>
              {item.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{item.name}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                {item.email}
              </div>
            </div>
          </div>
          <span className="pill pill-yellow">Pending</span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-primary"
            onClick={onApprove}
            disabled={isLoading}
            style={{ flex: 1, padding: "8px 0" }}
          >
            {isLoading ? "Processing..." : "Approve"}
          </button>
          <button
            className="btn-ghost"
            onClick={onReject}
            disabled={isLoading}
            style={{ padding: "8px 16px", color: "var(--red)", borderColor: "var(--red)" }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
