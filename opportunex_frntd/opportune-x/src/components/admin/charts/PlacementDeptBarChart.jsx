import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { getPlacementStats } from "../../../services/adminPlacementService";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PlacementDeptBarChart() {
  const [stats, setStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await getPlacementStats();
      const data = (res.data || [])
        .filter(s => s.deptWisePlaced && Object.keys(s.deptWisePlaced).length > 0)
        .sort((a, b) => {
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
  const depts = Object.keys(curr.deptWisePlaced || {});
  const counts = Object.values(curr.deptWisePlaced || {});

  const data = {
    labels: depts,
    datasets: [{ label: "Placed", data: counts, backgroundColor: "#8b5cf6", borderRadius: 8 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1e293b", padding: 12 }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#9ca3af" }, grid: { color: "rgba(156,163,175,0.1)" } },
      x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
    },
  };

  return (
    <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="panel-title">Department-wise</span>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-input" style={{ width: "auto", padding: "4px 8px", fontSize: 12, minHeight: "26px" }}>
          {stats.map(s => <option key={s._id} value={s.academicYear}>{s.academicYear}</option>)}
        </select>
      </div>
      <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: "220px", display: "flex", justifyContent: "center" }}><Bar data={data} options={options} /></div>

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11 }}>Total Departments</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{depts.length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11 }}>Total Placed</span>
            <span style={{ fontWeight: 600, color: "var(--accent)" }}>{counts.reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}