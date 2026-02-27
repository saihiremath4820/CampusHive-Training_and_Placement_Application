import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import { getPlacementStats } from "../../../services/adminPlacementService";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);


export default function PlacementTrendLineChart() {
  const [data, setData] = useState({ years: [], placed: [], percentages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await getPlacementStats();
      const stats = (res.data || []).sort((a, b) => {
        const yearA = parseInt(a.academicYear.split("-")[0]);
        const yearB = parseInt(b.academicYear.split("-")[0]);
        return yearA - yearB;
      });

      setData({
        years: stats.map(s => s.academicYear),
        placed: stats.map(s => s.studentsPlaced),
        percentages: stats.map(s => s.placementPercentage)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="panel" style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p></div>;
  }

  if (data.years.length === 0) {
    return <div className="panel" style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: "var(--text-muted)" }}>No trend data</p></div>;
  }

  const chartData = {
    labels: data.years,
    datasets: [
      { label: "Students Placed", data: data.placed, borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.1)", tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: "#8b5cf6", pointBorderColor: "#fff", pointBorderWidth: 2 },
      { label: "Placement %", data: data.percentages, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)", tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: "#10b981", pointBorderColor: "#fff", pointBorderWidth: 2, yAxisID: 'y1' },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: "bottom", labels: { color: "#9ca3af", padding: 15, usePointStyle: true } },
      tooltip: { backgroundColor: "#1e293b", padding: 12 }
    },
    scales: {
      y: { type: 'linear', position: 'left', beginAtZero: true, ticks: { color: "#9ca3af" }, grid: { color: "rgba(156,163,175,0.1)" }, title: { display: true, text: 'Students', color: "#8b5cf6" } },
      y1: { type: 'linear', position: 'right', beginAtZero: true, max: 100, ticks: { color: "#9ca3af", callback: (v) => v + '%' }, grid: { drawOnChartArea: false }, title: { display: true, text: '%', color: "#10b981" } },
      x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
    },
  };

  return (
    <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="panel-header" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="panel-title">Year-wise Placement Trend</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Historical performance</span>
      </div>
      <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ height: "280px", width: "100%" }}><Line data={chartData} options={options} /></div>
      </div>
    </div>
  );
}