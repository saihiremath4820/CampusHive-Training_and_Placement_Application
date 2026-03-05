import { useEffect, useState } from "react";
import toast from '../common/toastManager';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import {
  getIndustryCollaborations,
  addIndustryCollaboration,
  updateIndustryCollaboration,
  deleteIndustryCollaboration,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import EmptyState from "./shared/EmptyState";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_COLLAB = { organization: "", type: "", description: "" };

export default function IndustryCollaborationAdmin() {
  const [collaborations, setCollaborations] = useState([]);
  const [current, setCurrent] = useState(EMPTY_COLLAB);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchCollaborations(); }, []);

  async function fetchCollaborations() {
    try {
      setLoading(true);
      const res = await getIndustryCollaborations();
      setCollaborations(res.data || []);
    } catch (err) {
      console.error("Failed to load collaborations", err);
      toast.error("Failed to load industry collaborations");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!current.organization?.trim() || !current.type?.trim()) {
      toast.error("Organization and type are required"); return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await updateIndustryCollaboration(editingId, current);
        toast.success("Collaboration updated successfully!");
      } else {
        await addIndustryCollaboration(current);
        toast.success("Collaboration added successfully!");
      }
      setCurrent(EMPTY_COLLAB);
      setEditingId(null);
      fetchCollaborations();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(editingId ? "Failed to update collaboration" : "Failed to add collaboration");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(collab) {
    setCurrent({ organization: collab.organizationName || "", type: collab.purpose || "", description: collab.description || "" });
    setEditingId(collab._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() { setCurrent(EMPTY_COLLAB); setEditingId(null); }
  function openDeleteModal(collab) { setDeleteTarget(collab); setShowDeleteModal(true); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteIndustryCollaboration(deleteTarget._id);
      toast.success("Collaboration deleted successfully!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchCollaborations();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete collaboration");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading collaborations..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">Industry <em>Collaborations</em></h1>
        <p className="page-subtitle">Manage partnerships and collaborations with industry organizations.</p>
      </div>

      {/* ADD/EDIT FORM */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <span className="panel-title">{editingId ? "Edit Collaboration" : "Add New Collaboration"}</span>
          {editingId && (
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          )}
        </div>
        <div className="panel-body">
          <div className="form-row-2" style={{ marginBottom: 12 }}>
            <input className="form-input" placeholder="Organization / Company Name *" value={current.organization} onChange={(e) => setCurrent({ ...current, organization: e.target.value })} />
            <input className="form-input" placeholder="Collaboration Type / Purpose *" value={current.type} onChange={(e) => setCurrent({ ...current, type: e.target.value })} />
          </div>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label>Description (optional)</label>
            <textarea className="form-textarea" placeholder="Describe this collaboration..." value={current.description} onChange={(e) => setCurrent({ ...current, description: e.target.value })} rows={3} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={handleSave} variant="primary" loading={saving} icon={editingId ? <Edit2 size={14} /> : <Plus size={14} />}>
              {editingId ? "Update Collaboration" : "Add Collaboration"}
            </Button>
            {editingId && <Button onClick={handleCancelEdit} variant="ghost">Cancel</Button>}
          </div>
        </div>
      </div>

      {/* LIST */}
      {collaborations.length === 0 ? (
        <div className="panel"><EmptyState icon="building" title="No collaborations yet" message="Add your first industry collaboration to showcase partnerships" /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {collaborations.map((c) => {
            const isExpanded = expandedId === c._id;
            const desc = c.description?.trim();
            const hasLongDesc = desc && desc.length > 150;
            return (
              <div key={c._id} className="panel">
                <div className="panel-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{c.organizationName}</div>
                      <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 8 }}>{c.purpose}</div>
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {desc ? (
                          <>
                            {isExpanded || !hasLongDesc ? desc : `${desc.slice(0, 150)}...`}
                            {hasLongDesc && (
                              <button onClick={() => setExpandedId(isExpanded ? null : c._id)} className="btn-text" style={{ marginLeft: 6, fontSize: 11 }}>
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </>
                        ) : (
                          <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No description provided</span>
                        )}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => handleEdit(c)} className="btn-text" style={{ padding: "4px 6px" }}><Edit2 size={13} /></button>
                      <button onClick={() => openDeleteModal(c)} className="btn-danger" style={{ padding: "4px 6px" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Collaboration" message={`Are you sure you want to delete "${deleteTarget?.organizationName}"? This action cannot be undone.`} confirmText="Delete" variant="danger" loading={deleting} />
    </div>
  );
}