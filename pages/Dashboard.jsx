import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/books"), api.get("/members"), api.get("/transactions")])
      .then(([booksResponse, membersResponse, transactionsResponse]) => {
        const books = booksResponse.data.data;
        const issuedTransactions = transactionsResponse.data.data.filter(
          (transaction) => transaction.status === "Issued",
        );
        setStats({
          totalBooks: books.length,
          totalMembers: membersResponse.data.data.length,
          issuedCopies: issuedTransactions.length,
          availableCopies: Math.max(
            0,
            books.reduce((total, book) => total + book.quantity, 0) -
              issuedTransactions.length,
          ),
        });
      })
      .catch(() => setError("Backend se connect nahi ho saka"));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  const cards = [
    { label: "Total Books", value: stats.totalBooks },
    { label: "Total Members", value: stats.totalMembers },
    { label: "Issued Copies", value: stats.issuedCopies },
    { label: "Available Copies", value: stats.availableCopies },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="cards">
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <h3>{c.value}</h3>
            <p>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}