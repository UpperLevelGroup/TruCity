import { useEffect, useMemo, useState } from "react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminSearch from "../components/AdminSearch";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";

import {
  getAdminJobs,
  updateAdminJobStatus,
} from "../admin.service";

import type { AdminJob } from "../admin.types";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] =
    useState<AdminJob | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showActiveOnly, setShowActiveOnly] =
    useState(false);

  /*
   * =========================================================
   * LOAD JOBS
   * =========================================================
   */

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminJobs();

        console.log("ADMIN JOBS:", data);

        setJobs(data);
      } catch (err) {
        console.error(
          "Failed to load jobs:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load jobs."
        );
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  /*
   * =========================================================
   * SEARCH + FILTER
   * =========================================================
   */

  const filteredJobs = useMemo(() => {
    const value = search.trim().toLowerCase();

    let result = jobs;

    if (value) {
      result = result.filter((job) =>
        [
          job.title,
          job.companyName,
          job.location,
          job.employmentType,
          job.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value)
      );
    }

    if (showActiveOnly) {
      result = result.filter(
        (job) =>
          job.status?.toUpperCase() === "ACTIVE"
      );
    }

    return result;
  }, [search, jobs, showActiveOnly]);

  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const totalJobs = jobs.length;

  const activeJobs = jobs.filter(
    (job) =>
      job.status?.toLowerCase() === "active"
  ).length;

  const pendingJobs = jobs.filter(
    (job) =>
      job.status?.toLowerCase() === "pending"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      job.status?.toLowerCase() === "closed"
  ).length;

  const removedJobs = jobs.filter(
    (job) =>
      job.status?.toLowerCase() === "removed"
  ).length;

  const totalApplications = jobs.reduce(
    (total, job) =>
      total + (job.applicationCount ?? 0),
    0
  );

  /*
   * =========================================================
   * JOB STATUS CHANGE
   * =========================================================
   */

  async function handleJobStatusChange(
    status: string
  ) {
    if (!selectedJob) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const updatedJob =
        await updateAdminJobStatus(
          selectedJob.id,
          status
        );

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === updatedJob.id
            ? updatedJob
            : job
        )
      );

      setSelectedJob(updatedJob);
    } catch (err) {
      console.error(
        "Failed to update job:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update job."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * =========================================================
   * TABLE COLUMNS
   * =========================================================
   */

  const columns = [
    {
      key: "title",
      label: "Job",

      render: (job: AdminJob) => {
        const title = job.title || "Untitled job";

        const company =
          job.companyName ||
          "Company not provided";

        const initials =
          title.charAt(0).toUpperCase() || "J";

        return (
          <div className="admin-person">
            <div className="admin-person-avatar">
              {initials}
            </div>

            <div>
              <strong>{title}</strong>

              <span>{company}</span>
            </div>
          </div>
        );
      },
    },

    {
      key: "location",
      label: "Location",

      render: (job: AdminJob) => (
        <span>
          {job.location || "Not specified"}
        </span>
      ),
    },

    {
      key: "employmentType",
      label: "Type",

      render: (job: AdminJob) => (
        <span>
          {job.employmentType ||
            "Not specified"}
        </span>
      ),
    },

    {
      key: "applicationCount",
      label: "Applications",

      render: (job: AdminJob) => (
        <span className="admin-table-number">
          {job.applicationCount ?? 0}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (job: AdminJob) => (
        <AdminStatusBadge
          status={job.status || "UNKNOWN"}
        />
      ),
    },

    {
      key: "createdAt",
      label: "Posted",

      render: (job: AdminJob) => (
        <span>
          {formatDate(job.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "",

      render: (job: AdminJob) => (
        <button
          type="button"
          className="admin-row-action"
          onClick={() =>
            setSelectedJob(job)
          }
        >
          View
        </button>
      ),
    },
  ];

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="PLATFORM"
        title="Jobs"
        description="Manage job listings, monitor activity and oversee opportunities published on TruCity."
      />

      {/* SUMMARY */}

      <section className="admin-list-summary admin-job-summary">
        <div>
          <strong>
            {loading ? "—" : totalJobs}
          </strong>

          <span>Total jobs</span>
        </div>

        <div>
          <strong>
            {loading ? "—" : activeJobs}
          </strong>

          <span>Active jobs</span>
        </div>

        <div>
          <strong>
            {loading ? "—" : pendingJobs}
          </strong>

          <span>Pending review</span>
        </div>

        <div>
          <strong>
            {loading ? "—" : closedJobs}
          </strong>

          <span>Closed</span>
        </div>

        <div>
          <strong>
            {loading ? "—" : removedJobs}
          </strong>

          <span>Removed</span>
        </div>

        <div>
          <strong>
            {loading ? "—" : totalApplications}
          </strong>

          <span>Applications</span>
        </div>
      </section>

      {/* TOOLBAR */}

      <section className="admin-list-toolbar">
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search jobs, companies or locations..."
        />

        <button
          type="button"
          className={`admin-filter-button ${
            showActiveOnly ? "active" : ""
          }`}
          onClick={() =>
            setShowActiveOnly(
              (current) => !current
            )
          }
        >
          {showActiveOnly
            ? "All jobs"
            : "Active only"}
        </button>
      </section>

      {/* ERROR */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* TABLE */}

      <section className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>Job Directory</h2>

            <p>
              Review job listings and monitor
              their current status.
            </p>
          </div>

          <span className="admin-table-count">
            {loading
              ? "Loading..."
              : `${filteredJobs.length} ${
                  filteredJobs.length === 1
                    ? "result"
                    : "results"
                }`}
          </span>
        </div>

        <AdminTable
          columns={columns}
          data={filteredJobs}
          emptyMessage={
            loading
              ? "Loading jobs..."
              : "No jobs found."
          }
        />
      </section>

      {/* JOB DETAILS DRAWER */}

      {selectedJob && (
        <JobDetailsDrawer
          job={selectedJob}
          actionLoading={actionLoading}
          onClose={() => {
            if (!actionLoading) {
              setSelectedJob(null);
            }
          }}
          onStatusChange={
            handleJobStatusChange
          }
        />
      )}
    </main>
  );
}


/* =========================================================
   JOB DETAILS DRAWER
   ========================================================= */

interface JobDetailsDrawerProps {
  job: AdminJob;
  actionLoading: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

function JobDetailsDrawer({
  job,
  actionLoading,
  onClose,
  onStatusChange,
}: JobDetailsDrawerProps) {
  const title =
    job.title || "Untitled job";

  const company =
    job.companyName ||
    "Company not provided";

  const jobInitial =
    title.charAt(0).toUpperCase() || "J";

  const isRemoved =
    job.status?.toUpperCase() === "REMOVED";

  return (
    <div
      className="admin-drawer-overlay"
      onClick={onClose}
    >
      <aside
        className="admin-user-drawer admin-job-drawer"
        onClick={(event) =>
          event.stopPropagation()
        }
        aria-label="Job details"
      >
        {/* HEADER */}

        <div className="admin-drawer-header">
          <div>
            <span className="admin-drawer-eyebrow">
              JOB LISTING
            </span>

            <h2>Job Details</h2>

            <p>
              Review listing information and
              manage job availability.
            </p>
          </div>

          <button
            type="button"
            className="admin-drawer-close"
            onClick={onClose}
            disabled={actionLoading}
            aria-label="Close job details"
          >
            ×
          </button>
        </div>

        {/* JOB PROFILE */}

        <div className="admin-drawer-profile admin-job-profile">
          <div className="admin-drawer-avatar admin-job-avatar">
            {jobInitial}
          </div>

          <div className="admin-drawer-profile-info">
            <h3>{title}</h3>

            <p>{company}</p>

            <div className="admin-drawer-status">
              <AdminStatusBadge
                status={
                  job.status || "UNKNOWN"
                }
              />

              <span className="admin-drawer-role">
                {job.employmentType ||
                  "Job listing"}
              </span>
            </div>
          </div>
        </div>

        {/* POSTING INFORMATION */}

        <div className="admin-job-posting-card">
          <div className="admin-job-posting-item">
            <span>POSTED</span>

            <strong>
              {formatDate(job.createdAt)}
            </strong>
          </div>

          <div className="admin-job-posting-divider" />

          <div className="admin-job-posting-item">
            <span>APPLICATIONS</span>

            <strong>
              {job.applicationCount ?? 0}
            </strong>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}

        <div className="admin-drawer-section">
          {/* DESCRIPTION */}

          <div className="admin-job-section">
            <div className="admin-drawer-section-heading">
              <span>JOB DESCRIPTION</span>
            </div>

            <div className="admin-job-description">
              {job.description
                ? job.description
                : "No job description was provided."}
            </div>
          </div>

          {/* JOB INFORMATION */}

          <div className="admin-job-section">
            <div className="admin-drawer-section-heading">
              <span>JOB INFORMATION</span>
            </div>

            <div className="admin-drawer-details">
              <div className="admin-drawer-detail">
                <span>Company</span>

                <strong>
                  {company}
                </strong>
              </div>

              <div className="admin-drawer-detail">
                <span>Location</span>

                <strong>
                  {job.location ||
                    "Not specified"}
                </strong>
              </div>

              <div className="admin-drawer-detail">
                <span>Employment type</span>

                <strong>
                  {job.employmentType ||
                    "Not specified"}
                </strong>
              </div>

              <div className="admin-drawer-detail">
                <span>Applications</span>

                <strong>
                  {job.applicationCount ?? 0}
                </strong>
              </div>

              <div className="admin-drawer-detail">
                <span>Salary</span>

                <strong>
                  {formatSalary(
                    job.salaryMin,
                    job.salaryMax
                  )}
                </strong>
              </div>

              <div className="admin-drawer-detail">
                <span>Status</span>

                <AdminStatusBadge
                  status={
                    job.status || "UNKNOWN"
                  }
                />
              </div>

              <div className="admin-drawer-detail">
                <span>Posted</span>

                <strong>
                  {formatDate(job.createdAt)}
                </strong>
              </div>

              <div className="admin-drawer-detail admin-drawer-detail-id">
                <span>Job ID</span>

                <strong title={job.id}>
                  {job.id || "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* ADMIN ACTIONS */}

          <div className="admin-job-section admin-job-admin-section">
            <div className="admin-drawer-section-heading">
              <span>ADMINISTRATIVE ACTIONS</span>
            </div>

            <div className="admin-job-action-card">
              <div>
                <strong>
                  {isRemoved
                    ? "Restore this job"
                    : "Manage job visibility"}
                </strong>

                <p>
                  {isRemoved
                    ? "Restore the listing so it can become accessible to normal users again."
                    : "Removing a job hides it from normal users without deleting the listing or its application history."}
                </p>
              </div>

              {isRemoved ? (
                <button
                  type="button"
                  className="admin-job-action-primary"
                  onClick={() =>
                    onStatusChange("ACTIVE")
                  }
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Restoring..."
                    : "Restore Job"}
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-job-action-danger"
                  onClick={() =>
                    onStatusChange("REMOVED")
                  }
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Removing..."
                    : "Remove Job"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="admin-drawer-footer">
          <button
            type="button"
            className="admin-drawer-secondary"
            onClick={onClose}
            disabled={actionLoading}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}


/* =========================================================
   DATE FORMATTER
   ========================================================= */

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


/* =========================================================
   SALARY FORMATTER
   ========================================================= */

function formatSalary(
  minimum?: number,
  maximum?: number
) {
  if (
    minimum == null &&
    maximum == null
  ) {
    return "Not specified";
  }

  const format = (value: number) =>
    `R ${value.toLocaleString("en-ZA")}`;

  if (
    minimum != null &&
    maximum != null
  ) {
    return `${format(minimum)} – ${format(maximum)}`;
  }

  if (minimum != null) {
    return `${format(minimum)}+`;
  }

  return `Up to ${format(maximum!)}`;
}