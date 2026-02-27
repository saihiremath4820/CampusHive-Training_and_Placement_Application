import { useEffect, useState } from "react";
import { getIndustryCollaborations } from "../../../services/adminPlacementService";
import { X } from "lucide-react";

export default function IndustryCollaborationsSummary({ theme }) {
  const [collaborations, setCollaborations] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchCollaborations(); }, []);

  async function fetchCollaborations() {
    try {
      const res = await getIndustryCollaborations();
      setCollaborations(res.data || []);
    } catch (err) {
      console.error("Failed to load industry collaborations", err);
    }
  }

  if (collaborations.length === 0) return null;

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Industry Collaborations</span>
          {collaborations.length > 5 && (
            <button className="btn-text" style={{ fontSize: 11.5 }} onClick={() => setShowModal(true)}>
              View All ({collaborations.length})
            </button>
          )}
        </div>
        <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {collaborations.slice(0, 5).map((c) => (
            <div key={c._id} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{c.organizationName}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{c.purpose}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Industry Collaborations ({collaborations.length})</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {collaborations.map((c) => (
                  <div key={c._id} style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{c.organizationName}</div>
                    <div className="pill pill-blue" style={{ marginBottom: 8 }}>{c.purpose}</div>
                    {c.description && (
                      <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{c.description}</div>
                    )}
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