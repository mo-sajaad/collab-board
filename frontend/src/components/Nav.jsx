import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaArrowRightFromBracket } from "react-icons/fa6";
import { logoutUser } from "../api/auth";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse user profile", e);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-background/80 border-b-2 border-border backdrop-blur-md px-4 sm:px-8 py-3 flex justify-between items-center sticky top-0 z-50 shadow-xs">
      <NavLink
        to="/"
        className="text-2xl font-black bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
      >
        collab_board
      </NavLink>

      {/* Responsive Search bar */}
      <SearchBar />

      {/* User Info & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-muted/20 border border-border">
          <div className="w-7 h-7 rounded-full bg-linear-to-r from-green-400 to-cyan-400 text-black font-bold text-xs flex items-center justify-center shadow-xs">
            {initial}
          </div>
          <span className="text-sm font-medium text-foreground hidden md:inline-block max-w-[120px] truncate">
            {user?.username || "Account"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-red-400 hover:bg-red-500/10 border border-border/80 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <FaArrowRightFromBracket className="text-xs" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}