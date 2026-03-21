import { useEffect, useState } from "react";
import toast from '../common/toastManager';
import { Target, Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  getPlacementObjectives,
  addPlacementObjective,
  updatePlacementObjective,
  deletePlacementObjective,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import LoadingSpinner from "./shared/LoadingSpinner";
import Modal from "./shared/Modal";

export default function PlacementObjectivesAdmin() {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchObjectives(); }, []);

  async function fetchObjectives() {
    try {
      setLoading(true);
      const res = await getPlacementObjectives();
      const dataArr = res.data.data || (Array.isArray(res.data) ? res.data : []);
      setObjectives(dataArr);
    } catch (err) {
      console.error("Failed to load objectives", err);
      toast.error("Failed to load objectives");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newObjective.trim()) return;
    try {
      setSaving(true);
      await addPlacementObjective({ objective: newObjective });
      setNewObjective("");
      toast.success("Objective added!");
      fetchObjectives();
    } catch (err) {
      toast.error("Failed to add objective");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editValue.trim() || !editingId) return;
    try {
      setSaving(true);
      await updatePlacementObjective(editingId, { objective: editValue });
      toast.success("Objective updated!");
      setEditingId(null);
      setEditValue("");
      fetchObjectives();
    } catch (err) {
      toast.error("Failed to update objective");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(obj) { setEditingId(obj._id); setEditValue(obj.objective); }
  function cancelEdit() { setEditingId(null); setEditValue(""); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePlacementObjective(deleteTarget._id);
      toast.success("Objective deleted");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchObjectives();
    } catch (err) {
      toast.error("Failed to delete objective");
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner text="Loading objectives..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">Strategic <em>Objectives</em></h1>
        <p className="page-subtitle">Define and manage key goals for the placement ecosystem.</p>
      </div>

      {/* ADD FORM */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <span className="panel-title">Add New Objective</span>
        </div>
        <div className="panel-body" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="Type a new mission goal..."
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} loading={saving} disabled={!newObjective.trim()} variant="primary" icon={<Plus size={14} />}>
            Add Goal
          </Button>
        </div>
      </div>

      {/* OBJECTIVES LIST */}
      {objectives.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "56px 20px" }}>
          <Target size={36} style={{ color: "var(--border)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>No objectives defined yet.</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Start by adding your first placement goal above.</p>
        </div>
      ) : (
        <div className="grid-2">
          {objectives.map((obj, index) => (
            <div key={obj._id} className="panel" style={{ position: "relative" }}>
              <div className="panel-body" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 5, background: "rgba(45,106,79,0.1)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === obj._id ? (
                    <div>
                      <textarea
                        className="form-textarea"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        autoFocus
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={cancelEdit}>Cancel</button>
                        <Button onClick={handleUpdate} disabled={saving || !editValue.trim()} variant="primary" size="sm">
                          {saving ? "Saving..." : "Update Goal"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>{obj.objective}</p>
                      <span className="pill pill-gray">In Progress</span>
                    </>
                  )}
                </div>
                {editingId !== obj._id && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => startEdit(obj)} className="btn-text" style={{ padding: "4px 6px" }}><Edit2 size={13} /></button>
                    <button onClick={() => { setDeleteTarget(obj); setShowDeleteModal(true); }} className="btn-danger" style={{ padding: "4px 6px" }}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Objective" message={`This will permanently remove Objective #${objectives.indexOf(deleteTarget) + 1}. Continue?`} confirmText="Remove Goal" variant="danger" />
    </div>
  );
}
