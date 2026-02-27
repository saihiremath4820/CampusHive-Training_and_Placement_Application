import { useEffect, useState } from "react";
import { getPlacementObjectives } from "../../../services/adminPlacementService";

export default function PlacementObjectivesSummary({ theme }) {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlacementObjectives()
      .then((res) => {
        setObjectives(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className={`p-6 rounded-xl border ${theme.card} ${theme.border}`}
    >
      <h3 className="text-lg font-semibold mb-4">
        Placement Objectives
      </h3>

      {loading && (
        <p className="text-sm text-gray-400">Loading objectives...</p>
      )}

      {!loading && objectives.length === 0 && (
        <p className="text-sm text-gray-400">
          No objectives defined yet.
        </p>
      )}

      {!loading && objectives.length > 0 && (
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
          {objectives.map((obj) => (
            <li key={obj._id}>{obj.objective}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
