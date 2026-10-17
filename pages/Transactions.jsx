import { useEffect, useState } from "react";
import api from "../services/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = () =>
    Promise.all([
      api.get("/transactions"),
      api.get("/books"),
      api.get("/members"),
    ]);

  const issuedCountFor = (bookId, source = transactions) =>
    source.filter(
      (transaction) =>
        transaction.status === "Issued" &&
        (transaction.bookId?._id || transaction.bookId) === bookId,
    ).length;

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionsResponse, booksResponse, membersResponse] = await fetchData();
      setTransactions(transactionsResponse.data.data);
      setBooks(booksResponse.data.data);
      setMembers(membersResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Transactions load nahi ho sakin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchData()
      .then(([transactionsResponse, booksResponse, membersResponse]) => {
        if (!isMounted) return;
        setTransactions(transactionsResponse.data.data);
        setBooks(booksResponse.data.data);
        setMembers(membersResponse.data.data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || "Transactions load nahi ho sakin");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleIssue = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.post("/transactions", { bookId, memberId });
      setBookId("");
      setMemberId("");
      setMessage("Book issue ho gayi");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Book issue nahi ho saki");
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (transaction) => {
    setError("");
    setMessage("");
    try {
      await api.put(`/transactions/${transaction._id}`, {
        status: "Returned",
        returnDate: new Date().toISOString(),
      });
      setMessage("Book return mark ho gayi");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Book return nahi ho saki");
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Issue / Return Books</h1>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form transaction-form" onSubmit={handleIssue}>
        <h2>Issue a Book</h2>
        <label htmlFor="transaction-book">Book</label>
        <select
          id="transaction-book"
          value={bookId}
          onChange={(event) => setBookId(event.target.value)}
          required
        >
          <option value="">Select a book</option>
          {books
            .filter((book) => book.quantity - issuedCountFor(book._id) > 0)
            .map((book) => (
              <option key={book._id} value={book._id}>
                {book.title} ({Math.max(0, book.quantity - issuedCountFor(book._id))} available)
              </option>
            ))}
        </select>

        <label htmlFor="transaction-member">Member</label>
        <select
          id="transaction-member"
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
          required
        >
          <option value="">Select a member</option>
          {members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>

        <button className="btn primary" type="submit" disabled={saving || loading}>
          {saving ? "Issuing..." : "Issue Book"}
        </button>
      </form>

      <h2 className="section-title">Transaction History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>Abhi koi transaction nahi hai.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.bookId?.title || "Book unavailable"}</td>
                  <td>{transaction.memberId?.name || "Member unavailable"}</td>
                  <td>{new Date(transaction.issueDate).toLocaleDateString()}</td>
                  <td>
                    {transaction.returnDate
                      ? new Date(transaction.returnDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{transaction.status}</td>
                  <td>
                    {transaction.status === "Issued" ? (
                      <button
                        className="btn primary"
                        onClick={() => handleReturn(transaction)}
                      >
                        Mark Returned
                      </button>
                    ) : (
                      "—"
                    )}
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
