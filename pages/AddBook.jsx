import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function AddBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    quantity: "",
    publicationYear: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/books/${id}`)
      .then(({ data }) => {
        const book = data.data;
        setForm({
          title: book.title,
          author: book.author,
          category: book.category,
          isbn: book.isbn,
          quantity: String(book.quantity),
          publicationYear: String(book.publicationYear),
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Book load nahi ho saki");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await api.put(`/books/${id}`, form);
      } else {
        await api.post("/books", form);
      }

      navigate("/books", {
        state: {
          message: isEditing ? "Book updated successfully" : "Book added successfully",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Book add nahi ho saki"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>{isEditing ? "Edit Book" : "Add Book"}</h1>
        <Link className="btn secondary" to="/books">Back to Books</Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
      <form className="form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Author</label>
        <input
          name="author"
          value={form.author}
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <label>ISBN</label>
        <input
          name="isbn"
          value={form.isbn}
          onChange={handleChange}
          required
        />

        <label>Quantity</label>
        <input
          type="number"
          min="0"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <label>Publication Year</label>
        <input
          type="number"
          name="publicationYear"
          value={form.publicationYear}
          onChange={handleChange}
          required
        />

        <button
          className="btn primary"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Book"}
        </button>
      </form>
      )}
    </div>
  );
}
