
import React, { useEffect, useMemo, useRef, useState } from "react";

import { companyService } from "../company.service";
import {
  getCandidateDetails,
  type CompanyCandidateDetails,
} from "../candidateDetails.service";
import type {
  CompanyCandidate,
  CandidateCategory,
} from "../company.types";

const CATEGORIES: ("All" | CandidateCategory)[] = [
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

type FullscreenMedia = {
  type: "video" | "image";
  src: string;
  title: string;
};

export default function TalentFeed() {
  const [candidates, setCandidates] = useState<CompanyCandidate[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | CandidateCategory>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CompanyCandidate | null>(null);
  const [detailedCandidate, setDetailedCandidate] =
    useState<CompanyCandidateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] =
    useState<FullscreenMedia | null>(null);

  const detailRequestId = useRef(0);

  useEffect(() => {
    void loadCandidates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  // Close the full-screen viewer with Escape.
  useEffect(() => {
    if (!fullscreenMedia) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenMedia(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenMedia]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await companyService.getCandidates();
      setCandidates(result);
    } catch (requestError) {
      console.error("Failed to load talent feed:", requestError);
      setCandidates([]);

      if (
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
      ) {
        const response = (
          requestError as { response?: { status?: number } }
        ).response;

        setError(
          response?.status === 401 || response?.status === 403
            ? "You are not authorised to view the talent network."
            : "Unable to load candidates from the talent network."
        );
      } else {
        setError("Unable to connect to the TruCity talent network.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      if (category !== "All" && candidate.category !== category) {
        return false;
      }
      if (!query) return true;

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

      return searchableText.includes(query);
    });
  }, [candidates, search, category]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / PAGE_SIZE)
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCandidates.slice(start, start + PAGE_SIZE);
  }, [filteredCandidates, currentPage]);

  const pageStart =
    filteredCandidates.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const pageEnd = Math.min(
    currentPage * PAGE_SIZE,
    filteredCandidates.length
  );

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
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

  const handleSelectCandidate = async (candidate: CompanyCandidate) => {
    const requestId = ++detailRequestId.current;
    setSelectedCandidate(candidate);
    setDetailedCandidate(null);
    setDetailError(null);
    setLoadingDetails(true);
    setFullscreenMedia(null);

    try {
      const details = await getCandidateDetails(candidate.id);

      // Prevent a slower previous request replacing the selected profile.
      if (requestId === detailRequestId.current) {
        setDetailedCandidate(details);
      }
    } catch (requestError) {
      if (requestId !== detailRequestId.current) return;

      console.error("Failed to load candidate profile:", requestError);

      if (
        requestError &&
        typeof requestError === "object" &&
        "response" in requestError
      ) {
        const response = (
          requestError as { response?: { status?: number } }
        ).response;

        if (response?.status === 403) {
          setDetailError(
            "You are not authorised to view this candidate's full profile."
          );
        } else if (response?.status === 404) {
          setDetailError("The candidate profile could not be found.");
        } else {
          setDetailError("Unable to load the candidate's full profile.");
        }
      } else {
        setDetailError(
          "Unable to connect to the TruCity candidate profile service."
        );
      }
    } finally {
      if (requestId === detailRequestId.current) {
        setLoadingDetails(false);
      }
    }
  };

  // Automatically select the first candidate on the current page when needed.
  useEffect(() => {
    if (paginatedCandidates.length === 0) {
      setSelectedCandidate(null);
      setDetailedCandidate(null);
      setDetailError(null);
      setLoadingDetails(false);
      return;
    }

    const selectedStillVisible = paginatedCandidates.some(
      (candidate) => candidate.id === selectedCandidate?.id
    );

    if (!selectedStillVisible) {
      void handleSelectCandidate(paginatedCandidates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedCandidates, selectedCandidate?.id]);

  const getStatusStyle = (
    status: CompanyCandidate["status"]
  ): React.CSSProperties => {
    if (status === "Available") return styles.availableBadge;
    if (status === "Interviewing") return styles.interviewingBadge;
    if (status === "In Review") return styles.reviewBadge;
    return styles.neutralBadge;
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const getFullBodyPhoto = (
    candidate: CompanyCandidateDetails
  ): string | null => {
    if (candidate.media.fullBodyPhoto) {
      return candidate.media.fullBodyPhoto;
    }

    const frontImage = candidate.media.galleryImages.find(
      (image) => image.category?.toLowerCase() === "front"
    );

    return frontImage?.image ?? null;
  };

  const profileDetails = detailedCandidate;

  // Resolve media URLs once; only confirmed strings are passed to the viewer.
  const reelUrl = profileDetails?.media.reelMeta?.dataUrl;
  const facePhotoUrl = profileDetails?.media.facePhoto;
  const fullBodyPhotoUrl = profileDetails
    ? getFullBodyPhoto(profileDetails)
    : null;

  const openFullscreenImage = (
    src: string | null | undefined,
    title: string
  ) => {
    if (!src) return;

    setFullscreenMedia({
      type: "image",
      src,
      title,
    });
  };

  const openFullscreenVideo = (
    src: string | null | undefined,
    title: string
  ) => {
    if (!src) return;

    setFullscreenMedia({
      type: "video",
      src,
      title,
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.eyebrow}>VERIFIED TALENT NETWORK</div>
          <h1 style={styles.title}>Talent Feed</h1>
          <p style={styles.subtitle}>
            Discover verified professionals and review candidate profiles without
            interrupting your browsing.
          </p>
        </div>

        <div style={styles.resultSummary}>
          <span style={styles.resultLabel}>Candidates</span>
          <strong style={styles.resultValue}>
            {filteredCandidates.length}
          </strong>
        </div>
      </div>

      <div style={styles.searchCard}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon} aria-hidden="true">
            ⌕
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search candidates, roles or skills..."
            style={styles.searchInput}
            aria-label="Search candidates"
          />
          {search && (
            <button
              type="button"
              style={styles.clearButton}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div style={styles.categoryFilters}>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              style={
                category === item ? styles.activeFilter : styles.filterButton
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingCard}>
          <div style={styles.spinner} aria-hidden="true" />
          <p style={styles.loadingText}>Loading verified talent...</p>
        </div>
      ) : error ? (
        <div style={styles.errorState}>
          <div style={styles.errorIcon}>!</div>
          <h3 style={styles.emptyTitle}>Talent Feed Unavailable</h3>
          <p style={styles.emptyText}>{error}</p>
          <button
            type="button"
            style={styles.resetButton}
            onClick={() => void loadCandidates()}
          >
            Try Again
          </button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>⌕</div>
          <h3 style={styles.emptyTitle}>No candidates found</h3>
          <p style={styles.emptyText}>
            Try changing your search or selecting a different category.
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
              <strong style={styles.listHeaderTitle}>Talent Network</strong>
              <span style={styles.listHeaderSubtitle}>
                Showing {pageStart}–{pageEnd} of {filteredCandidates.length}{" "}
                candidates
              </span>
            </div>
            <span style={styles.pageIndicator}>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="trucity-talent-split" style={styles.splitLayout}>
            <section style={styles.candidatePane} aria-label="Candidate list">
              <div style={styles.paneHeading}>
                <strong>Candidates</strong>
                <span>{filteredCandidates.length}</span>
              </div>

              <div style={styles.candidateList}>
                {paginatedCandidates.map((candidate) => {
                  const isSelected = selectedCandidate?.id === candidate.id;

                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => void handleSelectCandidate(candidate)}
                      style={{
                        ...styles.candidateCard,
                        ...(isSelected ? styles.candidateCardSelected : {}),
                      }}
                      aria-pressed={isSelected}
                    >
                      <div style={styles.candidateCardTop}>
                        <div style={styles.tableAvatar}>
                          {getInitial(candidate.name)}
                        </div>
                        <div style={styles.candidateCardInfo}>
                          <div style={styles.candidateNameLine}>
                            <strong style={styles.candidateName}>
                              {candidate.name}
                            </strong>
                            {candidate.verified && (
                              <span
                                style={styles.verifiedBadge}
                                title="Verified candidate"
                                aria-label="Verified candidate"
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          <span style={styles.candidateRole}>
                            {candidate.role || "Role not provided"}
                          </span>
                        </div>
                      </div>

                      <div style={styles.candidateMeta}>
                        <span>
                          {candidate.category || "Category not provided"}
                        </span>
                        <span>
                          {candidate.experience}{" "}
                          {candidate.experience === 1 ? "year" : "years"}
                        </span>
                      </div>

                      <div style={styles.candidateCardBottom}>
                        <span style={styles.candidateLocation}>
                          {candidate.location || "Location not provided"}
                        </span>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(candidate.status),
                          }}
                        >
                          {candidate.status || "Not provided"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={styles.paginationBar}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1
                      ? styles.paginationButtonDisabled
                      : {}),
                  }}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </button>

                <div style={styles.pageNumbers}>
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        style={styles.pageEllipsis}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        style={
                          page === currentPage
                            ? styles.activePageButton
                            : styles.pageButton
                        }
                        onClick={() => setCurrentPage(page)}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === totalPages
                      ? styles.paginationButtonDisabled
                      : {}),
                  }}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </section>

            <section
              style={styles.profilePane}
              aria-label="Selected candidate profile"
              aria-live="polite"
            >
              {!selectedCandidate ? (
                <div style={styles.profilePlaceholder}>
                  <div style={styles.profilePlaceholderIcon}>⌕</div>
                  <h2 style={styles.profilePlaceholderTitle}>
                    Select a candidate
                  </h2>
                  <p style={styles.detailText}>
                    Choose someone from the list to view their verified profile
                    here.
                  </p>
                </div>
              ) : (
                <>
                  <div style={styles.profileHeader}>
                    <div style={styles.profileHeaderIdentity}>
                      <div style={styles.profileAvatar}>
                        {facePhotoUrl ? (
                          <img
                            src={facePhotoUrl}
                            alt={`${profileDetails?.name ?? selectedCandidate.name} profile`}
                            style={styles.profileAvatarImage}
                          />
                        ) : (
                          getInitial(
                            profileDetails?.name ?? selectedCandidate.name
                          )
                        )}
                      </div>
                      <div style={styles.profileHeaderText}>
                        <div style={styles.profileNameLine}>
                          <h2 style={styles.profileName}>
                            {profileDetails?.name ?? selectedCandidate.name}
                          </h2>
                          {selectedCandidate.verified && (
                            <span
                              style={styles.profileVerified}
                              title="Verified candidate"
                            >
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p style={styles.profileHeadline}>
                          {profileDetails?.headline ||
                            selectedCandidate.role ||
                            "Professional"}
                        </p>
                        <p style={styles.profileLocation}>
                          {profileDetails?.location ||
                            selectedCandidate.location ||
                            "Location not provided"}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(selectedCandidate.status),
                      }}
                    >
                      {selectedCandidate.status || "Status not provided"}
                    </span>
                  </div>

                  {loadingDetails ? (
                    <div style={styles.detailLoading}>
                      <div style={styles.spinner} aria-hidden="true" />
                      <p style={styles.loadingText}>
                        Loading complete candidate profile...
                      </p>
                    </div>
                  ) : detailError ? (
                    <div style={styles.detailError}>
                      <div style={styles.errorIcon}>!</div>
                      <h3 style={styles.emptyTitle}>Profile Unavailable</h3>
                      <p style={styles.emptyText}>{detailError}</p>
                      <button
                        type="button"
                        style={styles.resetButton}
                        onClick={() =>
                          void handleSelectCandidate(selectedCandidate)
                        }
                      >
                        Try Again
                      </button>
                    </div>
                  ) : profileDetails ? (
                    <div style={styles.profileContent}>
                      {/* Original position: quick facts appear before the reel. */}
                      <div style={styles.profileQuickFacts}>
                        <InfoItem
                          label="Category"
                          value={selectedCandidate.category}
                        />
                        <InfoItem
                          label="Experience"
                          value={`${profileDetails.yearsExperience} ${
                            profileDetails.yearsExperience === 1
                              ? "year"
                              : "years"
                          }`}
                        />
                        <InfoItem
                          label="Availability"
                          value={
                            profileDetails.media.preferences?.availability
                          }
                        />
                        <InfoItem
                          label="Profile completion"
                          value={
                            profileDetails.profileCompletion != null
                              ? `${profileDetails.profileCompletion}%`
                              : null
                          }
                        />
                      </div>

                      {/* Introduction Reel with full-screen viewing retained. */}
                      {reelUrl && (
                        <section style={styles.detailSection}>
                          <h3 style={styles.detailTitle}>Introduction Reel</h3>
                          <video
                            src={reelUrl}
                            controls
                            preload="metadata"
                            style={styles.reel}
                          />
                          <div style={styles.mediaActions}>
                            <button
                              type="button"
                              style={styles.viewMediaButton}
                              onClick={() =>
                                openFullscreenVideo(
                                  reelUrl,
                                  `${profileDetails.name} introduction reel`
                                )
                              }
                            >
                              View Full Screen
                            </button>
                          </div>
                          <div style={styles.mediaMeta}>
                            {profileDetails.media.reelMeta?.fileName && (
                              <span>
                                {profileDetails.media.reelMeta.fileName}
                              </span>
                            )}
                            {profileDetails.media.reelMeta?.fileSize && (
                              <span>
                                {profileDetails.media.reelMeta.fileSize}
                              </span>
                            )}
                          </div>
                        </section>
                      )}

                      <section style={styles.detailSection}>
                        <h3 style={styles.detailTitle}>Candidate Photos</h3>
                        <div style={styles.photoGrid}>
                          <div style={styles.photoCard}>
                            {facePhotoUrl ? (
                              <>
                                <img
                                  src={facePhotoUrl}
                                  alt={`${profileDetails.name} profile`}
                                  style={styles.profilePhoto}
                                />
                                <div style={styles.mediaActions}>
                                  <button
                                    type="button"
                                    style={styles.viewMediaButton}
                                    onClick={() =>
                                      openFullscreenImage(
                                        facePhotoUrl,
                                        `${profileDetails.name} profile photo`
                                      )
                                    }
                                  >
                                    View Full Screen
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div style={styles.photoPlaceholder}>
                                {getInitial(profileDetails.name)}
                              </div>
                            )}
                            <span style={styles.photoLabel}>Profile Photo</span>
                          </div>

                          <div style={styles.photoCard}>
                            {fullBodyPhotoUrl ? (
                              <>
                                <img
                                  src={fullBodyPhotoUrl}
                                  alt={`${profileDetails.name} full body`}
                                  style={styles.profilePhoto}
                                />
                                <div style={styles.mediaActions}>
                                  <button
                                    type="button"
                                    style={styles.viewMediaButton}
                                    onClick={() =>
                                      openFullscreenImage(
                                        fullBodyPhotoUrl,
                                        `${profileDetails.name} full body photo`
                                      )
                                    }
                                  >
                                    View Full Screen
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div style={styles.photoPlaceholder}>—</div>
                            )}
                            <span style={styles.photoLabel}>
                              Full Body Photo
                            </span>
                          </div>
                        </div>
                      </section>

                      <section style={styles.detailSection}>
                        <h3 style={styles.detailTitle}>Professional Summary</h3>
                        <p style={styles.detailText}>
                          {profileDetails.bio || "Not provided by candidate."}
                        </p>
                      </section>

                      <section style={styles.detailSection}>
                        <h3 style={styles.detailTitle}>Skills & Proficiency</h3>
                        {profileDetails.skills.length > 0 ? (
                          <div style={styles.skillsList}>
                            {profileDetails.skills.map((skill) => (
                              <div
                                key={`${skill.name}-${skill.yearsUsed ?? "na"}`}
                                style={styles.skillRow}
                              >
                                <div style={styles.skillMain}>
                                  <strong style={styles.skillName}>
                                    {skill.name}
                                  </strong>
                                  {skill.proficiency && (
                                    <span style={styles.skillProficiency}>
                                      {skill.proficiency}
                                    </span>
                                  )}
                                </div>
                                {skill.yearsUsed != null && (
                                  <span style={styles.skillYears}>
                                    {skill.yearsUsed}{" "}
                                    {skill.yearsUsed === 1 ? "year" : "years"}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.detailText}>
                            No skills provided by candidate.
                          </p>
                        )}
                      </section>

                      <ProfileSection title="Qualifications">
                        {profileDetails.qualifications.length > 0 ? (
                          <div style={styles.cardList}>
                            {profileDetails.qualifications.map((qualification) => (
                              <div
                                key={qualification.id}
                                style={styles.detailCard}
                              >
                                <strong style={styles.cardTitle}>
                                  {qualification.qualificationName ||
                                    "Qualification"}
                                </strong>
                                <span style={styles.cardMeta}>
                                  {qualification.institution ||
                                    "Institution not provided"}
                                </span>
                                {qualification.fieldOfStudy && (
                                  <span style={styles.cardText}>
                                    Field: {qualification.fieldOfStudy}
                                  </span>
                                )}
                                <span style={styles.cardText}>
                                  {qualification.startYear ??
                                  qualification.completionYear
                                    ? `${qualification.startYear ?? "—"} – ${
                                        qualification.completionYear ??
                                        "Present"
                                      }`
                                    : "Dates not provided"}
                                </span>
                                {qualification.verificationStatus && (
                                  <span style={styles.smallStatus}>
                                    {qualification.verificationStatus}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.detailText}>
                            No qualifications provided by candidate.
                          </p>
                        )}
                      </ProfileSection>

                      <ProfileSection title="Work History">
                        {profileDetails.experienceHistory.length > 0 ? (
                          <div style={styles.cardList}>
                            {profileDetails.experienceHistory.map((experience) => (
                              <div
                                key={experience.id}
                                style={styles.detailCard}
                              >
                                <strong style={styles.cardTitle}>
                                  {experience.jobTitle ||
                                    "Position not provided"}
                                </strong>
                                <span style={styles.cardMeta}>
                                  {experience.companyName ||
                                    "Company not provided"}
                                </span>
                                <span style={styles.cardText}>
                                  {formatDateRange(
                                    experience.startDate,
                                    experience.endDate
                                  )}
                                </span>
                                {experience.description && (
                                  <p style={styles.cardDescription}>
                                    {experience.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.detailText}>
                            No work history provided by candidate.
                          </p>
                        )}
                      </ProfileSection>

                      <ProfileSection title="Projects">
                        {profileDetails.media.projects.length > 0 ? (
                          <div style={styles.cardList}>
                            {profileDetails.media.projects.map((project) => (
                              <div
                                key={project.id}
                                style={styles.detailCard}
                              >
                                <strong style={styles.cardTitle}>
                                  {project.name || "Project"}
                                </strong>
                                {project.tech && (
                                  <span style={styles.cardMeta}>
                                    {project.tech}
                                  </span>
                                )}
                                {project.status && (
                                  <span style={styles.smallStatus}>
                                    {project.status}
                                  </span>
                                )}
                                {project.desc && (
                                  <p style={styles.cardDescription}>
                                    {project.desc}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.detailText}>
                            No projects provided by candidate.
                          </p>
                        )}
                      </ProfileSection>

                      <ProfileSection title="Portfolio Gallery">
                        {profileDetails.media.galleryImages.length > 0 ? (
                          <div style={styles.galleryGrid}>
                            {profileDetails.media.galleryImages.map((image) => (
                              <div key={image.id} style={styles.galleryItem}>
                                {image.image ? (
                                  <img
                                    src={image.image}
                                    alt={image.name || "Candidate portfolio image"}
                                    style={styles.galleryImage}
                                  />
                                ) : (
                                  <div style={styles.galleryPlaceholder}>
                                    No preview
                                  </div>
                                )}
                                <div style={styles.galleryCaption}>
                                  <strong>
                                    {image.name || "Portfolio image"}
                                  </strong>
                                  {image.category && <span>{image.category}</span>}
                                  {image.image && (
                                    <button
                                      type="button"
                                      style={styles.viewMediaButton}
                                      onClick={() =>
                                        openFullscreenImage(
                                          image.image,
                                          image.name || "Candidate portfolio image"
                                        )
                                      }
                                    >
                                      View Full Screen
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.detailText}>
                            No portfolio images provided by candidate.
                          </p>
                        )}
                      </ProfileSection>

                      <ProfileSection title="Documents">
                        {profileDetails.media.documents.length > 0 ? (
                          <div style={styles.documentList}>
                            {profileDetails.media.documents.map((document) => (
                              <div
                                key={document.id}
                                style={styles.documentRow}
                              >
                                <div>
                                  <strong style={styles.documentName}>
                                    {document.name ||
                                      document.fileName ||
                                      "Document"}
                                  </strong>
                                  {document.fileSize && (
                                    <span style={styles.documentMeta}>
                                      {document.fileSize}
                                    </span>
                                  )}
                                </div>
                                <span style={styles.documentStatus}>
                                  {document.status || "Provided"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.detailText}>
                            No documents provided by candidate.
                          </p>
                        )}
                      </ProfileSection>

                      <ProfileSection title="References">
                        <p style={styles.detailText}>
                          Not provided by candidate.
                        </p>
                      </ProfileSection>

                      <ProfileSection title="Contact Information">
                        <div style={styles.contactList}>
                          <InfoItem label="Email" value={profileDetails.email} />
                          <InfoItem label="Phone" value={profileDetails.phone} />
                        </div>
                      </ProfileSection>
                    </div>
                  ) : (
                    <p style={styles.detailText}>
                      Candidate profile information is unavailable.
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        </>
      )}

      {/* Full-screen media viewer */}
      {fullscreenMedia && (
        <div
          style={styles.fullscreenOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenMedia.title}
          onClick={() => setFullscreenMedia(null)}
        >
          <button
            type="button"
            style={styles.fullscreenCloseButton}
            onClick={() => setFullscreenMedia(null)}
            aria-label="Close full-screen viewer"
            title="Close (Esc)"
          >
            ×
          </button>

          <div
            style={styles.fullscreenContent}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.fullscreenTitle}>{fullscreenMedia.title}</div>

            {fullscreenMedia.type === "video" ? (
              <video
                key={fullscreenMedia.src}
                src={fullscreenMedia.src}
                controls
                autoPlay
                playsInline
                style={styles.fullscreenVideo}
              />
            ) : (
              <img
                src={fullscreenMedia.src}
                alt={fullscreenMedia.title}
                style={styles.fullscreenImage}
              />
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes trucity-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 1000px) {
            .trucity-talent-split {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}
      </style>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details style={styles.collapsibleSection}>
      <summary style={styles.collapsibleSummary}>{title}</summary>
      <div style={styles.collapsibleContent}>{children}</div>
    </details>
  );
}

interface InfoItemProps {
  label: string;
  value?: string | number | null;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={value ? styles.infoValue : styles.infoMissing}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function formatDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Present";

  if (!start && !endDate) return "Dates not provided";
  return `${start || "Unknown"} – ${end}`;
}

function formatDate(value?: string | null): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
  });
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    color: COLORS.text,
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginBottom: 20,
  },
  eyebrow: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    marginBottom: 7,
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: COLORS.teal,
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "7px 0 0",
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 1.55,
    maxWidth: 690,
  },
  resultSummary: {
    minWidth: 100,
    padding: "13px 16px",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    textAlign: "right",
    boxShadow: "0 4px 14px rgba(0,39,61,0.04)",
  },
  resultLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  resultValue: {
    display: "block",
    marginTop: 4,
    color: COLORS.darkBlue,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },
  searchCard: {
    padding: 14,
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 4px 14px rgba(0,39,61,0.035)",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.page,
    border: `1px solid ${COLORS.border}`,
  },
  searchIcon: { color: COLORS.blue, fontSize: 20, lineHeight: 1 },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "inherit",
  },
  clearButton: {
    border: "none",
    backgroundColor: "transparent",
    color: COLORS.softText,
    fontSize: 20,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  categoryFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  filterButton: {
    padding: "7px 11px",
    borderRadius: 7,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  activeFilter: {
    padding: "7px 11px",
    borderRadius: 7,
    border: `1px solid ${COLORS.gold}`,
    backgroundColor: COLORS.orange,
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 10,
    padding: "0 2px",
  },
  listHeaderTitle: {
    display: "block",
    color: COLORS.teal,
    fontSize: 13,
    fontWeight: 700,
  },
  listHeaderSubtitle: {
    display: "block",
    marginTop: 3,
    color: COLORS.softText,
    fontSize: 10,
  },
  pageIndicator: {
    flexShrink: 0,
    padding: "6px 9px",
    borderRadius: 6,
    backgroundColor: COLORS.lighterPurple,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: 600,
  },
  splitLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 0.82fr) minmax(0, 1.65fr)",
    alignItems: "start",
    gap: 14,
    width: "100%",
    minWidth: 0,
  },
  candidatePane: {
    minWidth: 0,
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    boxShadow: "0 6px 18px rgba(0,39,61,0.035)",
  },
  paneHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 14px",
    backgroundColor: COLORS.lighterPurple,
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: 700,
  },
  candidateList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    maxHeight: 720,
    overflowY: "auto",
  },
  candidateCard: {
    display: "block",
    width: "100%",
    padding: 13,
    textAlign: "left",
    border: "none",
    borderBottom: `1px solid ${COLORS.lighterPurple}`,
    borderLeft: "3px solid transparent",
    backgroundColor: COLORS.white,
    cursor: "pointer",
    fontFamily: "inherit",
    color: COLORS.text,
  },
  candidateCardSelected: {
    borderLeft: `3px solid ${COLORS.blue}`,
    backgroundColor: "#F0F9FF",
  },
  candidateCardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  tableAvatar: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  candidateCardInfo: { minWidth: 0, flex: 1 },
  candidateNameLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  candidateName: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  candidateRole: {
    display: "block",
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 1.4,
  },
  candidateMeta: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 11,
    color: COLORS.muted,
    fontSize: 10,
  },
  candidateCardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 9,
  },
  candidateLocation: {
    color: COLORS.softText,
    fontSize: 10,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: COLORS.availableBg,
    border: "1px solid #B9EFD2",
    color: COLORS.availableText,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
    fontWeight: 700,
    flexShrink: 0,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 7px",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 600,
    whiteSpace: "nowrap",
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
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 7,
    padding: 10,
    borderTop: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
  },
  paginationButton: {
    padding: "7px 9px",
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: 9,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  paginationButtonDisabled: { opacity: 0.45, cursor: "not-allowed" },
  pageNumbers: { display: "flex", alignItems: "center", gap: 3 },
  pageButton: {
    width: 25,
    height: 27,
    borderRadius: 5,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.muted,
    fontSize: 9,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  activePageButton: {
    width: 25,
    height: 27,
    borderRadius: 5,
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  pageEllipsis: { color: COLORS.softText, fontSize: 10, padding: "0 2px" },
  profilePane: {
    minWidth: 0,
    maxHeight: 850,
    overflowY: "auto",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    boxShadow: "0 6px 18px rgba(0,39,61,0.035)",
  },
  profilePlaceholder: {
    minHeight: 420,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  profilePlaceholderIcon: { color: COLORS.blue, fontSize: 42 },
  profilePlaceholderTitle: {
    margin: "12px 0 5px",
    color: COLORS.teal,
    fontSize: 20,
  },
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: "20px 22px",
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
  },
  profileHeaderIdentity: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    minWidth: 0,
  },
  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    overflow: "hidden",
    flexShrink: 0,
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  profileHeaderText: { minWidth: 0 },
  profileNameLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  profileName: {
    margin: 0,
    color: COLORS.darkBlue,
    fontSize: 21,
    lineHeight: 1.25,
    overflowWrap: "anywhere",
  },
  profileVerified: {
    padding: "4px 7px",
    borderRadius: 5,
    backgroundColor: COLORS.availableBg,
    color: COLORS.availableText,
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  profileHeadline: {
    margin: "5px 0 0",
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 1.4,
  },
  profileLocation: {
    margin: "4px 0 0",
    color: COLORS.muted,
    fontSize: 11,
  },
  profileContent: { padding: "18px 22px 24px" },
  profileQuickFacts: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    marginBottom: 20,
  },
  detailLoading: {
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: `3px solid ${COLORS.border}`,
    borderTopColor: COLORS.gold,
    animation: "trucity-spin 0.8s linear infinite",
  },
  loadingCard: {
    minHeight: 240,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 500,
    textAlign: "center",
  },
  emptyState: {
    padding: "50px 20px",
    textAlign: "center",
    borderRadius: 12,
    backgroundColor: COLORS.white,
    border: `1px dashed ${COLORS.border}`,
  },
  errorState: {
    padding: "50px 20px",
    textAlign: "center",
    borderRadius: 12,
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.errorBorder}`,
  },
  detailError: {
    margin: 20,
    padding: "32px 18px",
    textAlign: "center",
    borderRadius: 10,
    backgroundColor: COLORS.page,
    border: `1px solid ${COLORS.errorBorder}`,
  },
  errorIcon: {
    width: 42,
    height: 42,
    margin: "0 auto",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.errorBg,
    color: COLORS.errorText,
    fontSize: 20,
    fontWeight: 700,
  },
  emptyIcon: { color: COLORS.blue, fontSize: 34 },
  emptyTitle: {
    margin: "8px 0 0",
    color: COLORS.teal,
    fontSize: 16,
    fontWeight: 700,
  },
  emptyText: {
    margin: "7px 0 15px",
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 1.5,
  },
  resetButton: {
    padding: "8px 13px",
    borderRadius: 7,
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 18,
    borderBottom: `1px solid ${COLORS.lighterPurple}`,
  },
  detailTitle: {
    margin: "0 0 10px",
    color: COLORS.teal,
    fontSize: 13,
    fontWeight: 700,
  },
  detailText: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 1.65,
    fontWeight: 400,
  },
  reel: {
    display: "block",
    width: "100%",
    maxHeight: 300,
    borderRadius: 9,
    backgroundColor: COLORS.darkBlue,
    objectFit: "contain",
  },
  mediaMeta: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 7,
    color: COLORS.softText,
    fontSize: 9,
  },
  mediaActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  viewMediaButton: {
    padding: "7px 10px",
    borderRadius: 6,
    border: `1px solid ${COLORS.teal}`,
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  fullscreenOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    boxSizing: "border-box",
    backgroundColor: "rgba(0, 0, 0, 0.94)",
  },
  fullscreenCloseButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 1,
    cursor: "pointer",
  },
  fullscreenContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minWidth: 0,
    minHeight: 0,
  },
  fullscreenTitle: {
    maxWidth: "90%",
    color: COLORS.white,
    fontSize: 14,
    textAlign: "center",
    overflowWrap: "anywhere",
  },
  fullscreenImage: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "calc(100vh - 110px)",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  },
  fullscreenVideo: {
    display: "block",
    width: "100%",
    maxWidth: 1200,
    maxHeight: "calc(100vh - 110px)",
    backgroundColor: "#000000",
    objectFit: "contain",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  photoCard: {
    borderRadius: 9,
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },
  profilePhoto: {
    width: "100%",
    height: 230,
    display: "block",
    objectFit: "cover",
    backgroundColor: COLORS.lighterPurple,
  },
  photoPlaceholder: {
    width: "100%",
    height: 230,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lighterPurple,
    color: COLORS.teal,
    fontSize: 42,
    fontWeight: 700,
  },
  photoLabel: {
    display: "block",
    padding: "8px 10px",
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 10,
    backgroundColor: COLORS.page,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 7,
    minWidth: 0,
  },
  infoLabel: {
    color: COLORS.softText,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: 500,
    overflowWrap: "anywhere",
  },
  infoMissing: { color: COLORS.softText, fontSize: 11, fontStyle: "italic" },
  skillsList: { display: "flex", flexDirection: "column", gap: 6 },
  skillRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "9px 10px",
    borderRadius: 7,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },
  skillMain: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
  skillName: { color: COLORS.text, fontSize: 11 },
  skillProficiency: {
    padding: "3px 6px",
    borderRadius: 5,
    backgroundColor: "rgba(30,146,210,0.10)",
    color: COLORS.teal,
    fontSize: 8,
    fontWeight: 700,
  },
  skillYears: { color: COLORS.softText, fontSize: 9, flexShrink: 0 },
  collapsibleSection: {
    marginBottom: 10,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  collapsibleSummary: {
    padding: "12px 13px",
    cursor: "pointer",
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: COLORS.page,
  },
  collapsibleContent: { padding: 12 },
  cardList: { display: "flex", flexDirection: "column", gap: 8 },
  detailCard: {
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },
  cardTitle: {
    display: "block",
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: 700,
  },
  cardMeta: {
    display: "block",
    marginTop: 3,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 600,
  },
  cardText: {
    display: "block",
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 9,
  },
  cardDescription: {
    margin: "7px 0 0",
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 1.55,
  },
  smallStatus: {
    display: "inline-block",
    marginTop: 6,
    padding: "3px 6px",
    borderRadius: 5,
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: 600,
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  galleryItem: {
    overflow: "hidden",
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },
  galleryImage: {
    width: "100%",
    height: 140,
    display: "block",
    objectFit: "cover",
  },
  galleryPlaceholder: {
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.softText,
    fontSize: 10,
  },
  galleryCaption: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
    padding: "7px 8px",
    color: COLORS.text,
    fontSize: 9,
  },
  documentList: { display: "flex", flexDirection: "column", gap: 6 },
  documentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "9px 10px",
    borderRadius: 7,
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.page,
  },
  documentName: { display: "block", color: COLORS.text, fontSize: 10 },
  documentMeta: {
    display: "block",
    marginTop: 3,
    color: COLORS.softText,
    fontSize: 8,
  },
  documentStatus: {
    padding: "4px 7px",
    borderRadius: 5,
    backgroundColor: COLORS.white,
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: 600,
    flexShrink: 0,
  },
  contactList: { display: "flex", flexDirection: "column", gap: 7 },
};