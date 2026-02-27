import { useStudent } from "../../context/StudentContext";
import { CheckCircle2, BookOpen, Code2, TrendingUp, Zap, Clock, Star } from "lucide-react";

const STATUS_STYLES = {
  "Not Started": { color: "var(--text)", opacity: 0.4, bg: "var(--surface)", bar: "var(--border)" },
  "In Progress": { color: "var(--yellow)", opacity: 1, bg: "rgba(234,179,8,0.12)", bar: "var(--yellow)" },
  "Completed": { color: "var(--green)", opacity: 1, bg: "rgba(34,197,94,0.12)", bar: "var(--green)" },
};

export default function SkillRoadmap() {
  const { roadmap, updateRoadmapStatus } = useStudent();

  const items = roadmap || [];

  const completedCount = items.filter(i => i.status === "Completed").length;
  const inProgressCount = items.filter(i => i.status === "In Progress").length;
  const totalHours = items.reduce((acc, r) => acc + parseInt(r.hours || 0), 0);

  const PRIORITY_COLOR = { HIGH: "var(--red)", MEDIUM: "var(--yellow)", LOW: "var(--green)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.25rem", letterSpacing: "-0.03em" }}>
            Skill Pathways
          </h2>
          <p style={{ color: "var(--text)", opacity: 0.5, fontWeight: 500, margin: 0 }}>
            Track your learning journey tailored for PICT campus placements.
          </p>
        </div>
        {/* Mini stats */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            { label: "Completed", count: completedCount, color: "var(--green)", bg: "rgba(34,197,94,0.1)" },
            { label: "In Progress", count: inProgressCount, color: "var(--yellow)", bg: "rgba(234,179,8,0.1)" },
            { label: "Remaining", count: items.length - completedCount - inProgressCount, color: "var(--text)", bg: "var(--surface)" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ padding: "0.5rem 1rem", background: bg, borderRadius: "0.75rem", border: "1px solid var(--border)", textAlign: "center" }}>
              <p style={{ fontSize: "1.3rem", fontWeight: 900, color, margin: "0 0 0.1rem" }}>{count}</p>
              <p style={{ fontSize: "0.6rem", fontWeight: 900, color, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Progress bar */}
      <div className="panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", opacity: 0.7, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={15} style={{ color: "var(--accent)" }} /> Overall Readiness
          </span>
          <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "var(--accent)" }}>
            {items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0}%
          </span>
        </div>
        <div style={{ height: "10px", background: "var(--border)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "10px",
            background: "linear-gradient(90deg, var(--accent), #818cf8)",
            width: `${items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0}%`,
            transition: "width 0.6s ease"
          }} />
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45 }}>
            <Clock size={11} style={{ verticalAlign: "middle" }} /> ~{totalHours} learning hours total
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45 }}>
            <Zap size={11} style={{ verticalAlign: "middle", color: "var(--accent)" }} /> Tailored for PICT campus drives
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45 }}>
            <Star size={11} style={{ verticalAlign: "middle", color: "var(--yellow)" }} /> Focus on HIGH priority first
          </span>
        </div>
      </div>

      {items.length === 0 && (
        <div className="panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", opacity: 0.6, margin: "0 0 0.5rem" }}>No skills mapped yet</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text)", opacity: 0.4 }}>Upload your resume or apply to jobs to get your personalized roadmap.</p>
        </div>
      )}

      {/* Roadmap Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((item) => {
          const s = STATUS_STYLES[item.status] || STATUS_STYLES["Not Started"];
          const pColor = PRIORITY_COLOR[item.priority] || "var(--text)";
          return (
            <div key={item.skill} className="panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
              {/* Priority tag */}
              {item.priority && (
                <div style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  padding: "0.2rem 0.6rem", borderRadius: "0.4rem",
                  background: `${pColor}18`, color: pColor,
                  fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em"
                }}>
                  {item.priority}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>
                <div style={{
                  width: "2.75rem", height: "2.75rem", borderRadius: "0.85rem", flexShrink: 0,
                  background: s.bg, color: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${s.color}25`, opacity: s.opacity
                }}>
                  <CheckCircle2 size={22} />
                </div>

                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text)", textTransform: "capitalize", margin: "0 0 0.75rem", paddingRight: "5rem" }}>
                    {item.skill}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                      <BookOpen size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }} />
                      <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.65, margin: 0, lineHeight: 1.5 }}>
                        <strong>Course:</strong> {item.course}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                      <Code2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: "0.15rem" }} />
                      <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.65, margin: 0, lineHeight: 1.5 }}>
                        <strong>Project:</strong> {item.project}
                      </p>
                    </div>
                    {item.hours && (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <Clock size={12} style={{ color: "var(--text)", opacity: 0.35, flexShrink: 0 }} />
                        <p style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.4, margin: 0 }}>
                          Est. learning time: <strong>{item.hours}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {["Not Started", "In Progress", "Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateRoadmapStatus(item.skill, status)}
                        style={{
                          padding: "0.4rem 0.9rem", borderRadius: "0.75rem",
                          fontSize: "0.72rem", fontWeight: 900, cursor: "pointer",
                          border: item.status === status ? "none" : "1px solid var(--border)",
                          background: item.status === status ? "var(--accent)" : "var(--surface)",
                          color: item.status === status ? "#fff" : "var(--text)",
                          opacity: item.status === status ? 1 : 0.65,
                          transition: "all 0.2s"
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: "1rem", height: "5px", background: "var(--border)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "5px", background: s.bar,
                  width: item.status === "Completed" ? "100%" : item.status === "In Progress" ? "50%" : "0%",
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div style={{ padding: "1.25rem 1.5rem", background: "rgba(99,102,241,0.06)", borderRadius: "1rem", border: "1px dashed rgba(99,102,241,0.2)" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.6, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span>Apply to a job opportunity and our AI engine will auto-generate a personalized roadmap for your missing skills. 🤖</span>
        </p>
      </div>
    </div>
  );
}
