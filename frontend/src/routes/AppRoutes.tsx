import {
  Routes,
  Route,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
//import ProtectedRoute from "../routes/ProtectedRoute";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";

import Login from "../features/auth/components/Login";
import RoleChoice from "../features/auth/components/RoleChoice";
import RegisterCandidate from "../features/auth/components/RegisterCandidate";
import RegisterCompany from "../features/auth/components/RegisterCompany";

import AdminUsers from "../features/admin/pages/AdminUsers";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminCandidates from "../features/admin/pages/AdminCandidates";
import AdminEmployers from "../features/admin/pages/AdminEmployers";
import AdminJobs from "../features/admin/pages/AdminJobs";
import AdminApplications from "../features/admin/pages/AdminApplications";
import AdminVerifications from "../features/admin/pages/AdminVerifications";
import AdminReports from "../features/admin/pages/AdminReports";
import AdminAnalytics from "../features/admin/pages/AdminAnalytics";
import AdminSettings from "../features/admin/pages/AdminSettings";
import AdminMessages from "../features/admin/pages/Messages";

import CompanyLayout from "../layouts/CompanyLayout";
import CompanyDashboard from "../features/company/pages/CompanyDashboard";
//import CompanyProfile from "../features/company/pages/CompanyProfile";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
          ========================= */}
      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<RoleChoice />}
        />

        <Route
          path="/register/candidate"
          element={<RegisterCandidate />}
        />

        <Route
          path="/register/company"
          element={<RegisterCompany />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Route>


      {/* =========================
          COMPANY ROUTES
          ========================= */}
      <Route element={<CompanyLayout />}>

        <Route
          path="/company"
          element={<CompanyDashboard />}
        />

      </Route>


      {/* =========================
          ADMIN ROUTES
          ========================= */}
      <Route element={<AdminLayout />}>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/candidates"
          element={<AdminCandidates />}
        />

        <Route
          path="/admin/employers"
          element={<AdminEmployers />}
        />

        <Route
          path="/admin/jobs"
          element={<AdminJobs />}
        />

        <Route
          path="/admin/applications"
          element={<AdminApplications />}
        />

        <Route
          path="/admin/messages"
          element={<AdminMessages />}
        />

        <Route
          path="/admin/verifications"
          element={<AdminVerifications />}
        />

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

      </Route>

    </Routes>
  );
}
