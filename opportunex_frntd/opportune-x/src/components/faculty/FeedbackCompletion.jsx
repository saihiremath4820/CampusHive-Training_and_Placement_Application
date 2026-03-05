import { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Star, CheckCircle2, Loader2 } from "lucide-react";
import toast from '../common/toastManager';

export default function FeedbackCompletion() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [grade, setGrade] = useState("A (Very Good)");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/team`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async () => {
    if (!teamId || !status || !grade || !feedback) {
      toast.error("Please fill in all evaluation fields");
      return;
    }
    try {
      setSubmitting(true);
      const token = sessionStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_BASE}/team/evaluate`, {
        teamId, status, grade, feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Evaluation submitted successfully!");
      setTeamId("");
      setFeedback("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header Info */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <MessageSquare size={18} color="var(--accent)" />
          <span className="pill pill-blue">Performance Review</span>
        </div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Feedback & Completion
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Finalize project outcomes by providing detailed assessments for student teams.
          Your feedback directly influences their final achievement tokens.
        </p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Evaluation Form</span>
          <span className="panel-tag">Academic Year 2024-25</span>
        </div>

        <div className="panel-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Project/Team Selection */}
            <div className="form-field">
              <label>Select Project/Team</label>
              <select className="form-select" value={teamId} onChange={e => setTeamId(e.target.value)}>
                <option value="">Select a team to evaluate...</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name} ({team.project?.title || "Independent Research"})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row-2">
              {/* Project Status */}
              <div className="form-field">
                <label>Current Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option>Ongoing</option>
                  <option>On Hold</option>
                  <option>Under Review</option>
                  <option value="completed">Final Completion</option>
                </select>
              </div>

              {/* Score Placeholder or Grade */}
              <div className="form-field">
                <label>Performance Grade</label>
                <select className="form-select" value={grade} onChange={e => setGrade(e.target.value)}>
                  <option>O (Outstanding)</option>
                  <option>A+ (Excellent)</option>
                  <option>A (Very Good)</option>
                  <option>B (Good)</option>
                </select>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="form-field">
              <label>Detailed Feedback & Critical Comments</label>
              <textarea
                className="form-textarea"
                placeholder="Assess technical execution, documentation quality, and team collaboration. Point out specific strengths and areas for improvement..."
                style={{ minHeight: 180 }}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
            </div>

            {/* Submission */}
            <div style={{
              marginTop: 10,
              padding: "16px",
              background: "var(--surface-2)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} color="var(--green)" />
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                  Ready for institutional logging
                </span>
              </div>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} fill="currentColor" />}
                <span>{submitting ? "Submitting..." : "Submit Final Evaluation"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








