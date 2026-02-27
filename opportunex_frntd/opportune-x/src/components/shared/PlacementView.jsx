import { useState, useEffect } from "react";
import {
    Building2, Target, Phone, Award, Mic, FileText,
    Briefcase, Globe, Users, ShieldCheck, CheckCircle2,
    TrendingUp, Calendar, MapPin, Star, Mail,
    ChevronRight, GraduationCap, Zap, BarChart2,
    Clock, ArrowUpRight, BookOpen, Trophy, RefreshCw
} from "lucide-react";

import {
    getPlacementStats,
    getPlacementObjectives,
    getPlacementProcess,
    getTrainingActivities,
    getRecruiters,
    getTpoContacts,
    getIndustryCollaborations,
    getPlacementOverview,
} from "../../services/adminPlacementService";
import { getPublicSettings } from "../../services/authService";

/* ─── FALLBACK / STATIC DATA (used only when API returns empty) ── */

const COLLEGE_INFO = {
    name: "Pune Institute of Computer Technology",
    shortName: "PICT",
    address: "Survey No. 27, Pune-Satara Road, Dhankawadi, Pune - 411043, Maharashtra",
    established: 1983,
    naac: "A+",
    naacCycle: "4th Cycle",
    affiliatedTo: "Savitribai Phule Pune University (SPPU)",
    students: "2500+",
    faculty: "200+",
    phone: "+91-20-24371101",
    website: "www.pict.edu",
};

const AVATAR_COLORS = [
    "#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#ef4444", "#0ea5e9"
];

const FALLBACK_PROCESS = [
    { step: 1, icon: FileText, title: "Portal Registration", desc: "Students register on the T&P Cell portal. Academic records, skills, and resume are verified." },
    { step: 2, icon: BookOpen, title: "Pre-Placement Training", desc: "Aptitude, coding (DSA, SQL), and soft skills training. Mock GD/PI sessions conducted." },
    { step: 3, icon: Users, title: "Company Shortlisting", desc: "Companies review profiles based on CGPA, active backlogs, and skill match." },
    { step: 4, icon: Mic, title: "Online Test & GD Round", desc: "Aptitude, logical reasoning, and technical MCQs. GD rounds for select companies." },
    { step: 5, icon: Target, title: "Technical Interviews", desc: "1–3 technical interview rounds assessing DSA, projects, and system design." },
    { step: 6, icon: Award, title: "HR & Offer Letter", desc: "Final HR round. Offer letters released within 7–21 days." },
];

const FALLBACK_OBJECTIVES = [
    "Achieve highest possible placement rate for eligible students.",
    "Onboard maximum recruiting partners including product companies and MNCs.",
    "Establish PPO pipelines from summer internships.",
    "Maintain strong recruiter diversity across IT, Finance, Core, and Consulting sectors.",
];

/* ─── HELPER: Spinner ───────────────────────────────────────────── */
function Spinner() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
            <div style={{ width: 16, height: 16, border: "2.5px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Loading live data…
        </div>
    );
}

