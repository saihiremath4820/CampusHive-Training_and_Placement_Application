import React, { useEffect, useState } from "react";
import { X, Building2, MapPin, Globe, Briefcase, ExternalLink, Loader2, Target, Clock, ShieldCheck } from "lucide-react";
import { getPublicCompanyProfile } from "../../services/companyApi";

const CompanyProfileModal = ({ companyId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getPublicCompanyProfile(companyId);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching company profile:", err);
                setError("Failed to load company profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        if (companyId) fetchData();

        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [companyId, onClose]);

    if (!companyId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="company-modal" onClick={(e) => e.stopPropagation()}>
                {loading ? (
                    <div style={{ padding: "4rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                        <Loader2 className="animate-spin" size={40} color="var(--accent)" />
                        <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>Fetching corporate profile...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: "3rem", textAlign: "center" }}>
                        <p style={{ color: "var(--red)", fontWeight: 600 }}>{error}</p>
                        <button onClick={onClose} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "var(--accent)", color: "white", borderRadius: "8px", border: "none", cursor: "pointer" }}>Close</button>
                    </div>
                ) : (
                    <>
                        {/* Header Hero */}
                        <div style={{ background: "linear-gradient(135deg, #1e293b, #334155)", padding: "2.5rem 2rem", position: "relative" }}>
                            <button
                                onClick={onClose}
                                style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "0.5rem", borderRadius: "50%", cursor: "pointer" }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem" }}>
                                <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
                                    <Building2 size={40} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "20px", marginBottom: "0.5rem" }}>
                                        <ShieldCheck size={14} color="#10b981" />
                                        <span style={{ color: "white", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Verified Partner</span>
                                    </div>
                                    <h2 style={{ color: "white", fontSize: "2rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>{data.companyName}</h2>
                                    <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.6rem" }}>
                                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                            <Briefcase size={14} /> {data.industry || "Technology"}
                                        </span>
                                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                            <MapPin size={14} /> {data.location || "Multiple Locations"}
                                        </span>
                                        {data.website && (
                                            <a href={data.website} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", fontWeight: 600 }}>
                                                <Globe size={14} /> Website <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: "2rem", overflowY: "auto", flex: 1, background: "var(--bg)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "2rem" }}>
                                {/* Left: About */}
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "4px", height: "18px", background: "var(--accent)", borderRadius: "2px" }} />
                                        About {data.companyName}
                                    </h3>
                                    <p style={{ color: "var(--text)", opacity: 0.8, lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                                        {data.about || "This company has not provided a description yet. They are a leading player in their industry committed to excellence and innovation."}
                                    </p>
                                </div>

                                {/* Right: Active Drives */}
                                <div style={{ background: "white", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden" }}>
                                    <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
                                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>Active Drives</h4>
                                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>{data.totalActiveJobs} opportunities found</p>
                                    </div>

                                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                                        {data.activeJobs && data.activeJobs.length > 0 ? (
                                            data.activeJobs.map((job) => (
                                                <div key={job._id} style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="job-item-hover">
                                                    <h5 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{job.title}</h5>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                            <Target size={12} style={{ color: "var(--accent)" }} />
                                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>CGPA: {job.requiredCGPA}</span>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                            <Clock size={12} style={{ color: "var(--accent)" }} />
                                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Exp: {new Date(job.deadline).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: "2rem", textAlign: "center" }}>
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No live drives at the moment.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "1rem 2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", background: "white" }}>
                            <button
                                onClick={onClose}
                                style={{ padding: "0.6rem 1.5rem", borderRadius: "10px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                            >
                                Close Profile
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyProfileModal;
