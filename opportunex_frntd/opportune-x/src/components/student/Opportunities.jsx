import { useEffect, useState } from "react";
import { useStudent } from "../../context/StudentContext";
import { getStudentOpportunities } from "../../services/opportunityService";
import {
  Briefcase, MapPin, CheckCircle2, Sparkles,
  Target, Zap, AlertCircle, X, Building2, Clock
} from "lucide-react";
import LoadingSpinner from "../admin/shared/LoadingSpinner";

const PUNE_FALLBACK_OPPORTUNITIES = [
  { _id: "p1", title: "Software Engineer (SDE-1)", companyName: "Persistent Systems", type: "Full Time", location: "Pune, MH", fitPercentage: 87, requiredSkills: ["Java", "Spring Boot", "MySQL", "REST APIs"], missingSkills: [] },
  { _id: "p2", title: "Technology Analyst", companyName: "Barclays", type: "Full Time", location: "Pune, MH", fitPercentage: 81, requiredSkills: ["Python", "SQL", "Excel", "JIRA"], missingSkills: [] },
  { _id: "p3", title: "SDE Intern → PPO", companyName: "PhonePe", type: "Internship", location: "Bangalore", fitPercentage: 92, requiredSkills: ["DSA", "Java", "System Design", "OOP"], missingSkills: [] },
  { _id: "p4", title: "Data Engineer Intern", companyName: "ZS Associates", type: "Internship", location: "Pune, MH", fitPercentage: 78, requiredSkills: ["PySpark", "SQL", "Hadoop", "Airflow"], missingSkills: ["Airflow"] },
  { _id: "p5", title: "Associate Software Engineer", companyName: "Adobe", type: "Full Time", location: "Noida", fitPercentage: 88, requiredSkills: ["C++", "DSA", "OS", "DBMS"], missingSkills: [] },
  { _id: "p6", title: "Graduate Software Engineer", companyName: "HSBC", type: "Full Time", location: "Pune, MH", fitPercentage: 75, requiredSkills: ["Java", "SQL", "Spring", "Microservices"], missingSkills: ["Microservices"] },
  { _id: "p7", title: "Frontend Developer Intern", companyName: "Morgan Stanley", type: "Internship", location: "Mumbai", fitPercentage: 84, requiredSkills: ["React", "TypeScript", "CSS", "Git"], missingSkills: [] },
  { _id: "p8", title: "ML Engineer", companyName: "Qualcomm India", type: "Full Time", location: "Hyderabad", fitPercentage: 70, requiredSkills: ["Python", "TensorFlow", "C++", "DSP"], missingSkills: ["DSP"] },
];

const AVATAR_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#ef4444", "#0ea5e9"];

