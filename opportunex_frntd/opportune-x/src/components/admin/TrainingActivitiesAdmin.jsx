import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X, Calendar } from 'lucide-react';
import {
  getTrainingActivities,
  addTrainingActivity,
  updateTrainingActivity,
  deleteTraining,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_TRAINING = { title: "", date: "", description: "" };

export default function TrainingActivitiesAdmin() {
  const [trainings, setTrainings] = useState([]);
  const [current, setCurrent] = useState(EMPTY_TRAINING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchTrainings(); }, []);

  async function fetchTrainings() {
    try {
      setLoading(true);
      const res = await getTrainingActivities();
      const sorted = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setTrainings(sorted);
    } catch (err) {
      console.error("Failed to load trainings", err);
      toast.error("Failed to load training activities");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!current.title?.trim() || !current.date) { toast.error("Title and date are required"); return; }
    try {
      setSaving(true);
      if (editingId) {
        await updateTrainingActivity(editingId, current);
        toast.success("Training updated!");
      } else {
        await addTrainingActivity(current);
        toast.success("Training added!");
      }
      setCurrent(EMPTY_TRAINING);
      setEditingId(null);
      setShowAddForm(false);
      fetchTrainings();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(editingId ? "Failed to update training" : "Failed to add training");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(training) {
    const dateStr = training.date ? new Date(training.date).toISOString().split('T')[0] : "";
    setCurrent({ title: training.title || "", date: dateStr, description: training.description || "" });
    setEditingId(training._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setCurrent(EMPTY_TRAINING);
    setEditingId(null);
    setShowAddForm(false);
  }

  function openDeleteModal(training) { setDeleteTarget(training); setShowDeleteModal(true); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteTraining(deleteTarget._id);
      toast.success("Training deleted!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchTrainings();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete training");
    } finally {
      setDeleting(false);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner text="Loading trainings..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Training &amp; <em>Activities</em></h1>
          <p className="page-subtitle">Schedule workshops, seminars, and training sessions.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} icon={<Plus size={14} />} variant="primary">
            Add Activity
          </Button>
        )}
      </div>

      {/* ADD/EDIT FORM */}
      {showAddForm && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <span className="panel-title">{editingId ? "Edit Activity" : "Add New Activity"}</span>
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          </div>
          <div className="panel-body">
            <div className="form-row-2">
              <div className="form-field">
                <label>Title *</label>
                <input className="form-input" placeholder="e.g. Mock Interview Session" value={current.title} onChange={(e) => setCurrent({ ...current, title: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Date *</label>
                <input className="form-input" type="date" value={current.date} onChange={(e) => setCurrent({ ...current, date: e.target.value })} />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Description</label>
              <textarea className="form-textarea" placeholder="Details about the training activity..." value={current.description} onChange={(e) => setCurrent({ ...current, description: e.target.value })} rows={3} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button onClick={handleCancelEdit} variant="ghost">Cancel</Button>
              <Button onClick={handleSave} variant="primary" loading={saving} icon={editingId ? <Edit2 size={14} /> : <Plus size={14} />}>
                {editingId ? "Update Activity" : "Add Activity"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {trainings.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "56px 20px" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>No training activities scheduled.</p>
          <button className="btn-text" onClick={() => setShowAddForm(true)}>Schedule your first activity</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trainings.map((t) => (
            <div key={t._id} className="panel">
              <div className="panel-body" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, padding: "10px 14px", background: "rgba(27,79,216,0.07)", borderRadius: 6, textAlign: "center", minWidth: 88 }}>
                  <Calendar size={16} style={{ color: "var(--accent)", margin: "0 auto 4px" }} />
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>{formatDate(t.date)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{t.title}</div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>{t.description || "No description provided."}</p>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(t)} className="btn-text" style={{ padding: "4px 6px" }}><Edit2 size={13} /></button>
                  <button onClick={() => openDeleteModal(t)} className="btn-danger" style={{ padding: "4px 6px" }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Training Activity" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} confirmText="Delete" variant="danger" loading={deleting} />
    </div>
  );
}