import { useState, useEffect } from "react";
import { useStudent } from "../../context/StudentContext";
import {
  User, Mail, Phone, GraduationCap, BookOpen, Link2,
  Terminal, Heart, Save, Edit3, FileText, Github, Linkedin, Clock, X
} from "lucide-react";
import toast from '../common/toastManager';

const DEGREE_OPTIONS = ["Diploma", "B.Tech", "M.Tech", "B.Sc", "B.Com", "BA", "Other"];
const MAX_RESUME_SIZE = 2 * 1024 * 1024;

export default function Profile() {
  const student = useStudent();
  if (!student) return null;

  const { profile, updateProfile, resume, updateResume, isProfileMandatoryComplete } = student;

  const [isEditing, setIsEditing] = useState(!profile || !isProfileMandatoryComplete(profile));
  const [showPdf, setShowPdf] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", email: "", mobile: "", degree: "", branch: "",
    year: "", cgpa: "", percentage: "", tenth: "", twelfth: "", skills: "", github: "",
    linkedin: "", projects: "", interests: "",
  });

  const getCompleteness = () => {
    const fields = ['fullName', 'email', 'mobile', 'degree', 'branch', 'year', 'skills', 'github', 'linkedin', 'projects'];
    const filled = fields.filter(f => {
      if (f === 'skills') return Array.isArray(profile?.skills) ? profile.skills.length > 0 : !!profile?.skills;
      return !!profile?.[f];
    }).length;
    let score = Math.round((filled / fields.length) * 100);
    if (resume) score = Math.min(100, score + 10); // Bonus for resume
    return Math.min(100, score);
  };

  const completeness = getCompleteness();


  useEffect(() => {
    const prefill = sessionStorage.getItem("prefillProfile");
    const prefillData = prefill ? JSON.parse(prefill) : null;
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
        year: profile.year || "",
        cgpa: profile.cgpa || "",
        percentage: profile.percentage || "",
        tenth: profile.tenth || "",
        twelfth: profile.twelfth || "",
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        projects: profile.projects || "",
        interests: profile.interests || "",
      });
      return;
    }
    if (prefillData) {
      setFormData(prev => ({ ...prev, fullName: prefillData.fullName || "", email: prefillData.email || "" }));
    }
  }, [profile]);

  const isEngineering = ["Diploma", "B.Tech", "M.Tech"].includes(formData.degree);

  const handleSave = async () => {
    const missingFields = [];
    if (!formData.fullName) missingFields.push("Full Name");
    if (!formData.email) missingFields.push("Email");
    if (!formData.degree) missingFields.push("Degree");
    if (!formData.year) missingFields.push("Current Year");
    if (isEngineering && !formData.branch) missingFields.push("Branch/Major");
    if (missingFields.length > 0) {
      toast.error(`Please fill: ${missingFields.join(", ")}`);
      return;
    }
    try {
      await updateProfile({
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean),
      });
      sessionStorage.removeItem("prefillProfile");
      setIsEditing(false);
      toast.success("Profile saved successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to save profile.";
      toast.error(msg);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Only PDF allowed"); return; }
    if (file.size > MAX_RESUME_SIZE) { toast.error("File too large (Max 2MB)"); return; }

    const loadingToast = toast.loading("Uploading resume...");
    try {
      await updateResume(file);
      toast.success("Resume attached!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to upload resume to server", { id: loadingToast });
    }
  };

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem",
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "0.75rem", outline: "none", fontSize: "0.875rem",
    fontFamily: "inherit",
    fontWeight: 700, color: "var(--text)", boxSizing: "border-box",
    transition: "border-color 0.2s"
  };

  // View mode
  if (!isEditing && profile) {
    return (
      <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "2.5rem" }}>
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", minWidth: 0 }}>
            {/* Avatar */}
            <div style={{
              width: "3.5rem", height: "3.5rem", borderRadius: "1rem", flexShrink: 0,
              background: "rgba(99,102,241,0.1)", border: "2px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", fontWeight: 900, color: "var(--accent)"
            }}>
              {profile.fullName.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: "0.25rem" }}>
                <User size={10} /> Professional Profile
              </span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.15rem", letterSpacing: "-0.03em" }}>{profile.fullName}</h2>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", opacity: 0.5, margin: 0 }}>{profile.degree} in {profile.branch || "General Studies"}</p>
              {profile.skills?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.5rem" }}>
                  {profile.skills.slice(0, 5).map(s => (
                    <span key={s} style={{ padding: "0.15rem 0.55rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.4rem", fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text)", opacity: 0.75 }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.6rem 1.25rem", borderRadius: "0.75rem",
              background: "var(--surface)", border: "1px solid var(--border)",
              color: "var(--text)", fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", flexShrink: 0, transition: "border-color 0.15s"
            }}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>

        {/* Completeness Bar */}
        <div style={{ background: "var(--surface)", padding: "1.25rem 1.75rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profile Strength</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: completeness === 100 ? "var(--green)" : "var(--accent)" }}>{completeness}% Complete</span>
          </div>
          <div style={{ height: "6px", width: "100%", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completeness}%`, background: completeness === 100 ? "var(--green)" : "var(--accent)", transition: "width 0.5s ease-out" }} />
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.6rem", fontWeight: 600 }}>
            {completeness < 100 ? "Complete your profile to increase your chances of being shortlisted by top companies." : "🎉 Your profile is recruitment-ready! Companies can now see your full potential."}
          </p>
        </div>


        {/* Details Grid */}
        <div className="grid-2">
          <SectionCard title="Academic Standings" icon={GraduationCap}>
            <DetailRow label="Degree" value={profile.degree} />
            <DetailRow label="Branch" value={profile.branch} />
            <DetailRow label="Graduation Year" value={profile.year} />
            <DetailRow label={isEngineering ? "CGPA" : "Percentage"} value={isEngineering ? profile.cgpa : profile.percentage} />
            <DetailRow label="10th Percentage" value={profile.tenth ? `${profile.tenth}%` : "Not provided"} />
            <DetailRow label="12th Percentage" value={profile.twelfth ? `${profile.twelfth}%` : "Not provided"} />
          </SectionCard>

          <SectionCard title="Contact Information" icon={Mail}>
            <DetailRow label="Primary Email" value={profile.email} />
            <DetailRow label="Mobile Number" value={profile.mobile} />
            <DetailRow label="Location" value="On-Campus" />
            <DetailRow label="Status" value="Actively Looking" accent />
          </SectionCard>

          <SectionCard title="Professional Links" icon={Link2}>
            <SocialLink icon={Github} label="GitHub" url={profile.github} />
            <SocialLink icon={Linkedin} label="LinkedIn" url={profile.linkedin} />
            <div style={{ paddingTop: "0.5rem" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--text)", opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Attached Resume</p>
              {resume ? (
                <button onClick={() => setShowPdf(true)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem", background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem",
                  color: "var(--accent)", cursor: "pointer"
                }}>
                  <FileText size={18} />
                  <span style={{ flex: 1, textAlign: "left", fontSize: "0.8rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resume.name}</span>
                  <span style={{ padding: "0.2rem 0.5rem", background: "var(--accent)", color: "#fff", borderRadius: "0.3rem", fontSize: "0.65rem", fontWeight: 900 }}>View PDF</span>
                </button>
              ) : (
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--red)", background: "rgba(239,68,68,0.08)", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(239,68,68,0.15)" }}>No resume uploaded yet.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Projects & Interests" icon={Terminal}>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--text)", opacity: 0.45, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Top Projects</label>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", opacity: 0.65, fontStyle: "italic", margin: 0 }}>{profile.projects || "No projects listed yet."}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--text)", opacity: 0.45, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Interests</label>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", opacity: 0.65, fontStyle: "italic", margin: 0 }}>{profile.interests || "No specific interests mentioned."}</p>
            </div>
          </SectionCard>
        </div>

        {/* PDF Modal */}
        {showPdf && resume?.previewUrl && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowPdf(false)}
          >
            <div style={{ width: "100%", maxWidth: "64rem", height: "85vh", background: "#fff", borderRadius: "1rem", overflow: "hidden", position: "relative" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowPdf(false)} style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.5rem", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", cursor: "pointer", zIndex: 10 }}>
                <X size={18} />
              </button>
              <iframe src={resume.previewUrl} style={{ width: "100%", height: "100%" }} title="Resume Preview" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "2.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem" }}>Setup Your Profile</h2>
        <p style={{ color: "var(--text)", opacity: 0.55, fontWeight: 500, margin: 0 }}>This information is shared with recruiters during the hiring process.</p>
      </div>

      <div className="panel" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* Basic Info */}
        <FormSection title="Basic Information" icon={User} accentColor="var(--accent)">
          <div className="grid-2">
            <InputWrapper label="Full Name" icon={User} required>
              <input type="text" placeholder="E.g. Rahul Sharma" value={formData.fullName} style={inputStyle} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
            </InputWrapper>
            <InputWrapper label="Email Address" icon={Mail} required>
              <input type="email" placeholder="rahul@college.edu.in" value={formData.email} style={inputStyle} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </InputWrapper>
            <InputWrapper label="Mobile Number" icon={Phone}>
              <input type="tel" maxLength={10} placeholder="9876543210" value={formData.mobile} style={inputStyle}
                onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })} />
            </InputWrapper>
            <InputWrapper label="Degree Choice" icon={GraduationCap} required>
              <select value={formData.degree} style={{ ...inputStyle, appearance: "none" }} onChange={e => setFormData({ ...formData, degree: e.target.value })}>
                <option value="">Select Degree...</option>
                {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </InputWrapper>
          </div>
        </FormSection>

        {/* Academic */}
        <FormSection title="Academic Standings" icon={BookOpen} accentColor="var(--green)">
          <div className="grid-3">
            <InputWrapper label="Branch/Major" icon={BookOpen} required={isEngineering}>
              {isEngineering ? (
                <select value={formData.branch} style={{ ...inputStyle, appearance: "none" }} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                  <option value="">Select Branch</option>
                  <option value="Computer Engineering">CE - Computer Engineering</option>
                  <option value="Information Technology">IT - Information Technology</option>
                  <option value="Electronics & Telecommunication">ENTC</option>
                  <option value="Artificial Intelligence & Data Science">AIDS</option>
                  <option value="Electronics & Communication">ECE</option>
                </select>
              ) : (
                <input placeholder="E.g. Business Administration" value={formData.branch} style={inputStyle} onChange={e => setFormData({ ...formData, branch: e.target.value })} />
              )}
            </InputWrapper>
            <InputWrapper label="Current Year" icon={Clock} required>
              <select value={formData.year} style={{ ...inputStyle, appearance: "none" }} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                <option value="">Select Year</option>
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </InputWrapper>
            <InputWrapper label={isEngineering ? "CGPA" : "Percentage (%)"} icon={Terminal}>
              <input type="text" placeholder={isEngineering ? "E.g. 8.75" : "E.g. 75.5"}
                value={isEngineering ? formData.cgpa : formData.percentage} style={inputStyle}
                onChange={e => setFormData({ ...formData, [isEngineering ? "cgpa" : "percentage"]: e.target.value })} />
            </InputWrapper>
          </div>
          <div className="grid-2">
            <InputWrapper label="10th Percentage" icon={Terminal}>
              <div style={{ position: "relative" }}>
                <input type="number" min="0" max="100" step="0.01" placeholder="e.g. 85.5" value={formData.tenth || ''} style={inputStyle} onChange={e => setFormData({ ...formData, tenth: e.target.value })} />
                <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text)", opacity: 0.5, fontWeight: 700 }}>%</span>
              </div>
            </InputWrapper>
            <InputWrapper label="12th Percentage" icon={Terminal}>
              <div style={{ position: "relative" }}>
                <input type="number" min="0" max="100" step="0.01" placeholder="e.g. 78.2" value={formData.twelfth || ''} style={inputStyle} onChange={e => setFormData({ ...formData, twelfth: e.target.value })} />
                <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text)", opacity: 0.5, fontWeight: 700 }}>%</span>
              </div>
            </InputWrapper>
          </div>
          {(!formData.tenth || !formData.twelfth) && (
            <div style={{ padding: "0.75rem", background: "rgba(224,155,61,0.08)", border: "1px solid rgba(224,155,61,0.2)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "var(--yellow)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
              ⚠️ Complete your academic information to see all eligible opportunities
            </div>
          )}
        </FormSection>

        {/* Professional */}
        <FormSection title="Professional Presence" icon={Link2} accentColor="var(--accent)">
          <div className="grid-2">
            <InputWrapper label="GitHub Profile URL" icon={Github}>
              <input placeholder="https://github.com/username" value={formData.github} style={inputStyle} onChange={e => setFormData({ ...formData, github: e.target.value })} />
            </InputWrapper>
            <InputWrapper label="LinkedIn Profile URL" icon={Linkedin}>
              <input placeholder="https://linkedin.com/in/username" value={formData.linkedin} style={inputStyle} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
            </InputWrapper>
          </div>

          <div style={{
            padding: "2rem", borderRadius: "1rem", background: "var(--surface)",
            border: "2px dashed var(--border)", textAlign: "center"
          }}>
            <div style={{
              width: "3.5rem", height: "3.5rem", background: "var(--bg)", borderRadius: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem", color: "var(--accent)"
            }}>
              <FileText size={28} />
            </div>
            <p style={{ fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem" }}>Professional Resume</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.5, margin: "0 0 1rem" }}>PDF format only, must be under 2MB</p>
            <input type="file" id="resume-input" accept=".pdf" style={{ display: "none" }} onChange={handleResumeUpload} />
            <label htmlFor="resume-input" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1.5rem", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: "0.75rem",
              fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.1em", cursor: "pointer", color: "var(--text)"
            }}>
              {resume ? "Update Resume" : "Upload Resume"}
            </label>
            {resume && <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", opacity: 0.45, marginTop: "0.5rem", fontStyle: "italic" }}>Attached: {resume.name}</p>}
          </div>
        </FormSection>

        {/* Skills */}
        <FormSection title="Skills & Experience" icon={Heart} accentColor="var(--yellow)">
          <InputWrapper label="Skills (Comma separated)" icon={Terminal}>
            <textarea placeholder="react, tailwind, node.js, python..." value={formData.skills}
              rows={2} style={{ ...inputStyle, paddingTop: "0.75rem", resize: "none" }}
              onChange={e => setFormData({ ...formData, skills: e.target.value })} />
          </InputWrapper>
          <div className="grid-2">
            <InputWrapper label="Major Projects" icon={BookOpen}>
              <textarea placeholder="Describe your best work..." value={formData.projects} rows={3}
                style={{ ...inputStyle, paddingTop: "0.75rem", resize: "none" }}
                onChange={e => setFormData({ ...formData, projects: e.target.value })} />
            </InputWrapper>
            <InputWrapper label="Interests" icon={Heart}>
              <textarea placeholder="What do you love to do?" value={formData.interests} rows={3}
                style={{ ...inputStyle, paddingTop: "0.75rem", resize: "none" }}
                onChange={e => setFormData({ ...formData, interests: e.target.value })} />
            </InputWrapper>
          </div>
        </FormSection>

        <button onClick={handleSave} style={{
          padding: "1.1rem", background: "var(--accent)", color: "#fff",
          border: "none", borderRadius: "1.5rem", fontWeight: 900, fontSize: "1.1rem",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
          boxShadow: "0 8px 24px rgba(99,102,241,0.35)"
        }}>
          <Save size={22} /> Complete Profile
        </button>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, accentColor, children }) {
  return (
    <div>
      <h3 style={{
        fontSize: "1rem", fontWeight: 900, color: accentColor,
        display: "flex", alignItems: "center", gap: "0.6rem",
        paddingBottom: "1rem", borderBottom: "1px solid var(--border)", marginBottom: "1.25rem", marginTop: 0
      }}>
        <Icon size={18} /> {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="panel" style={{ padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ padding: "0.5rem", background: "var(--surface)", borderRadius: "0.75rem", color: "var(--accent)" }}>
          <Icon size={18} />
        </div>
        <h3 style={{ fontWeight: 900, color: "var(--text)", fontSize: "1rem", margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{children}</div>
    </div>
  );
}

function DetailRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", color: "var(--text)", opacity: 0.4 }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: accent ? "var(--accent)" : "var(--text)", opacity: accent ? 1 : 0.8 }}>{value || "—"}</span>
    </div>
  );
}

function SocialLink({ icon: Icon, label, url }) {
  if (!url) return <DetailRow label={label} value="Not linked" />;
  const safeUrl = url.startsWith("http") ? url : `https://${url}`;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text)", opacity: 0.5 }}>
        <Icon size={15} />
        <span style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      </div>
      <a href={safeUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)", textDecoration: "none", maxWidth: "10rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {url.replace("https://", "").replace("www.", "")}
      </a>
    </div>
  );
}

function InputWrapper({ label, icon: Icon, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--text)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label} {required && <span style={{ color: "var(--accent)" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text)", opacity: 0.4, pointerEvents: "none" }}>
          <Icon size={16} />
        </div>
        {children}
      </div>
    </div>
  );
}
