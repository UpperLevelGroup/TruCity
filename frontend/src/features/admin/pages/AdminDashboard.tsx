import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminStatCard from "../components/AdminStatCard";
import AdminActivityItem from "../components/AdminActivityItem";

import {
  getAdminDashboard,
} from "../admin.service";

import type {
  AdminDashboard as DashboardData,
} from "../admin.types";


export default function AdminDashboard() {

  const navigate = useNavigate();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    loadDashboard();

  }, []);


  async function loadDashboard() {

    try {

      setLoading(true);
      setError("");

      const result =
        await getAdminDashboard();

      setData(result);

    } catch (err) {

      console.error(
        "Failed to load admin dashboard:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }
  }


  if (loading) {

    return (
      <div className="admin-page">

        <AdminPageHeader
          eyebrow="ADMINISTRATION"
          title="Platform Overview"
          description="Monitor TruCity activity and manage the platform from one place."
        />

        <div className="admin-table-state">
          Loading dashboard...
        </div>

      </div>
    );
  }


  if (error || !data) {

    return (
      <div className="admin-page">

        <AdminPageHeader
          eyebrow="ADMINISTRATION"
          title="Platform Overview"
          description="Monitor TruCity activity and manage the platform from one place."
        />

        <div className="admin-error">
          {error || "No dashboard data available."}
        </div>

      </div>
    );
  }


  return (

    <div className="admin-page">

      <AdminPageHeader
        eyebrow="ADMINISTRATION"
        title="Platform Overview"
        description="Monitor TruCity activity and manage the platform from one place."
      />


      {/* =====================================================
          PLATFORM STATISTICS
      ===================================================== */}

      <section className="admin-stat-grid">

        <AdminStatCard
          label="Total Users"
          value={data.totalUsers.toLocaleString()}
          description="Registered platform users"
          icon="◉"
        />

        <AdminStatCard
          label="Candidates"
          value={data.candidates.toLocaleString()}
          description="Registered candidates"
          icon="♙"
        />

        <AdminStatCard
          label="Employers"
          value={data.employers.toLocaleString()}
          description="Registered employers"
          icon="▣"
        />

        <AdminStatCard
          label="Jobs"
          value={data.jobs.toLocaleString()}
          description="Job listings"
          icon="▤"
        />

      </section>


      {/* =====================================================
          ACTIVITY + PLATFORM STATUS
      ===================================================== */}

      <section className="admin-dashboard-grid">


        {/* RECENT ACTIVITY */}

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Recent Activity
              </h2>

              <p>
                Latest activity across the platform.
              </p>

            </div>

          </div>


          <div className="admin-activity-list">

            {data.recentActivity.length === 0 ? (

              <div className="admin-table-state">
                No recent activity.
              </div>

            ) : (

              data.recentActivity.map(
                (activity, index) => (

                  <AdminActivityItem
                    key={`${activity.createdAt}-${index}`}
                    icon="◉"
                    title={activity.action}
                    description={activity.description}
                    time={formatRelativeTime(
                      activity.createdAt
                    )}
                  />

                )
              )

            )}

          </div>

        </div>


        {/* PLATFORM STATUS */}

        <div className="admin-dashboard-card admin-platform-status-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Platform Status
              </h2>

              <p>
                Current system health.
              </p>

            </div>

            <div className="admin-system-health">
              <span className="admin-system-health-dot" />
              <span>
                Operational
              </span>
            </div>

          </div>


          <div className="admin-status-list">


            {/* AUTHENTICATION */}

            <div className="admin-status-row">

              <div className="admin-status-service">

                <div className="admin-status-icon">
                  ◉
                </div>

                <div>

                  <strong>
                    Authentication
                  </strong>

                  <span>
                    User authentication service
                  </span>

                </div>

              </div>

              <div className="admin-status-indicator">
                <span className="admin-status-dot" />
                <span>
                  Operational
                </span>
              </div>

            </div>


            {/* DATABASE */}

            <div className="admin-status-row">

              <div className="admin-status-service">

                <div className="admin-status-icon">
                  ▦
                </div>

                <div>

                  <strong>
                    Database
                  </strong>

                  <span>
                    PostgreSQL database
                  </span>

                </div>

              </div>

              <div className="admin-status-indicator">
                <span className="admin-status-dot" />
                <span>
                  Operational
                </span>
              </div>

            </div>


            {/* API */}

            <div className="admin-status-row">

              <div className="admin-status-service">

                <div className="admin-status-icon">
                  ⇄
                </div>

                <div>

                  <strong>
                    API
                  </strong>

                  <span>
                    TruCity backend services
                  </span>

                </div>

              </div>

              <div className="admin-status-indicator">
                <span className="admin-status-dot" />
                <span>
                  Operational
                </span>
              </div>

            </div>


            {/* VERIFICATION */}

            <div className="admin-status-row">

              <div className="admin-status-service">

                <div className="admin-status-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Verification
                  </strong>

                  <span>
                    Profile verification services
                  </span>

                </div>

              </div>

              <div className="admin-status-indicator">
                <span className="admin-status-dot" />
                <span>
                  Operational
                </span>
              </div>

            </div>

          </div>


          <div className="admin-status-footer">

            <span className="admin-status-footer-dot" />

            <span>
              All platform services are operating normally
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="admin-dashboard-card admin-quick-actions">

        <div className="admin-dashboard-card-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Common administration tasks.
            </p>

          </div>

        </div>


        <div className="admin-action-grid">


          {/* MANAGE USERS */}

          <button
            type="button"
            className="admin-action-card"
            onClick={() =>
              navigate("/admin/users")
            }
          >

            <span className="admin-action-icon">
              ◉
            </span>

            <strong>
              Manage Users
            </strong>

            <small>
              View and manage platform accounts
            </small>

            <span className="admin-action-arrow">
              →
            </span>

          </button>


          {/* REVIEW VERIFICATIONS */}

          <button
            type="button"
            className="admin-action-card"
            onClick={() =>
              navigate("/admin/verifications")
            }
          >

            <span className="admin-action-icon">
              ✓
            </span>

            <strong>
              Review Verifications
            </strong>

            <small>
              Review pending profile verifications
            </small>

            <span className="admin-action-arrow">
              →
            </span>

          </button>


          {/* MANAGE JOBS */}

          <button
            type="button"
            className="admin-action-card"
            onClick={() =>
              navigate("/admin/jobs")
            }
          >

            <span className="admin-action-icon">
              ▤
            </span>

            <strong>
              Manage Jobs
            </strong>

            <small>
              Review and manage job listings
            </small>

            <span className="admin-action-arrow">
              →
            </span>

          </button>


          {/* ANALYTICS */}

          <button
            type="button"
            className="admin-action-card admin-action-card-disabled"
            disabled
          >

            <span className="admin-action-icon">
              ▥
            </span>

            <strong>
              View Analytics
            </strong>

            <small>
              Platform analytics will be available here
            </small>

            <span className="admin-action-coming-soon">
              Coming soon
            </span>

          </button>

        </div>

      </section>

    </div>
  );
}


/*
 * =====================================================
 * RELATIVE TIME
 * =====================================================
 */

function formatRelativeTime(
  value?: string
) {

  if (!value) {
    return "Unknown time";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown time";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days} day${
    days === 1 ? "" : "s"
  } ago`;
}