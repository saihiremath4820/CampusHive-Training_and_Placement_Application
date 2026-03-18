import { useState, useEffect } from "react";
import {
  GraduationCap,
  LogOut,
  UserCircle,
  Menu,
  Briefcase,
  FileText,
  FileSearch,
  AlertCircle,
  ChevronRight,
  FilePlus,
  X,
  Eye,
  CheckCircle2,
  Map as MapIcon,
} from "lucide-react";

import axios from "axios";
import toast from '../common/toastManager';
import { useStudent } from "../../context/StudentContext";
import { getPublicSettings } from "../../services/authService";

import Profile from "./Profile";
import Opportunities from "./Opportunities";
import Applications from "./Applications";
import SkillRoadmap from "./SkillRoadmap";
import PlacementView from "../shared/PlacementView";
import NotificationIcon from "../shared/NotificationIcon";
import StudentProjects from "./StudentProjects";
import { useSocket } from "../../context/SocketContext";

const menuItems = [
  { id: "profile", label: "Professional Profile", icon: UserCircle },
  { id: "opportunities", label: "Jobs & Internships", icon: Briefcase },
  { id: "projects", label: "College Projects", icon: FilePlus },
  { id: "placement", label: "Placement Office", icon: GraduationCap },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "roadmap", label: "Skill Pathways", icon: MapIcon },
  { id: "resume", label: "ATS Assistant", icon: FileSearch },
];

