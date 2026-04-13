import { Outlet } from "react-router-dom";
import Navbar from "../components/Nav";

export default function DashboardLayout() {
    return(
        <div className="">
            <Navbar />
            <div className="outlet-wrapper">
                <Outlet />
            </div>
        </div>
    )
}