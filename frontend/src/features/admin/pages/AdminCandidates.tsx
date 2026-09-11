import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminStatusBadge from "../components/AdminStatusBadge";
import AdminSearch from "../components/AdminSearch";

import { getAdminCandidates } from "../admin.service";
import api from "../../../api/axios";

import type { AdminCandidate } from "../admin.types";

export default function AdminCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCandidate, setSelectedCandidate] =
    useState<AdminCandidate | null>(null);

  const [showActiveOnly, setShowActiveOnly] =
    useState(false);

  useEffect(() => {
    void loadCandidates();
  }, []);

  async function loadCandidates() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminCandidates();

      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates:", err);

      setError("Unable to load candidates.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = candidates;

    if (query) {
      result = result.filter((candidate) =>
        [
          candidate.firstName,
          candidate.lastName,
          candidate.email,
          candidate.location,
          candidate.verificationStatus,
          candidate.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (showActiveOnly) {
      result = result.filter(
        (candidate) =>
          candidate.status?.toUpperCase() === "ACTIVE"
      );
    }

    return result;
  }, [candidates, search, showActiveOnly]);

  const verifiedCount = candidates.filter(
    (candidate) =>
      candidate.verificationStatus?.toUpperCase() ===
      "VERIFIED"
  ).length;

  const activeCount = candidates.filter(
    (candidate) =>
      candidate.status?.toUpperCase() === "ACTIVE"
  ).length;

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="PEOPLE"
        title="Candidates"
        description="Manage professional profiles and monitor candidate activity across TruCity."
      />

      {/* SUMMARY */}

      <section className="admin-list-summary admin-candidate-summary">
        <div>
          <strong>{candidates.length}</strong>
          <span>Total candidates</span>
        </div>

        <div>
          <strong>{verifiedCount}</strong>
          <span>Verified profiles</span>
        </div>

        <div>
          <strong>{activeCount}</strong>
          <span>Active candidates</span>
        </div>
      </section>

      {/* SEARCH / FILTER */}

      <section className="admin-list-toolbar">
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search candidates..."
        />

        <button
          type="button"
          className={`admin-filter-button ${
            showActiveOnly ? "active" : ""
          }`}
          onClick={() =>
            setShowActiveOnly((current) => !current)
          }
        >
          {showActiveOnly ? "All candidates" : "Active only"}
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
            <h2>Candidate Profiles</h2>

            <p>
              Review and manage registered candidates.
            </p>
          </div>

          <span className="admin-table-count">
            {filteredCandidates.length}{" "}
            {filteredCandidates.length === 1
              ? "result"
              : "results"}
          </span>
        </div>

        {loading ? (
          <div className="admin-table-state">
            Loading candidates...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="admin-table-state">
            <strong>No candidates found</strong>

            <p>
              Try changing your search criteria.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.map(
                  (candidate) => {
                    const firstName =
                      candidate.firstName || "";

                    const lastName =
                      candidate.lastName || "";

                    const fullName =
                      `${firstName} ${lastName}`.trim() ||
                      "Unnamed candidate";

                    const initials =
                      `${firstName.charAt(0)}${lastName.charAt(0)}`
                        .trim()
                        .toUpperCase() || "?";

                    return (
                      <tr key={candidate.id}>
                        {/* Candidate */}

                        <td>
                          <div className="admin-person">
                            <div className="admin-person-avatar">
                              {initials}
                            </div>

                            <div>
                              <strong>
                                {fullName}
                              </strong>

                              <span>
                                Candidate
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}

                        <td>
                          {candidate.email ||
                            "Not provided"}
                        </td>

                        {/* Location */}

                        <td>
                          {candidate.location ||
                            "Not provided"}
                        </td>

                        {/* Verification */}

                        <td>
                          <AdminStatusBadge
                            status={
                              candidate.verificationStatus ||
                              "UNVERIFIED"
                            }
                          />
                        </td>

                        {/* Status */}

                        <td>
                          <AdminStatusBadge
                            status={
                              candidate.status ||
                              "UNKNOWN"
                            }
                          />
                        </td>

                        {/* Joined */}

                        <td>
                          {formatDate(
                            candidate.createdAt
                          )}
                        </td>

                        {/* Action */}

                        <td>
                          <button
                            type="button"
                            className="admin-row-action"
                            onClick={() =>
                              setSelectedCandidate(
                                candidate
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CANDIDATE DETAILS DRAWER */}

      {selectedCandidate && (
        <CandidateDetailsDrawer
          candidate={selectedCandidate}
          onClose={() =>
            setSelectedCandidate(null)
          }
          onMessage={async () => {
            try {
              /*
               * Create a real conversation with this candidate.
               *
               * The backend will reuse the existing conversation
               * if one already exists, so repeatedly clicking
               * Message Candidate will not create duplicates.
               */
              const response = await api.post(
                "/api/messages/conversations",
                {
                  targetType: "CANDIDATE",
                  targetId: selectedCandidate.id,
                }
              );

              const conversationId =
                response.data?.id;

              setSelectedCandidate(null);

              /*
               * Go directly to the Messages page.
               *
               * The conversation is now persisted in PostgreSQL.
               */
              if (conversationId) {
                navigate(
                  `/admin/messages?conversationId=${conversationId}`
                );
              } else {
                navigate("/admin/messages");
              }
            } catch (err) {
              console.error(
                "Failed to start candidate conversation:",
                err
              );

              setError(
                "Unable to start a conversation with this candidate."
              );
            }
          }}
        />
      )}
    </main>
  );
}


/* =========================================================
   CANDIDATE DETAILS DRAWER
   ========================================================= */

interface CandidateDetailsDrawerProps {
  candidate: AdminCandidate;
  onClose: () => void;
  onMessage: () => Promise<void>;
}

function CandidateDetailsDrawer({
  candidate,
  onClose,
  onMessage,
}: CandidateDetailsDrawerProps) {
  const firstName = candidate.firstName || "";
  const lastName = candidate.lastName || "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    "Unnamed candidate";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .trim()
      .toUpperCase() || "?";

  return (
    <div
      className="admin-drawer-overlay"
      onClick={onClose}
    >
      <aside
        className="admin-user-drawer admin-candidate-drawer"
        onClick={(event) =>
          event.stopPropagation()
        }
        aria-label="Candidate details"
      >
        {/* HEADER */}

        <div className="admin-drawer-header">
          <div>
            <span className="admin-drawer-eyebrow">
              CANDIDATE PROFILE
            </span>

            <h2>Candidate Details</h2>

            <p>
              Review professional profile and account information.
            </p>
          </div>

          <button
            type="button"
            className="admin-drawer-close"
            onClick={onClose}
            aria-label="Close candidate details"
          >
            ×
          </button>
        </div>

        {/* PROFILE */}

        <div className="admin-drawer-profile admin-candidate-profile">
          <div className="admin-drawer-avatar admin-candidate-avatar">
            {initials}
          </div>

          <div className="admin-drawer-profile-info">
            <h3>{fullName}</h3>

            <p>
              {candidate.email ||
                "No email available"}
            </p>

            <div className="admin-drawer-status">
              <AdminStatusBadge
                status={
                  candidate.status ||
                  "UNKNOWN"
                }
              />

              <span className="admin-drawer-role">
                Candidate
              </span>
            </div>
          </div>
        </div>

        {/* VERIFICATION */}

        <div className="admin-candidate-verification">
          <div className="admin-candidate-verification-label">
            <span>PROFILE VERIFICATION</span>

            <strong>
              {candidate.verificationStatus ||
                "UNVERIFIED"}
            </strong>
          </div>

          <AdminStatusBadge
            status={
              candidate.verificationStatus ||
              "UNVERIFIED"
            }
          />
        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="admin-drawer-section">
          <div className="admin-drawer-section-heading">
            <span>PROFILE INFORMATION</span>
          </div>

          <div className="admin-drawer-details">
            <div className="admin-drawer-detail">
              <span>First name</span>

              <strong>
                {candidate.firstName || "—"}
              </strong>
            </div>

            <div className="admin-drawer-detail">
              <span>Last name</span>

              <strong>
                {candidate.lastName || "—"}
              </strong>
            </div>

            <div className="admin-drawer-detail">
              <span>Email address</span>

              <strong>
                {candidate.email || "—"}
              </strong>
            </div>

            <div className="admin-drawer-detail">
              <span>Location</span>

              <strong>
                {candidate.location ||
                  "Not provided"}
              </strong>
            </div>

            <div className="admin-drawer-detail">
              <span>Account status</span>

              <AdminStatusBadge
                status={
                  candidate.status ||
                  "UNKNOWN"
                }
              />
            </div>

            <div className="admin-drawer-detail">
              <span>Verification</span>

              <AdminStatusBadge
                status={
                  candidate.verificationStatus ||
                  "UNVERIFIED"
                }
              />
            </div>

            <div className="admin-drawer-detail">
              <span>Joined</span>

              <strong>
                {formatDate(
                  candidate.createdAt
                )}
              </strong>
            </div>

            <div className="admin-drawer-detail admin-drawer-detail-id">
              <span>Candidate ID</span>

              <strong title={candidate.id}>
                {candidate.id || "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="admin-drawer-footer">
          <button
            type="button"
            className="admin-drawer-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="admin-drawer-primary"
            onClick={() => {
              void onMessage();
            }}
          >
            <span aria-hidden="true">✉</span>
            Message Candidate
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