export default function StudentDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumePreview, setResumePreview] = useState(null);
  const [targetRole, setTargetRole] = useState("software-engineer");
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);
  const [lastFile, setLastFile] = useState(null); // stores File object for auto re-analyze
  const [aiEngineOnline, setAiEngineOnline] = useState(null); // null = checking, true/false

  const studentData = useStudent();
  const profile = studentData?.profile;
  const isProfileMandatoryComplete = studentData?.isProfileMandatoryComplete;
  const profileIncomplete =
    profile && isProfileMandatoryComplete && !isProfileMandatoryComplete(profile);

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getPublicSettings()
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  // ── AI engine health ping (runs once when ATS tab is active) ──
  useEffect(() => {
    if (activeTab !== "resume") return;
    const AI_URL = import.meta.env.VITE_AI_ENGINE_URL || "http://localhost:5001";
    axios.get(`${AI_URL}/health`, { timeout: 4000 })
      .then(() => setAiEngineOnline(true))
      .catch(() => {
        // Might be CORS on direct ping — fallback: assume online if backend is reachable
        setAiEngineOnline(null); // unknown but don't block the user
      });
  }, [activeTab]);

  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");
    if (!hasShownWelcome && profile?.fullName) {
      const firstName = profile.fullName.split(" ")[0];
      toast.success(`Welcome back, ${firstName}! Keep grinding 🚀`, {
        duration: 4000,
        position: "top-center",
      });
      sessionStorage.setItem("hasShownWelcome", "true");
    }

    // Restore resume preview from the server path saved in profile
    // so the "View Resume" button keeps working after a page refresh
    if (profile?.resumePath && !resumePreview) {
      if (profile.resumePath.startsWith("http://") || profile.resumePath.startsWith("https://")) {
        setResumePreview(profile.resumePath);
      } else {
        const filename = profile.resumePath.replace(/\\/g, "/").split("/").pop();
        setResumePreview(`${import.meta.env.VITE_API_BASE}/uploads/resumes/${filename}`);
      }
    }
  }, [profile]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      if (studentData?.refreshStudentData) {
        studentData.refreshStudentData();
      }
    };
    socket.on('application_status_update', handleUpdate);
    socket.on('roadmap_ready', handleUpdate);

    return () => {
      socket.off('application_status_update', handleUpdate);
      socket.off('roadmap_ready', handleUpdate);
    };
  }, [socket, studentData]);

  // ── Core analysis function — accepts a File object and role string ──
  const analyzeWithFile = async (file, role) => {
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      setAnalysis(null);
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("role", role);
      formData.append('studentSkills', JSON.stringify(profile?.skills || []));
      formData.append('studentBranch', profile?.branch || '');
      formData.append('studentYear', profile?.year || '');
      formData.append('studentCgpa', profile?.cgpa || '');
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/student/analyze-resume`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(res.data.analysis);
      setLastAnalyzedAt(new Date());
      toast.success("Resume analyzed successfully!");
    } catch (err) {
      console.error("ATS Error:", err?.response?.data || err?.message || err);
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      const networkFail = !err?.response; // no response = backend unreachable
      setError(
        backendMsg ||
        (networkFail ? "Cannot reach server. Make sure the backend is running on port 5000." : "AI analysis engine offline. Please retry later.")
      );
    } finally {
      setLoading(false);
    }
  };

  // ── File upload handler — saves file + triggers analysis ──
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setResumePreview(objectUrl);
    setLastFile(file);              // ← save for auto re-analyze
    await analyzeWithFile(file, targetRole);
  };

  // ── Role change handler — auto re-analyzes if file already uploaded ──
  const handleRoleChange = async (newRole) => {
    setTargetRole(newRole);
    if (lastFile) {
      // File already uploaded — re-analyze immediately with the new role
      await analyzeWithFile(lastFile, newRole);
    } else {
      // No file yet — just clear stale result
      setAnalysis(null);
    }
  };

  const pageLabels = {
    profile: "Professional Profile",
    opportunities: "Jobs & Internships",
    projects: "College Projects",
    placement: "Placement Office",
    applications: "My Applications",
    roadmap: "Skill Pathways",
    resume: "ATS Assistant",
  };

  const displayMenuItems = menuItems.filter(item => {
    if (!settings) return true;
    if (item.id === "placement" && settings.placementEnabled === false) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <aside className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g fill="var(--accent)">
                  {/* Top Left */}
                  <path d="M 30 16 L 42.12 23 L 42.12 37 L 30 44 L 17.88 37 L 17.88 23 Z" />
                  <circle cx="30" cy="30" r="4.5" fill="white" />
                  {/* Top Right */}
                  <path d="M 58 16 L 70.12 23 L 70.12 37 L 58 44 L 45.88 37 L 45.88 23 Z" />
                  <circle cx="58" cy="30" r="4.5" fill="white" />
                  {/* Bottom Center */}
                  <path d="M 44 40 L 56.12 47 L 56.12 61 L 44 68 L 31.88 61 L 31.88 47 Z" />
                  <circle cx="44" cy="54" r="4.5" fill="white" />
                </g>
              </svg>
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-brand-name">Campus <span style={{ color: "var(--accent)" }}>Hive</span></div>
              <div className="sidebar-brand-sub" style={{ marginTop: "2px", letterSpacing: "1px" }}>T&amp;P PORTAL</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <div className="sidebar-group">
              {displayMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`sidebar-item${isActive ? " active" : ""}`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {item.id === "profile" && profileIncomplete && (
                      <span style={{
                        marginLeft: "auto",
                        width: 7, height: 7,
                        borderRadius: "50%",
                        background: "var(--red)",
                        flexShrink: 0
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User chip */}
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {profile?.fullName?.charAt(0) || "S"}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{profile?.fullName || "Student"}</div>
                <div className="sidebar-user-role">Academic Profile</div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div className={sidebarOpen ? "main-content" : "main-content-full"}>

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
            >
              <Menu size={18} />
            </button>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
              Student Dashboard
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationIcon />
            <div style={{ width: 1, height: 22, background: "var(--border)" }} />
            <button
              onClick={onLogout}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(200,75,49,0.06)", border: "1px solid rgba(200,75,49,0.15)", borderRadius: 6, color: "var(--red)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1400, width: "100%" }}>

          {/* Incomplete profile banner */}
          {profileIncomplete && activeTab !== "profile" && (
            <div style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "rgba(224,155,61,0.08)",
              border: "1px solid rgba(224,155,61,0.25)",
              borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a05e10", fontSize: 13 }}>
                <AlertCircle size={16} />
                <span>Your profile isn't complete yet — companies won't be able to see you.</span>
              </div>
              <button
                onClick={() => setActiveTab("profile")}
                style={{ padding: "5px 12px", background: "var(--yellow)", border: "none", borderRadius: 5, color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px" }}
              >
                Finish Now
              </button>
            </div>
          )}

          {/* Tab content */}
          <div>
            {activeTab === "profile" && <Profile />}
            {activeTab === "opportunities" && <Opportunities onNavigateToProfile={() => setActiveTab("profile")} />}
            {activeTab === "applications" && <Applications />}
            {activeTab === "projects" && <StudentProjects />}
            {activeTab === "roadmap" && <SkillRoadmap />}
            {activeTab === "placement" && <PlacementView role="student" />}
            {activeTab === "resume" && (
              <ResumeAnalyzer
                analysis={analysis}
                loading={loading}
                error={error}
                resumePreview={resumePreview}
                onUpload={handleResumeUpload}
                targetRole={targetRole}
                onRoleChange={handleRoleChange}  // ← auto re-analyze on role switch
                lastAnalyzedAt={lastAnalyzedAt}
                hasFile={!!lastFile}              // ← tells UI if re-analyze is possible
                aiEngineOnline={aiEngineOnline}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── ResumeAnalyzer ────────────────────────────────────────── */
const ROLE_OPTIONS = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "ml", label: "Machine Learning / AI" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "backend", label: "Backend Developer" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "embedded", label: "Embedded Systems" },
];

function ResumeAnalyzer({ analysis, loading, error, onUpload, resumePreview, targetRole, onRoleChange, lastAnalyzedAt, hasFile, aiEngineOnline }) {
  const [showPdf, setShowPdf] = useState(false);

  const getScoreClass = (score) => {
    if (score >= 75) return "strong";
    if (score >= 50) return "average";
    return "weak";
  };
  
  const getScoreLabel = (score) => {
    if (score >= 75) return "Strong Match";
    if (score >= 50) return "Average Match";
    return "Needs Work";
  };

  return (
    <div className="ats-wrapper">
      <div className="page-title-block" style={{marginBottom: 0}}>
        <h1 className="page-title" style={{fontFamily: 'inherit', fontWeight: 600}}>ATS Assistant</h1>
        <p className="page-subtitle" style={{fontFamily: 'inherit'}}>Clean, professional AI resume analysis tailored to your target role.</p>
      </div>

      {/* Upload panel */}
      <div className="ats-card">
        <div className="ats-upload-section">
          {/* Target Role Row */}
          <div className="ats-row" style={{ justifyContent: 'space-between' }}>
            <div className="ats-row">
              <label className="ats-label">Target Role</label>
              <select
                className="ats-select"
                value={targetRole}
                onChange={(e) => onRoleChange(e.target.value)}
                disabled={loading}
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="ats-hint">Changing will auto re-analyze</span>
            </div>
            {aiEngineOnline === true && <span className="ats-hint" style={{color: '#22c55e'}}>AI Engine Online</span>}
            {aiEngineOnline === false && <span className="ats-hint" style={{color: '#ef4444'}}>AI Engine Offline</span>}
          </div>

          {/* Upload Drop Zone */}
          <label className="ats-upload-zone" style={{ opacity: loading ? 0.6 : 1, position: 'relative' }}>
            <input
              type="file"
              onChange={onUpload}
              accept=".pdf"
              disabled={loading}
            />
            {hasFile ? (
              <div className="ats-resume-info">
                <FileSearch size={20} style={{ color: "#3b82f6" }} />
                <span className="ats-resume-name">Resume Uploaded</span>
                <span className="ats-resume-meta">PDF &middot; Analyzed for {ROLE_OPTIONS.find(r => r.value === targetRole)?.label}</span>
                <span className="ats-reupload-btn">{loading ? "Analyzing..." : "Replace"}</span>
              </div>
            ) : (
              <div className="ats-upload-prompt">
                <FileSearch size={20} style={{ color: "#3b82f6" }} />
                <span>Drop your resume PDF here or</span>
                <span className="ats-browse-btn">Browse files</span>
                <span className="ats-hint" style={{marginLeft: 8}}>Max 5MB</span>
              </div>
            )}
          </label>
        </div>

        {resumePreview && (
          <div style={{ marginTop: 16 }}>
             <button onClick={() => setShowPdf(true)} className="ats-reupload-btn" style={{ padding: '6px 12px', background: 'transparent' }}>
               View PDF
             </button>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, color: "#ef4444", fontSize: 13, marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>

      {/* ── RESULTS ── */}
      {analysis && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Score card */}
          <div className="ats-card">
            <div className="ats-score-section">
              <div className="ats-score-header">
                <span className="ats-section-title">ATS Match Score</span>
                {analysis.mode && (
                  <span className="ats-score-source">{analysis.mode === 'GROQ_AI' ? 'Groq AI' : 'Keyword Engine'}</span>
                )}
                <span className={`ats-score-label ${getScoreClass(analysis.atsScore)}`}>{getScoreLabel(analysis.atsScore)}</span>
              </div>

              <div className="ats-score-body">
                <div className="ats-score-number">
                  <span className="ats-score-value">{analysis.atsScore}</span>
                  <span className="ats-score-unit">%</span>
                </div>
                <div className="ats-score-right">
                  {analysis.resumeSummary && (
                    <p className="ats-score-summary">{analysis.resumeSummary}</p>
                  )}
                  <div className="ats-score-bar">
                    <div className="ats-score-fill" style={{ width: `${analysis.atsScore}%`, background: getScoreClass(analysis.atsScore) === 'strong' ? '#22c55e' : getScoreClass(analysis.atsScore) === 'average' ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="ats-score-role">Role: {ROLE_OPTIONS.find(r => r.value === targetRole)?.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-col: Verified Skills + Missing Skills */}
          <div className="ats-skills-grid">
            <div className="ats-skills-card ats-skills-verified">
              <div className="ats-card-header">
                <span className="ats-card-title">Verified Skills</span>
                <span className="ats-card-count">{analysis.extractedSkills?.length || 0} found</span>
              </div>
              <div className="ats-tags">
                {(analysis.extractedSkills || []).length === 0 ? (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>None detected</span>
                ) : (
                  (analysis.extractedSkills || []).map((s) => (
                    <span key={s} className="ats-tag ats-tag-verified">{s}</span>
                  ))
                )}
              </div>
            </div>

            <div className="ats-skills-card ats-skills-missing">
              <div className="ats-card-header">
                <span className="ats-card-title">Missing Skills</span>
                <span className="ats-card-count">{analysis.missingSkills?.length || 0} gaps</span>
              </div>
              <div className="ats-tags">
                {(analysis.missingSkills || []).length === 0 ? (
                  <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 500 }}>No critical gaps detected</span>
                ) : (
                  (analysis.missingSkills || []).map((s) => (
                    <span key={s} className="ats-tag ats-tag-missing">{s}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
             <div className="ats-card">
               <div className="ats-section-title" style={{marginBottom: 12}}>Resume Strengths</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                 {analysis.strengths.map((s, i) => (
                   <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                     <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0, marginTop: 6 }} />
                     <span className="ats-body">{s}</span>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* Optimization Suggestions */}
          <div className="ats-suggestions">
            <div className="ats-section-header">
              <span className="ats-section-title">Optimization Suggestions</span>
              <span className="ats-hint">Specific to your resume</span>
            </div>
            
            {(analysis.suggestions || []).length === 0 ? (
               <div className="ats-card">
                 <span className="ats-body" style={{ color: "#22c55e" }}>No critical improvements needed</span>
               </div>
            ) : (
              <div className="ats-suggestions-list">
                {analysis.suggestions.map((s, i) => {
                  const isObj = typeof s === "object" && s !== null;
                  const text = isObj ? s.suggestion : s;
                  const priority = isObj ? s.priority?.toLowerCase() || 'medium' : 'medium';
                  const reason = isObj ? s.reason : null;
                  
                  return (
                    <div key={i} className={`ats-suggestion-item ats-priority-${priority}`}>
                      <div className="ats-suggestion-content">
                        <span className="ats-suggestion-text">{text}</span>
                        {reason && <span className="ats-suggestion-desc">{reason}</span>}
                      </div>
                      {isObj && s.priority && (
                        <span className={`ats-priority-badge ats-priority-${priority}`}>
                          {s.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdf && resumePreview && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowPdf(false)}
        >
          <div
            style={{ position: "relative", width: "100%", maxWidth: 900, height: "85vh", background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPdf(false)}
              style={{ position: "absolute", top: 10, right: 10, zIndex: 10, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={16} />
            </button>
            <iframe src={resumePreview} style={{ width: "100%", height: "100%", border: "none" }} title="Resume Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
