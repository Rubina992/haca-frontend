import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="brand">📚 Library</span>
      <div className="links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/members">Members</NavLink>
        <NavLink to="/transactions">Issue / Return</NavLink>
      </div>
    </nav>
  );
}