import { useEffect, useState } from "react";
import { getRecruiters } from "../../../services/adminPlacementService";
import { X } from "lucide-react";

export default function PlacementRecruitersSummary({ theme }) {
  const [recruiters, setRecruiters] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchRecruiters(); }, []);

  async function fetchRecruiters() {
    try {
      const res = await getRecruiters();
      setRecruiters(res.data || []);
    } catch (err) {
      console.error("Failed to load recruiters", err);
    }
  }

  if (recruiters.length === 0) return null;

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Top Recruiters</span>
          {recruiters.length > 0 && (
            <button
              className="btn-text"
              style={{ fontSize: 11.5, color: "var(--accent)", fontWeight: 700 }}
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'recruiters' }))}
            >
              Manage All →
            </button>
          )}
        </div>
        <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {recruiters.slice(0, 5).map((r) => (
            <div key={r._id} style={{
              padding: "10px 12px",
              background: "var(--surface-2)",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text)",
            }}>
              {r.companyName}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Recruiters ({recruiters.length})</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {recruiters.map((r) => (
                  <div key={r._id} style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{r.companyName}</div>
                    {r.role && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Role: {r.role}</div>}
                    {r.package && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>Package: {r.package}</div>}
                    {r.description && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{r.description}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}