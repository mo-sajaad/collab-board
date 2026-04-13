import React from "react"
import { Outlet } from "react-router-dom"
import AuthNavbar from "../components/NavAuth"

export default function AuthLayout() {
    return(
        <div className="min-h-screen w-full flex flex-col bg-background">
            <AuthNavbar />
            <div className="flex flex-1 justify-center items-center p-6">
                <div className="bg-card border border-border rounded-2xl shadow-sm p-6 w-full max-w-md"><Outlet /></div>
            </div>
        </div>
    )
}