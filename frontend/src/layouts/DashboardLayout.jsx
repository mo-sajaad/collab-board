import { Outlet } from "react-router-dom";
import Navbar from "../components/Nav";

import "./DashboardLayout.css"

export default function DashboardLayout() {
    return(
        <div className="dashboard-container">
            <Navbar />
            <div className="outlet-wrapper">
                <Outlet />
            </div>
        </div>
    )
}