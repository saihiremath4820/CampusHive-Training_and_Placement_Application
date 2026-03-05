import { useEffect, useState } from "react";
import { ShieldCheck, Clock, X, Building2, Calendar, AlertTriangle } from "lucide-react";
import toast from '../common/toastManager';
import { getPendingDrives, approveDrive, rejectDrive } from "../../services/adminService";
import LoadingSpinner from "./shared/LoadingSpinner";

export default function DriveApprovalsAdmin() {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState(null); // drive being rejected
    const [rejectReason, setRejectReason] = useState("");

    async function fetchDrives() {
        try {
            setLoading(true);
            const res = await getPendingDrives();
            setDrives(res.data || []);
        } catch (err) {
            toast.error("Failed to load pending drives");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchDrives(); }, []);

    async function handleApprove(id, title) {
        setActionLoading(id + "_approve");
        try {
            await approveDrive(id);
            toast.success(`"${title}" approved and now live for students!`);
            fetchDrives();
            window.dispatchEvent(new Event('refreshPendingCounts'));
        } catch (err) {
            toast.error("Approval failed");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleReject() {
        if (!rejectModal) return;
        setActionLoading(rejectModal._id + "_reject");
        try {
            await rejectDrive(rejectModal._id, rejectReason);
            toast.success(`"${rejectModal.title}" rejected.`);
            setRejectModal(null);
            setRejectReason("");
            fetchDrives();
            window.dispatchEvent(new Event('refreshPendingCounts'));
        } catch (err) {
            toast.error("Rejection failed");
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) return (
        <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
            <LoadingSpinner size="lg" text="Loading pending drives..." />
        </div>
    );

    return (
        <div>
            <div className="page-title-block">
                <h1 className="page-title">Drive <em>Approvals</em></h1>
                <p className="page-subtitle">Review and approve placement drives submitted by companies before students can see them.</p>
            </div>

            {drives.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "80px 20px",
                    border: "1px dashed var(--border)", borderRadius: 12,
                    color: "var(--text-muted)"
                }}>
                    <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontSize: 15, fontWeight: 600 }}>No drives awaiting approval</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>All submitted drives have been reviewed.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {drives.map(drive => (
                        <div key={drive._id} className="panel" style={{ padding: 0 }}>
                            <div className="panel-body">
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

                                    {/* Drive Info */}
                                    <div style={{ flex: 1, minWidth: 260 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <span className="pill pill-yellow" style={{ fontSize: 10 }}>
                                                <Clock size={10} style={{ display: "inline", marginRight: 4 }} />
                                                Pending Review
                                            </span>
                                            <span className="pill" style={{ fontSize: 10 }}>{drive.type}</span>
                                        </div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
                                            {drive.title}
                                        </h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                                                <Building2 size={12} />
                                                {drive.createdBy?.name || "Unknown Company"}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                                                <Calendar size={12} />
                                                Submitted: {new Date(drive.createdAt).toLocaleDateString()}
                                            </div>
                                            {drive.deadline && (
                                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                    Deadline: {new Date(drive.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        {drive.description && (
                                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6, maxWidth: 480 }}>
                                                {drive.description.slice(0, 200)}{drive.description.length > 200 ? "..." : ""}
                                            </p>
                                        )}
                                        {drive.requiredSkills?.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                                {drive.requiredSkills.slice(0, 5).map(s => (
                                                    <span key={s} className="pill" style={{ fontSize: 10 }}>{s}</span>
                                                ))}
                                                {drive.requiredSkills.length > 5 && (
                                                    <span style={{ fontSize: 10, color: "var(--accent)" }}>+{drive.requiredSkills.length - 5}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleApprove(drive._id, drive.title)}
                                            disabled={!!actionLoading}
                                            className="btn-primary"
                                            style={{ padding: "9px 18px", fontSize: 13 }}
                                        >
                                            {actionLoading === drive._id + "_approve" ? "Approving..." : "✓ Approve"}
                                        </button>
                                        <button
                                            onClick={() => { setRejectModal(drive); setRejectReason(""); }}
                                            disabled={!!actionLoading}
                                            className="btn-ghost"
                                            style={{ padding: "9px 14px", color: "var(--red)", borderColor: "var(--red)", fontSize: 13 }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Reject Modal ── */}
            {rejectModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    background: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 24
                }}>
                    <div style={{
                        background: "var(--surface)", borderRadius: 12, padding: 28,
                        width: "100%", maxWidth: 460, border: "1px solid var(--border)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <AlertTriangle size={18} style={{ color: "var(--red)" }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                                Reject Drive
                            </h3>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                            Rejecting: <strong>{rejectModal.title}</strong>. The company will be notified.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Optional: provide a reason so the company can revise and resubmit..."
                            rows={4}
                            className="form-field"
                            style={{ width: "100%", fontSize: 13, borderRadius: 8, padding: "10px 14px", marginBottom: 16, resize: "vertical" }}
                        />
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setRejectModal(null)}
                                className="btn-ghost"
                                style={{ padding: "8px 16px", fontSize: 13 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!!actionLoading}
                                className="btn-danger"
                                style={{ padding: "8px 16px", fontSize: 13 }}
                            >
                                {actionLoading ? "Rejecting..." : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
