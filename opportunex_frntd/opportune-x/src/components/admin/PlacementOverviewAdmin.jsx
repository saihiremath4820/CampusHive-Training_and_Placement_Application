import { useEffect, useState } from "react";
import toast from '../common/toastManager';
import { Save, X, Info } from 'lucide-react';
import {
  getPlacementOverview,
  upsertPlacementOverview,
} from "../../services/adminPlacementService";
import Button from "./shared/Button";
import LoadingSpinner from "./shared/LoadingSpinner";

const EMPTY_OVERVIEW = {
  title: "Training & Placement Cell",
  description: "",
};

export default function PlacementOverviewAdmin() {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [original, setOriginal] = useState(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => { fetchOverview(); }, []);

  async function fetchOverview() {
    try {
      setLoading(true);
      const res = await getPlacementOverview();
      const data = res.data || EMPTY_OVERVIEW;
      setOverview(data);
      setOriginal(data);
    } catch (err) {
      console.error("Failed to load overview", err);
      toast.error("Failed to load placement overview");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!overview.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    try {
      setSaving(true);
      await upsertPlacementOverview({ title: overview.title, description: overview.description });
      toast.success("Overview saved successfully!");
      setOriginal(overview);
      setEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save overview");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setOverview(original);
    setEditing(false);
  }

  if (loading) return (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <LoadingSpinner size="lg" text="Loading overview..." />
    </div>
  );

  return (
    <div>
      <div className="page-title-block" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Placement <em>Overview</em></h1>
          <p className="page-subtitle">Define the main introduction for the T&amp;P Cell.</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="primary">Edit Content</Button>
        )}
      </div>

      <div className="panel">
        {editing ? (
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-field">
              <label>Header Title</label>
              <input
                type="text"
                className="form-input"
                value={overview.title}
                onChange={(e) => setOverview({ ...overview, title: e.target.value })}
                placeholder="e.g. Training & Placement Cell"
              />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={overview.description}
                onChange={(e) => setOverview({ ...overview, description: e.target.value })}
                rows={10}
                placeholder="Write a comprehensive overview about the department's vision, mission, and activities..."
              />
            </div>
            <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <Button onClick={handleSave} variant="primary" loading={saving} icon={<Save size={14} />}>
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="ghost" disabled={saving} icon={<X size={14} />}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="panel-header">
              <span className="panel-title">{overview.title}</span>
            </div>
            <div className="panel-body">
              {overview.description ? (
                <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {overview.description}
                </p>
              ) : (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <Info size={36} style={{ color: "var(--border)", marginBottom: 10 }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                    No overview content has been added yet.
                  </p>
                  <button className="btn-text" onClick={() => setEditing(true)}>
                    Draft an overview now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}