export default function Opportunities({ onNavigateToProfile }) {
  const { applications, resume, applyToOpportunity, generateRoadmap, isProfileMandatoryComplete, profile } = useStudent();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [pendingOpportunity, setPendingOpportunity] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    const fetchOpportunities = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await getStudentOpportunities();
        if (isMounted) setOpportunities(res.data.data || []);
      } catch (err) {
        console.error("Failed to load opportunities", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOpportunities(true);
    intervalId = setInterval(() => fetchOpportunities(false), 15000);
    return () => { isMounted = false; if (intervalId) clearInterval(intervalId); };
  }, []);

  const handleApplyClick = async (op) => {
    if (!isProfileMandatoryComplete() || !resume) {
      setPendingOpportunity(op);
      setShowBlockModal(true);
    } else {
      await applyToOpportunity(op);

      // Auto-generate roadmap for missing skills after successful apply
      const studentSkillsLower = (profile?.skills || []).map(s => (s?.name || s || "").toLowerCase());
      const jobSkills = op.requiredSkills || [];
      const missing = jobSkills.filter(s => !studentSkillsLower.includes(s.toLowerCase()));
      if (missing.length > 0) {
        // Give a short toast before starting AI generation
        const toastId = missing.length;
        generateRoadmap(missing, op.title || "software-engineer").catch(() => { });
      }
    }
  };

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '200px',
      color: 'var(--text-muted)', fontSize: '13px',
      fontFamily: "'DM Mono', monospace"
    }}>
      <div style={{
        width: '20px', height: '20px',
        border: '2px solid var(--accent)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginRight: '10px'
      }} />
      Loading...
    </div>
  );

  const displayOps = opportunities.length > 0 ? opportunities : PUNE_FALLBACK_OPPORTUNITIES;
  const isFallback = opportunities.length === 0;
  const FILTERS = ["All", "Full Time", "Internship"];
  const filtered = filter === "All" ? displayOps : displayOps.filter(o => (o.type || "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2.5rem", minWidth: 0 }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.25rem" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: "0.4rem" }}>
            <Briefcase size={11} /> Placement Portal
          </span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.2rem", letterSpacing: "-0.03em" }}>
            Available Roles
          </h2>
          <p style={{ color: "var(--text)", opacity: 0.5, fontSize: "0.82rem", fontWeight: 500, margin: 0 }}>
            Open positions matched to your academic and skill profile
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {!resume && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.75rem", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: "0.5rem" }}>
              <AlertCircle size={13} style={{ color: "#d97706" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#d97706" }}>Resume Missing</span>
            </div>
          )}
          <div style={{ padding: "0.35rem 0.85rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.65rem", fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", opacity: 0.6 }}>
            {filtered.length} {filter === "All" ? "total" : filter.toLowerCase()} roles
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "0.4rem", paddingBottom: "0.25rem" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.3rem 0.85rem", borderRadius: "0.5rem", fontSize: "0.72rem", fontWeight: 700,
            border: filter === f ? "none" : "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s",
            background: filter === f ? "var(--accent)" : "var(--surface)",
            color: filter === f ? "#fff" : "var(--text)", opacity: filter === f ? 1 : 0.65
          }}>{f}</button>
        ))}
      </div>


      {/* ── FALLBACK NOTICE ── */}
      {isFallback && (
        <div style={{
          padding: "0.75rem 1.25rem", background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)", borderRadius: "0.75rem",
          display: "flex", alignItems: "center", gap: "0.65rem"
        }}>
          <Sparkles size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span style={{ fontSize: "0.77rem", fontWeight: 600, color: "var(--text)", opacity: 0.65 }}>
            Sample opportunities from PICT recruiters 🏛️ — real listings appear once companies post on the platform.
          </span>
        </div>
      )}

      {/* ── OPPORTUNITIES GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem", minWidth: 0 }}>
        {filtered.map((op, idx) => {
          const alreadyApplied = (applications || []).some((a) => a.title === op.title);
          const jobSkills = op.requiredSkills || [];
          const backendMissingSkills = op.missingSkills || [];

          // Use backend's fit score if available (proper 0-100%), else compute client-side
          let numericFit = (op.fitPercentage != null) ? op.fitPercentage : null;
          let fitLabel;

          if (numericFit != null) {
            // Backend computed real score — show it with matched count for clarity
            const matchedCount = jobSkills.length - backendMissingSkills.length;
            fitLabel = `${matchedCount}/${jobSkills.length} Skills`;
          } else if (jobSkills.length > 0) {
            // Fallback: compute client-side from profile
            const studentSkillsLower = (profile?.skills || []).map(s => (s?.name || s || "").toLowerCase());
            const matchCount = jobSkills.filter(s => studentSkillsLower.includes(s.toLowerCase())).length;
            numericFit = Math.round((matchCount / jobSkills.length) * 100);
            fitLabel = `${matchCount}/${jobSkills.length} Skills`;
          } else {
            numericFit = 0;
            fitLabel = "No Skills Listed";
          }

          const isExcellentFit = numericFit >= 80;
          const isGoodFit = numericFit >= 50;
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const fitColor = isExcellentFit ? "#22c55e" : isGoodFit ? "var(--accent)" : "#f59e0b";
          const showFitBadge = jobSkills.length > 0;
          // Show missing skills from backend; fallback to client-side compute
          const effectiveMissingSkills = backendMissingSkills.length > 0
            ? backendMissingSkills
            : jobSkills.filter(s => !(profile?.skills || []).map(sk => (sk?.name || sk || "").toLowerCase()).includes(s.toLowerCase()));

          return (
            <div key={op._id} className="panel" style={{
              padding: "1.5rem", position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column", gap: "1rem",
              border: "1px solid var(--border)", transition: "box-shadow 0.2s, border-color 0.2s",
              minWidth: 0
            }}>
              {/* Top row: avatar + title + fit badge */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", minWidth: 0 }}>
                <div style={{
                  width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", flexShrink: 0,
                  background: `${avatarColor}18`, color: avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: 900, border: `1px solid ${avatarColor}25`
                }}>
                  {(op.companyName || "?").charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.2rem", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {op.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text)", opacity: 0.6 }}>{op.companyName || "Top Recruiter"}</span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border)", display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: avatarColor }}>{op.type || "Full Time"}</span>
                  </div>
                </div>
                {/* Fit badge */}
                {showFitBadge && (
                  <div style={{
                    padding: "0.3rem 0.65rem", borderRadius: "0.5rem", flexShrink: 0,
                    background: `${fitColor}12`, border: `1px solid ${fitColor}28`,
                    color: fitColor, fontSize: "0.68rem", fontWeight: 900,
                    display: "flex", alignItems: "center", gap: "0.25rem"
                  }}>
                    {isExcellentFit ? <Zap size={10} /> : <Target size={10} />}
                    {fitLabel}
                  </div>
                )}
              </div>

              {/* Fit bar */}
              {showFitBadge && (
                <div style={{ background: "var(--surface)", borderRadius: "0.375rem", height: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${numericFit}%`, height: "100%", background: fitColor, borderRadius: "0.375rem", transition: "width 0.5s" }} />
                </div>
              )}

              {/* Skills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", minWidth: 0 }}>
                {op.requiredSkills.slice(0, 5).map((skill, i) => (
                  <span key={i} style={{
                    fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.55rem",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "0.35rem", color: "var(--text)", opacity: 0.8
                  }}>{skill}</span>
                ))}
                {op.requiredSkills.length > 5 && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.55rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.35rem", color: "var(--text)", opacity: 0.4 }}>+{op.requiredSkills.length - 5}</span>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.875rem", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", opacity: 0.65 }}>{op.location || "On-site / Remote"}</span>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  {effectiveMissingSkills.length > 0 && (
                    <button
                      onClick={() => generateRoadmap(effectiveMissingSkills, op.title)}
                      title={`Generate roadmap for ${effectiveMissingSkills.length} missing skill${effectiveMissingSkills.length > 1 ? 's' : ''}`}
                      style={{
                        padding: "0.45rem", borderRadius: "0.5rem", background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.25)", color: "var(--accent)", cursor: "pointer", display: "flex",
                        transition: "all 0.15s"
                      }}
                    >
                      <Sparkles size={14} />
                    </button>
                  )}
                  <button onClick={() => handleApplyClick(op)} disabled={alreadyApplied} style={{
                    padding: "0.5rem 1.1rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 800,
                    cursor: alreadyApplied ? "default" : "pointer",
                    border: alreadyApplied ? "1px solid var(--accent)" : "1px solid transparent",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    background: alreadyApplied ? "transparent" : "var(--accent)",
                    color: alreadyApplied ? "var(--accent)" : "#fff",
                    opacity: alreadyApplied ? 0.8 : 1,
                    transition: "all 0.2s"
                  }}>
                    {alreadyApplied ? <><CheckCircle2 size={13} /> Applied</> : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BLOCKING MODAL ── */}
      {showBlockModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
          <div className="panel" style={{ width: "100%", maxWidth: "26rem", padding: "2.5rem", textAlign: "center" }}>
            <div style={{ width: "3.5rem", height: "3.5rem", margin: "0 auto 1.25rem", background: "rgba(239,68,68,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={24} style={{ color: "var(--red)" }} />
            </div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.5rem" }}>Incomplete Profile</h3>
            <p style={{ color: "var(--text)", opacity: 0.55, fontWeight: 500, marginBottom: "2rem", fontSize: "0.85rem", lineHeight: 1.6 }}>
              Companies require a complete profile and uploaded resume before you can apply.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <button onClick={() => { setShowBlockModal(false); onNavigateToProfile?.(); }} style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", background: "var(--accent)", color: "#fff", fontWeight: 900, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", border: "none", cursor: "pointer" }}>
                Complete Profile Now
              </button>
              <button onClick={() => setShowBlockModal(false)} style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", background: "none", color: "var(--text)", opacity: 0.45, fontWeight: 700, fontSize: "0.75rem", border: "1px solid var(--border)", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
