import { useState, useEffect } from "react";
import axios from "axios";
import {
    GitMerge, FlaskConical, CheckCircle2, Clock,
    ChevronRight, Target, User, Users, Loader2,
    BookOpen, Code2
} from "lucide-react";
import toast from '../common/toastManager';
import LoadingSpinner from "../admin/shared/LoadingSpinner";
import ExpandableText from "../shared/ExpandableText";

const DOMAIN_COLORS = {
    "Machine Learning": "#6366f1",
    "Web Development": "#22c55e",
    "Data Science": "#f59e0b",
    "Cybersecurity": "#ef4444",
    "IoT": "#14b8a6",
    "Blockchain": "#8b5cf6",
    "Computer Vision": "#ec4899",
    "default": "#0ea5e9",
};

function getDomainColor(domain) {
    if (!domain) return DOMAIN_COLORS.default;
    for (const key of Object.keys(DOMAIN_COLORS)) {
        if (domain.toLowerCase().includes(key.toLowerCase())) return DOMAIN_COLORS[key];
    }
    return DOMAIN_COLORS.default;
}

export default function StudentProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [userId, setUserId] = useState(null);
    const [myTeams, setMyTeams] = useState([]);

    useEffect(() => {
        try {
            const token = sessionStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.id);
            }
        } catch (e) { console.error("Failed to decode token", e); }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const [projRes, teamRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE}/project`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_BASE}/team/student`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
            ]);
            setProjects(Array.isArray(projRes.data?.data || projRes.data) ? (projRes.data?.data || projRes.data) : []);
            setMyTeams(Array.isArray(teamRes.data?.data || teamRes.data) ? (teamRes.data?.data || teamRes.data) : []);
        } catch (err) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (projectId) => {
        try {
            setApplying(projectId);
            const token = sessionStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_BASE}/project/apply`, { projectId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Application submitted successfully!");
            await fetchProjects();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to apply");
        } finally {
            setApplying(null);
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

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2.5rem", minWidth: 0 }}>

            {/* ── HEADER ── */}
            <div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: "0.4rem" }}>
                    <FlaskConical size={11} /> Academic Research
                </span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.2rem", letterSpacing: "-0.03em" }}>
                    Active Projects
                </h2>
                <p style={{ color: "var(--text)", opacity: 0.5, fontSize: "0.82rem", fontWeight: 500, margin: 0 }}>
                    Research and development opportunities supervised by college faculty
                </p>
            </div>


            {/* ── EMPTY STATE ── */}
            {projects.length === 0 && !loading ? (
                <div style={{
                    textAlign: 'center', padding: '40px',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        📭
                    </div>
                    <p style={{ fontSize: '13px' }}>
                        No data found yet
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem", minWidth: 0 }}>
                    {projects.map((p) => {
                        const myApp = p.applicants?.find(a =>
                            (typeof a.student === 'string' && a.student === userId) ||
                            (typeof a.student === 'object' && a.student?._id === userId)
                        );
                        const isApplied = !!myApp;
                        const status = myApp?.status || null;
                        const domainColor = getDomainColor(p.domain);

                        // Check if I have an assigned team for this project
                        const myTeam = myTeams.find(t =>
                            (typeof t.project === 'string' && t.project === p._id) ||
                            (typeof t.project === 'object' && t.project?._id === p._id)
                        );

                        const statusStyle = status === 'Approved'
                            ? { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.25)" }
                            : status === 'Rejected'
                                ? { bg: "rgba(239,68,68,0.1)", color: "var(--red)", border: "rgba(239,68,68,0.25)" }
                                : { bg: "rgba(234,179,8,0.1)", color: "#f59e0b", border: "rgba(234,179,8,0.25)" };

                        return (
                            <div key={p._id} className="panel" style={{
                                padding: "1.5rem", position: "relative", overflow: "hidden",
                                display: "flex", flexDirection: "column", gap: "1rem",
                                borderTop: `3px solid ${domainColor}`, minWidth: 0
                            }}>
                                {/* Title + domain */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", minWidth: 0 }}>
                                    <div style={{
                                        width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", flexShrink: 0,
                                        background: `${domainColor}18`, color: domainColor,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        border: `1px solid ${domainColor}25`
                                    }}>
                                        <Code2 size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: "0.95rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.2rem", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.title}
                                        </h3>
                                        {p.domain && (
                                            <span style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: domainColor }}>
                                                {p.domain}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <ExpandableText
                                    text={p.description}
                                    maxChars={180}
                                    style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.55, margin: 0, lineHeight: 1.6 }}
                                />

                                {/* Meta chips */}
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {p.duration && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.65rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
                                            <Clock size={11} style={{ color: "var(--text-muted)" }} />
                                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", opacity: 0.65 }}>{p.duration}</span>
                                        </div>
                                    )}
                                    {(p.createdBy?.name) && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.65rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
                                            <User size={11} style={{ color: "var(--text-muted)" }} />
                                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", opacity: 0.65 }}>{p.createdBy.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Milestones */}
                                {p.milestones?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "var(--text)", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                            <Target size={10} style={{ color: domainColor }} /> Milestones
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                            {p.milestones.slice(0, 3).map((m, i) => (
                                                <div key={i} style={{
                                                    display: "flex", alignItems: "center", gap: "0.6rem",
                                                    padding: "0.4rem 0.65rem", background: `${domainColor}08`,
                                                    borderRadius: "0.5rem", border: `1px solid ${domainColor}15`
                                                }}>
                                                    <div style={{ width: "1.1rem", height: "1.1rem", borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 900, color: domainColor, border: "1px solid var(--border)", flexShrink: 0 }}>{i + 1}</div>
                                                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text)", opacity: 0.7, lineHeight: 1.4 }}>
                                                        {typeof m === 'string' ? m : m.text}
                                                    </span>
                                                </div>
                                            ))}
                                            {p.milestones.length > 3 && (
                                                <span style={{ fontSize: "0.65rem", color: "var(--text)", opacity: 0.35, paddingLeft: "0.4rem" }}>+{p.milestones.length - 3} more milestones</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Evaluation Feedback */}
                                {myTeam && myTeam.grade && (
                                    <div style={{ marginTop: "0.5rem", padding: "1rem", background: "var(--surface)", border: `1px solid ${domainColor}30`, borderRadius: "0.75rem", display: "flex", flexDirection: "column", gap: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Faculty Evaluation</span>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: domainColor, background: `${domainColor}15`, padding: "0.2rem 0.6rem", borderRadius: "1rem" }}>Grade: {myTeam.grade}</span>
                                        </div>
                                        {myTeam.feedback && (
                                            <div style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.8, lineHeight: 1.5, background: "var(--surface-2)", padding: "0.75rem", borderRadius: "0.5rem", fontStyle: "italic" }}>
                                                "{myTeam.feedback}"
                                            </div>
                                        )}
                                        {myTeam.status && (
                                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                                Project Status: {myTeam.status}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.875rem", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                        <Users size={13} style={{ color: "var(--text-muted)" }} />
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text)", opacity: 0.45 }}>
                                            {p.applicants?.length || 0} interested
                                        </span>
                                    </div>

                                    {isApplied ? (
                                        <div style={{
                                            padding: "0.4rem 1rem", borderRadius: "0.65rem",
                                            fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase",
                                            letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.35rem",
                                            background: statusStyle.bg, color: statusStyle.color,
                                            border: `1px solid ${statusStyle.border}`
                                        }}>
                                            <CheckCircle2 size={12} /> {status || "Pending"}
                                        </div>
                                    ) : (
                                        <button onClick={() => handleApply(p._id)} disabled={applying === p._id} style={{
                                            padding: "0.5rem 1.1rem", background: domainColor, color: "#fff",
                                            border: "none", borderRadius: "0.65rem", fontSize: "0.73rem",
                                            fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center",
                                            gap: "0.35rem", opacity: applying === p._id ? 0.7 : 1, transition: "opacity 0.2s"
                                        }}>
                                            {applying === p._id ? <Loader2 className="animate-spin" size={13} /> : <>Join Team <ChevronRight size={12} /></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
