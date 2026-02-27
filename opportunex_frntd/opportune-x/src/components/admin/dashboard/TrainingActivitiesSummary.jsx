import { useEffect, useState } from "react";
import { getTrainingActivities } from "../../../services/adminPlacementService";
import { X } from "lucide-react";

export default function TrainingActivitiesSummary() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getTrainingActivities()
      .then((res) => setTrainings(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="panel">
      <div className="panel-body" style={{ color: "var(--text-muted)", fontSize: 13 }}>
        Loading activities...
      </div>
    </div>
  );

  if (trainings.length === 0) return (
    <div className="panel">
      <div className="panel-body" style={{ color: "var(--text-muted)", fontSize: 13 }}>
        No training &amp; activities available.
      </div>
    </div>
  );

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Training &amp; Activities</span>
          {trainings.length > 0 && (
            <button
              className="btn-text"
              style={{ fontSize: 11.5, color: "var(--accent)", fontWeight: 700 }}
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'placement' }))}
            >
              Manage All →
            </button>
          )}
        </div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {trainings.slice(0, 5).map((t) => (
            <div key={t._id} style={{
              padding: "10px 12px",
              background: "var(--surface-2)",
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{t.title}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {new Date(t.date).toLocaleDateString()} · {t.description || 'No description'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 660 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Training &amp; Activities ({trainings.length})</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {trainings.map((t) => (
                <div key={t._id} style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{t.title}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginLeft: 12, flexShrink: 0 }}>
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{t.description || 'No description provided'}</div>
                  {t.category && (
                    <span className="pill pill-blue" style={{ marginTop: 8 }}>{t.category}</span>
                  )}
                </div>
              ))}
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