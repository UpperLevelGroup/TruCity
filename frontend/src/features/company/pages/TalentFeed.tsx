import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { companyService } from "../company.service";
import {
  getCandidateDetails,
  type CompanyCandidateDetails,
} from "../candidateDetails.service";
import type {
  CompanyCandidate,
  CandidateCategory,
} from "../company.types";

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

const PAGE_SIZE = 25;

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


interface TalentFeedProps {
  onOpenMessage?: (candidateName: string) => void;
}

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
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    selectedCandidate,
    setSelectedCandidate,
  ] = useState<CompanyCandidate | null>(
    null
  );

  const [
    detailedCandidate,
    setDetailedCandidate,
  ] =
    useState<CompanyCandidateDetails | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingDetails,
    setLoadingDetails,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    detailError,
    setDetailError,
  ] = useState<string | null>(null);

  useEffect(() => {
    void loadCandidates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  const loadCandidates = async () => {
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

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCandidates.length /
        PAGE_SIZE
    )
  );

  useEffect(() => {
    setCurrentPage((page) =>
      Math.min(page, totalPages)
    );
  }, [totalPages]);

  const paginatedCandidates =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PAGE_SIZE;

      return filteredCandidates.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      filteredCandidates,
      currentPage,
    ]);

  const pageStart =
    filteredCandidates.length === 0
      ? 0
      : (currentPage - 1) *
          PAGE_SIZE +
        1;

  const pageEnd = Math.min(
    currentPage * PAGE_SIZE,
    filteredCandidates.length
  );

  const getPageNumbers =
    (): (number | "...")[] => {
      if (totalPages <= 7) {
        return Array.from(
          { length: totalPages },
          (_, index) => index + 1
        );
      }

      if (currentPage <= 4) {
        return [
          1,
          2,
          3,
          4,
          5,
          "...",
          totalPages,
        ];
      }

      if (
        currentPage >=
        totalPages - 3
      ) {
        return [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      }

      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    };

  const handleViewProfile = async (
    candidate: CompanyCandidate
  ) => {
    setSelectedCandidate(candidate);
    setDetailedCandidate(null);
    setDetailError(null);
    setLoadingDetails(true);

    try {
      const details =
        await getCandidateDetails(
          candidate.id
        );

      setDetailedCandidate(details);
    } catch (error) {
      console.error(
        "Failed to load candidate profile:",
        error
      );

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

        if (response?.status === 403) {
          setDetailError(
            "You are not authorised to view this candidate's full profile."
          );
        } else if (
          response?.status === 404
        ) {
          setDetailError(
            "The candidate profile could not be found."
          );
        } else {
          setDetailError(
            "Unable to load the candidate's full profile."
          );
        }
      } else {
        setDetailError(
          "Unable to connect to the TruCity candidate profile service."
        );
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeProfile = () => {
    setSelectedCandidate(null);
    setDetailedCandidate(null);
    setDetailError(null);
    setLoadingDetails(false);
  };

  const handleOpenMessage = (
    candidate: CompanyCandidate
  ) => {
    onOpenMessage?.(candidate.name);
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

  const getInitial = (
    name: string
  ) =>
    name
      .charAt(0)
      .toUpperCase();

  const getFullBodyPhoto = (
    candidate: CompanyCandidateDetails
  ): string | null => {
    if (candidate.media.fullBodyPhoto) {
      return candidate.media.fullBodyPhoto;
    }

    const frontImage =
      candidate.media.galleryImages.find(
        (image) =>
          image.category?.toLowerCase() ===
          "front"
      );

    return frontImage?.image ?? null;
  };

  const profileDetails =
    detailedCandidate;

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
        <>
          <div style={styles.listHeader}>
            <div>
              <strong
                style={
                  styles.listHeaderTitle
                }
              >
                Talent Network
              </strong>

              <span
                style={
                  styles.listHeaderSubtitle
                }
              >
                Showing {pageStart}–{pageEnd} of{" "}
                {filteredCandidates.length} candidates
              </span>
            </div>

            <span
              style={styles.pageIndicator}
            >
              Page {currentPage} of{" "}
              {totalPages}
            </span>
          </div>

          <div
            style={styles.tableScroll}
          >
            <div
              style={styles.candidateTable}
            >
              <div
                style={styles.tableHeader}
              >
                <div>
                  Candidate
                </div>

                <div>
                  Role
                </div>

                <div>
                  Category
                </div>

                <div>
                  Experience
                </div>

                <div>
                  Location
                </div>

                <div>
                  Status
                </div>

                <div>
                  Action
                </div>
              </div>

              {paginatedCandidates.map(
                (candidate) => (
                  <div
                    key={candidate.id}
                    style={styles.tableRow}
                  >
                    <div
                      style={
                        styles.tableCandidateCell
                      }
                    >
                      <div
                        style={
                          styles.tableAvatar
                        }
                      >
                        {getInitial(
                          candidate.name
                        )}
                      </div>

                      <div
                        style={
                          styles.tableCandidateInfo
                        }
                      >
                        <div
                          style={
                            styles.tableCandidateNameRow
                          }
                        >
                          <strong
                            style={
                              styles.tableCandidateName
                            }
                          >
                            {candidate.name}
                          </strong>

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
                      </div>
                    </div>

                    <div
                      style={
                        styles.tableCell
                      }
                    >
                      <span
                        style={
                          styles.tablePrimaryText
                        }
                      >
                        {candidate.role ||
                          "Not provided"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.tableCell
                      }
                    >
                      <span
                        style={
                          styles.categoryBadge
                        }
                      >
                        {candidate.category ||
                          "Not provided"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.tableCell
                      }
                    >
                      <span
                        style={
                          styles.tablePrimaryText
                        }
                      >
                        {candidate.experience}{" "}
                        {candidate.experience ===
                        1
                          ? "year"
                          : "years"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.tableCell
                      }
                    >
                      <span
                        style={
                          candidate.location
                            ? styles.tablePrimaryText
                            : styles.tableMutedText
                        }
                      >
                        {candidate.location ||
                          "Not provided"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.tableCell
                      }
                    >
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(
                            candidate.status
                          ),
                        }}
                      >
                        {candidate.status ||
                          "Not provided"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.tableActionCell
                      }
                    >
                      <button
                        type="button"
                        style={
                          styles.compactViewButton
                        }
                        onClick={() =>
                          void handleViewProfile(
                            candidate
                          )
                        }
                      >
                        View Profile
                      </button>

                      {onOpenMessage && (
                        <button
                          type="button"
                          style={
                            styles.compactMessageButton
                          }
                          onClick={() =>
                            handleOpenMessage(
                              candidate
                            )
                          }
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div
            style={styles.paginationBar}
          >
            <div
              style={
                styles.paginationSummary
              }
            >
              Showing{" "}
              <strong>
                {pageStart}
              </strong>{" "}
              to{" "}
              <strong>
                {pageEnd}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredCandidates.length}
              </strong>
            </div>

            <div
              style={
                styles.paginationControls
              }
            >
              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === 1
                    ? styles.paginationButtonDisabled
                    : {}),
                }}
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                Previous
              </button>

              <div
                style={
                  styles.pageNumbers
                }
              >
                {getPageNumbers().map(
                  (page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        style={
                          styles.pageEllipsis
                        }
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        style={
                          page ===
                          currentPage
                            ? styles.activePageButton
                            : styles.pageButton
                        }
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                        aria-label={`Go to page ${page}`}
                        aria-current={
                          page ===
                          currentPage
                            ? "page"
                            : undefined
                        }
                      >
                        {page}
                      </button>
                    )
                )}
              </div>

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                style={{
                  ...styles.paginationButton,
                  ...(currentPage ===
                  totalPages
                    ? styles.paginationButtonDisabled
                    : {}),
                }}
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {selectedCandidate && (
        <div
          style={styles.modalOverlay}
          onClick={closeProfile}
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
            <div
              style={styles.modalHeader}
            >
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
                  {profileDetails?.name ??
                    selectedCandidate.name}
                </h2>

                <p
                  style={styles.modalRole}
                >
                  {profileDetails?.headline ??
                    profileDetails?.name ??
                    selectedCandidate.role}
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={closeProfile}
                aria-label="Close candidate profile"
              >
                ×
              </button>
            </div>

            <div
              style={styles.modalBody}
            >
              {loadingDetails ? (
                <div
                  style={
                    styles.detailLoading
                  }
                >
                  <div
                    style={
                      styles.spinner
                    }
                    aria-hidden="true"
                  />

                  <p
                    style={
                      styles.loadingText
                    }
                  >
                    Loading complete candidate profile...
                  </p>
                </div>
              ) : detailError ? (
                <div
                  style={
                    styles.detailError
                  }
                >
                  <div
                    style={
                      styles.errorIcon
                    }
                  >
                    !
                  </div>

                  <h3
                    style={
                      styles.emptyTitle
                    }
                  >
                    Profile Unavailable
                  </h3>

                  <p
                    style={
                      styles.emptyText
                    }
                  >
                    {detailError}
                  </p>

                  <button
                    type="button"
                    style={
                      styles.resetButton
                    }
                    onClick={() =>
                      void handleViewProfile(
                        selectedCandidate
                      )
                    }
                  >
                    Try Again
                  </button>
                </div>
              ) : profileDetails ? (
                <>
                  {/* INTRO REEL */}
                  {profileDetails.media
                    .reelMeta?.dataUrl && (
                    <section
                      style={
                        styles.detailSection
                      }
                    >
                      <h3
                        style={
                          styles.detailTitle
                        }
                      >
                        Introduction Reel
                      </h3>

                      <video
                        src={
                          profileDetails
                            .media
                            .reelMeta
                            .dataUrl
                        }
                        controls
                        preload="metadata"
                        style={
                          styles.reel
                        }
                      />

                      <div
                        style={
                          styles.mediaMeta
                        }
                      >
                        {profileDetails
                          .media
                          .reelMeta
                          .fileName && (
                          <span>
                            {
                              profileDetails
                                .media
                                .reelMeta
                                .fileName
                            }
                          </span>
                        )}

                        {profileDetails
                          .media
                          .reelMeta
                          .fileSize && (
                          <span>
                            {
                              profileDetails
                                .media
                                .reelMeta
                                .fileSize
                            }
                          </span>
                        )}
                      </div>
                    </section>
                  )}

                  {/* PROFILE PHOTOS */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Candidate Photos
                    </h3>

                    <div
                      style={
                        styles.photoGrid
                      }
                    >
                      <div
                        style={
                          styles.photoCard
                        }
                      >
                        {profileDetails
                          .media
                          .facePhoto ? (
                          <img
                            src={
                              profileDetails
                                .media
                                .facePhoto
                            }
                            alt={`${profileDetails.name} profile`}
                            style={
                              styles.profilePhoto
                            }
                          />
                        ) : (
                          <div
                            style={
                              styles.photoPlaceholder
                            }
                          >
                            {getInitial(
                              profileDetails.name
                            )}
                          </div>
                        )}

                        <span
                          style={
                            styles.photoLabel
                          }
                        >
                          Profile Photo
                        </span>
                      </div>

                      <div
                        style={
                          styles.photoCard
                        }
                      >
                        {getFullBodyPhoto(
                          profileDetails
                        ) ? (
                          <img
                            src={
                              getFullBodyPhoto(
                                profileDetails
                              ) ?? undefined
                            }
                            alt={`${profileDetails.name} full body`}
                            style={
                              styles.profilePhoto
                            }
                          />
                        ) : (
                          <div
                            style={
                              styles.photoPlaceholder
                            }
                          >
                            —
                          </div>
                        )}

                        <span
                          style={
                            styles.photoLabel
                          }
                        >
                          Full Body Photo
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* IDENTITY */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Candidate Information
                    </h3>

                    <div
                      style={
                        styles.infoGrid
                      }
                    >
                      <InfoItem
                        label="Full Name"
                        value={
                          profileDetails.name
                        }
                      />

                      <InfoItem
                        label="Role / Headline"
                        value={
                          profileDetails
                            .headline
                        }
                      />

                      <InfoItem
                        label="Category"
                        value={
                          selectedCandidate.category
                        }
                      />

                      <InfoItem
                        label="Location"
                        value={
                          profileDetails
                            .location
                        }
                      />

                      <InfoItem
                        label="Experience"
                        value={`${profileDetails.yearsExperience} ${
                          profileDetails.yearsExperience ===
                          1
                            ? "year"
                            : "years"
                        }`}
                      />

                      <InfoItem
                        label="Profile Completion"
                        value={
                          profileDetails
                            .profileCompletion !=
                          null
                            ? `${profileDetails.profileCompletion}%`
                            : null
                        }
                      />
                    </div>
                  </section>

                  {/* PROFESSIONAL SUMMARY */}
                  <section
                    style={
                      styles.detailSection
                    }
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
                      {profileDetails.bio ||
                        "Not provided by candidate."}
                    </p>
                  </section>

                  {/* SKILLS */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Skills & Proficiency
                    </h3>

                    {profileDetails.skills
                      .length > 0 ? (
                      <div
                        style={
                          styles.skillsList
                        }
                      >
                        {profileDetails.skills.map(
                          (skill) => (
                            <div
                              key={`${skill.name}-${skill.yearsUsed ?? "na"}`}
                              style={
                                styles.skillRow
                              }
                            >
                              <div
                                style={
                                  styles.skillMain
                                }
                              >
                                <strong
                                  style={
                                    styles.skillName
                                  }
                                >
                                  {
                                    skill.name
                                  }
                                </strong>

                                {skill.proficiency && (
                                  <span
                                    style={
                                      styles.skillProficiency
                                    }
                                  >
                                    {
                                      skill.proficiency
                                    }
                                  </span>
                                )}
                              </div>

                              {skill.yearsUsed !=
                                null && (
                                <span
                                  style={
                                    styles.skillYears
                                  }
                                >
                                  {
                                    skill.yearsUsed
                                  }{" "}
                                  {skill.yearsUsed ===
                                  1
                                    ? "year"
                                    : "years"}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p
                        style={
                          styles.detailText
                        }
                      >
                        No skills provided by
                        candidate.
                      </p>
                    )}
                  </section>

                  {/* QUALIFICATIONS */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Qualifications
                    </h3>

                    {profileDetails
                      .qualifications.length >
                    0 ? (
                      <div
                        style={
                          styles.cardList
                        }
                      >
                        {profileDetails.qualifications.map(
                          (qualification) => (
                            <div
                              key={
                                qualification.id
                              }
                              style={
                                styles.detailCard
                              }
                            >
                              <strong
                                style={
                                  styles.cardTitle
                                }
                              >
                                {qualification.qualificationName ||
                                  "Qualification"}
                              </strong>

                              <span
                                style={
                                  styles.cardMeta
                                }
                              >
                                {qualification.institution ||
                                  "Institution not provided"}
                              </span>

                              {qualification.fieldOfStudy && (
                                <span
                                  style={
                                    styles.cardText
                                  }
                                >
                                  Field:{" "}
                                  {
                                    qualification.fieldOfStudy
                                  }
                                </span>
                              )}

                              <span
                                style={
                                  styles.cardText
                                }
                              >
                                {qualification.startYear ??
                                qualification.completionYear
                                  ? `${
                                      qualification.startYear ??
                                      "—"
                                    } – ${
                                      qualification.completionYear ??
                                      "Present"
                                    }`
                                  : "Dates not provided"}
                              </span>

                              {qualification.verificationStatus && (
                                <span
                                  style={
                                    styles.smallStatus
                                  }
                                >
                                  {
                                    qualification.verificationStatus
                                  }
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p
                        style={
                          styles.detailText
                        }
                      >
                        No qualifications provided
                        by candidate.
                      </p>
                    )}
                  </section>

                  {/* WORK HISTORY */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Work History
                    </h3>

                    {profileDetails
                      .experienceHistory
                      .length > 0 ? (
                      <div
                        style={
                          styles.cardList
                        }
                      >
                        {profileDetails.experienceHistory.map(
                          (experience) => (
                            <div
                              key={
                                experience.id
                              }
                              style={
                                styles.detailCard
                              }
                            >
                              <strong
                                style={
                                  styles.cardTitle
                                }
                              >
                                {experience.jobTitle ||
                                  "Position not provided"}
                              </strong>

                              <span
                                style={
                                  styles.cardMeta
                                }
                              >
                                {experience.companyName ||
                                  "Company not provided"}
                              </span>

                              <span
                                style={
                                  styles.cardText
                                }
                              >
                                {formatDateRange(
                                  experience.startDate,
                                  experience.endDate
                                )}
                              </span>

                              {experience.description && (
                                <p
                                  style={
                                    styles.cardDescription
                                  }
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
                    ) : (
                      <p
                        style={
                          styles.detailText
                        }
                      >
                        No work history provided by
                        candidate.
                      </p>
                    )}
                  </section>

                  {/* AVAILABILITY */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Availability
                    </h3>

                    <span
                      style={
                        styles.availabilityBadge
                      }
                    >
                      {profileDetails.media
                        .preferences
                        ?.availability ||
                        "Not provided by candidate"}
                    </span>
                  </section>

                  {/* PROJECTS */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Projects
                    </h3>

                    {profileDetails.media
                      .projects.length > 0 ? (
                      <div
                        style={
                          styles.cardList
                        }
                      >
                        {profileDetails.media.projects.map(
                          (project) => (
                            <div
                              key={
                                project.id
                              }
                              style={
                                styles.detailCard
                              }
                            >
                              <strong
                                style={
                                  styles.cardTitle
                                }
                              >
                                {project.name ||
                                  "Project"}
                              </strong>

                              {project.tech && (
                                <span
                                  style={
                                    styles.cardMeta
                                  }
                                >
                                  {
                                    project.tech
                                  }
                                </span>
                              )}

                              {project.status && (
                                <span
                                  style={
                                    styles.smallStatus
                                  }
                                >
                                  {
                                    project.status
                                  }
                                </span>
                              )}

                              {project.desc && (
                                <p
                                  style={
                                    styles.cardDescription
                                  }
                                >
                                  {
                                    project.desc
                                  }
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p
                        style={
                          styles.detailText
                        }
                      >
                        No projects provided by
                        candidate.
                      </p>
                    )}
                  </section>

                  {/* GALLERY */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Portfolio Gallery
                    </h3>

                    {profileDetails.media
                      .galleryImages.length >
                    0 ? (
                      <div
                        style={
                          styles.galleryGrid
                        }
                      >
                        {profileDetails.media.galleryImages.map(
                          (image) => (
                            <div
                              key={
                                image.id
                              }
                              style={
                                styles.galleryItem
                              }
                            >
                              {image.image ? (
                                <img
                                  src={
                                    image.image
                                  }
                                  alt={
                                    image.name ||
                                    "Candidate portfolio image"
                                  }
                                  style={
                                    styles.galleryImage
                                  }
                                />
                              ) : (
                                <div
                                  style={
                                    styles.galleryPlaceholder
                                  }
                                >
                                  No preview
                                </div>
                              )}

                              <div
                                style={
                                  styles.galleryCaption
                                }
                              >
                                <strong>
                                  {image.name ||
                                    "Portfolio image"}
                                </strong>

                                {image.category && (
                                  <span>
                                    {
                                      image.category
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p
                        style={
                          styles.detailText
                        }
                      >
                        No portfolio images provided
                        by candidate.
                      </p>
                    )}
                  </section>

                  {/* DOCUMENTS */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Documents
                    </h3>

                    {profileDetails.media
                      .documents.length >
                    0 ? (
                      <div
                        style={
                          styles.documentList
                        }
                      >
                        {profileDetails.media.documents.map(
                          (document) => (
                            <div
                              key={
                                document.id
                              }
                              style={
                                styles.documentRow
                              }
                            >
                              <div>
                                <strong
                                  style={
                                    styles.documentName
                                  }
                                >
                                  {document.name ||
                                    document.fileName ||
                                    "Document"}
                                </strong>

                                {document.fileSize && (
                                  <span
                                    style={
                                      styles.documentMeta
                                    }
                                  >
                                    {
                                      document.fileSize
                                    }
                                  </span>
                                )}
                              </div>

                              <span
                                style={
                                  styles.documentStatus
                                }
                              >
                                {document.status ||
                                  "Provided"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p
                        style={
                          styles.detailText
                        }
                      >
                        No documents provided by
                        candidate.
                      </p>
                    )}
                  </section>

                  {/* REFERENCES */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      References
                    </h3>

                    <p
                      style={
                        styles.detailText
                      }
                    >
                      Not provided by candidate.
                    </p>
                  </section>

                  {/* CONTACT */}
                  <section
                    style={
                      styles.detailSection
                    }
                  >
                    <h3
                      style={
                        styles.detailTitle
                      }
                    >
                      Contact Information
                    </h3>

                    <div
                      style={
                        styles.contactList
                      }
                    >
                      <InfoItem
                        label="Email"
                        value={
                          profileDetails.email
                        }
                      />

                      <InfoItem
                        label="Phone"
                        value={
                          profileDetails.phone
                        }
                      />
                    </div>
                  </section>
                </>
              ) : (
                <p
                  style={
                    styles.detailText
                  }
                >
                  Candidate profile information
                  is unavailable.
                </p>
              )}
            </div>

            <div
              style={styles.modalFooter}
            >
              {onOpenMessage && (
                <button
                  type="button"
                  style={
                    styles.primaryMessageButton
                  }
                  onClick={() =>
                    handleOpenMessage(
                      selectedCandidate
                    )
                  }
                >
                  Message Candidate
                </button>
              )}

              <button
                type="button"
                style={
                  styles.secondaryModalButton
                }
                onClick={closeProfile}
              >
                Close
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

interface InfoItemProps {
  label: string;
  value?: string | number | null;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <span
        style={
          value
            ? styles.infoValue
            : styles.infoMissing
        }
      >
        {value || "Not provided"}
      </span>
    </div>
  );
}

function formatDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  const start = formatDate(
    startDate
  );

  const end = endDate
    ? formatDate(endDate)
    : "Present";

  if (!start && !endDate) {
    return "Dates not provided";
  }

  return `${start || "Unknown"} – ${end}`;
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return parsed.toLocaleDateString(
    "en-ZA",
    {
      year: "numeric",
      month: "short",
    }
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

  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "10px",
    padding: "0 2px",
  },

  listHeaderTitle: {
    display: "block",
    color: COLORS.teal,
    fontSize: "13px",
    fontWeight: 700,
  },

  listHeaderSubtitle: {
    display: "block",
    marginTop: "3px",
    color: COLORS.softText,
    fontSize: "10px",
  },

  pageIndicator: {
    flexShrink: 0,
    padding: "6px 9px",
    borderRadius: "6px",
    backgroundColor: COLORS.lighterPurple,
    color: COLORS.muted,
    fontSize: "10px",
    fontWeight: 600,
  },

  tableScroll: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    boxShadow:
      "0 8px 20px rgba(0,39,61,0.045)",
  },

  candidateTable: {
    width: "100%",
    minWidth: "1050px",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 2fr) minmax(170px, 1.4fr) minmax(160px, 1.25fr) 105px minmax(140px, 1.2fr) 115px 180px",
    alignItems: "center",
    gap: "12px",
    padding: "11px 16px",
    backgroundColor: COLORS.lighterPurple,
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.muted,
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 2fr) minmax(170px, 1.4fr) minmax(160px, 1.25fr) 105px minmax(140px, 1.2fr) 115px 180px",
    alignItems: "center",
    gap: "12px",
    minHeight: "66px",
    padding: "9px 16px",
    borderBottom: `1px solid ${COLORS.lighterPurple}`,
    backgroundColor: COLORS.white,
    transition:
      "background-color 0.15s ease",
  },

  tableCandidateCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  tableAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
  },

  tableCandidateInfo: {
    minWidth: 0,
    flex: 1,
  },

  tableCandidateNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: 0,
  },

  tableCandidateName: {
    color: COLORS.teal,
    fontSize: "12px",
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tableCell: {
    minWidth: 0,
    overflow: "hidden",
  },

  tablePrimaryText: {
    display: "block",
    color: COLORS.text,
    fontSize: "10px",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tableMutedText: {
    display: "block",
    color: COLORS.softText,
    fontSize: "10px",
    fontWeight: 400,
    fontStyle: "italic",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tableActionCell: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },

  compactViewButton: {
    padding: "7px 10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: "9px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },

  compactMessageButton: {
    padding: "7px 10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.blue}`,
    backgroundColor: COLORS.blue,
    color: COLORS.white,
    fontSize: "9px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },

  verifiedBadge: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor:
      COLORS.availableBg,
    border: "1px solid #B9EFD2",
    color: COLORS.availableText,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "8px",
    fontWeight: 700,
    flexShrink: 0,
  },

  categoryBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "6px",
    backgroundColor:
      "rgba(30,146,210,0.10)",
    color: COLORS.teal,
    fontSize: "9px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  availableBadge: {
    backgroundColor:
      COLORS.availableBg,
    color: COLORS.availableText,
  },

  interviewingBadge: {
    backgroundColor:
      COLORS.interviewBg,
    color: COLORS.interviewText,
  },

  reviewBadge: {
    backgroundColor:
      COLORS.reviewBg,
    color: COLORS.reviewText,
  },

  neutralBadge: {
    backgroundColor:
      COLORS.neutralBg,
    color: COLORS.neutralText,
  },

  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
  },

  paginationSummary: {
    color: COLORS.muted,
    fontSize: "10px",
    fontWeight: 400,
  },

  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  paginationButton: {
    padding: "7px 10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: "9px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  paginationButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  pageButton: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.muted,
    fontSize: "9px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  activePageButton: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    fontSize: "9px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  pageEllipsis: {
    width: "20px",
    textAlign: "center",
    color: COLORS.softText,
    fontSize: "11px",
    fontWeight: 600,
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

  detailLoading: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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

  detailError: {
    padding: "40px 20px",
    textAlign: "center",
    borderRadius: "10px",
    backgroundColor: COLORS.page,
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
    maxWidth: "680px",
    maxHeight: "88vh",
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
    position: "sticky",
    top: 0,
    backgroundColor: COLORS.white,
    zIndex: 2,
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
    flexShrink: 0,
  },

  modalBody: {
    padding: "24px",
  },

  detailSection: {
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: `1px solid ${COLORS.lighterPurple}`,
  },

  detailTitle: {
    margin: "0 0 10px",
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

  reel: {
    display: "block",
    width: "100%",
    maxHeight: "330px",
    borderRadius: "10px",
    backgroundColor: COLORS.darkBlue,
    objectFit: "contain",
  },

  mediaMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "7px",
    color: COLORS.softText,
    fontSize: "9px",
  },

  photoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  photoCard: {
    borderRadius: "10px",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },

  profilePhoto: {
    width: "100%",
    height: "260px",
    display: "block",
    objectFit: "cover",
    backgroundColor: COLORS.lighterPurple,
  },

  photoPlaceholder: {
    width: "100%",
    height: "260px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lighterPurple,
    color: COLORS.teal,
    fontSize: "48px",
    fontWeight: 700,
  },

  photoLabel: {
    display: "block",
    padding: "8px 10px",
    color: COLORS.muted,
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "1px",
    borderRadius: "9px",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.border,
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "10px",
    backgroundColor: COLORS.white,
    minWidth: 0,
  },

  infoLabel: {
    color: COLORS.softText,
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },

  infoValue: {
    color: COLORS.text,
    fontSize: "11px",
    fontWeight: 500,
    overflowWrap: "anywhere",
  },

  infoMissing: {
    color: COLORS.softText,
    fontSize: "11px",
    fontStyle: "italic",
  },

  skillsList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  skillRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "9px 10px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },

  skillMain: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },

  skillName: {
    color: COLORS.text,
    fontSize: "11px",
  },

  skillProficiency: {
    padding: "3px 6px",
    borderRadius: "5px",
    backgroundColor:
      "rgba(30,146,210,0.10)",
    color: COLORS.teal,
    fontSize: "8px",
    fontWeight: 700,
  },

  skillYears: {
    color: COLORS.softText,
    fontSize: "9px",
    flexShrink: 0,
  },

  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  detailCard: {
    padding: "11px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },

  cardTitle: {
    display: "block",
    color: COLORS.teal,
    fontSize: "11px",
    fontWeight: 700,
  },

  cardMeta: {
    display: "block",
    marginTop: "3px",
    color: COLORS.text,
    fontSize: "10px",
    fontWeight: 600,
  },

  cardText: {
    display: "block",
    marginTop: "4px",
    color: COLORS.muted,
    fontSize: "9px",
  },

  cardDescription: {
    margin: "7px 0 0",
    color: COLORS.muted,
    fontSize: "10px",
    lineHeight: 1.55,
  },

  smallStatus: {
    display: "inline-block",
    marginTop: "6px",
    padding: "3px 6px",
    borderRadius: "5px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.muted,
    fontSize: "8px",
    fontWeight: 600,
  },

  availabilityBadge: {
    display: "inline-flex",
    padding: "7px 10px",
    borderRadius: "7px",
    backgroundColor: COLORS.reviewBg,
    color: COLORS.reviewText,
    fontSize: "10px",
    fontWeight: 600,
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  galleryItem: {
    overflow: "hidden",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },

  galleryImage: {
    width: "100%",
    height: "150px",
    display: "block",
    objectFit: "cover",
  },

  galleryPlaceholder: {
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.softText,
    fontSize: "10px",
  },

  galleryCaption: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    padding: "7px 8px",
    color: COLORS.text,
    fontSize: "9px",
  },

  documentList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  documentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "9px 10px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },

  documentName: {
    display: "block",
    color: COLORS.text,
    fontSize: "10px",
  },

  documentMeta: {
    display: "block",
    marginTop: "3px",
    color: COLORS.softText,
    fontSize: "8px",
  },

  documentStatus: {
    padding: "4px 7px",
    borderRadius: "5px",
    backgroundColor: COLORS.white,
    color: COLORS.muted,
    fontSize: "8px",
    fontWeight: 600,
    flexShrink: 0,
  },

  contactList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  modalFooter: {
    padding: "16px 24px",
    borderTop: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    position: "sticky",
    bottom: 0,
    backgroundColor: COLORS.white,
  },

  primaryMessageButton: {
    padding: "9px 14px",
    borderRadius: "7px",
    border: `1px solid ${COLORS.blue}`,
    backgroundColor: COLORS.blue,
    color: COLORS.white,
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
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
};
