import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-background/80 border-border border-b-2 backdrop-blur-md text-white px-6 py-2 flex justify-between items-center sticky shadow-md top-0 z-50">
      <NavLink to="/" className="text-2xl font-bold bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
        BtecTrello
      </NavLink>
      {/* Search bar */}
      <div className="flex m-1 mx-6 min-w-md border-2 border-border rounded-md">
        <input
          type="text"
          placeholder="Search boards..."
          className="w-full px-4 py-2 rounded-md bg-card text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-out"
        />
      </div>

      {/* Navigation links */}
      <div className="">
        <NavLink
          to="/auth/login"
          className="text-white hover:text-red-500/80 hover:-translate-y-4 hover:scale-105 transition-all transform duration-300 hover:shadow-lg ease-in-out"
        >
          Log out
        </NavLink>
      </div>
    </header>
  );
}
