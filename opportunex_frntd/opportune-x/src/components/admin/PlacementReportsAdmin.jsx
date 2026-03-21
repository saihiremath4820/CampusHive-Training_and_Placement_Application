import { useEffect, useState } from "react";
import toast from '../common/toastManager';
import { Edit2, Trash2, Upload, Eye, FileText, Calendar, X, Check } from 'lucide-react';
import {
  getPlacementReports,
  addPlacementReport,
  updatePlacementReport,
  deletePlacementReport,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import EmptyState from "./shared/EmptyState";
import LoadingSpinner from "./shared/LoadingSpinner";
import api from "../../services/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE?.replace('/api', '');

export default function PlacementReportsAdmin() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const res = await getPlacementReports();
      const dataArr = res.data.data || (Array.isArray(res.data) ? res.data : []);
      setReports(dataArr);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!file) { toast.error("Please select a PDF file"); return; }
    if (!title || !academicYear) { toast.error("Title and academic year are required"); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('reportFile', file);
      formData.append('title', title);
      formData.append('academicYear', academicYear);
      await api.post('/admin/placement/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Report uploaded successfully!");
      setTitle(""); setAcademicYear(""); setFile(null);
      fetchReports();
    } catch (err) {
      toast.error("Failed to upload report");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate() {
    if (!title || !academicYear) { toast.error("Title and academic year are required"); return; }
    try {
      setUploading(true);
      await updatePlacementReport(editingId, { title, academicYear });
      toast.success("Report updated!");
      setTitle(""); setAcademicYear(""); setEditingId(null);
      fetchReports();
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setUploading(false);
    }
  }

  function handleEdit(report) {
    setTitle(report.title);
    setAcademicYear(report.academicYear);
    setEditingId(report._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() { setTitle(""); setAcademicYear(""); setFile(null); setEditingId(null); }

  async function handleDelete() {
    try {
      setDeleting(true);
      await deletePlacementReport(deleteTarget._id);
      toast.success("Report deleted!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchReports();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading reports..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">Placement <em>Reports</em></h1>
        <p className="page-subtitle">Maintain and publish annual placement performance documents.</p>
      </div>

      {/* UPLOAD/EDIT FORM */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <span className="panel-title">{editingId ? "Edit Report Metadata" : "Upload New Placement Report"}</span>
          {editingId && (
            <button onClick={handleCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          )}
        </div>
        <div className="panel-body">
          <div className="form-row-2" style={{ marginBottom: 14 }}>
            <div className="form-field">
              <label>Report Title *</label>
              <input className="form-input" placeholder="e.g. Annual Placement Report 2023" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Academic Year *</label>
              <input className="form-input" placeholder="e.g. 2023-24" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            </div>
          </div>

          {!editingId && (
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Select PDF Document</label>
              <div className="drop-zone" style={{ position: "relative" }}>
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 1 }} />
                <Upload size={24} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {file ? <span style={{ color: "var(--accent)", fontWeight: 500 }}>{file.name}</span> : "Click or drag to select a PDF report"}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {editingId && <Button onClick={handleCancel} variant="ghost">Cancel</Button>}
            <Button onClick={editingId ? handleUpdate : handleUpload} variant="primary" loading={uploading} icon={editingId ? <Check size={14} /> : <Upload size={14} />} disabled={editingId ? (!title || !academicYear) : (!file || !title || !academicYear)}>
              {editingId ? "Save Changes" : "Complete Upload"}
            </Button>
          </div>
        </div>
      </div>

      {/* REPORTS GRID */}
      {reports.length === 0 ? (
        <div className="panel"><EmptyState icon="document" title="No reports available" message="Start building your archive by uploading the first report." /></div>
      ) : (
        <div className="grid-2">
          {reports.map((r) => (
            <div key={r._id} className="panel">
              <div className="panel-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ padding: "8px 10px", background: "rgba(27,79,216,0.08)", borderRadius: 6, color: "var(--accent)" }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button onClick={() => setViewingReport(r)} className="btn-text" style={{ padding: "4px 6px" }} title="View Report"><Eye size={14} /></button>
                    <button onClick={() => handleEdit(r)} className="btn-text" style={{ padding: "4px 6px" }} title="Edit Metadata"><Edit2 size={14} /></button>
                    <button onClick={() => { setDeleteTarget(r); setShowDeleteModal(true); }} className="btn-danger" style={{ padding: "4px 6px" }} title="Delete Report"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{r.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                  <Calendar size={12} />
                  <span>Session {r.academicYear}</span>
                </div>
                <div style={{ paddingTop: 12, borderTop: "1px solid var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a href={`${API_BASE_URL}${r.reportFileUrl}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--accent)", textDecoration: "none", letterSpacing: "0.5px" }}>
                    Download Asset
                  </a>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, background: "var(--surface-2)", color: "var(--text-muted)", padding: "2px 6px", borderRadius: 3, letterSpacing: "0.5px" }}>PDF</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      {viewingReport && (
        <div className="modal-overlay" onClick={() => setViewingReport(null)}>
          <div className="modal-box" style={{ maxWidth: 900, height: "90vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 14, fontWeight: 500 }}>{viewingReport.title}</h3>
              <button onClick={() => setViewingReport(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={17} />
              </button>
            </div>
            <div style={{ flex: 1, background: "var(--surface-2)" }}>
              <iframe src={`${API_BASE_URL}${viewingReport.reportFileUrl}`} style={{ width: "100%", height: "100%", border: "none" }} title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Report" message={`This will permanently delete "${deleteTarget?.title}". This action cannot be undone.`} confirmText="Confirm Delete" variant="danger" loading={deleting} />
    </div>
  );
}
