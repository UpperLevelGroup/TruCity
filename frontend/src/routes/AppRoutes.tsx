import {
  Routes,
  Route,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";

import Home from "../features/homepage/Home";

import Login from "../features/auth/components/login/Login";
import ForgotPassword from "../features/auth/components/login/ForgotPassword";
import RoleChoice from "../features/auth/components/register/RoleChoice";
import RegisterCandidate from "../features/auth/components/register/RegisterCandidate";
import RegisterCompany from "../features/auth/components/register/RegisterCompany";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminUsers from "../features/admin/pages/AdminUsers";
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

/* =========================================================
   CANDIDATE
========================================================= */

import CandidateLayout from "../features/candidate/components/CandidateLayout";
import CandidateDashboard from "../features/candidate/pages/CandidateDashboard";
import CandidateVerify from "../features/candidate/pages/CandidateVerify";
import CandidateOnboardingPage from "../features/candidate/pages/CandidateOnboardingPage";
import ChoosePlan from "../features/candidate/pages/ChoosePlan";
import CompanyFeed from "../features/candidate/pages/CompanyFeed";
import CvBuilder from "../features/candidate/pages/CvBuilder";
import GuidanceHub from "../features/candidate/pages/GuidanceHub";
import Messages from "../features/candidate/pages/Messages";
import Notifications from "../features/candidate/pages/Notifications";
import { Profile } from "../features/candidate/pages/Profile";
import ProfileSetup from "../features/candidate/pages/ProfileSetup";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC
      ====================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route element={<PublicLayout />}>
        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Registration Role Choice */}
        <Route
          path="/register"
          element={<RoleChoice />}
        />

        {/* Candidate Registration */}
        <Route
          path="/register/candidate"
          element={<RegisterCandidate />}
        />

        {/* Company Registration */}
        <Route
          path="/register/company"
          element={<RegisterCompany />}
        />

        {/*
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        */}
      </Route>

      {/* =====================================================
          CANDIDATE ONBOARDING

      ====================================================== */}

      <Route
        path="/candidate/onboarding"
        element={<CandidateOnboardingPage />}
      />

      {/* =====================================================
          CANDIDATE PLAN SELECTION

          ====================================================== */}

      <Route
        path="/candidate/choose-plan"
        element={<ChoosePlan />}
      />

      {/* =====================================================
          CANDIDATE APPLICATION
      ====================================================== */}

      <Route element={<CandidateLayout />}>
        {/* Candidate Dashboard */}
        <Route
          path="/candidate"
          element={<CandidateDashboard />}
        />

        {/* Opportunities / Talent Feed */}
        <Route
          path="/candidate/feed"
          element={<CompanyFeed />}
        />

        {/* Messages */}
        <Route
          path="/candidate/messages"
          element={<Messages />}
        />

        {/* Guidance Hub */}
        <Route
          path="/candidate/hub"
          element={<GuidanceHub />}
        />

        {/* CV */}
        <Route
          path="/candidate/cv"
          element={<CvBuilder />}
        />

        {/* Profile */}
        <Route
          path="/candidate/profile"
          element={<Profile />}
        />

        {/* Profile Setup */}
        <Route
          path="/candidate/profile/setup"
          element={<ProfileSetup />}
        />

        {/* Verification */}
        <Route
          path="/candidate/verify"
          element={<CandidateVerify />}
        />

        {/* Notifications */}
        <Route
          path="/candidate/notifications"
          element={<Notifications />}
        />
      </Route>

      {/* =====================================================
          COMPANY
      ====================================================== */}

      <Route element={<CompanyLayout />}>
        <Route
          path="/company"
          element={<CompanyDashboard />}
        />
      </Route>

      {/* =====================================================
          ADMIN
      ====================================================== */}

      <Route element={<AdminLayout />}>
        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* Users */}
        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* Candidates */}
        <Route
          path="/admin/candidates"
          element={<AdminCandidates />}
        />

        {/* Employers */}
        <Route
          path="/admin/employers"
          element={<AdminEmployers />}
        />

        {/* Jobs */}
        <Route
          path="/admin/jobs"
          element={<AdminJobs />}
        />

        {/* Applications */}
        <Route
          path="/admin/applications"
          element={<AdminApplications />}
        />

        {/* Messages */}
        <Route
          path="/admin/messages"
          element={<AdminMessages />}
        />

        {/* Verifications */}
        <Route
          path="/admin/verifications"
          element={<AdminVerifications />}
        />

        {/* Reports */}
        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        {/* Analytics */}
        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />

        {/* Settings */}
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />
      </Route>
    </Routes>
  );
}
