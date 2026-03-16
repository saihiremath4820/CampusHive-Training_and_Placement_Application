import { useState, useEffect } from "react";
import { useStudent } from "../../context/StudentContext";
import { CheckCircle2, BookOpen, Code2, TrendingUp, Zap, Clock, Star, Target } from "lucide-react";

/* 1. Priority Configuration */
const priorityConfig = {
  high: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444', icon: '🔴', label: 'HIGH PRIORITY' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#f59e0b', icon: '🟡', label: 'MEDIUM' },
  low: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e', icon: '🟢', label: 'LOW' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444', icon: '🔴', label: 'HIGH PRIORITY' },
  MEDIUM: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#f59e0b', icon: '🟡', label: 'MEDIUM' },
  LOW: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e', icon: '🟢', label: 'LOW' }
};

/* 2. Estimated Date Helper */
const getEstimatedCompletionDate = (totalHours, hoursPerDay = 2) => {
  if (!totalHours) return { date: "TBD", days: 0, weeks: 0 };
  const daysNeeded = Math.ceil(totalHours / hoursPerDay);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);
  return {
    date: completionDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    days: daysNeeded,
    weeks: Math.ceil(daysNeeded / 7)
  };
};

/* 3. Progress percentage calculator for tabs */
const calculateCompletion = (roadmap) => {
  if (!roadmap || !roadmap.roadmap) return 0;
  const total = roadmap.roadmap.length || 0;
  if (total === 0) return 0;
  const completed = roadmap.roadmap.filter(s => s.status === 'Completed').length || 0;
  return Math.round((completed / total) * 100);
};

/* 4. Badges definitions */
const BADGES = [
  { id: 'first_skill', icon: '🌱', name: 'First Step', desc: 'Completed your first skill', condition: (stats) => stats.completed >= 1 },
  { id: 'halfway', icon: '⚡', name: 'Halfway There', desc: '50% of roadmap complete', condition: (stats) => stats.percent >= 50 },
  { id: 'on_fire', icon: '🔥', name: 'On Fire', desc: '7 day learning streak', condition: (stats) => stats.streak >= 7 },
  { id: 'completionist', icon: '🏆', name: 'Completionist', desc: 'Finished entire roadmap', condition: (stats) => stats.percent >= 100 && stats.completed > 0 },
  { id: 'speed_learner', icon: '🚀', name: 'Speed Learner', desc: 'Completed 5 skills in one day', condition: (stats) => stats.todayCompleted >= 5 },
  { id: 'consistent', icon: '💎', name: 'Consistent', desc: '30 day streak', condition: (stats) => stats.streak >= 30 },
];

