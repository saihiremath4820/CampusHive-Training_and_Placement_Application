import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import {
  getPlacementStats,
  upsertPlacementStat,
  deletePlacementStat,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import Modal from "./shared/Modal";
import EmptyState from "./shared/EmptyState";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_STAT = {
  academicYear: "",
  studentsEnrolled: "",
  studentsPlaced: "",
  placementPercentage: "",
  averageSalary: "",
  medianSalary: "",
  deptWisePlaced: "",
  status: "Completed",
};

export default function PlacementStatsAdmin() {
  const [stats, setStats] = useState([]);
  const [current, setCurrent] = useState(EMPTY_STAT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  // AUTO-CALCULATE PERCENTAGE when enrolled/placed changes
  useEffect(() => {
    const enrolled = Number(current.studentsEnrolled);
    const placed = Number(current.studentsPlaced);
    if (enrolled > 0 && placed >= 0) {
      const percentage = ((placed / enrolled) * 100).toFixed(2);
      setCurrent(prev => ({ ...prev, placementPercentage: percentage }));
    }
  }, [current.studentsEnrolled, current.studentsPlaced]);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await getPlacementStats();
      const sorted = (res.data || []).sort((a, b) => {
        const yearA = parseInt(a.academicYear.split("-")[0]);
        const yearB = parseInt(b.academicYear.split("-")[0]);
        return yearB - yearA;
      });
      setStats(sorted);
    } catch (err) {
      console.error("Failed to load stats", err);
      toast.error("Failed to load placement statistics");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!current.academicYear?.trim() || !current.studentsEnrolled || !current.studentsPlaced) {
      toast.error("Academic year, enrolled, and placed are required");
      return;
    }
    let deptParsed = {};
    if (current.deptWisePlaced?.trim()) {
      try {
        deptParsed = JSON.parse(current.deptWisePlaced);
      } catch (e) {
        toast.error('Invalid JSON format for department-wise data. Example: {"CE":120,"IT":140}');
        return;
      }
    }
    try {
      setSaving(true);
      await upsertPlacementStat({
        academicYear: current.academicYear,
        studentsEnrolled: Number(current.studentsEnrolled),
        studentsPlaced: Number(current.studentsPlaced),
        placementPercentage: Number(current.placementPercentage),
        averageSalary: current.averageSalary ? Number(current.averageSalary) : null,
        medianSalary: current.medianSalary ? Number(current.medianSalary) : null,
        deptWisePlaced: deptParsed,
        status: current.status,
      });
      toast.success(editingId ? "Statistics updated successfully!" : "Statistics added successfully!");
      setCurrent(EMPTY_STAT);
      setEditingId(null);
      fetchStats();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save statistics");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(stat) {
    setCurrent({
      academicYear: stat.academicYear || "",
      studentsEnrolled: stat.studentsEnrolled?.toString() || "",
      studentsPlaced: stat.studentsPlaced?.toString() || "",
      placementPercentage: stat.placementPercentage?.toString() || "",
      averageSalary: stat.averageSalary?.toString() || "",
      medianSalary: stat.medianSalary?.toString() || "",
      deptWisePlaced: stat.deptWisePlaced ? JSON.stringify(stat.deptWisePlaced) : "",
      status: stat.status || "Completed",
    });
    setEditingId(stat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setCurrent(EMPTY_STAT);
    setEditingId(null);
  }

  function openDeleteModal(stat) {
    setDeleteTarget(stat);
    setShowDeleteModal(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deletePlacementStat(deleteTarget._id);
      toast.success("Statistics deleted successfully!");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchStats();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete statistics");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading placement statistics..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">Placement <em>Statistics</em></h1>
        <p className="page-subtitle">Manage year-wise placement data for your institution.</p>
      </div>

      {/* ADD/EDIT FORM */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <span className="panel-title">{editingId ? "Edit Statistics" : "Add New Statistics"}</span>
          {editingId && (
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <X size={17} />
            </button>
          )}
        </div>
        <div className="panel-body">
          <div className="form-row-3">
            <input className="form-input" placeholder="Academic Year *" value={current.academicYear} onChange={(e) => setCurrent({ ...current, academicYear: e.target.value })} />
            <input className="form-input" type="number" placeholder="Students Enrolled *" value={current.studentsEnrolled} onChange={(e) => setCurrent({ ...current, studentsEnrolled: e.target.value })} />
            <input className="form-input" type="number" placeholder="Students Placed *" value={current.studentsPlaced} onChange={(e) => setCurrent({ ...current, studentsPlaced: e.target.value })} />
            <div style={{ position: "relative" }}>
              <input className="form-input" type="text" placeholder="Placement %" value={current.placementPercentage} readOnly style={{ background: "var(--surface-2)", cursor: "not-allowed" }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--green)" }}>Auto</span>
            </div>
            <input className="form-input" type="number" placeholder="Average Salary (LPA)" value={current.averageSalary} onChange={(e) => setCurrent({ ...current, averageSalary: e.target.value })} />
            <input className="form-input" type="number" placeholder="Median Salary (LPA)" value={current.medianSalary} onChange={(e) => setCurrent({ ...current, medianSalary: e.target.value })} />
          </div>
          <div className="form-field" style={{ marginBottom: 12 }}>
            <label>Department-wise Placed (JSON — optional)</label>
            <textarea className="form-textarea" placeholder='{"CE":120,"IT":140}' value={current.deptWisePlaced} onChange={(e) => setCurrent({ ...current, deptWisePlaced: e.target.value })} rows={2} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5 }} />
          </div>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label>Status</label>
            <select className="form-select" value={current.status} onChange={(e) => setCurrent({ ...current, status: e.target.value })}>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={handleSave} variant="primary" loading={saving} icon={editingId ? <Edit2 size={14} /> : <Plus size={14} />}>
              {editingId ? "Update Statistics" : "Add Statistics"}
            </Button>
            {editingId && <Button onClick={handleCancelEdit} variant="ghost">Cancel</Button>}
          </div>
        </div>
      </div>

      {/* LIST */}
      {stats.length === 0 ? (
        <div className="panel"><EmptyState icon="document" title="No statistics yet" message="Add your first placement statistics to get started" /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stats.map((stat) => (
            <div key={stat._id} className="panel">
              <div className="panel-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{stat.academicYear}</span>
                      <span className={`pill ${stat.status === "Completed" ? "pill-green" : "pill-yellow"}`}>{stat.status}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                      <DataPoint label="Enrolled" value={stat.studentsEnrolled} />
                      <DataPoint label="Placed" value={stat.studentsPlaced} />
                      <DataPoint label="Percentage" value={`${stat.placementPercentage}%`} accent />
                      <DataPoint label="Avg Salary" value={stat.averageSalary ? `${stat.averageSalary} LPA` : "—"} />
                    </div>
                    {stat.deptWisePlaced && Object.keys(stat.deptWisePlaced).length > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--surface-2)" }}>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>Dept-wise</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {Object.entries(stat.deptWisePlaced).map(([dept, count]) => (
                            <span key={dept} className="pill pill-blue">{dept}: {count}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Button onClick={() => handleEdit(stat)} variant="ghost" size="sm" icon={<Edit2 size={13} />}>Edit</Button>
                    <Button onClick={() => openDeleteModal(stat)} variant="danger" size="sm" icon={<Trash2 size={13} />}>Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Statistics" message={`Are you sure you want to delete statistics for "${deleteTarget?.academicYear}"? This action cannot be undone.`} confirmText="Delete" variant="danger" loading={deleting} />
    </div>
  );
}

function DataPoint({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
    </div>
  );
}