import { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useLocation } from "react-router-dom";

export default function Members() {
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  // Search badle to backend se members dobara mangwao
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/members", { params: { search } })
        .then((res) => {
          setMembers(res.data.data);
          setError("");
        })
        .catch(() => setError("Members load nahi ho sake"))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ko delete karna chahte hain?`)) return;
    try {
      const res = await api.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((m) => m._id !== id));
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Delete nahi ho saka");
      setMessage("");
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Members</h1>
        <Link className="btn primary" to="/members/add">+ Add Member</Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Name ya email search karein..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : members.length === 0 ? (
        <p>Koi member nahi mila.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td>{m.address}</td>
                  <td>{new Date(m.membershipDate).toLocaleDateString()}</td>
                  <td>
                    <Link className="btn secondary" to={`/members/${m._id}/edit`}>
                      Edit
                    </Link>
                    <button className="btn danger" onClick={() => handleDelete(m._id, m.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}