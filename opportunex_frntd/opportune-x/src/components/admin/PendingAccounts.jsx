import { useEffect, useState } from "react";
import {
  getPendingCompanies,
  approveCompany,
  toggleVerified,
} from "../../services/adminService";

export default function PendingAccounts() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      const res = await getPendingCompanies();
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending companies");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveCompany(id);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerified = async (id) => {
    try {
      await toggleVerified(id);
      setCompanies((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, verified: !c.verified } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading pending companies...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Pending Companies</h3>

      {companies.length === 0 && <p>No pending companies</p>}

      {companies.map((c) => (
        <div key={c._id} style={{ marginBottom: "10px" }}>
          <span>{c.name}</span>

          <button onClick={() => handleApprove(c._id)}>
            Approve
          </button>

          <button onClick={() => handleToggleVerified(c._id)}>
            Toggle Verified
          </button>
        </div>
      ))}
    </div>
  );
}
