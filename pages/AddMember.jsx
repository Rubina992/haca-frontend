import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function AddMember() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/members/${id}`)
      .then(({ data }) => {
        const member = data.data;
        setForm({
          name: member.name,
          email: member.email,
          phone: member.phone,
          address: member.address,
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Member load nahi ho saka");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEditing) {
        await api.put(`/members/${id}`, form);
      } else {
        await api.post("/members", form);
      }
      navigate("/members", {
        state: {
          message: isEditing ? "Member updated successfully" : "Member added successfully",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Member add nahi ho saka");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>{isEditing ? "Edit Member" : "Add Member"}</h1>
        <Link className="btn secondary" to="/members">Back to Members</Link>
      </div>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
      <form className="form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Address</label>
        <input name="address" value={form.address} onChange={handleChange} required />

        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Member"}
        </button>
      </form>
      )}
    </div>
  );
}