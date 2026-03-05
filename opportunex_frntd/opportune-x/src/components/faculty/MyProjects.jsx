import { useState, useEffect } from "react";
import axios from "axios";
import { FolderGit2, Calendar, Target, Clock, Loader2, Trash2, Sparkles, FolderIcon, MoreVertical } from "lucide-react";
import toast from '../common/toastManager';

import ExpandableText from "../shared/ExpandableText";

export default function MyProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_BASE}/project/my`, { headers: { Authorization: `Bearer ${token}` } });
            setProjects(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            toast.error("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_BASE}/project/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setProjects(prev => prev.filter(p => p._id !== id));
            toast.success("Project deleted successfully");
        } catch (err) {
            toast.error("Failed to delete project");
        }
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <FolderGit2 size={18} color="var(--accent)" />
                        <span className="pill pill-blue">Research HUB</span>
                    </div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                        My Project Portfolio
                    </h2>
                    <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4 }}>
                        Review and oversee the lifecycle of your published research initiatives.
                    </p>
                </div>

                <div className="pill pill-blue" style={{ height: 32, display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
                    <Sparkles size={13} />
                    <span style={{ fontWeight: 700 }}>{projects.length} Active Records</span>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="panel" style={{ padding: 60, textAlign: "center", borderStyle: "dashed" }}>
                    <FolderIcon size={40} style={{ color: "var(--border)", marginBottom: 16 }} />
                    <h4 style={{ color: "var(--text)", marginBottom: 8 }}>No Research Tracks Established</h4>
                    <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>Begin your journey by publishing a project vision from the dashboard.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 20 }}>
                    {projects.map((project) => (
                        <div key={project._id} className="panel" style={{ display: "flex", flexDirection: "column" }}>
                            <div className="panel-header" style={{ padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(27, 79, 216, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                                        <FolderIcon size={20} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                                        <span className="pill" style={{ fontSize: 9, letterSpacing: 1, marginBottom: 6, padding: "2px 8px", display: "inline-block", overflowWrap: "break-word", alignSelf: "flex-start", maxWidth: "100%", whiteSpace: "normal", textAlign: "left" }}>{project.domain}</span>
                                        <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0, overflowWrap: "break-word", width: "100%" }} title={project.title}>{project.title}</h4>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                    <span className={`pill ${project.status === 'Completed' ? 'pill-green' : 'pill-yellow'}`} style={{ fontSize: 10 }}>{project.status || 'Active'}</span>
                                    <button
                                        onClick={() => handleDelete(project._id)}
                                        style={{ background: "none", border: "none", color: "var(--red)", opacity: 0.3, cursor: "pointer", padding: 4 }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="panel-body" style={{ padding: "24px", flex: 1 }}>
                                <ExpandableText
                                    text={project.description}
                                    maxChars={260}
                                    style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}
                                />

                                <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 20 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                        <Target size={14} color="var(--accent)" />
                                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--text-muted)" }}>Roadmap Milestones</span>
                                    </div>
                                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                                        {project.milestones?.slice(0, 2).map((m, i) => (
                                            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--text)" }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", opacity: 0.5 }} />
                                                {typeof m === 'object' ? m.text : m}
                                            </li>
                                        ))}
                                        {project.milestones?.length > 2 && (
                                            <li style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, paddingLeft: 16 }}>
                                                + {project.milestones.length - 2} academic markers
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                                    <div style={{ display: "flex", gap: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Clock size={13} color="var(--accent)" />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{project.duration}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Calendar size={13} color="var(--accent)" />
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{new Date(project.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

