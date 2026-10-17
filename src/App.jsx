import { Navigate, Route, Routes } from "react-router-dom";
import AddBook from "../pages/AddBook.jsx";
import AddMember from "../pages/AddMember.jsx";
import Books from "../pages/Books.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Members from "../pages/Members.jsx";
import Transactions from "../pages/Transactions.jsx";
import Navbar from "../Component/Navbar.jsx";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/add" element={<AddBook />} />
          <Route path="/books/:id/edit" element={<AddBook />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/add" element={<AddMember />} />
          <Route path="/members/:id/edit" element={<AddMember />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
