import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import companyService from "../company.service";

import type {
  CompanyCandidate,
  CandidateCategory,
} from "../company.types";

interface TalentFeedProps {
  onOpenMessage?: (
    candidateName: string
  ) => void;
}

const CATEGORIES: (
  | "All"
  | CandidateCategory
)[] = [
  "All",
  "Software Engineering",
  "DevOps & Cloud",
  "Data & AI",
  "Design",
  "Other",
];

const COLORS = {
  white: "#FFFFFF",
  page: "#F8FCFF",
  teal: "#00466D",
  darkBlue: "#00273D",
  blue: "#1E92D2",
  gold: "#FFAD01",
  orange: "#FFD784",
  grey: "#B6B3BD",
  lightPurple: "#E9E8F3",
  lighterPurple: "#F4F3FA",
  border: "#D4D2E6",
  text: "#334155",
  muted: "#64748B",
  softText: "#94A3B8",

  // Status colours are intentionally reserved for UI status indicators.
  availableBg: "#E9FFF4",
  availableText: "#16804A",
  interviewBg: "#FFF7D9",
  interviewText: "#8A6500",
  reviewBg: "#EAF6FD",
  reviewText: "#006E9F",
  neutralBg: "#F1F5F9",
  neutralText: "#64748B",

  errorBg: "#FFF1F4",
  errorBorder: "#FF4672",
  errorText: "#A61B3C",
} as const;

