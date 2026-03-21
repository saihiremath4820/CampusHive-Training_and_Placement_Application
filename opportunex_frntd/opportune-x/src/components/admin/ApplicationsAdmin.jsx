import { useEffect, useState, useMemo } from "react";
import { Search, ClipboardList, Building2, User, Calendar, Filter, Trash2 } from "lucide-react";
import toast from '../common/toastManager';
import { getAllApplications } from "../../services/adminService";
import LoadingSpinner from "./shared/LoadingSpinner";
import { extractArray } from "../../utils/apiHelpers";

const STATUS_COLORS = {
    Applied: { bg: "rgba(27,79,216,0.1)", color: "var(--accent)" },
    Shortlisted: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" },
    Selected: { bg: "rgba(16,185,129,0.1)", color: "var(--green)" },
    Rejected: { bg: "rgba(200,75,49,0.1)", color: "var(--red)" },
};

export default function ApplicationsAdmin() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetchApplications();
    }, []);

    async function fetchApplications() {
        try {
            setLoading(true);
            const res = await getAllApplications();
            setApplications(extractArray(res.data, 'applications'));
            window.dispatchEvent(new Event('refreshPendingCounts'));
        } catch (err) {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        return applications.filter(app => {
            const name = app.studentId?.name?.toLowerCase() || "";
            const email = app.studentId?.email?.toLowerCase() || "";
            const title = app.opportunityId?.title?.toLowerCase() || "";
            const company = app.opportunityId?.createdBy?.name?.toLowerCase() || "";
            const q = searchTerm.toLowerCase();

            const matchSearch = !searchTerm ||
                name.includes(q) || email.includes(q) || title.includes(q) || company.includes(q);
            const matchStatus = statusFilter === "All" || app.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [applications, searchTerm, statusFilter]);

        Rejected: applications.filter(a => a.status === "Rejected").length,
    }), [applications]);

    const handleDeleteApplication = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this application? This action cannot be undone.'
        );
        if (!confirmed) return;

        try {
            const { default: api } = await import("../../services/api");
            await api.delete(`/admin/applications/${id}`);
            // Remove from local state immediately:
            setApplications(prev => prev.filter(app => app._id !== id));
            toast.success('Application deleted successfully');
            window.dispatchEvent(new Event('refreshPendingCounts'));
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete application');
        }
    };

    if (loading) return (
        <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
            <LoadingSpinner size="lg" text="Loading all applications..." />
        </div>
    );

    return (
        <div>
            <div className="page-title-block">
                <h1 className="page-title">All <em>Applications</em></h1>
                <p className="page-subtitle">Complete view of every student application across all placement drives.</p>
            </div>

            {/* ── Summary Stat Chips */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                {["All", "Applied", "Shortlisted", "Selected", "Rejected"].map(s => {
                    const cfg = STATUS_COLORS[s] || { bg: "var(--surface-2)", color: "var(--text-muted)" };
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 20,
                                border: `1px solid ${statusFilter === s ? cfg.color : "var(--border)"}`,
                                background: statusFilter === s ? cfg.bg : "var(--surface)",
                                color: statusFilter === s ? cfg.color : "var(--text-muted)",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            {s}
                            <span style={{
                                background: statusFilter === s ? cfg.color : "var(--border)",
                                color: statusFilter === s ? "#fff" : "var(--text-muted)",
                                borderRadius: 10,
                                padding: "1px 7px",
                                fontSize: 10,
                                fontWeight: 800,
                            }}>
                                {counts[s] || 0}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Search ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div className="search-wrap">
                    <span className="search-icon"><Search size={14} /></span>
                    <input
                        type="text"
                        placeholder="Search student, email, job title, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ width: 320 }}
                    />
                </div>
                <span className="panel-tag" style={{ marginLeft: "auto" }}>{filtered.length} records</span>
            </div>

            {/* ── Table ── */}
            <div className="panel">
                <div className="panel-body" style={{ padding: 0 }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                            <ClipboardList size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                            <p style={{ fontSize: 14 }}>No applications match your search</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 20 }}>Student</th>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: 20 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app) => {
                                    const cfg = STATUS_COLORS[app.status] || { bg: "var(--surface-2)", color: "var(--text-muted)" };
                                    return (
                                        <tr key={app._id}>
                                            <td style={{ paddingLeft: 20 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: 6,
                                                        background: "rgba(27,79,216,0.08)", color: "var(--accent)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontWeight: 700, fontSize: 13, flexShrink: 0
                                                    }}>
                                                        {app.studentId?.name?.charAt(0) || "S"}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                                                            {app.studentId?.name || "Unknown"}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                                                            {app.studentId?.email || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                                                    {app.opportunityId?.title || "—"}
                                                </div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                    {app.opportunityId?.type || ""}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Building2 size={13} style={{ color: "var(--text-muted)" }} />
                                                    <span style={{ fontSize: 13, color: "var(--text)" }}>
                                                        {app.opportunityId?.createdBy?.name || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                                                    <Calendar size={11} />
                                                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
                                                </div>
                                            </td>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td style={{ paddingRight: 20 }}>
                                                <button
                                                    onClick={() => handleDeleteApplication(app._id)}
                                                    className="delete-btn"
                                                    title="Delete Application"
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        color: "#ef4444",
                                                        cursor: "pointer",
                                                        padding: "4px",
                                                        borderRadius: "4px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        transition: "background 0.2s"
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                                                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
