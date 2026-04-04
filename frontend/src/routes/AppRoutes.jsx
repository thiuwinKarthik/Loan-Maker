import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import UserDashboard from "../pages/user/Dashboard";
import LoanApply from "../pages/user/LoanApply";
import LoanHistory from "../pages/user/LoanHistory";
import Profile from "../pages/user/Profile";

import AdminDashboard from "../pages/admin/Dashboard";
import UserList from "../pages/admin/UserList";
import LoanList from "../pages/admin/LoanList";
import Reports from "../pages/admin/Reports";
import AddAdmin from "../pages/admin/AddAdmin";

import ProtectedRoute from "./ProtectedRoute";
import Offers from "../pages/user/Offers";
import ManageAssets from "../pages/user/ManageAssets";
import LoanAdvisor from "../pages/shared/LoanAdvisor";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply-loan"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <LoanApply />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-history"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <LoanHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Offers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ManageAssets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor"
        element={
          <ProtectedRoute allowedRoles={["USER", "ROLE_ADMIN"]}>
            <LoanAdvisor />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <UserList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/loans"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <LoanList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <AddAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/advisor"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <LoanAdvisor />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
