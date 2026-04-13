import { NavLink } from "react-router-dom";

export default function AuthNavbar() {
  return (
    <header className="bg-background/80 border-border border-b-2 backdrop-blur-md text-white px-6 py-2 flex justify-between items-center sticky shadow-md top-0 z-50">
      <div to="/" className="text-2xl font-bold bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent m-2">
        BtecTrello
      </div>
    </header>
  );
}