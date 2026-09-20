import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Home from "./src/pages/dashboard/Home";
import Board from "./src/pages/dashboard/Board";
import TaskOverview from "./src/pages/dashboard/TaskOverview";

import DashboardLayout from "./src/layouts/DashboardLayout";
import AuthLayout from "./src/layouts/AuthLayout";

import Login from "./src/pages/auth/Login";
import Signup from "./src/pages/auth/Signup";
import ProtectedRoute from "./src/utils/ProtectedRoute";


export const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "board/:id", element: <Board /> },
          { path: "task/:id", element: <TaskOverview /> },
        ],
      },
    ],
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);