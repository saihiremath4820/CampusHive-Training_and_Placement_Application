import { useEffect, useState } from "react";
import { getTpoContacts } from "../../../services/adminPlacementService";
import { X, Mail, Phone } from "lucide-react";

export default function TpoContactsSummary({ theme }) {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    try {
      const res = await getTpoContacts();
      setContacts(res.data || []);
    } catch (err) {
      console.error("Failed to load TPO contacts", err);
    }
  }

  if (contacts.length === 0) return null;

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">TPO / Placement Contacts</span>
          {contacts.length > 5 && (
            <button className="btn-text" style={{ fontSize: 11.5 }} onClick={() => setShowModal(true)}>
              View All ({contacts.length})
            </button>
          )}
        </div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contacts.slice(0, 5).map((c) => (
            <div key={c._id} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{c.role}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{c.email}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 660 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All TPO Contacts ({contacts.length})</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {contacts.map((c) => (
                  <div key={c._id} className="contact-card">
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{c.name}</div>
                    <div className="contact-role" style={{ marginBottom: 8 }}>{c.role}</div>
                    <div className="contact-info-row">
                      <Mail size={12} />
                      <a href={`mailto:${c.email}`} style={{ color: "inherit", textDecoration: "none" }}>{c.email}</a>
                    </div>
                    {c.phone && (
                      <div className="contact-info-row" style={{ marginTop: 4 }}>
                        <Phone size={12} />
                        <a href={`tel:${c.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{c.phone}</a>
                      </div>
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