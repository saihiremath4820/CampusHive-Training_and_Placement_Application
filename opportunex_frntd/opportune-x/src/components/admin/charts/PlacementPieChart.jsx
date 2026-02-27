import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getPlacementStats } from "../../../services/adminPlacementService";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PlacementPieChart() {
  const [stats, setStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await getPlacementStats();
      const data = (res.data || []).sort((a, b) => {
        const yearA = parseInt(a.academicYear.split("-")[0]);
        const yearB = parseInt(b.academicYear.split("-")[0]);
        return yearB - yearA;
      });
      setStats(data);
      if (data.length > 0) setSelectedYear(data[0].academicYear);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="panel" style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p></div>;
  }

  if (stats.length === 0) {
    return <div className="panel" style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: "var(--text-muted)" }}>No data</p></div>;
  }

  const curr = stats.find(s => s.academicYear === selectedYear) || stats[0];
  const placed = curr.studentsPlaced || 0;
  const total = curr.studentsEnrolled || 0;

  const data = {
    labels: ["Placed", "Unplaced"],
    datasets: [{ data: [placed, Math.max(total - placed, 0)], backgroundColor: ["#8b5cf6", "#334155"], borderWidth: 0 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#9ca3af", padding: 15 } },
      tooltip: { backgroundColor: "#1e293b", padding: 12 }
    },
  };

  return (
    <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="panel-title">Placement Status</span>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-input" style={{ width: "auto", padding: "4px 8px", fontSize: 12, minHeight: "26px" }}>
          {stats.map(s => <option key={s._id} value={s.academicYear}>{s.academicYear}</option>)}
        </select>
      </div>
      <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: "220px", display: "flex", justifyContent: "center" }}><Pie data={data} options={options} /></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{total}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Placed</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{placed}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rate</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--green)" }}>{curr.placementPercentage}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}