export default function SkillRoadmap() {
  const { roadmaps, updateRoadmapStatus } = useStudent();
  const [selectedId, setSelectedId] = useState(null);
  
  const [stats, setStats] = useState({
    streak: 0,
    completed: 0,
    percent: 0,
    todayCompleted: 0
  });

  useEffect(() => {
    if (!selectedId && roadmaps && Object.keys(roadmaps).length > 0) {
      setSelectedId(Object.keys(roadmaps)[0]);
    }
  }, [roadmaps, selectedId]);

  // Recalculate robust global stats on any roadmap change
  useEffect(() => {
    let totalCompleted = 0;
    let overallPercent = 0;
    let rCount = 0;
    
    if (roadmaps) {
      Object.values(roadmaps).forEach(doc => {
        if (doc && doc.roadmap) {
          totalCompleted += doc.roadmap.filter(s => s.status === 'Completed').length;
          overallPercent += calculateCompletion(doc);
          rCount++;
        }
      });
    }

    const todayCompleted = parseInt(localStorage.getItem('roadmap_today_completed') || '0');
    const streak = parseInt(localStorage.getItem('roadmap_streak') || '0');

    setStats({
      streak,
      completed: totalCompleted,
      percent: rCount > 0 ? Math.round(overallPercent / rCount) : 0,
      todayCompleted
    });
  }, [roadmaps]);

  // Invoked when user sets a skill to 'Completed' to boost streak and day count locally
  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('roadmap_last_active');
    let currentStreak = parseInt(localStorage.getItem('roadmap_streak') || '0');
    let todayCompleted = parseInt(localStorage.getItem('roadmap_today_completed') || '0');

    if (lastActive === today) {
       // Already active today, just bump the count
       todayCompleted++;
       localStorage.setItem('roadmap_today_completed', todayCompleted.toString());
    } else {
       // This is the first completed active hit of the day!
       const yesterday = new Date();
       yesterday.setDate(yesterday.getDate() - 1);
       if (lastActive === yesterday.toDateString()) {
         // Consecutive hit
         currentStreak++;
       } else if (!lastActive) {
         // Literally the first day ever
         currentStreak = 1;
       } else {
         // Missed a day — RIP streak :'(
         currentStreak = 1;
       }
       localStorage.setItem('roadmap_streak', currentStreak.toString());
       localStorage.setItem('roadmap_last_active', today);
       localStorage.setItem('roadmap_today_completed', '1');
       todayCompleted = 1;
    }
    
    // Refresh the local component state immediately so badges/streak update!
    setStats(prev => ({
      ...prev,
      streak: currentStreak,
      todayCompleted,
      completed: prev.completed + 1
    }));
  };

  const handleStatusChange = (skill, status) => {
    if (status === 'Completed') {
       updateStreak();
    }
    updateRoadmapStatus(skill, status, selectedId);
  };

  const currentDoc = roadmaps[selectedId] || { roadmap: [] };
  const items = currentDoc.roadmap || [];

  const completedCount = items.filter(i => i.status === "Completed").length;
  const inProgressCount = items.filter(i => i.status === "In Progress").length;
  const totalHours = items.reduce((acc, r) => acc + parseInt(r.hours || r.estimatedHours || 0), 0);
  const estimate = getEstimatedCompletionDate(totalHours);
  
  const earnedBadgesCount = BADGES.filter(b => b.condition(stats)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      
      {/* 5. Streak Banner */}
      <div className="streak-banner">
        <div className="streak-item">
          <span className="streak-icon">🔥</span>
          <span className="streak-count">{stats.streak}</span>
          <span className="streak-label">Day Streak</span>
        </div>
        <div className="streak-item">
          <span className="streak-icon">⚡</span>
          <span className="streak-count">{stats.completed}</span>
          <span className="streak-label">Skills Done</span>
        </div>
        <div className="streak-item">
          <span className="streak-icon">🏆</span>
          <span className="streak-count">{earnedBadgesCount}</span>
          <span className="streak-label">Badges</span>
        </div>
        <div className="streak-item">
          <span className="streak-icon">📈</span>
          <span className="streak-count">{stats.percent}%</span>
          <span className="streak-label">Overall</span>
        </div>
      </div>

      {/* 1 & 2. Target Selector Tabs with progress bar */}
      {Object.keys(roadmaps).length > 0 && (
        <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {Object.entries(roadmaps).map(([id, r]) => {
            const isActive = selectedId === id;
            const completionPercent = calculateCompletion(r);
            const roleName = r.opportunityId?.title || r.targetRole || (id === "general" ? "General Roadmap" : "Roadmap");
            const compName = r.opportunityId?.companyName || (id === "general" ? "Core Skills" : "Company Preview");

            return (
              <button
                key={id}
                className={`roadmap-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedId(id)}
                title={`${roleName} @ ${compName}`}
              >
                <span className="tab-company">{compName}</span>
                <span className="tab-title">{roleName.substring(0, 22)}{roleName.length > 22 ? '...' : ''}</span>
                <span className="tab-percent">{completionPercent}%</span>
                <div className="tab-progress-bar">
                  <div
                    className="tab-progress-fill"
                    style={{ 
                      width: `${completionPercent}%`, 
                      background: completionPercent === 100 ? '#22c55e' : '#3b82f6' 
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

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

      {/* Overall Progress bar Header with Expected Completion Date */}
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
          <span style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45, fontWeight: 600 }}>
            <Target size={11} style={{ verticalAlign: "middle", color: "var(--accent)", marginRight: "4px" }} /> 
            Complete by: {estimate.date} ({estimate.weeks} weeks)
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45 }}>
            <Star size={11} style={{ verticalAlign: "middle", color: "var(--yellow)", marginRight: "4px" }} /> 
            2 hrs/day recommended
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
          const s = {
            "Not Started": { color: "var(--text)", opacity: 0.4, bg: "var(--surface)", bar: "var(--border)" },
            "In Progress": { color: "var(--yellow)", opacity: 1, bg: "rgba(234,179,8,0.12)", bar: "var(--yellow)" },
            "Completed": { color: "var(--green)", opacity: 1, bg: "rgba(34,197,94,0.12)", bar: "var(--green)" }
          }[item.status || "Not Started"];
          
          /* 3. Extract Priority Configuration */
          const pConfig = priorityConfig[item.priority?.toLowerCase() || 'medium'] || priorityConfig.medium;
          const itemDate = getEstimatedCompletionDate(item.hours || item.estimatedHours);

          return (
            <div key={item.skill} className="panel skill-card" style={{ 
              padding: "1.5rem", position: "relative", overflow: "hidden", 
              borderLeft: `5px solid ${pConfig.border}` 
            }}>
              
              {/* 3. Priority Color-Coded Badge */}
              {item.priority && (
                <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                  <span className="priority-badge" style={{
                    background: pConfig.bg,
                    border: `1px solid ${pConfig.border}`,
                    color: pConfig.text,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    {pConfig.icon} {pConfig.label}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap", marginTop: "4px" }}>
                <div style={{
                  width: "2.75rem", height: "2.75rem", borderRadius: "0.85rem", flexShrink: 0,
                  background: s.bg, color: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${s.color}25`, opacity: s.opacity
                }}>
                  <CheckCircle2 size={22} />
                </div>

                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text)", textTransform: "capitalize", margin: "0 0 0.75rem", paddingRight: "7rem" }}>
                    {item.skill}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    {/* Render Resources */}
                    {item.resources && item.resources.length > 0 && (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <BookOpen size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {item.resources.map((res, idx) => (
                            <p key={idx} style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.85, margin: 0, lineHeight: 1.5 }}>
                              <strong>{res.platform}:</strong>{" "}
                              {res.url && res.url !== "#" && !res.url.includes('actual-link') ? (
                                <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>{res.title}</a>
                              ) : (
                                res.title
                              )}
                              {res.duration && <span style={{ opacity: 0.5, fontSize: "0.7rem", marginLeft: 6 }}>({res.duration})</span>}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {!item.resources && item.course && (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <BookOpen size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }} />
                        <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.85, margin: 0 }}><strong>Course:</strong> {item.course}</p>
                      </div>
                    )}

                    {/* Render Projects */}
                    {item.projects && item.projects.length > 0 && (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginTop: "0.3rem" }}>
                        <Code2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: "0.15rem" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {item.projects.map((proj, idx) => (
                            <p key={idx} style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.85, margin: 0, lineHeight: 1.5 }}>
                              <strong>[{proj.difficulty}] {proj.title}:</strong> {proj.description}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {!item.projects && item.project && (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <Code2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: "0.15rem" }} />
                        <p style={{ fontSize: "0.8rem", color: "var(--text)", opacity: 0.85, margin: 0 }}><strong>Project:</strong> {item.project}</p>
                      </div>
                    )}

                    {/* 4. Est Time Completion Display */}
                    {(item.hours || item.estimatedHours) && (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
                        <Clock size={12} style={{ color: "var(--text)", opacity: 0.35, flexShrink: 0 }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                           <p style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.6, margin: 0 }}>
                             Est. completion: <strong style={{color: "var(--accent)"}}>{itemDate.date}</strong>
                           </p>
                           <p style={{ fontSize: "0.68rem", color: "var(--text)", opacity: 0.35, margin: 0 }}>
                             ({item.hours || item.estimatedHours} hrs / {itemDate.weeks} wks)
                           </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {["Not Started", "In Progress", "Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(item.skill, status)}
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
              <div style={{ marginTop: "1rem", height: "4px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "4px", background: s.bar,
                  width: item.status === "Completed" ? "100%" : item.status === "In Progress" ? "50%" : "0%",
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Badges System Display */}
      <div className="badges-section panel" style={{ padding: "1.5rem" }}>
        <h4>🏅 Your Badges</h4>
        <div className="badges-grid">
          {BADGES.map(badge => {
            const earned = badge.condition(stats);
            return (
              <div
                key={badge.id}
                className={`badge-card ${earned ? 'earned' : 'locked'}`}
                title={badge.desc}
              >
                <span className="badge-icon" style={{ filter: earned ? 'none' : 'grayscale(100%)' }}>
                  {badge.icon}
                </span>
                <span className="badge-name">{badge.name}</span>
                {!earned && <span className="badge-lock">🔒</span>}
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
