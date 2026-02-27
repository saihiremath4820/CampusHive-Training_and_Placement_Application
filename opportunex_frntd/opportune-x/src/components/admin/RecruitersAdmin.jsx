import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X, Briefcase, IndianRupee, Users } from 'lucide-react';
import {
  getRecruiters,
  addRecruiter,
  updateRecruiter,
  deleteRecruiter,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_RECRUITER = { companyName: "", role: "", package: "", description: "" };

export default function RecruitersAdmin() {
  const [recruiters, setRecruiters] = useState([]);
  const [current, setCurrent] = useState(EMPTY_RECRUITER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchRecruiters(); }, []);

  async function fetchRecruiters() {
    try {
      setLoading(true);
      const res = await getRecruiters();
      setRecruiters(res.data || []);
    } catch (err) {
      console.error("Failed to load recruiters", err);
      toast.error("Failed to load recruiters");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!current.companyName?.trim()) { toast.error("Company name is required"); return; }
    try {
      setSaving(true);
      if (editingId) {
        await updateRecruiter(editingId, current);
        toast.success("Recruiter updated!");
      } else {
        await addRecruiter(current);
        toast.success("Recruiter added!");
      }
      setCurrent(EMPTY_RECRUITER);
      setEditingId(null);
      setShowAddForm(false);
      fetchRecruiters();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(editingId ? "Failed to update recruiter" : "Failed to add recruiter");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(recruiter) {
    setCurrent({ companyName: recruiter.companyName || "", role: recruiter.role || "", package: recruiter.package || "", description: recruiter.description || "" });
    setEditingId(recruiter._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setCurrent(EMPTY_RECRUITER);
    setEditingId(null);
    setShowAddForm(false);
  }

  function openDeleteModal(recruiter) { setDeleteTarget(recruiter); setShowDeleteModal(true); }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteRecruiter(deleteTarget._id);
      toast.success("Recruiter deleted!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchRecruiters();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete recruiter");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner text="Loading recruiters..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title"><em>Recruiters</em></h1>
          <p className="page-subtitle">Manage visiting companies and recruitment details.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} icon={<Plus size={14} />} variant="primary">
            Add Recruiter
          </Button>
        )}
      </div>

      {/* ADD/EDIT FORM */}
      {showAddForm && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <span className="panel-title">{editingId ? "Edit Recruiter" : "Add New Recruiter"}</span>
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          </div>
          <div className="panel-body">
            <div className="form-row-3">
              <div className="form-field">
                <label>Company Name *</label>
                <input className="form-input" placeholder="e.g. Google" value={current.companyName} onChange={(e) => setCurrent({ ...current, companyName: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Role</label>
                <input className="form-input" placeholder="e.g. Software Engineer" value={current.role} onChange={(e) => setCurrent({ ...current, role: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Package (CTC)</label>
                <input className="form-input" placeholder="e.g. 12 LPA" value={current.package} onChange={(e) => setCurrent({ ...current, package: e.target.value })} />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Description / Requirements</label>
              <textarea className="form-textarea" placeholder="Details about the role and requirements..." value={current.description} onChange={(e) => setCurrent({ ...current, description: e.target.value })} rows={3} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button onClick={handleCancelEdit} variant="ghost">Cancel</Button>
              <Button onClick={handleSave} variant="primary" loading={saving} icon={editingId ? <Edit2 size={14} /> : <Plus size={14} />}>
                {editingId ? "Update Recruiter" : "Add Recruiter"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {recruiters.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "56px 20px" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>No recruiters added yet.</p>
          <button className="btn-text" onClick={() => setShowAddForm(true)}>Add your first recruiter</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {recruiters.map((r) => (
            <div key={r._id} className="panel">
              <div className="panel-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 7, background: "rgba(27,79,216,0.08)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>
                    {r.companyName.charAt(0)}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => handleEdit(r)} className="btn-text" style={{ padding: "4px 6px" }}><Edit2 size={13} /></button>
                    <button onClick={() => openDeleteModal(r)} className="btn-danger" style={{ padding: "4px 6px" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>{r.companyName}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {r.role && <span className="pill pill-blue" style={{ display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={10} />{r.role}</span>}
                  {r.package && <span className="pill pill-green" style={{ display: "flex", alignItems: "center", gap: 4 }}><IndianRupee size={10} />{r.package}</span>}
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>{r.description || "No specific description provided."}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Recruiter" message={`Are you sure you want to delete "${deleteTarget?.companyName}"?`} confirmText="Delete" variant="danger" loading={deleting} />
    </div>
  );
}