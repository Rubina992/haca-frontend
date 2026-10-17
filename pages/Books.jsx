import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Books() {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [issuedCounts, setIssuedCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  // Categories ek baar load hon (dropdown ke liye)
  useEffect(() => {
    api
      .get("/books/categories")
      .then((res) => setCategories(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Categories load nahi ho sakin"));
  }, []);

  // Search ya category badle to backend se dobara books mangwao
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      Promise.all([
        api.get("/books", { params: { search, category } }),
        api.get("/transactions"),
      ])
        .then(([booksResponse, transactionsResponse]) => {
          setBooks(booksResponse.data.data);
          const counts = transactionsResponse.data.data.reduce((result, transaction) => {
            if (transaction.status === "Issued") {
              const id = transaction.bookId?._id || transaction.bookId;
              result[id] = (result[id] || 0) + 1;
            }
            return result;
          }, {});
          setIssuedCounts(counts);
          setError("");
        })
        .catch(() => setError("Books load nahi ho sakin"))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" ko delete karna chahte hain?`)) return;
    try {
      const res = await api.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
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
        <h1>Books</h1>
        <Link className="btn primary" to="/books/add">+ Add Book</Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Title ya author search karein..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Sab categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <p>Koi book nahi mili.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.category}</td>
                  <td>{b.isbn}</td>
                  <td>{b.quantity}</td>
                  <td>{Math.max(0, b.quantity - (issuedCounts[b._id] || 0))}</td>
                  <td>{b.publicationYear}</td>
                  <td>
                    <Link className="btn secondary" to={`/books/${b._id}/edit`}>
                      Edit
                    </Link>
                    <button className="btn danger" onClick={() => handleDelete(b._id, b.title)}>
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