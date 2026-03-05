import { useEffect, useState } from "react";
import toast from '../common/toastManager';
import { Edit2, Trash2, Plus, X, GitMerge, Check, Briefcase, FileText, Users, Mic, Award, Flag } from 'lucide-react';
import {
  getPlacementProcess,
  upsertPlacementProcess,
  deletePlacementProcess,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_STEP = { stepNumber: "", title: "", description: "" };

const getIconForTitle = (title) => {
  const t = title.toLowerCase();
  if (t.includes("register") || t.includes("sign")) return FileText;
  if (t.includes("interview") || t.includes("talk")) return Mic;
  if (t.includes("test") || t.includes("exam")) return Check;
  if (t.includes("offer") || t.includes("letter")) return Award;
  if (t.includes("group") || t.includes("discussion")) return Users;
  if (t.includes("start") || t.includes("kickoff")) return Flag;
  return Briefcase;
};

export default function PlacementProcessAdmin() {
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(EMPTY_STEP);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => { fetchProcess(); }, []);

  async function fetchProcess() {
    try {
      setLoading(true);
      const res = await getPlacementProcess();
      const sorted = (res.data || []).sort((a, b) => a.stepNumber - b.stepNumber);
      setSteps(sorted);
    } catch (err) {
      console.error("Failed to load process", err);
      toast.error("Failed to load placement process");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!current.stepNumber || !current.title?.trim() || !current.description?.trim()) {
      toast.error("All fields are required"); return;
    }
    const stepNum = Number(current.stepNumber);
    if (isNaN(stepNum) || stepNum < 1) { toast.error("Step number must be a positive number"); return; }
    try {
      setSaving(true);
      await upsertPlacementProcess({ stepNumber: stepNum, title: current.title, description: current.description });
      toast.success(editingId ? "Step updated!" : "Step added!");
      setCurrent(EMPTY_STEP);
      setEditingId(null);
      setShowAddForm(false);
      fetchProcess();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save process step");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(step) {
    setCurrent({ stepNumber: step.stepNumber.toString(), title: step.title || "", description: step.description || "" });
    setEditingId(step._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() { setCurrent(EMPTY_STEP); setEditingId(null); setShowAddForm(false); }
  function openDeleteModal(step) { setDeleteTarget(step); setShowDeleteModal(true); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deletePlacementProcess(deleteTarget._id);
      toast.success("Process step deleted!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchProcess();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete process step");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner text="Loading process..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Placement <em>Process</em></h1>
          <p className="page-subtitle">Define the step-by-step procedure for campus placements.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} icon={<Plus size={14} />} variant="primary">Add Step</Button>
        )}
      </div>

      {/* ADD/EDIT FORM */}
      {showAddForm && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <span className="panel-title">{editingId ? "Edit Step Details" : "Add New Step"}</span>
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          </div>
          <div className="panel-body">
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 14, marginBottom: 14 }}>
              <div className="form-field">
                <label>Step #</label>
                <input className="form-input" type="number" value={current.stepNumber} onChange={(e) => setCurrent({ ...current, stepNumber: e.target.value })} placeholder="1" min="1" style={{ fontFamily: "'DM Mono', monospace", textAlign: "center" }} />
              </div>
              <div className="form-field">
                <label>Title</label>
                <input className="form-input" type="text" value={current.title} onChange={(e) => setCurrent({ ...current, title: e.target.value })} placeholder="e.g. Pre-Placement Talk" />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Description</label>
              <textarea className="form-textarea" value={current.description} onChange={(e) => setCurrent({ ...current, description: e.target.value })} rows={3} placeholder="Describe exactly what happens in this step..." />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button onClick={handleCancelEdit} variant="ghost">Cancel</Button>
              <Button onClick={handleSave} variant="primary" loading={saving} icon={<Check size={14} />}>
                {editingId ? "Update Step" : "Save Step"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEPS LIST */}
      {steps.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "56px 20px" }}>
          <GitMerge size={36} style={{ color: "var(--border)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Map out your placement journey.</p>
          <button className="btn-text" onClick={() => setShowAddForm(true)}>Start by adding step 1</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step) => {
            const Icon = getIconForTitle(step.title);
            return (
              <div key={step._id} className="panel">
                <div className="panel-body" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 7, background: "rgba(27,79,216,0.08)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="pill pill-blue">Step {step.stepNumber}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>{step.title}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{step.description}</p>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(step)} className="btn-text" style={{ padding: "4px 6px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openDeleteModal(step)} className="btn-danger" style={{ padding: "4px 6px" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Step" message={`Remove step ${deleteTarget?.stepNumber} "${deleteTarget?.title}"?`} confirmText="Remove Step" variant="danger" loading={deleting} />
    </div>
  );
}