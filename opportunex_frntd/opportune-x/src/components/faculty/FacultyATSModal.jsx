import { X, Bot, GraduationCap } from "lucide-react";

const RECOMMENDATION_META = {
    HIGHLY_RECOMMENDED: { label: "Highly Recommended", bg: "#dcfce7", color: "#15803d" },
    RECOMMENDED: { label: "Recommended", bg: "#dbeafe", color: "#1d4ed8" },
    CONDITIONAL: { label: "Conditional Fit", bg: "#fef9c3", color: "#b45309" },
    NOT_RECOMMENDED: { label: "Not Recommended", bg: "#fee2e2", color: "#b91c1c" },
};

const ACADEMIC_META = {
    STRONG: { label: "Strong", color: "#15803d" },
    MODERATE: { label: "Moderate", color: "#ca8a04" },
    NEEDS_SUPPORT: { label: "Needs Support", color: "#b91c1c" },
};

function FitScoreRing({ score }) {
    const color = score >= 75 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";
    return (
        <div style={{
            width: 110, height: 110, borderRadius: "50%",
            border: `6px solid ${color}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto"
        }}>
            <span style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>/ 100</span>
        </div>
    );
}

function BreakdownBar({ label, value, max, color = "var(--accent)" }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 140, fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 7, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((value / max) * 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.5s" }} />
            </div>
            <span style={{ width: 36, fontSize: 11, fontWeight: 700, color: "var(--text)", textAlign: "right" }}>{value}/{max}</span>
        </div>
    );
}

function SkillPills({ skills, variant }) {
    const colors = {
        relevant: { bg: "#dcfce7", color: "#15803d" },
        missing: { bg: "#fee2e2", color: "#b91c1c" },
        transferable: { bg: "#dbeafe", color: "#1d4ed8" }
    };
    const c = colors[variant];
    if (!skills?.length) return <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>None</span>;
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {skills.map((s, i) => (
                <span key={i} style={{
                    padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                    background: c.bg, color: c.color
                }}>{s}</span>
            ))}
        </div>
    );
}

export default function FacultyATSModal({ result, onClose }) {
    const rec = RECOMMENDATION_META[result.recommendation] || RECOMMENDATION_META.CONDITIONAL;
    const acad = ACADEMIC_META[result.academicStrength] || ACADEMIC_META.MODERATE;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "16px"
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "var(--surface)", borderRadius: 16, padding: "28px 32px",
                    width: "min(620px, 100%)", maxHeight: "88vh", overflowY: "auto",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                    animation: "ats-modal-in 0.25s ease"
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <GraduationCap size={18} color="var(--accent)" />
                            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>AI Academic Fit Evaluation</span>
                        </div>
                        {result.studentName && (
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Candidate: <strong>{result.studentName}</strong></div>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Disclaimer */}
                <div style={{
                    background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8,
                    padding: "8px 14px", marginBottom: 20, fontSize: 12, color: "#92400e"
                }}>
                    ⚠️ AI Fit Score is <strong>advisory only</strong>. Apply your own academic judgment when evaluating students.
                </div>

                {/* Score + Recommendation + Academic Strength */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                    <FitScoreRing score={result.fitScore ?? 0} />
                    <div>
                        <div style={{
                            display: "inline-block", padding: "6px 18px", borderRadius: 999,
                            background: rec.bg, color: rec.color, fontWeight: 700, fontSize: 13, marginBottom: 8
                        }}>
                            {rec.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Overall Academic Fit Score</div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "4px 12px", borderRadius: 999,
                            background: "var(--surface-2)", fontSize: 12, fontWeight: 600, color: acad.color
                        }}>
                            Academic Strength: {acad.label}
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                {result.breakdown && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 10 }}>Score Breakdown</div>
                        <BreakdownBar label="Domain Relevance" value={result.breakdown.domainRelevance ?? 0} max={40} />
                        <BreakdownBar label="Skill Alignment" value={result.breakdown.skillAlignment ?? 0} max={30} color="#16a34a" />
                        <BreakdownBar label="Academic Strength" value={result.breakdown.academicStrength ?? 0} max={20} color="#ca8a04" />
                        <BreakdownBar label="Initiative" value={result.breakdown.initiative ?? 0} max={10} color="#7c3aed" />
                    </div>
                )}

                {/* Skills */}
                {result.skills && (
                    <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Skill Analysis</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#15803d", marginBottom: 5 }}>✅ Relevant Skills</div>
                            <SkillPills skills={result.skills.relevant} variant="relevant" />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#b91c1c", marginBottom: 5 }}>📚 Skills to Develop</div>
                            <SkillPills skills={result.skills.missing} variant="missing" />
                        </div>
                        {result.skills.transferable?.length > 0 && (
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", marginBottom: 5 }}>🔄 Transferable Skills</div>
                                <SkillPills skills={result.skills.transferable} variant="transferable" />
                            </div>
                        )}
                    </div>
                )}

                {/* Strengths & Growth Areas */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    {result.strengths?.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>💪 Strengths</div>
                            {result.strengths.map((s, i) => (
                                <div key={i} style={{ fontSize: 12, color: "var(--text)", marginBottom: 5, paddingLeft: 12, borderLeft: "2px solid #86efac" }}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                    {result.growthAreas?.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>🌱 Growth Areas</div>
                            {result.growthAreas.map((g, i) => (
                                <div key={i} style={{ fontSize: 12, color: "var(--text)", marginBottom: 5, paddingLeft: 12, borderLeft: "2px solid #fde68a" }}>
                                    {g}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Summary */}
                {result.summary && (
                    <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>🤖 Academic Assessment</div>
                        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
