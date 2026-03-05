import { X, Bot, ShieldCheck, TrendingUp, Target, AlertTriangle } from "lucide-react";

const RECOMMENDATION_META = {
    STRONG_YES: { label: "Strong Hire", bg: "#dcfce7", color: "#15803d" },
    YES: { label: "Hire", bg: "#dbeafe", color: "#1d4ed8" },
    MAYBE: { label: "Consider", bg: "#fef9c3", color: "#b45309" },
    NO: { label: "Pass", bg: "#fee2e2", color: "#b91c1c" },
};

function ScoreRing({ score }) {
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
            <span style={{ width: 130, fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 7, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((value / max) * 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.5s" }} />
            </div>
            <span style={{ width: 36, fontSize: 11, fontWeight: 700, color: "var(--text)", textAlign: "right" }}>{value}/{max}</span>
        </div>
    );
}

function SkillPills({ skills, variant }) {
    const colors = {
        matched: { bg: "#dcfce7", color: "#15803d" },
        missing: { bg: "#fee2e2", color: "#b91c1c" },
        extra: { bg: "#dbeafe", color: "#1d4ed8" }
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

export default function ATSResultModal({ result, onClose }) {
    const rec = RECOMMENDATION_META[result.recommendation] || RECOMMENDATION_META.MAYBE;

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
                            <Bot size={18} color="var(--accent)" />
                            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>AI Match Analysis</span>
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
                    ⚠️ AI Match Score is <strong>advisory only</strong>. Use your own judgment when making hiring decisions.
                </div>

                {/* Score + Recommendation */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                    <ScoreRing score={result.overallScore ?? 0} />
                    <div>
                        <div style={{
                            display: "inline-block", padding: "6px 18px", borderRadius: 999,
                            background: rec.bg, color: rec.color, fontWeight: 700, fontSize: 13, marginBottom: 8
                        }}>
                            {rec.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Overall ATS Match Score</div>
                    </div>
                </div>

                {/* Score Breakdown */}
                {result.breakdown && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 10 }}>Score Breakdown</div>
                        <BreakdownBar label="Skills Match" value={result.breakdown.skillsMatch ?? 0} max={40} />
                        <BreakdownBar label="CGPA Score" value={result.breakdown.cgpaScore ?? 0} max={20} color="#16a34a" />
                        <BreakdownBar label="Resume Relevance" value={result.breakdown.resumeRelevance ?? 0} max={25} color="#ca8a04" />
                        <BreakdownBar label="Profile Score" value={result.breakdown.profileScore ?? 0} max={15} color="#7c3aed" />
                    </div>
                )}

                {/* Skills */}
                {result.skillMatch && (
                    <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Skill Analysis</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#15803d", marginBottom: 5 }}>✅ Matched Skills</div>
                            <SkillPills skills={result.skillMatch.matched} variant="matched" />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#b91c1c", marginBottom: 5 }}>❌ Missing Skills</div>
                            <SkillPills skills={result.skillMatch.missing} variant="missing" />
                        </div>
                        {result.skillMatch.extra?.length > 0 && (
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", marginBottom: 5 }}>➕ Bonus Skills</div>
                                <SkillPills skills={result.skillMatch.extra} variant="extra" />
                            </div>
                        )}
                    </div>
                )}

                {/* CGPA Check */}
                {result.cgpaCheck && (
                    <div style={{
                        padding: "12px 16px", borderRadius: 8, marginBottom: 20,
                        background: result.cgpaCheck.meets ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${result.cgpaCheck.meets ? "#86efac" : "#fca5a5"}`,
                        fontSize: 13, color: result.cgpaCheck.meets ? "#15803d" : "#b91c1c", fontWeight: 600
                    }}>
                        CGPA: {result.cgpaCheck.studentCGPA} / Minimum Required: {result.cgpaCheck.requiredCGPA} &nbsp;
                        {result.cgpaCheck.meets ? "✅ Meets requirement" : "❌ Below minimum"}
                    </div>
                )}

                {/* Strengths & Concerns */}
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
                    {result.concerns?.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>⚠️ Concerns</div>
                            {result.concerns.map((c, i) => (
                                <div key={i} style={{ fontSize: 12, color: "var(--text)", marginBottom: 5, paddingLeft: 12, borderLeft: "2px solid #fca5a5" }}>
                                    {c}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Summary */}
                {result.summary && (
                    <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>🤖 AI Assessment</div>
                        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
