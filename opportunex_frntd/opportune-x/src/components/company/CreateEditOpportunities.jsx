import { useState, useEffect } from "react";
import {
  Briefcase, MapPin, Type, List, PlusCircle, X, Loader2, ArrowRight, Zap, Target, Sparkles, Calendar, GraduationCap, CheckCircle2, FileText, Edit3
} from "lucide-react";
import toast from "react-hot-toast";
import { createOpportunity, updateOpportunity } from "../../services/companyApi";

const JOB_TYPES = ["Full-Time", "Internship", "Project", "Contract"];
const DEGREE_TYPES = ["BE / B.Tech", "ME / M.Tech", "B.Sc", "M.Sc", "MBA", "PhD"];
const STUDENT_DATA_POINTS = ["Resume", "CGPA", "GitHub/Portfolio", "LinkedIn Profile", "Contact Number", "Backlog History", "Statement of Purpose"];

const EMPTY_FORM = {
  title: "",
  type: "Full-Time",
  location: "Pune, Maharashtra",
  description: "",
  requiredSkills: [""],
  requiredDegree: "BE / B.Tech",
  requiredCGPA: 6.0,
  deadline: "",
  dataRequirements: ["Resume", "CGPA", "Contact Number"]
};

// editOpportunity prop: if passed, we're in EDIT MODE
export default function CreateEditOpportunities({ onSuccess, onOpportunityCreated, editOpportunity }) {
  const isEdit = !!editOpportunity;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && editOpportunity) {
      const deadline = editOpportunity.deadline
        ? new Date(editOpportunity.deadline).toISOString().split("T")[0]
        : "";
      setFormData({
        title: editOpportunity.title || "",
        type: editOpportunity.type || "Full-Time",
        location: editOpportunity.location || "Pune, Maharashtra",
        description: editOpportunity.description || "",
        requiredSkills: editOpportunity.requiredSkills?.length ? editOpportunity.requiredSkills : [""],
        requiredDegree: editOpportunity.requiredDegree || "BE / B.Tech",
        requiredCGPA: editOpportunity.requiredCGPA || 6.0,
        deadline,
        dataRequirements: editOpportunity.dataRequirements || ["Resume", "CGPA", "Contact Number"],
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [editOpportunity]);

  const toggleRequirement = (req) => {
    setFormData(prev => ({
      ...prev,
      dataRequirements: prev.dataRequirements.includes(req)
        ? prev.dataRequirements.filter(r => r !== req)
        : [...prev.dataRequirements, req]
    }));
  };

  const handleSkillChange = (index, value) => {
    const updated = [...formData.requiredSkills];
    updated[index] = value;
    setFormData({ ...formData, requiredSkills: updated });
  };

  const addSkill = () => setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, ""] });

  const removeSkill = (index) => {
    if (formData.requiredSkills.length <= 1) return;
    setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, type, location, description } = formData;
    if (!title || !type || !description) {
      toast.error("Please fill all required fields."); return;
    }
    const skills = formData.requiredSkills.filter(s => s.trim() !== "");
    if (skills.length === 0) { toast.error("At least one required skill is needed."); return; }

    try {
      setLoading(true);
      if (isEdit) {
        await updateOpportunity(editOpportunity._id, { ...formData, requiredSkills: skills });
        toast.success("Drive updated! Pending admin re-approval before students can see it.");
      } else {
        await createOpportunity({ ...formData, requiredSkills: skills });
        toast.success("Drive submitted for admin approval!");
        setFormData(EMPTY_FORM);
      }
      if (onSuccess) onSuccess();
      if (onOpportunityCreated) onOpportunityCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || (isEdit ? "Update failed." : "Create failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", padding: 24, borderRadius: 20, border: "1px solid var(--border)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="pill pill-blue" style={{ fontSize: 10 }}>
              {isEdit ? "Edit Existing Drive" : "Talent Pipeline Deployment"}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>/</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
              {isEdit ? "EDIT_RECORD" : "NEW_RECORD"}
            </span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "'Fraunces', serif" }}>
            {isEdit ? "Edit Career Opening" : "Publish Career Opening"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {isEdit
              ? "Editing will reset admin approval — the drive goes back to pending review."
              : "Design a high-impact role to attract top-tier academic talent."}
          </p>
          {isEdit && (
            <div style={{ marginTop: 10, padding: "8px 14px", background: "rgba(224,155,61,0.08)", border: "1px solid rgba(224,155,61,0.2)", borderRadius: 8, fontSize: 12, color: "var(--yellow)", display: "flex", alignItems: "center", gap: 6 }}>
              ⚠️ Saving changes will require admin re-approval before the listing goes live again.
            </div>
          )}
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: isEdit ? "rgba(139,92,246,0.08)" : "rgba(27,79,216,0.06)", color: isEdit ? "var(--purple)" : "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isEdit ? <Edit3 size={28} /> : <Sparkles size={28} />}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Role Definition Panel */}
        <div className="panel">
          <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", padding: "20px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Target size={18} color="var(--accent)" />
              <span className="panel-title">Role Definition</span>
            </div>
          </div>
          <div className="panel-body" style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
            <InputField label="Official Job Title" icon={Type} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Software Engineer (Cloud)" />

            <div className="grid-2" style={{ gap: 24 }}>
              <InputField label="Employment Model" icon={Briefcase} isSelect options={JOB_TYPES} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="Select type..." />
              <InputField label="Location" icon={MapPin} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Mumbai / Remote" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24 }}>
              <InputField label="Required Degree" icon={GraduationCap} isSelect options={DEGREE_TYPES} value={formData.requiredDegree} onChange={e => setFormData({ ...formData, requiredDegree: e.target.value })} placeholder="Select degree..." />
              <InputField label="Min CGPA" icon={Zap} type="number" value={formData.requiredCGPA} onChange={e => setFormData({ ...formData, requiredCGPA: parseFloat(e.target.value) })} placeholder="e.g. 7.5" />
              <InputField label="Application Deadline" icon={Calendar} type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} placeholder="Select date" />
            </div>

            <div className="form-group" style={{ marginTop: 8 }}>
              <label className="form-label" style={{ display: "block", marginBottom: 10, fontSize: 13, fontWeight: 600 }}>Description & Expectations</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detail responsibilities, team culture, and growth..." rows={8} className="form-field" style={{ width: "100%", height: "auto", padding: "18px 20px", lineHeight: 1.7, fontSize: "14px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontFamily: "inherit", resize: "vertical" }} />
            </div>
          </div>
        </div>

        {/* Data Requirements */}
        <div className="panel">
          <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", padding: "20px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={18} color="var(--blue)" />
              <span className="panel-title">Student Data Requirements</span>
            </div>
          </div>
          <div className="panel-body" style={{ padding: "32px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {STUDENT_DATA_POINTS.map(point => (
                <div key={point} onClick={() => toggleRequirement(point)} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${formData.dataRequirements.includes(point) ? "var(--accent)" : "var(--border)"}`, background: formData.dataRequirements.includes(point) ? "rgba(27,79,216,0.04)" : "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${formData.dataRequirements.includes(point) ? "var(--accent)" : "var(--text-muted)40"}`, display: "flex", alignItems: "center", justifyContent: "center", background: formData.dataRequirements.includes(point) ? "var(--accent)" : "transparent", color: "white" }}>
                    {formData.dataRequirements.includes(point) && <CheckCircle2 size={14} />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: formData.dataRequirements.includes(point) ? "var(--accent)" : "var(--text)" }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="panel">
          <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", padding: "20px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Zap size={18} color="var(--purple)" />
              <span className="panel-title">Core Competencies Required</span>
            </div>
            <button type="button" onClick={addSkill} className="btn-secondary" style={{ fontSize: 12, padding: "8px 16px", borderRadius: 10, border: "1px dashed var(--purple)", color: "var(--purple)", background: "rgba(139,92,246,0.04)", fontWeight: 600 }}>
              <PlusCircle size={14} style={{ marginRight: 6 }} /> Add Skill
            </button>
          </div>
          <div className="panel-body" style={{ padding: "32px 40px" }}>
            <div className="grid-2" style={{ gap: 20 }}>
              {formData.requiredSkills.map((skill, i) => (
                <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                  <div style={{ position: "absolute", left: 14, width: 22, height: 22, borderRadius: 8, background: "rgba(139,92,246,0.12)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, zIndex: 1 }}>{i + 1}</div>
                  <input type="text" value={skill} onChange={e => handleSkillChange(i, e.target.value)} placeholder="e.g. React, Node.js, SQL" className="form-field" style={{ paddingLeft: 46, height: 46, borderRadius: 12, width: "100%" }} />
                  {formData.requiredSkills.length > 1 && (
                    <button type="button" onClick={() => removeSkill(i)} style={{ position: "absolute", right: 12, padding: 6, background: "rgba(200,75,49,0.08)", border: "none", color: "var(--red)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: 18, borderRadius: 16, background: isEdit ? "var(--purple)" : "var(--accent)", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 10px 30px rgba(27, 79, 216, 0.2)" }}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              {isEdit ? "Save Changes (Pending Re-Approval)" : "Submit for Admin Approval"}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", isSelect = false, options = [] }) => (
  <div className="form-group" style={{ marginBottom: 0, width: "100%" }}>
    <label className="form-label" style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>{label}</label>
    <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
      {type !== "date" && <Icon size={16} style={{ position: "absolute", left: 14, color: "var(--text-muted)", pointerEvents: "none", zIndex: 1 }} />}
      {isSelect ? (
        <select value={value} onChange={onChange} className="form-select" style={{ paddingLeft: 42, height: 46, width: "100%", borderRadius: 12 }}>
          <option value="">{placeholder}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="form-field" style={{ paddingLeft: type === "date" ? 16 : 42, paddingRight: 14, height: 46, width: "100%", borderRadius: 12, textAlign: "left", boxSizing: "border-box", display: "block", fontFamily: "inherit" }} />
      )}
    </div>
  </div>
);
