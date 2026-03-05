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

function ScoreBadge({ score }) {
  const color = score >= 75 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Average" : "Needs Work";
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}22`, color, letterSpacing: "0.4px", border: `1px solid ${color}44`
    }}>{label}</span>
  );
}

function ResumeAnalyzer({ analysis, loading, error, onUpload, resumePreview, targetRole, onRoleChange, lastAnalyzedAt, hasFile, aiEngineOnline }) {
  const [showPdf, setShowPdf] = useState(false);

  const fmtTime = (d) => {
    if (!d) return null;
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return d.toLocaleTimeString();
  };

  return (
    <div>
      <div className="page-title-block">
        <h1 className="page-title">ATS <em>Assistant</em></h1>
        <p className="page-subtitle">AI-powered resume analysis personalised to your profile and target role.</p>
      </div>

      {/* Upload panel */}
      <div className="panel" style={{ maxWidth: 760, marginBottom: 20 }}>
        <div className="panel-header">
          <span className="panel-title">Upload &amp; Analyze</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {aiEngineOnline === true && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--green)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                AI Online
              </span>
            )}
            {aiEngineOnline === false && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--red)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />
                AI Offline
              </span>
            )}
            {lastAnalyzedAt && (
              <span className="panel-tag">Last analyzed: {fmtTime(lastAnalyzedAt)}</span>
            )}
          </div>
        </div>
        <div className="panel-body">

          {/* Role selector */}
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Target Role
              {hasFile && (
                <span style={{ marginLeft: 8, fontSize: 10, color: "var(--accent)", fontFamily: "'DM Mono', monospace", letterSpacing: 0, fontWeight: 500, textTransform: "none" }}>
                  · changing will auto re-analyze
                </span>
              )}
            </label>
            <select
              value={targetRole}
              onChange={(e) => onRoleChange(e.target.value)}
              disabled={loading}
              style={{
                marginTop: 6, width: "100%", padding: "9px 12px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text)", fontSize: 13.5,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {ROLE_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Upload zone */}
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Resume PDF</label>
            <div className="drop-zone" style={{ position: "relative", marginTop: 6 }}>
              <input
                type="file"
                onChange={onUpload}
                accept=".pdf"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 1 }}
              />
              <FileSearch size={26} style={{ color: "var(--accent)", marginBottom: 7 }} />
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>
                {loading ? "Analyzing…" : analysis ? "Re-upload to re-analyze" : "Drop PDF or click to upload"}
              </p>
              <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>PDF Format · Max 5MB · Analyzed for role: <strong>{ROLE_OPTIONS.find(r => r.value === targetRole)?.label}</strong></p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {resumePreview && (
              <button onClick={() => setShowPdf(true)} className="btn-ghost" style={{ gap: 6 }}>
                <Eye size={13} /> View Resume
              </button>
            )}
          </div>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--accent)", fontSize: 13, marginTop: 14, padding: "10px 14px", background: "rgba(var(--accent-rgb,99,102,241),0.06)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <div style={{ width: 15, height: 15, border: "2.5px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
              <span>Analyzing for <strong>{ROLE_OPTIONS.find(r => r.value === targetRole)?.label}</strong> — this takes 5–10 seconds…</span>
            </div>
          )}

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(200,75,49,0.07)", border: "1px solid rgba(200,75,49,0.2)", borderRadius: 6, color: "var(--red)", fontSize: 13, marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      {analysis && (
        <div style={{ maxWidth: 900 }}>

          {/* Score card */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-header">
              <span className="panel-title">ATS Match Score</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {analysis.mode && (() => {
                  const isGroq = analysis.mode === "GROQ_AI";
                  return (
                    <span className="panel-tag" style={{
                      background: isGroq ? "rgba(59,130,246,0.1)" : "rgba(224,155,61,0.1)",
                      color: isGroq ? "#3b82f6" : "var(--yellow)",
                      border: `1px solid ${isGroq ? "rgba(59,130,246,0.25)" : "rgba(224,155,61,0.25)"}`,
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: "0.3px"
                    }}>
                      {isGroq ? "🤖 Groq AI" : "⚡ Keyword Engine"}
                    </span>
                  );
                })()}
                <ScoreBadge score={analysis.atsScore} />
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 52, fontWeight: 700, color: "var(--accent)", letterSpacing: "-2px", lineHeight: 1 }}>
                    {analysis.atsScore}<span style={{ fontSize: 22, color: "var(--text-muted)" }}>%</span>
                  </div>
                  {analysis.resumeSummary && (
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 8, maxWidth: 360 }}>
                      {analysis.resumeSummary}
                    </p>
                  )}
                </div>
                {/* Progress bar */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ height: 8, borderRadius: 8, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 8,
                      width: `${analysis.atsScore}%`,
                      background: analysis.atsScore >= 75 ? "var(--green)" : analysis.atsScore >= 50 ? "var(--yellow)" : "var(--red)",
                      transition: "width 0.8s ease"
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                    Role analyzed: <strong>{ROLE_OPTIONS.find(r => r.value === targetRole)?.label}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-col: Verified Skills + Missing Skills */}
          <div className="grid-2" style={{ marginBottom: 16 }}>

            <div className="panel">
              <div className="panel-header">
                <span className="panel-title" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <CheckCircle2 size={13} style={{ color: "var(--green)" }} /> Verified Skills
                </span>
                <span className="panel-tag pill-green">{analysis.extractedSkills?.length || 0} found</span>
              </div>
              <div className="panel-body" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(analysis.extractedSkills || []).length === 0 ? (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No skills detected in resume text</span>
                ) : (
                  (analysis.extractedSkills || []).map((s) => (
                    <span key={s} className="pill pill-green">{s}</span>
                  ))
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span className="panel-title" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <AlertCircle size={13} style={{ color: "var(--red)" }} /> Missing Skills
                </span>
                <span className="panel-tag" style={{ background: "rgba(200,75,49,0.08)", color: "var(--red)", border: "1px solid rgba(200,75,49,0.2)" }}>
                  {analysis.missingSkills?.length || 0} gaps
                </span>
              </div>
              <div className="panel-body" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(analysis.missingSkills || []).length === 0 ? (
                  <span style={{ fontSize: 12, color: "var(--green)" }}>✓ No critical gaps detected</span>
                ) : (
                  (analysis.missingSkills || []).map((s) => (
                    <span key={s} className="pill" style={{ background: "rgba(200,75,49,0.08)", color: "var(--red)", border: "1px solid rgba(200,75,49,0.18)" }}>{s}</span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-header">
                <span className="panel-title">✦ Resume Strengths</span>
              </div>
              <div className="panel-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {analysis.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", flexShrink: 0, marginTop: 5 }} />
                      <span style={{ color: "var(--text)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Optimization Suggestions */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <AlertCircle size={13} style={{ color: "var(--yellow)" }} /> Optimization Suggestions
              </span>
              <span className="panel-tag">Specific to your resume</span>
            </div>
            <div className="panel-body">
              {(analysis.suggestions || []).length === 0 ? (
                <span style={{ fontSize: 12.5, color: "var(--green)" }}>✓ No critical improvements needed</span>
              ) : (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {analysis.suggestions.map((s, i) => {
                    // s may be a string (legacy) or object { suggestion, priority, reason } (Groq)
                    const isObj = typeof s === "object" && s !== null;
                    const text = isObj ? s.suggestion : s;
                    const priority = isObj ? s.priority : null;
                    const reason = isObj ? s.reason : null;
                    const dotColor = priority === "high" ? "var(--red)" : priority === "medium" ? "var(--yellow)" : "var(--accent)";
                    return (
                      <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{text}</div>
                          {reason && (
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                              {s.category?.toUpperCase()} · {reason}
                            </div>
                          )}
                        </div>
                        {priority && (
                          <span className="pill" style={{
                            flexShrink: 0,
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
                            background: priority === "high" ? "rgba(200,75,49,0.1)" : priority === "medium" ? "rgba(224,155,61,0.1)" : "rgba(59,130,246,0.1)",
                            color: priority === "high" ? "var(--red)" : priority === "medium" ? "var(--yellow)" : "var(--accent)",
                            border: `1px solid ${priority === "high" ? "rgba(200,75,49,0.25)" : priority === "medium" ? "rgba(224,155,61,0.25)" : "rgba(59,130,246,0.25)"}`
                          }}>{priority?.toUpperCase()}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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