export default function TalentFeed({
  onOpenMessage,
}: TalentFeedProps) {
  const [
    candidates,
    setCandidates,
  ] = useState<CompanyCandidate[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    category,
    setCategory,
  ] = useState<
    "All" | CandidateCategory
  >("All");

  const [
    selectedCandidate,
    setSelectedCandidate,
  ] = useState<CompanyCandidate | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    void loadCandidates();
  }, []);

  const loadCandidates =
    async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await companyService.getCandidates();

        setCandidates(result);
      } catch (error) {
        console.error(
          "Failed to load talent feed:",
          error
        );

        setCandidates([]);

        if (
          error &&
          typeof error === "object" &&
          "response" in error
        ) {
          const response =
            (
              error as {
                response?: {
                  status?: number;
                };
              }
            ).response;

          if (
            response?.status === 401 ||
            response?.status === 403
          ) {
            setError(
              "You are not authorised to view the talent network."
            );
          } else {
            setError(
              "Unable to load candidates from the talent network."
            );
          }
        } else {
          setError(
            "Unable to connect to the TruCity talent network."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const filteredCandidates =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return candidates.filter(
        (candidate) => {
          const matchesCategory =
            category === "All" ||
            candidate.category ===
              category;

          if (!matchesCategory) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchableText = [
            candidate.name,
            candidate.role,
            candidate.category,
            candidate.status,
            candidate.location ?? "",
            candidate.bio ?? "",
            ...candidate.skills,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      candidates,
      search,
      category,
    ]);

  const handleMessage = (
    candidate: CompanyCandidate
  ) => {
    if (onOpenMessage) {
      onOpenMessage(
        candidate.name
      );
      return;
    }

    setSelectedCandidate(null);
  };

  const getStatusStyle = (
    status: CompanyCandidate["status"]
  ): React.CSSProperties => {
    if (status === "Available") {
      return styles.availableBadge;
    }

    if (status === "Interviewing") {
      return styles.interviewingBadge;
    }

    if (status === "In Review") {
      return styles.reviewBadge;
    }

    return styles.neutralBadge;
  };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.eyebrow}>
            VERIFIED TALENT NETWORK
          </div>

          <h1 style={styles.title}>
            Talent Feed
          </h1>

          <p style={styles.subtitle}>
            Discover verified professionals and
            connect with candidates that match
            your hiring needs.
          </p>
        </div>

        <div style={styles.resultSummary}>
          <span style={styles.resultLabel}>
            Candidates
          </span>

          <strong style={styles.resultValue}>
            {filteredCandidates.length}
          </strong>
        </div>
      </div>

      <div style={styles.searchCard}>
        <div style={styles.searchWrapper}>
          <span
            style={styles.searchIcon}
            aria-hidden="true"
          >
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search candidates, roles or skills..."
            style={styles.searchInput}
            aria-label="Search candidates"
          />

          {search && (
            <button
              type="button"
              style={styles.clearButton}
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div style={styles.categoryFilters}>
          {CATEGORIES.map(
            (item) => (
              <button
                key={item}
                type="button"
                style={
                  category === item
                    ? styles.activeFilter
                    : styles.filterButton
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingCard}>
          <div
            style={styles.spinner}
            aria-hidden="true"
          />

          <p style={styles.loadingText}>
            Loading verified talent...
          </p>
        </div>
      ) : error ? (
        <div style={styles.errorState}>
          <div style={styles.errorIcon}>
            !
          </div>

          <h3 style={styles.emptyTitle}>
            Talent Feed Unavailable
          </h3>

          <p style={styles.emptyText}>
            {error}
          </p>

          <button
            type="button"
            style={styles.resetButton}
            onClick={() =>
              void loadCandidates()
            }
          >
            Try Again
          </button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            ⌕
          </div>

          <h3 style={styles.emptyTitle}>
            No candidates found
          </h3>

          <p style={styles.emptyText}>
            Try changing your search or
            selecting a different category.
          </p>

          <button
            type="button"
            style={styles.resetButton}
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.candidateGrid}>
          {filteredCandidates.map(
            (candidate) => (
              <article
                key={candidate.id}
                style={styles.candidateCard}
              >
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {candidate.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={styles.identity}>
                    <div style={styles.nameRow}>
                      <h2
                        style={
                          styles.candidateName
                        }
                      >
                        {candidate.name}
                      </h2>

                      {candidate.verified && (
                        <span
                          style={
                            styles.verifiedBadge
                          }
                          title="Verified candidate"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <p style={styles.role}>
                      {candidate.role}
                    </p>

                    {candidate.location && (
                      <p style={styles.location}>
                        {candidate.location}
                      </p>
                    )}
                  </div>
                </div>

                <div style={styles.statusRow}>
                  <span
                    style={
                      styles.categoryBadge
                    }
                  >
                    {candidate.category}
                  </span>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(
                        candidate.status
                      ),
                    }}
                  >
                    {candidate.status}
                  </span>
                </div>

                <div style={styles.experienceRow}>
                  <span
                    style={
                      styles.experienceLabel
                    }
                  >
                    Experience
                  </span>

                  <strong
                    style={
                      styles.experienceValue
                    }
                  >
                    {candidate.experience}{" "}
                    {candidate.experience === 1
                      ? "year"
                      : "years"}
                  </strong>
                </div>

                <div style={styles.skills}>
                  {candidate.skills
                    .slice(0, 4)
                    .map(
                      (skill) => (
                        <span
                          key={skill}
                          style={styles.skill}
                        >
                          {skill}
                        </span>
                      )
                    )}
                </div>

                {candidate.bio && (
                  <p style={styles.bio}>
                    {candidate.bio}
                  </p>
                )}

                <div style={styles.cardActions}>
                  <button
                    type="button"
                    style={styles.viewButton}
                    onClick={() =>
                      setSelectedCandidate(
                        candidate
                      )
                    }
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    style={
                      styles.messageButton
                    }
                    onClick={() =>
                      handleMessage(
                        candidate
                      )
                    }
                  >
                    Message
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}

      {selectedCandidate && (
        <div
          style={styles.modalOverlay}
          onClick={() =>
            setSelectedCandidate(null)
          }
          role="presentation"
        >
          <div
            style={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="talent-profile-title"
          >
            <div style={styles.modalHeader}>
              <div>
                <span
                  style={
                    styles.modalEyebrow
                  }
                >
                  CANDIDATE PROFILE
                </span>

                <h2
                  id="talent-profile-title"
                  style={styles.modalTitle}
                >
                  {selectedCandidate.name}
                </h2>

                <p
                  style={styles.modalRole}
                >
                  {selectedCandidate.role}
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={() =>
                  setSelectedCandidate(null)
                }
                aria-label="Close candidate profile"
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.profileHeader}>
                <div
                  style={
                    styles.largeAvatar
                  }
                >
                  {selectedCandidate.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <div
                    style={
                      styles.modalBadgeRow
                    }
                  >
                    <span
                      style={
                        styles.categoryBadge
                      }
                    >
                      {
                        selectedCandidate.category
                      }
                    </span>

                    {selectedCandidate.verified && (
                      <span
                        style={
                          styles.verifiedLabel
                        }
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <span
                    style={
                      styles.modalExperience
                    }
                  >
                    {
                      selectedCandidate.experience
                    }{" "}
                    {selectedCandidate.experience ===
                    1
                      ? "year"
                      : "years"}{" "}
                    experience
                  </span>
                </div>
              </div>

              {selectedCandidate.location && (
                <section
                  style={styles.detailSection}
                >
                  <h3
                    style={
                      styles.detailTitle
                    }
                  >
                    Location
                  </h3>

                  <p
                    style={
                      styles.detailText
                    }
                  >
                    {
                      selectedCandidate.location
                    }
                  </p>
                </section>
              )}

              {selectedCandidate.bio && (
                <section
                  style={styles.detailSection}
                >
                  <h3
                    style={
                      styles.detailTitle
                    }
                  >
                    Professional Summary
                  </h3>

                  <p
                    style={
                      styles.detailText
                    }
                  >
                    {selectedCandidate.bio}
                  </p>
                </section>
              )}

              <section
                style={styles.detailSection}
              >
                <h3
                  style={styles.detailTitle}
                >
                  Skills
                </h3>

                <div
                  style={styles.modalSkills}
                >
                  {selectedCandidate.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        style={
                          styles.modalSkill
                        }
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </section>

              <section
                style={styles.detailSection}
              >
                <h3
                  style={styles.detailTitle}
                >
                  Availability
                </h3>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(
                      selectedCandidate.status
                    ),
                  }}
                >
                  {
                    selectedCandidate.status
                  }
                </span>
              </section>

              {selectedCandidate.email && (
                <div
                  style={styles.contactRow}
                >
                  <span
                    style={styles.contactLabel}
                  >
                    Email
                  </span>

                  <span
                    style={styles.contactValue}
                  >
                    {
                      selectedCandidate.email
                    }
                  </span>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={
                  styles.secondaryModalButton
                }
                onClick={() =>
                  setSelectedCandidate(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                style={
                  styles.primaryModalButton
                }
                onClick={() =>
                  handleMessage(
                    selectedCandidate
                  )
                }
              >
                Message Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes trucity-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const styles: {
  [key: string]: React.CSSProperties;
} = {
  page: {
    width: "100%",
    boxSizing: "border-box",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "24px",
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    marginBottom: "7px",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    color: COLORS.teal,
    fontSize: "32px",
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },

  subtitle: {
    margin: "7px 0 0",
    color: COLORS.muted,
    fontSize: "14px",
    lineHeight: 1.55,
    fontWeight: 400,
    maxWidth: "690px",
  },

  resultSummary: {
    minWidth: "120px",
    padding: "14px 18px",
    backgroundColor: COLORS.white,
    borderRadius: "10px",
    border: `1px solid ${COLORS.border}`,
    textAlign: "right",
    boxShadow:
      "0 6px 18px rgba(0,39,61,0.04)",
  },

  resultLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  resultValue: {
    display: "block",
    marginTop: "3px",
    color: COLORS.darkBlue,
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1,
  },

  searchCard: {
    padding: "16px",
    marginBottom: "22px",
    borderRadius: "12px",
    backgroundColor:
      "rgba(255,255,255,0.96)",
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 6px 18px rgba(0,39,61,0.04)",
  },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
    height: "44px",
    borderRadius: "8px",
    backgroundColor: COLORS.page,
    border: `1px solid ${COLORS.border}`,
  },

  searchIcon: {
    color: COLORS.blue,
    fontSize: "20px",
    lineHeight: 1,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: COLORS.text,
    fontSize: "13px",
    fontFamily: "inherit",
  },

  clearButton: {
    border: "none",
    backgroundColor: "transparent",
    color: COLORS.softText,
    fontSize: "20px",
    lineHeight: 1,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  categoryFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "12px",
  },

  filterButton: {
    padding: "7px 11px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.muted,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  activeFilter: {
    padding: "7px 11px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.gold}`,
    backgroundColor: COLORS.orange,
    color: COLORS.teal,
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  candidateGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "18px",
  },

  candidateCard: {
    padding: "18px",
    borderRadius: "12px",
    backgroundColor:
      "rgba(255,255,255,0.96)",
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 8px 20px rgba(0,39,61,0.045)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 700,
    flexShrink: 0,
  },

  identity: {
    minWidth: 0,
    flex: 1,
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  candidateName: {
    margin: 0,
    color: COLORS.teal,
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: 1.3,
  },

  verifiedBadge: {
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    backgroundColor: COLORS.availableBg,
    border: "1px solid #B9EFD2",
    color: COLORS.availableText,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: 700,
    flexShrink: 0,
  },

  role: {
    margin: "3px 0 0",
    color: COLORS.muted,
    fontSize: "11px",
    fontWeight: 400,
  },

  location: {
    margin: "3px 0 0",
    color: COLORS.softText,
    fontSize: "10px",
    fontWeight: 400,
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "14px",
  },

  categoryBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "6px",
    backgroundColor: "rgba(30,146,210,0.10)",
    color: COLORS.teal,
    fontSize: "9px",
    fontWeight: 600,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: 600,
  },

  availableBadge: {
    backgroundColor: COLORS.availableBg,
    color: COLORS.availableText,
  },

  interviewingBadge: {
    backgroundColor: COLORS.interviewBg,
    color: COLORS.interviewText,
  },

  reviewBadge: {
    backgroundColor: COLORS.reviewBg,
    color: COLORS.reviewText,
  },

  neutralBadge: {
    backgroundColor: COLORS.neutralBg,
    color: COLORS.neutralText,
  },

  experienceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px",
    paddingTop: "12px",
    borderTop: `1px solid ${COLORS.lighterPurple}`,
  },

  experienceLabel: {
    color: COLORS.softText,
    fontSize: "10px",
    fontWeight: 400,
  },

  experienceValue: {
    color: COLORS.text,
    fontSize: "10px",
    fontWeight: 700,
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "11px",
  },

  skill: {
    padding: "4px 7px",
    borderRadius: "5px",
    backgroundColor: COLORS.page,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    fontSize: "9px",
    fontWeight: 500,
  },

  bio: {
    margin: "12px 0 0",
    color: COLORS.muted,
    fontSize: "11px",
    lineHeight: 1.55,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  cardActions: {
    display: "flex",
    gap: "7px",
    marginTop: "15px",
  },

  viewButton: {
    flex: 1,
    padding: "9px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  messageButton: {
    flex: 1,
    padding: "9px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  loadingCard: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
  },

  spinner: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: `3px solid ${COLORS.border}`,
    borderTopColor: COLORS.gold,
    animation:
      "trucity-spin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: "12px",
    color: COLORS.muted,
    fontSize: "12px",
    fontWeight: 500,
  },

  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    borderRadius: "12px",
    backgroundColor: COLORS.white,
    border: `1px dashed ${COLORS.border}`,
  },

  errorState: {
    padding: "60px 20px",
    textAlign: "center",
    borderRadius: "12px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.errorBorder}`,
  },

  errorIcon: {
    width: "42px",
    height: "42px",
    margin: "0 auto",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.errorBg,
    color: COLORS.errorText,
    fontSize: "20px",
    fontWeight: 700,
  },

  emptyIcon: {
    color: COLORS.blue,
    fontSize: "34px",
  },

  emptyTitle: {
    margin: "8px 0 0",
    color: COLORS.teal,
    fontSize: "16px",
    fontWeight: 700,
  },

  emptyText: {
    margin: "5px 0 15px",
    color: COLORS.muted,
    fontSize: "11px",
    lineHeight: 1.5,
  },

  resetButton: {
    padding: "8px 13px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor:
      "rgba(0,39,61,0.46)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },

  modal: {
    width: "100%",
    maxWidth: "560px",
    maxHeight: "85vh",
    overflowY: "auto",
    backgroundColor: COLORS.white,
    borderRadius: "14px",
    boxShadow:
      "0 25px 60px rgba(0,39,61,0.20)",
  },

  modalHeader: {
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `1px solid ${COLORS.border}`,
  },

  modalEyebrow: {
    color: COLORS.gold,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },

  modalTitle: {
    margin: "4px 0 0",
    color: COLORS.teal,
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  modalRole: {
    margin: "4px 0 0",
    color: COLORS.muted,
    fontSize: "12px",
    fontWeight: 400,
  },

  closeButton: {
    width: "32px",
    height: "32px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
    color: COLORS.text,
    fontSize: "20px",
    lineHeight: 1,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  modalBody: {
    padding: "24px",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
  },

  largeAvatar: {
    width: "58px",
    height: "58px",
    borderRadius: "12px",
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 700,
  },

  modalBadgeRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "7px",
  },

  verifiedLabel: {
    color: COLORS.availableText,
    fontSize: "10px",
    fontWeight: 700,
  },

  modalExperience: {
    display: "block",
    marginTop: "6px",
    color: COLORS.muted,
    fontSize: "11px",
  },

  detailSection: {
    marginBottom: "20px",
  },

  detailTitle: {
    margin: "0 0 8px",
    color: COLORS.teal,
    fontSize: "12px",
    fontWeight: 700,
  },

  detailText: {
    margin: 0,
    color: COLORS.muted,
    fontSize: "12px",
    lineHeight: 1.65,
    fontWeight: 400,
  },

  modalSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },

  modalSkill: {
    padding: "6px 9px",
    borderRadius: "6px",
    backgroundColor: COLORS.page,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    fontSize: "10px",
    fontWeight: 500,
  },

  contactRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "10px 0",
    borderTop: `1px solid ${COLORS.lighterPurple}`,
  },

  contactLabel: {
    color: COLORS.softText,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  contactValue: {
    color: COLORS.text,
    fontSize: "11px",
    fontWeight: 500,
    textAlign: "right",
    overflowWrap: "anywhere",
  },

  modalFooter: {
    padding: "16px 24px",
    borderTop: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },

  secondaryModalButton: {
    padding: "9px 14px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  primaryModalButton: {
    padding: "9px 14px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
