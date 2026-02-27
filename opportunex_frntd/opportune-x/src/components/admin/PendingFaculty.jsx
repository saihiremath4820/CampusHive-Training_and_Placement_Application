import { useEffect, useState } from "react";
import {
  getPendingFaculty,
  approveFaculty,
} from "../../services/adminService";

export default function PendingFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingFaculty();
  }, []);

  const fetchPendingFaculty = async () => {
    try {
      setLoading(true);
      const res = await getPendingFaculty();
      setFaculty(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending faculty");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveFaculty(id);
      setFaculty((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading pending faculty...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Pending Faculty</h3>

      {faculty.length === 0 && <p>No pending faculty</p>}

      {faculty.map((f) => (
        <div
          key={f._id}
          className="flex justify-between items-center p-3 border rounded mb-2"
        >
          <div>
            <p className="font-medium">{f.name}</p>
            <p className="text-sm text-gray-400">{f.email}</p>
          </div>

          <button
            onClick={() => handleApprove(f._id)}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
