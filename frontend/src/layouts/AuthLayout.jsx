import { Outlet } from "react-router-dom";
import AuthNavbar from "../components/NavAuth";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <AuthNavbar />
      <main className="flex flex-1 justify-center items-center p-4 sm:p-6">
        <div className="bg-card border-2 border-border rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md transition-all">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
