import { useEffect, useMemo, useState } from "react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminSearch from "../components/AdminSearch";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";

import { getAdminApplications } from "../admin.service";

import type {
  AdminApplication,
} from "../admin.types";

export default function AdminApplications() {
  const [applications, setApplications] = useState<
    AdminApplication[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState<AdminApplication | null>(null);

  const [showActiveOnly, setShowActiveOnly] =
    useState(false);

  /*
   * =========================================================
   * LOAD APPLICATIONS
   * =========================================================
   */

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminApplications();

        console.log(
          "ADMIN APPLICATIONS:",
          data
        );

        setApplications(data);
      } catch (err) {
        console.error(
          "Failed to load applications:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  /*
   * =========================================================
   * SEARCH + FILTER
   * =========================================================
   */

  const filteredApplications = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    let result = applications;

    if (value) {
      result = result.filter(
        (application) =>
          [
            application.candidateName,
            application.email,
            application.jobTitle,
            application.companyName,
            application.status,
            application.appliedAt,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(value)
      );
    }

    if (showActiveOnly) {
      result = result.filter((application) => {
        const status =
          application.status?.toLowerCase();

        return (
          status === "review" ||
          status === "shortlisted" ||
          status === "interview"
        );
      });
    }

    return result;
  }, [
    search,
    applications,
    showActiveOnly,
  ]);

  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const totalApplications =
    applications.length;

  const reviewApplications =
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "review"
    ).length;

  const shortlistedApplications =
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "shortlisted"
    ).length;

  const interviewApplications =
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "interview"
    ).length;

  /*
   * =========================================================
   * DRAWER
   * =========================================================
   */

  function handleViewApplication(
    application: AdminApplication
  ) {
    setSelectedApplication(application);
  }

  function closeApplicationDetails() {
    setSelectedApplication(null);
  }

  /*
   * =========================================================
   * TABLE COLUMNS
   * =========================================================
   */

  const columns = [
    {
      key: "candidate",
      label: "Candidate",

      render: (
        application: AdminApplication
      ) => {
        const candidateName =
          application.candidateName ||
          "Unnamed candidate";

        const initials =
          candidateName
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?";

        return (
          <div className="admin-person">
            <div className="admin-person-avatar">
              {initials}
            </div>

            <div>
              <strong>
                {candidateName}
              </strong>

              <span>
                {application.email ||
                  "No email available"}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      key: "job",
      label: "Position",

      render: (
        application: AdminApplication
      ) => (
        <div className="admin-table-primary">
          <strong>
            {application.jobTitle ||
              "Untitled position"}
          </strong>

          <span>
            {application.companyName ||
              "Company unavailable"}
          </span>
        </div>
      ),
    },

    {
      key: "appliedAt",
      label: "Applied",

      render: (
        application: AdminApplication
      ) => (
        <span>
          {formatDate(
            application.appliedAt
          )}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (
        application: AdminApplication
      ) => (
        <AdminStatusBadge
          status={
            application.status ||
            "UNKNOWN"
          }
        />
      ),
    },

    {
      key: "actions",
      label: "",

      render: (
        application: AdminApplication
      ) => (
        <button
          type="button"
          className="admin-row-action"
          onClick={() =>
            handleViewApplication(
              application
            )
          }
        >
          View
        </button>
      ),
    },
  ];

  /*
   * =========================================================
   * SELECTED APPLICATION DATA
   * =========================================================
   */

  const selectedCandidateName =
    selectedApplication?.candidateName ||
    "Unnamed candidate";

  const selectedCandidateInitials =
    selectedCandidateName
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const selectedStatus =
    selectedApplication?.status ||
    "UNKNOWN";

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="PLATFORM"
        title="Applications"
        description="Monitor applications submitted to opportunities across the TruCity platform."
      />

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="admin-list-summary">
        <div>
          <strong>
            {loading
              ? "—"
              : totalApplications}
          </strong>

          <span>
            Total applications
          </span>
        </div>

        <div>
          <strong>
            {loading
              ? "—"
              : reviewApplications}
          </strong>

          <span>
            Under review
          </span>
        </div>

        <div>
          <strong>
            {loading
              ? "—"
              : shortlistedApplications}
          </strong>

          <span>
            Shortlisted
          </span>
        </div>

        <div>
          <strong>
            {loading
              ? "—"
              : interviewApplications}
          </strong>

          <span>
            Interviews
          </span>
        </div>
      </section>

      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <section className="admin-list-toolbar">
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search applications..."
        />

        <button
          type="button"
          className={`admin-filter-button ${
            showActiveOnly
              ? "active"
              : ""
          }`}
          onClick={() =>
            setShowActiveOnly(
              (current) => !current
            )
          }
        >
          {showActiveOnly
            ? "All applications"
            : "Active applications"}
        </button>
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* =====================================================
          TABLE
          ===================================================== */}

      <section className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>
              Application Directory
            </h2>

            <p>
              Review candidate applications
              and their current recruitment stage.
            </p>
          </div>

          <span className="admin-table-count">
            {loading
              ? "Loading..."
              : `${filteredApplications.length} ${
                  filteredApplications.length ===
                  1
                    ? "result"
                    : "results"
                }`}
          </span>
        </div>

        {loading ? (
          <div className="admin-table-state">
            Loading applications...
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredApplications}
            emptyMessage="No applications found. Try changing your search criteria."
          />
        )}
      </section>

      {/* =====================================================
          APPLICATION DRAWER
          ===================================================== */}

      {selectedApplication && (
        <div
          className="admin-drawer-overlay"
          onClick={
            closeApplicationDetails
          }
        >
          <aside
            className="admin-user-drawer admin-application-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
            aria-label="Application details"
          >
            {/* =================================================
                DRAWER HEADER
                ================================================= */}

            <div className="admin-drawer-header">
              <div>
                <span className="admin-drawer-eyebrow">
                  APPLICATION DETAILS
                </span>

                <h2>
                  Application Profile
                </h2>

                <p>
                  Review the candidate,
                  position and application
                  status.
                </p>
              </div>

              <button
                type="button"
                className="admin-drawer-close"
                onClick={
                  closeApplicationDetails
                }
                aria-label="Close application details"
              >
                ×
              </button>
            </div>

            {/* =================================================
                CANDIDATE PROFILE
                ================================================= */}

            <div className="admin-drawer-profile admin-application-profile">
              <div className="admin-drawer-avatar admin-application-avatar">
                {selectedCandidateInitials}
              </div>

              <div className="admin-drawer-profile-info">
                <h3>
                  {selectedCandidateName}
                </h3>

                <p>
                  {selectedApplication.email ||
                    "No email available"}
                </p>

                <div className="admin-drawer-status">
                  <AdminStatusBadge
                    status={selectedStatus}
                  />

                  <span className="admin-drawer-role">
                    Applicant
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                APPLICATION SUMMARY
                ================================================= */}

            <div className="admin-drawer-section">
              <div className="admin-drawer-section-heading">
                <span>
                  APPLICATION SUMMARY
                </span>
              </div>

              <div className="admin-application-summary">
                <div className="admin-application-summary-item">
                  <span>
                    Position
                  </span>

                  <strong>
                    {selectedApplication.jobTitle ||
                      "Untitled position"}
                  </strong>
                </div>

                <div className="admin-application-summary-divider" />

                <div className="admin-application-summary-item">
                  <span>
                    Company
                  </span>

                  <strong>
                    {selectedApplication.companyName ||
                      "Company unavailable"}
                  </strong>
                </div>

                <div className="admin-application-summary-divider" />

                <div className="admin-application-summary-item">
                  <span>
                    Applied
                  </span>

                  <strong>
                    {formatDate(
                      selectedApplication.appliedAt
                    )}
                  </strong>
                </div>
              </div>

              {/* =================================================
                  CANDIDATE INFORMATION
                  ================================================= */}

              <div className="admin-drawer-section-heading admin-application-heading-spaced">
                <span>
                  CANDIDATE INFORMATION
                </span>
              </div>

              <div className="admin-drawer-details">
                <div className="admin-drawer-detail">
                  <span>
                    Candidate
                  </span>

                  <strong>
                    {selectedApplication.candidateName ||
                      "—"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>
                    Email address
                  </span>

                  <strong>
                    {selectedApplication.email ||
                      "—"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>
                    Application status
                  </span>

                  <AdminStatusBadge
                    status={selectedStatus}
                  />
                </div>

                <div className="admin-drawer-detail">
                  <span>
                    Applied
                  </span>

                  <strong>
                    {formatDate(
                      selectedApplication.appliedAt
                    )}
                  </strong>
                </div>
              </div>

              {/* =================================================
                  POSITION INFORMATION
                  ================================================= */}

              <div className="admin-drawer-section-heading admin-application-heading-spaced">
                <span>
                  POSITION INFORMATION
                </span>
              </div>

              <div className="admin-drawer-details">
                <div className="admin-drawer-detail">
                  <span>
                    Job title
                  </span>

                  <strong>
                    {selectedApplication.jobTitle ||
                      "—"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>
                    Company
                  </span>

                  <strong>
                    {selectedApplication.companyName ||
                      "—"}
                  </strong>
                </div>
              </div>

              {/* =================================================
                  APPLICATION ID
                  ================================================= */}

              <div className="admin-application-id-card">
                <span>
                  APPLICATION ID
                </span>

                <strong
                  title={
                    getApplicationId(
                      selectedApplication
                    ) || undefined
                  }
                >
                  {getApplicationId(
                    selectedApplication
                  ) || "Not available"}
                </strong>
              </div>
            </div>

            {/* =================================================
                FOOTER
                ================================================= */}

            <div className="admin-drawer-footer">
              <button
                type="button"
                className="admin-drawer-secondary"
                onClick={
                  closeApplicationDetails
                }
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

/*
 * AdminApplication may have an ID depending
 * on the current backend response. This safely
 * supports either id or applicationId without
 * requiring a type change.
 */

function getApplicationId(
  application: AdminApplication
) {
  const record =
    application as AdminApplication & {
      id?: string;
      applicationId?: string;
    };

  return (
    record.id ||
    record.applicationId ||
    ""
  );
}