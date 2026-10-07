import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminStatusBadge from "../components/AdminStatusBadge";
import AdminSearch from "../components/AdminSearch";

import { getAdminCandidates } from "../admin.service";
import api from "../../../api/axios";

import type { AdminCandidate } from "../admin.types";

/* =========================================================
   ADMIN CANDIDATE DETAIL TYPES
   ========================================================= */

interface CandidateSkillDetail {
  name: string;
  proficiency?: string | null;
  yearsUsed?: number | null;
}

interface CandidateQualificationDetail {
  id: string;
  institution?: string | null;
  qualificationName?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  completionYear?: number | null;
  verificationStatus?: string | null;
}

interface CandidateExperienceDetail {
  id: string;
  companyName?: string | null;
  jobTitle?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface CandidateGalleryImageDetail {
  id: string;
  name: string;
  category: string;
  image: string;
  uploadedAt: string;
}

interface CandidateDocumentDetail {
  id: number;
  name: string;
  status: string;
  fileName?: string | null;
  fileSize?: string | null;
  dataUrl?: string | null;
}

interface CandidateProjectDetail {
  id: number;
  name: string;
  tech: string;
  status: string;
  desc: string;
}

interface CandidateReelDetail {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  dataUrl?: string | null;
}

interface CandidatePreferencesDetail {
  availability?: string | null;
}

interface AdminCandidateMedia {
  facePhoto?: string | null;
  fullBodyPhoto?: string | null;
  galleryImages: CandidateGalleryImageDetail[];
  documents: CandidateDocumentDetail[];
  projects: CandidateProjectDetail[];
  reelMeta?: CandidateReelDetail | null;
  preferences?: CandidatePreferencesDetail | null;
}

interface AdminCandidateDetails {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  yearsExperience: number;
  profileCompletion?: number | null;
  verified: boolean;
  skills: CandidateSkillDetail[];
  qualifications: CandidateQualificationDetail[];
  experienceHistory: CandidateExperienceDetail[];
  media: AdminCandidateMedia;
}

/* =========================================================
   PAGE
   ========================================================= */

export default function AdminCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCandidate, setSelectedCandidate] =
    useState<AdminCandidate | null>(null);

  const [candidateDetails, setCandidateDetails] =
    useState<AdminCandidateDetails | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [selectedDocument, setSelectedDocument] =
    useState<CandidateDocumentDetail | null>(null);

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

  async function loadCandidateDetails(candidate: AdminCandidate) {
    try {
      setSelectedCandidate(candidate);
      setCandidateDetails(null);
      setDetailsError("");
      setDetailsLoading(true);

      const response = await api.get<AdminCandidateDetails>(
        `/admin/candidates/${candidate.id}/details`
      );

      if (!response.data || typeof response.data !== "object") {
        throw new Error(
          "The server returned invalid candidate details."
        );
      }

      const normalized: AdminCandidateDetails = {
        ...response.data,
        skills: Array.isArray(response.data.skills)
          ? response.data.skills
          : [],
        qualifications: Array.isArray(
          response.data.qualifications
        )
          ? response.data.qualifications
          : [],
        experienceHistory: Array.isArray(
          response.data.experienceHistory
        )
          ? response.data.experienceHistory
          : [],
        media: {
          facePhoto:
            response.data.media?.facePhoto ?? null,
          fullBodyPhoto:
            response.data.media?.fullBodyPhoto ?? null,
          galleryImages: Array.isArray(
            response.data.media?.galleryImages
          )
            ? response.data.media.galleryImages
            : [],
          documents: Array.isArray(
            response.data.media?.documents
          )
            ? response.data.media.documents
            : [],
          projects: Array.isArray(
            response.data.media?.projects
          )
            ? response.data.media.projects
            : [],
          reelMeta:
            response.data.media?.reelMeta ?? null,
          preferences:
            response.data.media?.preferences ?? null,
        },
      };

      setCandidateDetails(normalized);
    } catch (err) {
      console.error(
        "Failed to load candidate details:",
        err
      );

      setDetailsError(
        "Unable to load the candidate's complete profile."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeCandidateDrawer() {
    setSelectedCandidate(null);
    setCandidateDetails(null);
    setDetailsError("");
    setSelectedDocument(null);
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
          {showActiveOnly
            ? "All candidates"
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

                        <td>
                          {candidate.email ||
                            "Not provided"}
                        </td>

                        <td>
                          {candidate.location ||
                            "Not provided"}
                        </td>

                        <td>
                          <AdminStatusBadge
                            status={
                              candidate.verificationStatus ||
                              "UNVERIFIED"
                            }
                          />
                        </td>

                        <td>
                          <AdminStatusBadge
                            status={
                              candidate.status ||
                              "UNKNOWN"
                            }
                          />
                        </td>

                        <td>
                          {formatDate(
                            candidate.createdAt
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-row-action"
                            onClick={() => {
                              void loadCandidateDetails(
                                candidate
                              );
                            }}
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
          details={candidateDetails}
          loading={detailsLoading}
          error={detailsError}
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
          onClose={closeCandidateDrawer}
          onMessage={async () => {
            try {
              const response = await api.post(
                "/api/messages/conversations",
                {
                  targetType: "CANDIDATE",
                  targetId: selectedCandidate.id,
                }
              );

              const conversationId =
                response.data?.id;

              closeCandidateDrawer();

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
  details: AdminCandidateDetails | null;
  loading: boolean;
  error: string;
  selectedDocument: CandidateDocumentDetail | null;
  onSelectDocument: (
    document: CandidateDocumentDetail | null
  ) => void;
  onClose: () => void;
  onMessage: () => Promise<void>;
}

function CandidateDetailsDrawer({
  candidate,
  details,
  loading,
  error,
  selectedDocument,
  onSelectDocument,
  onClose,
  onMessage,
}: CandidateDetailsDrawerProps) {
  const firstName =
    details?.firstName ??
    candidate.firstName ??
    "";

  const lastName =
    details?.lastName ??
    candidate.lastName ??
    "";

  const fullName =
    details?.name ||
    `${firstName} ${lastName}`.trim() ||
    "Unnamed candidate";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .trim()
      .toUpperCase() || "?";

  const profilePhoto =
    details?.media?.facePhoto || null;

  const profileCompletion =
    typeof details?.profileCompletion ===
    "number"
      ? Math.max(
          0,
          Math.min(100, details.profileCompletion)
        )
      : null;

  const documents =
    details?.media?.documents ?? [];

  const galleryImages =
    details?.media?.galleryImages ?? [];

  const projects =
    details?.media?.projects ?? [];

  const skills =
    details?.skills ?? [];

  const qualifications =
    details?.qualifications ?? [];

  const experienceHistory =
    details?.experienceHistory ?? [];

  return (
    <>
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
                Complete professional profile and
                account information.
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

          {/* PROFILE HEADER */}

          <div className="admin-drawer-profile admin-candidate-profile">
            <div
              className="admin-drawer-avatar admin-candidate-avatar"
              style={{
                overflow: "hidden",
                padding: 0,
              }}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={`${fullName} profile`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initials
              )}
            </div>

            <div className="admin-drawer-profile-info">
              <h3>{fullName}</h3>

              <p>
                {details?.headline ||
                  "Professional candidate"}
              </p>

              <p>
                {details?.location ||
                  candidate.location ||
                  "Location not provided"}
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

          {/* LOADING */}

          {loading && (
            <div className="admin-table-state">
              Loading complete candidate profile...
            </div>
          )}

          {/* ERROR */}

          {error && !loading && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {/* DETAILS */}

          {!loading && details && (
            <>
              {/* PROFILE COMPLETION */}

              <div className="admin-candidate-completion">
                <div className="admin-candidate-completion-header">
                  <div>
                    <span>
                      PROFILE COMPLETION
                    </span>

                    <strong>
                      {profileCompletion !== null
                        ? `${profileCompletion}%`
                        : "Not available"}
                    </strong>
                  </div>
                </div>

                {profileCompletion !== null && (
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      borderRadius: 999,
                      background: "#E5E7EB",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${profileCompletion}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "#1E92D2",
                        transition:
                          "width 0.3s ease",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* VERIFICATION */}

              <div className="admin-candidate-verification">
                <div className="admin-candidate-verification-label">
                  <span>
                    PROFILE VERIFICATION
                  </span>

                  <strong>
                    {candidate.verificationStatus ||
                      (details.verified
                        ? "VERIFIED"
                        : "UNVERIFIED")}
                  </strong>
                </div>

                <AdminStatusBadge
                  status={
                    candidate.verificationStatus ||
                    (details.verified
                      ? "VERIFIED"
                      : "UNVERIFIED")
                  }
                />
              </div>

              {/* PERSONAL INFORMATION */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    PERSONAL INFORMATION
                  </span>
                </div>

                <div className="admin-drawer-details">
                  <CandidateDetail
                    label="First name"
                    value={
                      details.firstName ||
                      "Not provided"
                    }
                  />

                  <CandidateDetail
                    label="Last name"
                    value={
                      details.lastName ||
                      "Not provided"
                    }
                  />

                  <CandidateDetail
                    label="Email address"
                    value={
                      details.email ||
                      candidate.email ||
                      "Not provided"
                    }
                  />

                  <CandidateDetail
                    label="Phone"
                    value={
                      details.phone ||
                      "Not provided"
                    }
                  />

                  <CandidateDetail
                    label="Location"
                    value={
                      details.location ||
                      candidate.location ||
                      "Not provided"
                    }
                  />

                  <CandidateDetail
                    label="Years of experience"
                    value={
                      details.yearsExperience > 0
                        ? `${details.yearsExperience} ${
                            details.yearsExperience ===
                            1
                              ? "year"
                              : "years"
                          }`
                        : "Not provided"
                    }
                  />
                </div>
              </div>

              {/* PROFESSIONAL PROFILE */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    PROFESSIONAL PROFILE
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div>
                    <span className="admin-detail-label">
                      Professional headline
                    </span>

                    <strong
                      style={{
                        display: "block",
                        marginTop: 5,
                        color: "#00273D",
                      }}
                    >
                      {details.headline ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span className="admin-detail-label">
                      Professional summary
                    </span>

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#475569",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {details.bio ||
                        "No professional summary has been provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* SKILLS */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    SKILLS
                  </span>

                  <strong>
                    {skills.length}
                  </strong>
                </div>

                {skills.length === 0 ? (
                  <EmptySection text="No skills have been added." />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {skills.map((skill) => (
                      <div
                        key={`${skill.name}-${skill.yearsUsed ?? "na"}`}
                        style={{
                          border:
                            "1px solid #D4D2E6",
                          borderRadius: 10,
                          padding:
                            "8px 10px",
                          background:
                            "#F8FCFF",
                        }}
                      >
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              "#00273D",
                            fontSize: 13,
                          }}
                        >
                          {skill.name}
                        </strong>

                        {(skill.proficiency ||
                          skill.yearsUsed !==
                            null) && (
                          <span
                            style={{
                              display:
                                "block",
                              marginTop: 3,
                              color:
                                "#64748B",
                              fontSize: 11,
                            }}
                          >
                            {skill.proficiency ||
                              "Skill"}
                            {skill.yearsUsed !==
                              null &&
                              skill.yearsUsed !==
                                undefined
                              ? ` • ${skill.yearsUsed} ${
                                  skill.yearsUsed ===
                                  1
                                    ? "yr"
                                    : "yrs"
                                }`
                              : ""}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUALIFICATIONS */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    QUALIFICATIONS
                  </span>

                  <strong>
                    {qualifications.length}
                  </strong>
                </div>

                {qualifications.length ===
                0 ? (
                  <EmptySection text="No qualifications have been added." />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 10,
                    }}
                  >
                    {qualifications.map(
                      (qualification) => (
                        <div
                          key={
                            qualification.id
                          }
                          className="admin-candidate-item-card"
                        >
                          <strong>
                            {qualification.qualificationName ||
                              "Qualification"}
                          </strong>

                          <span>
                            {qualification.institution ||
                              "Institution not provided"}
                          </span>

                          {qualification.fieldOfStudy && (
                            <span>
                              {
                                qualification.fieldOfStudy
                              }
                            </span>
                          )}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap: 8,
                              marginTop: 7,
                              alignItems:
                                "center",
                            }}
                          >
                            <span>
                              {formatYearRange(
                                qualification.startYear,
                                qualification.completionYear
                              )}
                            </span>

                            {qualification.verificationStatus && (
                              <AdminStatusBadge
                                status={
                                  qualification.verificationStatus
                                }
                              />
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* EXPERIENCE */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    WORK EXPERIENCE
                  </span>

                  <strong>
                    {experienceHistory.length}
                  </strong>
                </div>

                {experienceHistory.length ===
                0 ? (
                  <EmptySection text="No work experience has been added." />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 12,
                    }}
                  >
                    {experienceHistory.map(
                      (experience) => (
                        <div
                          key={experience.id}
                          className="admin-candidate-item-card"
                        >
                          <strong>
                            {experience.jobTitle ||
                              "Position"}
                          </strong>

                          <span>
                            {experience.companyName ||
                              "Company not provided"}
                          </span>

                          <span>
                            {formatDateRange(
                              experience.startDate,
                              experience.endDate
                            )}
                          </span>

                          {experience.description && (
                            <p
                              style={{
                                margin:
                                  "7px 0 0",
                                lineHeight:
                                  1.55,
                                color:
                                  "#475569",
                              }}
                            >
                              {
                                experience.description
                              }
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* MEDIA */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    CANDIDATE MEDIA
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  <MediaPreview
                    label="Profile photo"
                    image={
                      details.media.facePhoto
                    }
                  />

                  <MediaPreview
                    label="Full body photo"
                    image={
                      details.media
                        .fullBodyPhoto
                    }
                  />
                </div>

                {details.media.reelMeta
                  ?.dataUrl && (
                  <div
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <span className="admin-detail-label">
                      INTRO VIDEO
                    </span>

                    <video
                      src={
                        details.media
                          .reelMeta.dataUrl
                      }
                      controls
                      playsInline
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: 7,
                        maxHeight: 280,
                        borderRadius: 14,
                        background:
                          "#0F172A",
                      }}
                    />

                    <div
                      style={{
                        marginTop: 6,
                        color: "#64748B",
                        fontSize: 11,
                      }}
                    >
                      {
                        details.media
                          .reelMeta.fileName
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* GALLERY */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    GALLERY
                  </span>

                  <strong>
                    {galleryImages.length}
                  </strong>
                </div>

                {galleryImages.length ===
                0 ? (
                  <EmptySection text="No gallery images have been uploaded." />
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {galleryImages.map(
                      (image) => (
                        <div
                          key={image.id}
                          style={{
                            border:
                              "1px solid #D4D2E6",
                            borderRadius: 12,
                            overflow:
                              "hidden",
                            background:
                              "#F8FCFF",
                          }}
                        >
                          <img
                            src={image.image}
                            alt={
                              image.name ||
                              "Candidate gallery image"
                            }
                            style={{
                              width: "100%",
                              height: 150,
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                          />

                          <div
                            style={{
                              padding: 9,
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                color:
                                  "#00273D",
                                fontSize: 12,
                              }}
                            >
                              {image.name ||
                                "Image"}
                            </strong>

                            <span
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  3,
                                color:
                                  "#64748B",
                                fontSize: 10,
                              }}
                            >
                              {formatMediaCategory(
                                image.category
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* DOCUMENTS */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    DOCUMENTS
                  </span>

                  <strong>
                    {documents.length}
                  </strong>
                </div>

                {documents.length === 0 ? (
                  <EmptySection text="No candidate documents have been uploaded." />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 9,
                    }}
                  >
                    {documents.map(
                      (document) => (
                        <div
                          key={document.id}
                          className="admin-candidate-document"
                        >
                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <strong>
                              {document.name ||
                                "Candidate document"}
                            </strong>

                            <span>
                              {document.fileName ||
                                "File name unavailable"}
                            </span>

                            {document.fileSize && (
                              <span>
                                {
                                  document.fileSize
                                }
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 7,
                              flexShrink: 0,
                            }}
                          >
                            <AdminStatusBadge
                              status={
                                document.status ||
                                "PENDING"
                              }
                            />

                            {document.dataUrl && (
                              <button
                                type="button"
                                className="admin-row-action"
                                onClick={() =>
                                  onSelectDocument(
                                    document
                                  )
                                }
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* PROJECTS */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    PROJECTS
                  </span>

                  <strong>
                    {projects.length}
                  </strong>
                </div>

                {projects.length === 0 ? (
                  <EmptySection text="No projects have been added." />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 10,
                    }}
                  >
                    {projects.map(
                      (project) => (
                        <div
                          key={project.id}
                          className="admin-candidate-item-card"
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap: 10,
                            }}
                          >
                            <strong>
                              {project.name}
                            </strong>

                            <AdminStatusBadge
                              status={
                                project.status ||
                                "ACTIVE"
                              }
                            />
                          </div>

                          <span>
                            {project.tech ||
                              "Technology not specified"}
                          </span>

                          {project.desc && (
                            <p
                              style={{
                                margin:
                                  "7px 0 0",
                                color:
                                  "#475569",
                                lineHeight:
                                  1.55,
                              }}
                            >
                              {project.desc}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* AVAILABILITY */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    AVAILABILITY
                  </span>
                </div>

                <div className="admin-drawer-details">
                  <CandidateDetail
                    label="Availability"
                    value={
                      formatAvailability(
                        details.media
                          .preferences
                          ?.availability
                      )
                    }
                  />
                </div>
              </div>

              {/* ACCOUNT INFORMATION */}

              <div className="admin-drawer-section">
                <div className="admin-drawer-section-heading">
                  <span>
                    ACCOUNT INFORMATION
                  </span>
                </div>

                <div className="admin-drawer-details">
                  <CandidateDetail
                    label="Account status"
                    value={
                      candidate.status ||
                      "UNKNOWN"
                    }
                  />

                  <CandidateDetail
                    label="Verification"
                    value={
                      candidate.verificationStatus ||
                      (details.verified
                        ? "VERIFIED"
                        : "UNVERIFIED")
                    }
                  />

                  <CandidateDetail
                    label="Joined"
                    value={formatDate(
                      candidate.createdAt
                    )}
                  />

                  <CandidateDetail
                    label="Candidate ID"
                    value={details.id || "—"}
                    monospace
                  />

                  <CandidateDetail
                    label="User ID"
                    value={details.userId || "—"}
                    monospace
                  />
                </div>
              </div>
            </>
          )}

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

      {/* DOCUMENT VIEWER */}

      {selectedDocument?.dataUrl && (
        <div
          className="admin-drawer-overlay"
          style={{
            zIndex: 1001,
          }}
          onClick={() =>
            onSelectDocument(null)
          }
        >
          <div
            style={{
              width: "min(1000px, 92vw)",
              height: "min(800px, 90vh)",
              background: "#FFFFFF",
              borderRadius: 18,
              boxShadow:
                "0 24px 80px rgba(15, 23, 42, 0.28)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 16,
                padding:
                  "16px 18px",
                borderBottom:
                  "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#00273D",
                  }}
                >
                  {selectedDocument.name ||
                    "Candidate document"}
                </strong>

                <span
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                  }}
                >
                  {selectedDocument.fileName ||
                    "Document"}
                </span>
              </div>

              <button
                type="button"
                className="admin-drawer-close"
                onClick={() =>
                  onSelectDocument(null)
                }
                aria-label="Close document viewer"
              >
                ×
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                background: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                padding: 16,
              }}
            >
              {isImageDataUrl(
                selectedDocument.dataUrl
              ) ? (
                <img
                  src={selectedDocument.dataUrl}
                  alt={
                    selectedDocument.name ||
                    "Candidate document"
                  }
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit:
                      "contain",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <iframe
                  title={
                    selectedDocument.name ||
                    "Candidate document"
                  }
                  src={
                    selectedDocument.dataUrl
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 8,
                    background:
                      "#FFFFFF",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

interface CandidateDetailProps {
  label: string;
  value: string;
  monospace?: boolean;
}

function CandidateDetail({
  label,
  value,
  monospace = false,
}: CandidateDetailProps) {
  return (
    <div className="admin-drawer-detail">
      <span>{label}</span>

      <strong
        style={
          monospace
            ? {
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                wordBreak: "break-all",
              }
            : undefined
        }
      >
        {value}
      </strong>
    </div>
  );
}

interface MediaPreviewProps {
  label: string;
  image?: string | null;
}

function MediaPreview({
  label,
  image,
}: MediaPreviewProps) {
  return (
    <div
      style={{
        border: "1px solid #D4D2E6",
        borderRadius: 14,
        overflow: "hidden",
        background: "#F8FCFF",
      }}
    >
      <div
        style={{
          height: 170,
          background: "#EAF4FA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span
            style={{
              color: "#64748B",
              fontSize: 12,
              padding: 12,
              textAlign: "center",
            }}
          >
            Not uploaded
          </span>
        )}
      </div>

      <div
        style={{
          padding: 9,
          color: "#00273D",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: "#F8FCFF",
        border: "1px solid #E2E8F0",
        color: "#64748B",
        fontSize: 12,
      }}
    >
      {text}
    </div>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(
  startDate?: string | null,
  endDate?: string | null
) {
  const start = formatDate(startDate);
  const end = endDate
    ? formatDate(endDate)
    : "Present";

  if (start === "—" && end === "Present") {
    return "Dates not provided";
  }

  return `${start} - ${end}`;
}

function formatYearRange(
  startYear?: number | null,
  completionYear?: number | null
) {
  if (!startYear && !completionYear) {
    return "Dates not provided";
  }

  if (startYear && completionYear) {
    return `${startYear} - ${completionYear}`;
  }

  if (startYear) {
    return `${startYear} - Present`;
  }

  return `${completionYear}`;
}

function formatAvailability(
  availability?: string | null
) {
  if (!availability) {
    return "Not specified";
  }

  return availability
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatMediaCategory(
  category?: string
) {
  if (!category) {
    return "Gallery";
  }

  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function isImageDataUrl(
  value: string
) {
  return value.startsWith(
    "data:image/"
  );
}