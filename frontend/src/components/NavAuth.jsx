import { NavLink } from "react-router-dom";

export default function AuthNavbar() {
  return (
    <header className="bg-background/80 border-b-2 border-border backdrop-blur-md px-6 py-3.5 flex justify-between items-center sticky top-0 z-50">
      <NavLink
        to="/"
        className="text-2xl font-black bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
      >
        collab_board
      </NavLink>

      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted/20 text-muted border border-border">
        Secure Access
      </span>
    </header>
  );
}