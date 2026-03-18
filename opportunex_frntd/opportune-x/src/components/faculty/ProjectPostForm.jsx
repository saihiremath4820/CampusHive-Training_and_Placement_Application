import { useState } from "react";
import api from "../../services/api";
import {
  FilePlus, Type, AlignLeft, Database, Calendar,
  PlusCircle, ArrowRight, Target, Sparkles, Info, X, Loader2, GitCommit, ClipboardList
} from "lucide-react";
import toast from '../common/toastManager';

export default function ProjectPostForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", domain: "", duration: "",
    milestones: ["", ""]
  });

  const handleMilestoneChange = (index, value) => {
    const updated = [...formData.milestones];
    updated[index] = value;
    setFormData({ ...formData, milestones: updated });
  };

  const addMilestone = () => setFormData({ ...formData, milestones: [...formData.milestones, ""] });

  const removeMilestone = (index) => {
    if (formData.milestones.length <= 1) return;
    setFormData({ ...formData, milestones: formData.milestones.filter((_, i) => i !== index) });
  };

  const handlePost = async () => {
    if (!formData.title || !formData.description || !formData.domain || !formData.duration) {
      toast.error("Please fill in all mandatory fields"); return;
    }
    const validMilestones = formData.milestones.filter(m => m.trim() !== "");
    if (validMilestones.length === 0) { toast.error("Add at least one project milestone"); return; }

    try {
      setLoading(true);
      await api.post("/project", { ...formData, milestones: validMilestones });
      toast.success("Project posted successfully! It is now visible to students.");
      setFormData({ title: "", description: "", domain: "", duration: "", milestones: ["", ""] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Sparkles size={18} color="var(--accent)" />
            <span className="pill pill-blue">Research Hub</span>
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            Publish Project Vision
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4 }}>
            Propose a new research track or development opportunity for the student community.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Basic Intent Section */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Fundamental Details</span>
            <span className="panel-tag">Required Information</span>
          </div>
          <div className="panel-body" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-field">
              <label>Project Nomenclature (Title)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                  <Type size={15} />
                </span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Optimized Algorithmic Trading Bot"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Executive Summary & Scope</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Elaborate on the technical complexity, research goals, and required student background..."
                className="form-textarea"
                style={{ minHeight: 140 }}
              />
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Technology Domain</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                    <Database size={15} />
                  </span>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="e.g. Rust, Web3"
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Anticipated Timeline</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                    <Calendar size={15} />
                  </span>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 1 Semester"
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Logic */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Strategic Roadmapping</span>
            <span className="panel-tag">Progress Tracking</span>
          </div>
          <div className="panel-body" style={{ padding: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formData.milestones.map((m, index) => (
                <div key={index} style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 6,
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "var(--accent)", flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="text"
                      value={m}
                      onChange={e => handleMilestoneChange(index, e.target.value)}
                      placeholder={`Define milestone phase ${index + 1}...`}
                      className="form-input"
                      style={{ paddingRight: 40 }}
                    />
                    {formData.milestones.length > 1 && (
                      <button
                        onClick={() => removeMilestone(index)}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--red)", cursor: "pointer", opacity: 0.5 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addMilestone}
                style={{
                  marginTop: 8, alignSelf: "flex-start",
                  background: "none", border: "1px dashed var(--border)",
                  padding: "8px 16px", borderRadius: 6, fontSize: 12,
                  fontWeight: 600, color: "var(--accent)", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6
                }}
              >
                <GitCommit size={14} />
                <span>Append Operational Phase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{
          marginTop: 8,
          padding: "20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(224, 155, 61, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E09B3D" }}>
              <Info size={20} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Review Visibility</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Once published, this project will be listed on the Student Opportunities dashboard.</div>
            </div>
          </div>
          <button
            onClick={handlePost}
            disabled={loading}
            className="btn-primary"
            style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8 }}
          >
            {loading ? <div className="spinner" /> : (
              <>
                <span>Broadcast Project Vision</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

