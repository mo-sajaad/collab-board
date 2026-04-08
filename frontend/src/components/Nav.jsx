import { NavLink } from "react-router-dom";
import "./Nav.css";

export default function Navbar() {
  return (
    <nav className="nav-container">
      <div className="logo">TrelloClone</div>

      {/* Search bar */}
      <div className="nav-search">
        <input type="text" placeholder="Search boards..." />
      </div>

      {/* Navigation links */}
      <div className="nav-links">
        <NavLink to="/" className="nav-link">Home</NavLink>
      </div>
    </nav>
  );
}