/* ─── COMPONENT ─────────────────────────────────────────────────── */
export default function PlacementView({ role = "student" }) {
    const [activeYear, setActiveYear] = useState(0);
    const [activeSection, setActiveSection] = useState("overview");

    // --- Live data from admin API ---
    const [stats, setStats] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [processSteps, setProcessSteps] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [collaborations, setCollaborations] = useState([]);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [settings, setSettings] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [
                statsRes,
                objRes,
                procRes,
                trainRes,
                recruiterRes,
                contactRes,
                collabRes,
                overviewRes,
                setRes,
            ] = await Promise.allSettled([
                getPlacementStats(),
                getPlacementObjectives(),
                getPlacementProcess(),
                getTrainingActivities(),
                getRecruiters(),
                getTpoContacts(),
                getIndustryCollaborations(),
                getPlacementOverview(),
                getPublicSettings()
            ]);

            // Sort stats by academic year ascending
            const rawStats = statsRes.status === "fulfilled" ? (statsRes.value.data || []) : [];
            const sortedStats = [...rawStats].sort((a, b) =>
                parseInt((a.academicYear || "0").split("-")[0]) -
                parseInt((b.academicYear || "0").split("-")[0])
            );
            setStats(sortedStats);

            const rawObj = objRes.status === "fulfilled" ? (objRes.value.data || []) : [];
            setObjectives(rawObj);

            const rawProc = procRes.status === "fulfilled" ? (procRes.value.data || []) : [];
            setProcessSteps([...rawProc].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0)));

            setTrainings(trainRes.status === "fulfilled" ? (trainRes.value.data || []) : []);
            setRecruiters(recruiterRes.status === "fulfilled" ? (recruiterRes.value.data || []) : []);
            setContacts(contactRes.status === "fulfilled" ? (contactRes.value.data || []) : []);
            setCollaborations(collabRes.status === "fulfilled" ? (collabRes.value.data || []) : []);
            setOverview(overviewRes.status === "fulfilled" ? overviewRes.value.data : null);
            setSettings(setRes.status === "fulfilled" ? setRes.value.data : null);

        } catch (err) {
            console.error("PlacementView fetch error:", err);
        } finally {
            setLoading(false);
            setLastRefreshed(new Date());
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // Derived display data
    const displayStats = stats.length > 0 ? stats : [];
    const stat = displayStats[activeYear] || null;
    const displayObjectives = objectives.length > 0 ? objectives : [];
    const displayProcess = processSteps.length > 0 ? processSteps : FALLBACK_PROCESS.map((p, i) => ({
        _id: i, stepNumber: p.step, title: p.title, description: p.desc
    }));
    const displayContacts = contacts.length > 0 ? contacts : [];
    const displayRecruiters = recruiters.length > 0 ? recruiters : [];
    const displayCollaborations = collaborations.length > 0 ? collaborations : [];
    const displayTrainings = trainings.length > 0 ? trainings : [];

    const fmtTime = (d) => {
        if (!d) return "";
        const diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        return `${Math.floor(diff / 60)}m ago`;
    };

    const SECTIONS = [
        { id: "overview", label: "Overview", icon: BarChart2 },
        { id: "recruiters", label: "Recruiters", icon: Building2 },
        { id: "process", label: "Our Process", icon: Zap },
        { id: "trainings", label: "Trainings", icon: BookOpen },
        { id: "collaborations", label: "Industry Partners", icon: Globe },
        { id: "contacts", label: "TPO Contacts", icon: Phone },
    ].filter(s => {
        if (!settings) return true;
        if (s.id === "recruiters" && settings.recruitersVisible === false) return false;
        if (s.id === "trainings" && settings.trainingEnabled === false) return false;
        return true;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "3rem", maxWidth: "1200px" }}>

            {/* ── HERO BANNER ── */}
            <div style={{
                borderRadius: "1.5rem", overflow: "hidden", position: "relative",
                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
                padding: "3rem",
                boxShadow: "0 24px 60px rgba(99,102,241,0.25)"
            }}>
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                    <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
                    <GraduationCap size={220} style={{ position: "absolute", right: "-20px", bottom: "-30px", opacity: 0.06, color: "#fff" }} />
                </div>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                        <span style={{ padding: "0.3rem 0.85rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: "0.5rem", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a5b4fc" }}>
                            🏛️ Official Placement Cell
                        </span>
                        <span style={{ padding: "0.3rem 0.85rem", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "0.5rem", fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.1em", color: "#86efac" }}>
                            ● ACTIVE
                        </span>
                        {/* Refresh button */}
                        <button
                            onClick={fetchAll}
                            disabled={loading}
                            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "0.3rem 0.85rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", color: "#a5b4fc", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em" }}
                        >
                            <RefreshCw size={11} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
                            {loading ? "Loading…" : lastRefreshed ? `Updated ${fmtTime(lastRefreshed)}` : "Refresh"}
                        </button>
                    </div>

                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 0.75rem" }}>
                        Placement Cell<br />
                        <span style={{ color: "#a5b4fc" }}>& Career Success Hub</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", fontWeight: 500, maxWidth: "560px", lineHeight: 1.65, margin: "0 0 2rem" }}>
                        {overview?.description || `${COLLEGE_INFO.name} (${COLLEGE_INFO.shortName}) — empowering ${COLLEGE_INFO.students} students with industry connections, pre-placement training, and career opportunities since ${COLLEGE_INFO.established}.`}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        {[
                            { label: "NAAC Grade", value: `${COLLEGE_INFO.naac} (${COLLEGE_INFO.naacCycle})` },
                            { label: "Established", value: COLLEGE_INFO.established },
                            { label: "Affiliated", value: "SPPU, Pune" },
                            { label: "Recruiters", value: displayRecruiters.length > 0 ? `${displayRecruiters.length}+` : "Ready" },
                            { label: "Trainings", value: displayTrainings.length > 0 ? displayTrainings.length : "–" },
                        ].map(item => (
                            <div key={item.label} style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.12)" }}>
                                <div style={{ fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a5b4fc", marginBottom: "0.1rem" }}>{item.label}</div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#fff" }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PLACEMENT STATS (from admin) ── */}
            {loading && <Spinner />}

            {!loading && displayStats.length > 0 && (
                <div>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                        {displayStats.map((s, i) => (
                            <button key={s.academicYear || i} onClick={() => setActiveYear(i)} style={{
                                padding: "0.5rem 1.25rem", borderRadius: "0.75rem",
                                fontWeight: 900, fontSize: "0.75rem", cursor: "pointer",
                                background: activeYear === i ? "var(--accent)" : "var(--surface)",
                                color: activeYear === i ? "#fff" : "var(--text)",
                                opacity: activeYear === i ? 1 : 0.6,
                                border: activeYear === i ? "none" : "1px solid var(--border)",
                                transition: "all 0.2s"
                            }}>
                                {s.academicYear}
                            </button>
                        ))}
                    </div>

                    {stat && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                            {[
                                { label: "Students Placed", value: stat.studentsPlaced || stat.totalPlaced || stat.placed || "—", sub: stat.studentsEnrolled ? `of ${stat.studentsEnrolled} enrolled` : "", icon: Award, color: "#22c55e" },
                                { label: "Placement Rate", value: stat.placementPercentage != null ? `${stat.placementPercentage}%` : stat.placementRate != null ? `${stat.placementRate}%` : (stat.studentsPlaced && stat.studentsEnrolled) ? `${Math.round(stat.studentsPlaced / stat.studentsEnrolled * 100)}%` : "—", sub: "Campus Achievement", icon: TrendingUp, color: "#6366f1" },
                                { label: "Companies Visited", value: stat.companiesVisited || stat.companies || "—", sub: "Unique recruiters", icon: Building2, color: "#f59e0b" },
                                { label: "Avg Package", value: (stat.averageSalary || stat.averageCtc || stat.avgPackage) ? `₹${stat.averageSalary || stat.averageCtc || stat.avgPackage} LPA` : "—", sub: (stat.medianSalary || stat.medianCtc) ? `Median: ₹${stat.medianSalary || stat.medianCtc} LPA` : "", icon: BarChart2, color: "#14b8a6" },
                                { label: "Highest Package", value: (stat.highestCtc || stat.highestPackage) ? `₹${stat.highestCtc || stat.highestPackage} LPA` : "—", sub: "Top On-Campus Offer", icon: Zap, color: "#a855f7" },
                            ].map(({ label, value, sub, icon: Icon, color }) => (
                                <div key={label} className="panel" style={{ padding: "1.5rem", borderTop: `3px solid ${color}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                        <div style={{ padding: "0.5rem", borderRadius: "0.6rem", background: `${color}18`, color }}>
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.15rem", lineHeight: 1 }}>{value}</p>
                                    <p style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color, margin: "0 0 0.15rem", opacity: 0.8 }}>{label}</p>
                                    <p style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45, margin: 0 }}>{sub}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!loading && displayStats.length === 0 && (
                <div className="panel" style={{ padding: "2rem", textAlign: "center" }}>
                    <BarChart2 size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No placement statistics added yet. Admin can add them from the Placement → Stats section.</p>
                </div>
            )}

            {/* ── SECTION NAV ── */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", background: "var(--surface)", padding: "0.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveSection(id)} style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.6rem 1.1rem", borderRadius: "0.75rem",
                        fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                        background: activeSection === id ? "var(--accent)" : "none",
                        color: activeSection === id ? "#fff" : "var(--text)",
                        opacity: activeSection === id ? 1 : 0.55,
                        border: "none", transition: "all 0.2s"
                    }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeSection === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Objectives from admin */}
                    <div className="panel" style={{ padding: "2rem" }}>
                        <h3 style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text)", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Target size={13} style={{ color: "var(--accent)" }} /> T&P Cell Objectives
                            <span className="pill" style={{ marginLeft: "auto", fontSize: 10, background: "rgba(99,102,241,0.08)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)", fontFamily: "'DM Mono', monospace" }}>
                                {displayObjectives.length > 0 ? `${displayObjectives.length} goals` : "Admin-managed"}
                            </span>
                        </h3>
                        {loading ? <Spinner /> : displayObjectives.length === 0 ? (
                            <div>
                                {FALLBACK_OBJECTIVES.map((obj, i) => (
                                    <div key={i} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                        <div style={{ width: "1.6rem", height: "1.6rem", borderRadius: "50%", flexShrink: 0, background: "rgba(99,102,241,0.08)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 900, border: "1px solid rgba(99,102,241,0.15)" }}>{i + 1}</div>
                                        <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.65, margin: 0, lineHeight: 1.6 }}>{obj}</p>
                                    </div>
                                ))}
                                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 12, fontFamily: "'DM Mono', monospace" }}>← Admin can update these from Placement → Objectives</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {displayObjectives.map((o, i) => (
                                    <div key={o._id || i} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                                        <div style={{ width: "1.6rem", height: "1.6rem", borderRadius: "50%", flexShrink: 0, background: "rgba(99,102,241,0.08)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 900, border: "1px solid rgba(99,102,241,0.15)" }}>{i + 1}</div>
                                        <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.75, margin: 0, lineHeight: 1.6 }}>{o.objective}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Industry Collaborations preview */}
                    {displayCollaborations.length > 0 && (
                        <div className="panel" style={{ padding: "2rem" }}>
                            <h3 style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text)", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Globe size={13} style={{ color: "var(--accent)" }} /> Industry Collaborations ({displayCollaborations.length})
                            </h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                                {displayCollaborations.map((c, i) => (
                                    <div key={c._id || i} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.75rem", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", opacity: 0.8 }}>
                                        {c.organizationName || c.organization}
                                        {(c.purpose || c.type) && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.5 }}>· {c.purpose || c.type}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── RECRUITERS ── */}
            {activeSection === "recruiters" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.2rem" }}>Placement Recruiters</h2>
                            <p style={{ fontSize: "0.85rem", color: "var(--text)", opacity: 0.5, margin: 0 }}>Companies actively recruiting via the placement cell</p>
                        </div>
                        <span style={{ padding: "0.4rem 1rem", background: "rgba(34,197,94,0.1)", borderRadius: "0.75rem", fontSize: "0.72rem", fontWeight: 900, color: "var(--green)", border: "1px solid rgba(34,197,94,0.2)" }}>
                            {displayRecruiters.length} Listed
                        </span>
                    </div>

                    {loading ? <Spinner /> : displayRecruiters.length === 0 ? (
                        <div className="panel" style={{ padding: "2rem", textAlign: "center" }}>
                            <Building2 size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No recruiters added yet. Admin can add them from Placement → Recruiters.</p>
                        </div>
                    ) : (
                        displayRecruiters.map((r, i) => (
                            <div key={r._id || i} className="panel" style={{ position: "relative", overflow: "hidden" }}>
                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: AVATAR_COLORS[i % AVATAR_COLORS.length], borderRadius: "4px 0 0 4px" }} />
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center", paddingLeft: "0.5rem" }}>
                                    <div style={{
                                        width: "3.5rem", height: "3.5rem", borderRadius: "0.85rem", flexShrink: 0,
                                        background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}15`, border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}30`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "1.4rem", fontWeight: 900, color: AVATAR_COLORS[i % AVATAR_COLORS.length]
                                    }}>{(r.companyName || "?").charAt(0)}</div>

                                    <div style={{ flex: 1, minWidth: "180px" }}>
                                        <h3 style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.3rem" }}>{r.companyName}</h3>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                                            {r.role && <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text)", opacity: 0.6 }}><Briefcase size={12} /> {r.role}</span>}
                                        </div>
                                        {r.description && <p style={{ fontSize: "0.78rem", color: "var(--text)", opacity: 0.5, margin: "0.35rem 0 0", lineHeight: 1.55 }}>{r.description}</p>}
                                    </div>

                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        {r.package && (
                                            <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--green)", margin: "0 0 0.25rem" }}>
                                                ₹{r.package} LPA
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── PROCESS ── */}
            {activeSection === "process" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem" }}>Placement Process</h2>
                        <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.5, margin: 0 }}>Step-by-step journey from registration to offer letter.</p>
                    </div>

                    {loading ? <Spinner /> : (
                        <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
                            <div style={{ position: "absolute", left: "1.1rem", top: "1.5rem", bottom: "1.5rem", width: "2px", background: "var(--border)", borderRadius: "2px" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                {displayProcess.map((step, idx) => (
                                    <div key={step._id || idx} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                                        <div style={{
                                            width: "2.2rem", height: "2.2rem", borderRadius: "50%", flexShrink: 0,
                                            background: "var(--accent)", color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 900,
                                            boxShadow: "0 0 0 4px var(--bg)", position: "relative", zIndex: 1
                                        }}>{step.stepNumber || idx + 1}</div>
                                        <div className="panel" style={{ flex: 1, padding: "1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                <div>
                                                    <span style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", opacity: 0.7 }}>Phase {step.stepNumber || idx + 1}</span>
                                                    <h4 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text)", margin: "0.1rem 0 0" }}>{step.title}</h4>
                                                </div>
                                            </div>
                                            {step.description && (
                                                <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.6, lineHeight: 1.65, margin: 0 }}>{step.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TRAININGS ── */}
            {activeSection === "trainings" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem" }}>Training Activities</h2>
                        <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.5, margin: 0 }}>Pre-placement training sessions and workshops organised by the T&P cell.</p>
                    </div>

                    {loading ? <Spinner /> : displayTrainings.length === 0 ? (
                        <div className="panel" style={{ padding: "2rem", textAlign: "center" }}>
                            <BookOpen size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No training activities added yet. Admin can add them from Placement → Trainings.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                            {displayTrainings.map((t, i) => (
                                <div key={t._id || i} className="panel" style={{ padding: "1.5rem", borderTop: `3px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}` }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{ padding: "0.4rem", background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}15`, borderRadius: "0.5rem", color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                                <BookOpen size={18} />
                                            </div>
                                            {t.category && (
                                                <span style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: AVATAR_COLORS[i % AVATAR_COLORS.length], opacity: 0.8 }}>{t.category}</span>
                                            )}
                                        </div>
                                        {t.date && (
                                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", textAlign: "right" }}>
                                                {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        )}
                                    </div>
                                    <h4 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.35rem", lineHeight: 1.4 }}>{t.title || t.name}</h4>
                                    {(t.resourcePerson || t.trainer) && (
                                        <p style={{ fontSize: "0.72rem", color: "var(--accent)", marginTop: "0.35rem", fontWeight: 600, lineHeight: 1.5 }}>
                                            👤 {t.resourcePerson || t.trainer}
                                        </p>
                                    )}
                                    {t.description && (
                                        <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.55, margin: "0.4rem 0 0", lineHeight: 1.6 }}>{t.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── INDUSTRY COLLABORATIONS ── */}
            {activeSection === "collaborations" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem" }}>Industry Collaborations</h2>
                        <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.5, margin: 0 }}>MOUs, partnerships, and industry tie-ups facilitated by the placement cell.</p>
                    </div>

                    {loading ? <Spinner /> : displayCollaborations.length === 0 ? (
                        <div className="panel" style={{ padding: "2rem", textAlign: "center" }}>
                            <Globe size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No industry collaborations added yet. Admin can add them from Placement → Collaborations.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                            {displayCollaborations.map((c, i) => (
                                <div key={c._id || i} className="panel" style={{ padding: "1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                        <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}15`, color: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 900, flexShrink: 0, border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}25` }}>
                                            {(c.organizationName || c.organization || "?").charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: "0.95rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.15rem" }}>{c.organizationName || c.organization}</h4>
                                            {(c.purpose || c.type) && <span style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: AVATAR_COLORS[i % AVATAR_COLORS.length], opacity: 0.8 }}>{c.purpose || c.type}</span>}
                                        </div>
                                    </div>
                                    {c.description && <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.55, margin: 0, lineHeight: 1.6 }}>{c.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TPO CONTACTS ── */}
            {activeSection === "contacts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem" }}>T&P Cell Contacts</h2>
                        <p style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.5, margin: 0 }}>Direct contacts for placement queries, internship coordination, and PPO requests.</p>
                    </div>

                    {loading ? <Spinner /> : displayContacts.length === 0 ? (
                        <div className="panel" style={{ padding: "2rem", textAlign: "center" }}>
                            <Phone size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No TPO contacts added yet. Admin can add them from Placement → Contacts.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
                            {displayContacts.map((c, i) => (
                                <div key={c._id || i} className="panel" style={{ padding: "2rem", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}10`, borderRadius: "0 1rem 0 100%" }} />
                                    <div style={{
                                        width: "4rem", height: "4rem", borderRadius: "1rem", marginBottom: "1.25rem",
                                        background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}15`, color: AVATAR_COLORS[i % AVATAR_COLORS.length],
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "1.5rem", fontWeight: 900, border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}25`
                                    }}>
                                        {(c.name || "?").charAt(0)}{(c.name || "").split(" ").slice(-1)[0]?.charAt(0) || ""}
                                    </div>
                                    <p style={{ fontSize: "0.6rem", fontWeight: 900, color: AVATAR_COLORS[i % AVATAR_COLORS.length], textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 0.25rem" }}>{c.role || c.designation}</p>
                                    <h4 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text)", margin: "0 0 1.25rem" }}>{c.name}</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1.25rem", borderTop: "1px dashed var(--border)" }}>
                                        {c.email && (
                                            <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
                                                <div style={{ padding: "0.4rem", background: "var(--surface)", borderRadius: "0.5rem", color: "var(--accent)" }}><Mail size={14} /></div>
                                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)" }}>{c.email}</span>
                                            </a>
                                        )}
                                        {c.phone && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ padding: "0.4rem", background: "var(--surface)", borderRadius: "0.5rem", color: "var(--text)", opacity: 0.5 }}><Phone size={14} /></div>
                                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", opacity: 0.7 }}>{c.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: "1.25rem", padding: "0.6rem", background: "var(--surface)", borderRadius: "0.75rem", textAlign: "center" }}>
                                        <span style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
                                            Available Mon–Fri, 10 AM – 5 PM
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", opacity: 0.4 }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text)", margin: 0 }}>
                    © 2025 {COLLEGE_INFO.name} · T&P Cell · Dhankawadi, Pune 411043
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShieldCheck size={12} style={{ color: "var(--text)" }} />
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Secured by CampusHive</span>
                </div>
            </div>
        </div>
    );
}
