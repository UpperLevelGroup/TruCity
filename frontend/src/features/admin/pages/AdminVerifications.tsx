import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminSearch from "../components/AdminSearch";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";

import {
  getAdminVerifications,
  reviewAdminVerification,
} from "../admin.service";

import type {
  AdminVerification,
} from "../admin.types";


export default function AdminVerifications() {
  const [verifications, setVerifications] =
    useState<AdminVerification[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedVerification, setSelectedVerification] =
    useState<AdminVerification | null>(null);

  const [reviewMode, setReviewMode] =
    useState(false);

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [showPendingOnly, setShowPendingOnly] =
    useState(false);


  /*
   * =========================================================
   * LOAD
   * =========================================================
   */

  async function loadVerifications() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminVerifications();

      console.log(
        "ADMIN VERIFICATIONS:",
        data
      );

      setVerifications(data);
    } catch (err) {
      console.error(
        "Failed to load verifications:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load verifications."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadVerifications();
  }, []);


  /*
   * =========================================================
   * SEARCH + FILTER
   * =========================================================
   */

  const filteredVerifications =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      let result =
        verifications;

      if (value) {
        result =
          result.filter(
            (verification) =>
              [
                verification.candidateName,
                verification.email,
                verification.verificationType,
                verification.status,
                verification.submittedAt,
                verification.verifierName,
                verification.result,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(value)
          );
      }

      if (showPendingOnly) {
        result =
          result.filter(
            (verification) => {
              const status =
                verification.status
                  ?.toLowerCase();

              return (
                status === "pending" ||
                status === "review" ||
                status === "in_progress" ||
                status === "in progress"
              );
            }
          );
      }

      return result;
    }, [
      search,
      verifications,
      showPendingOnly,
    ]);


  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const totalVerifications =
    verifications.length;

  const verifiedVerifications =
    verifications.filter(
      (verification) =>
        verification.status
          ?.toLowerCase() ===
        "verified"
    ).length;

  const pendingVerifications =
    verifications.filter(
      (verification) =>
        verification.status
          ?.toLowerCase() ===
        "pending"
    ).length;

  const reviewVerifications =
    verifications.filter(
      (verification) =>
        [
          "review",
          "in_progress",
          "in progress",
        ].includes(
          verification.status
            ?.toLowerCase() || ""
        )
    ).length;


  /*
   * =========================================================
   * OPEN VIEW
   * =========================================================
   */

  function openView(
    verification: AdminVerification
  ) {
    setSelectedVerification(
      verification
    );

    setReviewMode(false);

    setNotes(
      verification.notes || ""
    );
  }


  /*
   * =========================================================
   * OPEN REVIEW
   * =========================================================
   */

  function openReview(
    verification: AdminVerification
  ) {
    setSelectedVerification(
      verification
    );

    setReviewMode(true);

    setNotes(
      verification.notes || ""
    );
  }


  /*
   * =========================================================
   * CLOSE DRAWER
   * =========================================================
   */

  function closeDrawer() {
    if (saving) {
      return;
    }

    setSelectedVerification(null);
    setReviewMode(false);
    setNotes("");
  }


  /*
   * =========================================================
   * UPDATE STATUS
   * =========================================================
   */

  async function updateStatus(
    status: string
  ) {
    if (!selectedVerification) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated =
        await reviewAdminVerification(
          selectedVerification.id,
          {
            status,
            notes,
          }
        );

      setVerifications(
        (current) =>
          current.map(
            (verification) =>
              verification.id ===
              updated.id
                ? updated
                : verification
          )
      );

      setSelectedVerification(
        updated
      );

      setReviewMode(false);
    } catch (err) {
      console.error(
        "Failed to update verification:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update verification."
      );
    } finally {
      setSaving(false);
    }
  }


  /*
   * =========================================================
   * TABLE
   * =========================================================
   */

  const columns = [
    {
      key: "person",
      label: "Subject",

      render: (
        verification: AdminVerification
      ) => {
        const candidateName =
          verification.candidateName ||
          "Unnamed candidate";

        const initials =
          candidateName
            .split(" ")
            .filter(Boolean)
            .map(
              (part) =>
                part.charAt(0)
            )
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
                {verification.email ||
                  "No email available"}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      key: "type",
      label: "Verification Type",

      render: (
        verification: AdminVerification
      ) => (
        <span>
          {formatVerificationType(
            verification.verificationType
          )}
        </span>
      ),
    },

    {
      key: "submittedAt",
      label: "Submitted",

      render: (
        verification: AdminVerification
      ) => (
        <span>
          {formatDate(
            verification.submittedAt
          )}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (
        verification: AdminVerification
      ) => (
        <AdminStatusBadge
          status={formatStatus(
            verification.status
          )}
        />
      ),
    },

    {
      key: "actions",
      label: "",

      render: (
        verification: AdminVerification
      ) => {
        const status =
          verification.status
            ?.toLowerCase();

        const canReview =
          status === "pending" ||
          status === "in_progress" ||
          status === "in progress" ||
          status === "review";

        return (
          <button
            type="button"
            className="admin-row-action"
            onClick={() =>
              canReview
                ? openReview(
                    verification
                  )
                : openView(
                    verification
                  )
            }
          >
            {canReview
              ? "Review"
              : "View"}
          </button>
        );
      },
    },
  ];


  /*
   * =========================================================
   * SELECTED VERIFICATION
   * =========================================================
   */

  const selectedCandidateName =
    selectedVerification?.candidateName ||
    "Unnamed candidate";

  const selectedCandidateInitials =
    selectedCandidateName
      .split(" ")
      .filter(Boolean)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const selectedStatus =
    selectedVerification?.status ||
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
        title="Verifications"
        description="Review identity, qualification and employment verification activity across TruCity."
      />


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="admin-list-summary">

        <div>
          <strong>
            {loading
              ? "—"
              : totalVerifications}
          </strong>

          <span>
            Total requests
          </span>
        </div>


        <div>
          <strong>
            {loading
              ? "—"
              : verifiedVerifications}
          </strong>

          <span>
            Verified
          </span>
        </div>


        <div>
          <strong>
            {loading
              ? "—"
              : pendingVerifications}
          </strong>

          <span>
            Pending
          </span>
        </div>


        <div>
          <strong>
            {loading
              ? "—"
              : reviewVerifications}
          </strong>

          <span>
            Under review
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
          placeholder="Search verifications..."
        />

        <button
          type="button"
          className={`admin-filter-button ${
            showPendingOnly
              ? "active"
              : ""
          }`}
          onClick={() =>
            setShowPendingOnly(
              (current) => !current
            )
          }
        >
          {showPendingOnly
            ? "All verifications"
            : "Needs review"}
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
              Verification Queue
            </h2>

            <p>
              Review submitted verification
              requests and their current status.
            </p>
          </div>

          <span className="admin-table-count">
            {loading
              ? "Loading..."
              : `${filteredVerifications.length} ${
                  filteredVerifications.length ===
                  1
                    ? "result"
                    : "results"
                }`}
          </span>

        </div>


        {loading ? (
          <div className="admin-table-state">
            Loading verifications...
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredVerifications}
            emptyMessage="No verification requests found."
          />
        )}

      </section>


      {/* =====================================================
          VERIFICATION DRAWER
          ===================================================== */}

      {selectedVerification && (

        <div
          className="admin-drawer-overlay"
          onClick={closeDrawer}
        >

          <aside
            className="admin-user-drawer admin-verification-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
            aria-label="Verification details"
          >

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="admin-drawer-header">

              <div>

                <span className="admin-drawer-eyebrow">
                  VERIFICATION DETAILS
                </span>

                <h2>
                  {formatVerificationType(
                    selectedVerification.verificationType
                  )}
                </h2>

                <p>
                  Review verification evidence,
                  status and administrative notes.
                </p>

              </div>


              <button
                type="button"
                className="admin-drawer-close"
                onClick={closeDrawer}
                disabled={saving}
                aria-label="Close verification details"
              >
                ×
              </button>

            </div>


            {/* =================================================
                CANDIDATE PROFILE
                ================================================= */}

            <div className="admin-drawer-profile admin-verification-profile">

              <div className="admin-drawer-avatar admin-verification-avatar">
                {selectedCandidateInitials}
              </div>


              <div className="admin-drawer-profile-info">

                <h3>
                  {selectedCandidateName}
                </h3>

                <p>
                  {selectedVerification.email ||
                    "No email available"}
                </p>


                <div className="admin-drawer-status">

                  <AdminStatusBadge
                    status={formatStatus(
                      selectedStatus
                    )}
                  />

                  <span className="admin-drawer-role">
                    Verification
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                CONTENT
                ================================================= */}

            <div className="admin-drawer-section">

              {/* =================================================
                  VERIFICATION SUMMARY
                  ================================================= */}

              <div className="admin-drawer-section-heading">
                <span>
                  VERIFICATION SUMMARY
                </span>
              </div>


              <div className="admin-verification-summary">

                <div className="admin-verification-summary-item">

                  <span>
                    Type
                  </span>

                  <strong>
                    {formatVerificationType(
                      selectedVerification.verificationType
                    )}
                  </strong>

                </div>


                <div className="admin-verification-summary-divider" />


                <div className="admin-verification-summary-item">

                  <span>
                    Status
                  </span>

                  <AdminStatusBadge
                    status={formatStatus(
                      selectedStatus
                    )}
                  />

                </div>


                <div className="admin-verification-summary-divider" />


                <div className="admin-verification-summary-item">

                  <span>
                    Submitted
                  </span>

                  <strong>
                    {formatDate(
                      selectedVerification.submittedAt
                    )}
                  </strong>

                </div>

              </div>


              {/* =================================================
                  VERIFICATION INFORMATION
                  ================================================= */}

              <div className="admin-drawer-section-heading admin-verification-heading-spaced">

                <span>
                  VERIFICATION INFORMATION
                </span>

              </div>


              <div className="admin-drawer-details">

                <div className="admin-drawer-detail">

                  <span>
                    Candidate
                  </span>

                  <strong>
                    {selectedVerification.candidateName ||
                      "—"}
                  </strong>

                </div>


                <div className="admin-drawer-detail">

                  <span>
                    Email address
                  </span>

                  <strong>
                    {selectedVerification.email ||
                      "—"}
                  </strong>

                </div>


                <div className="admin-drawer-detail">

                  <span>
                    Verification type
                  </span>

                  <strong>
                    {formatVerificationType(
                      selectedVerification.verificationType
                    )}
                  </strong>

                </div>


                <div className="admin-drawer-detail">

                  <span>
                    Submitted
                  </span>

                  <strong>
                    {formatDate(
                      selectedVerification.submittedAt
                    )}
                  </strong>

                </div>


                <div className="admin-drawer-detail">

                  <span>
                    Verifier
                  </span>

                  <strong>
                    {selectedVerification.verifierName ||
                      "Not reviewed"}
                  </strong>

                </div>


                <div className="admin-drawer-detail">

                  <span>
                    Current status
                  </span>

                  <AdminStatusBadge
                    status={formatStatus(
                      selectedStatus
                    )}
                  />

                </div>

              </div>


              {/* =================================================
                  RESULT
                  ================================================= */}

              {selectedVerification.result && (

                <>

                  <div className="admin-drawer-section-heading admin-verification-heading-spaced">

                    <span>
                      VERIFICATION RESULT
                    </span>

                  </div>


                  <div className="admin-verification-result">

                    <div className="admin-verification-result-icon">
                      ✓
                    </div>

                    <div>

                      <span>
                        RESULT
                      </span>

                      <strong>
                        {formatStatus(
                          selectedVerification.result
                        )}
                      </strong>

                    </div>

                  </div>

                </>

              )}


              {/* =================================================
                  EXISTING NOTES
                  ================================================= */}

              {!reviewMode &&
                selectedVerification.notes && (

                <>

                  <div className="admin-drawer-section-heading admin-verification-heading-spaced">

                    <span>
                      REVIEW NOTES
                    </span>

                  </div>


                  <div className="admin-verification-notes">

                    <p>
                      {selectedVerification.notes}
                    </p>

                  </div>

                </>

              )}


              {/* =================================================
                  REVIEW FORM
                  ================================================= */}

              {reviewMode && (

                <>

                  <div className="admin-drawer-section-heading admin-verification-heading-spaced">

                    <span>
                      ADMINISTRATIVE REVIEW
                    </span>

                  </div>


                  <div className="admin-verification-review-card">

                    <label
                      className="admin-form-label"
                      htmlFor="verification-notes"
                    >
                      Review notes
                    </label>


                    <textarea
                      id="verification-notes"
                      className="admin-form-textarea"
                      value={notes}
                      onChange={(event) =>
                        setNotes(
                          event.target.value
                        )
                      }
                      placeholder="Enter verification notes..."
                      rows={6}
                      disabled={saving}
                    />


                    <p className="admin-verification-review-hint">
                      Add any relevant information
                      before approving or rejecting
                      this verification request.
                    </p>

                  </div>

                </>

              )}

            </div>


            {/* =================================================
                FOOTER
                ================================================= */}

            <div className="admin-drawer-footer">

              <button
                type="button"
                className="admin-drawer-secondary"
                onClick={closeDrawer}
                disabled={saving}
              >
                Close
              </button>


              {reviewMode && (

                <div className="admin-verification-actions">

                  <button
                    type="button"
                    className="admin-verification-review-button"
                    disabled={saving}
                    onClick={() =>
                      updateStatus(
                        "IN_PROGRESS"
                      )
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Keep in Review"}
                  </button>


                  <button
                    type="button"
                    className="admin-verification-reject-button"
                    disabled={saving}
                    onClick={() =>
                      updateStatus(
                        "REJECTED"
                      )
                    }
                  >
                    Reject
                  </button>


                  <button
                    type="button"
                    className="admin-verification-approve-button"
                    disabled={saving}
                    onClick={() =>
                      updateStatus(
                        "VERIFIED"
                      )
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Verify"}
                  </button>

                </div>

              )}

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

function formatVerificationType(
  value?: string
) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


function formatStatus(
  value?: string
) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


function formatDate(
  value?: string
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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